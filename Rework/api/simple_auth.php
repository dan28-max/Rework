<?php
/**
 * Simple Authentication API for Spartan Data
 * Auto-detects campus and office from email
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

// Start session
session_start();

class SimpleAuthAPI {
    private $db;
    
    public function __construct() {
        try {
            $this->db = getDB();
        } catch (Exception $e) {
            error_log("Database connection error: " . $e->getMessage());
            $this->sendError('Database connection failed. Please run setup.php first.', 500);
        }
    }

    /**
     * Handle login request - auto-detects campus and office from email
     */
    public function login() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendError('Method not allowed', 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            $input = $_POST;
        }

        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $remember = $input['remember'] ?? false;

        // Validate input
        if (empty($email) || empty($password)) {
            $this->sendError('Email and password are required');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->sendError('Invalid email format');
        }

        try {
            // Get user from database (no role filter - let email determine everything)
            $stmt = $this->db->prepare("
                SELECT id, email, password, name, role, campus, office, status, last_login 
                FROM users 
                WHERE email = ? AND status = 'active'
            ");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                $this->logActivity(null, 'login_failed', "Failed login attempt for email: $email");
                $this->sendError('Invalid credentials or account not found');
            }

            // Verify password
            if (!password_verify($password, $user['password'])) {
                $this->logActivity($user['id'], 'login_failed', 'Invalid password');
                $this->sendError('Invalid credentials');
            }

            // Auto-detect and update campus/office from email if not set
            if (empty($user['campus']) || (empty($user['office']) && $user['role'] === 'user')) {
                $this->updateUserCampusFromEmail($user['id'], $email);
                // Refresh user data
                $stmt = $this->db->prepare("
                    SELECT id, email, password, name, role, campus, office, status, last_login 
                    FROM users 
                    WHERE id = ?
                ");
                $stmt->execute([$user['id']]);
                $user = $stmt->fetch();
            }

            // Generate session
            $sessionId = $this->generateSessionId();
            $expiresAt = date('Y-m-d H:i:s', time() + (24 * 60 * 60)); // 24 hours

            // Store session in database
            $stmt = $this->db->prepare("
                INSERT INTO user_sessions (user_id, session_id, ip_address, user_agent, expires_at) 
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $user['id'],
                $sessionId,
                $_SERVER['REMOTE_ADDR'] ?? '',
                $_SERVER['HTTP_USER_AGENT'] ?? '',
                $expiresAt
            ]);

            // Update last login
            $stmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $stmt->execute([$user['id']]);

            // Set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['session_id'] = $sessionId;
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_campus'] = $user['campus'];
            $_SESSION['user_office'] = $user['office'];

            // Set cookie if remember me is checked
            if ($remember) {
                $cookieValue = base64_encode($user['id'] . ':' . $sessionId);
                setcookie('spartan_remember', $cookieValue, time() + (30 * 24 * 60 * 60), '/'); // 30 days
            }

            // Log successful login
            $this->logActivity($user['id'], 'login_success', 'User logged in successfully');

            // Return success response
            $this->sendSuccess([
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'role' => $user['role'],
                    'campus' => $user['campus'],
                    'office' => $user['office'],
                    'last_login' => $user['last_login']
                ],
                'session_id' => $sessionId,
                'expires_at' => $expiresAt
            ]);

        } catch (PDOException $e) {
            error_log("Login error: " . $e->getMessage());
            $this->sendError('Database error occurred');
        }
    }

    /**
     * Auto-detect campus and office from email
     */
    private function updateUserCampusFromEmail($userId, $email) {
        try {
            // Parse email to extract campus and office
            $emailParts = explode('@', $email);
            if (count($emailParts) !== 2) return;

            $localPart = $emailParts[0];
            $domain = $emailParts[1];

            // Check if it's a BSU email
            if (strpos($domain, 'spartandata.com') === false) return;

            $parts = explode('.', $localPart);
            if (count($parts) < 2) return;

            $campusCode = end($parts);
            $officeCode = implode('.', array_slice($parts, 0, -1));

            // Map campus codes to full names
            $campusMap = [
                'pablo_borbon' => 'Pablo Borbon',
                'rosario' => 'Rosario',
                'san_juan' => 'San Juan',
                'lemery' => 'Lemery',
                'alangilan' => 'Alangilan',
                'lobo' => 'Lobo',
                'balayan' => 'Balayan',
                'mabini' => 'Mabini',
                'lipa' => 'Lipa',
                'malvar' => 'Malvar',
                'nasugbo' => 'Nasugbo'
            ];

            $campusName = $campusMap[$campusCode] ?? $campusCode;

            // Determine role and office
            if ($officeCode === 'admin') {
                $role = 'admin';
                $office = null;
            } else if ($email === 'superadmin@spartandata.com') {
                $role = 'super_admin';
                $campusName = 'All Campuses';
                $office = null;
            } else {
                $role = 'user';
                $office = str_replace('_', ' ', ucwords($officeCode, '_'));
            }

            // Update user record
            $stmt = $this->db->prepare("UPDATE users SET campus = ?, office = ?, role = ? WHERE id = ?");
            $stmt->execute([$campusName, $office, $role, $userId]);

        } catch (Exception $e) {
            error_log("Error updating user campus from email: " . $e->getMessage());
        }
    }

    /**
     * Handle logout request
     */
    public function logout() {
        if (isset($_SESSION['session_id'])) {
            try {
                // Remove session from database
                $stmt = $this->db->prepare("DELETE FROM user_sessions WHERE session_id = ?");
                $stmt->execute([$_SESSION['session_id']]);

                // Log logout
                if (isset($_SESSION['user_id'])) {
                    $this->logActivity($_SESSION['user_id'], 'logout', 'User logged out');
                }
            } catch (PDOException $e) {
                error_log("Logout error: " . $e->getMessage());
            }
        }

        // Clear session
        session_destroy();
        
        // Clear remember me cookie
        if (isset($_COOKIE['spartan_remember'])) {
            setcookie('spartan_remember', '', time() - 3600, '/');
        }

        $this->sendSuccess(['message' => 'Logged out successfully']);
    }

    /**
     * Check if user is authenticated
     */
    public function checkAuth() {
        if (!isset($_SESSION['user_id']) || !isset($_SESSION['session_id'])) {
            $this->sendError('Not authenticated', 401);
        }

        try {
            // Verify session in database
            $stmt = $this->db->prepare("
                SELECT u.id, u.email, u.name, u.role, u.campus, u.office, u.status, s.expires_at
                FROM users u
                JOIN user_sessions s ON u.id = s.user_id
                WHERE s.session_id = ? AND s.expires_at > NOW() AND u.status = 'active'
            ");
            $stmt->execute([$_SESSION['session_id']]);
            $user = $stmt->fetch();

            if (!$user) {
                session_destroy();
                $this->sendError('Session expired or invalid', 401);
            }

            $this->sendSuccess([
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'role' => $user['role'],
                    'campus' => $user['campus'],
                    'office' => $user['office'],
                    'status' => $user['status']
                ],
                'session_expires' => $user['expires_at']
            ]);

        } catch (PDOException $e) {
            error_log("Auth check error: " . $e->getMessage());
            $this->sendError('Database error occurred');
        }
    }

    /**
     * Generate unique session ID
     */
    private function generateSessionId() {
        return 'sess_' . bin2hex(random_bytes(16)) . '_' . time();
    }

    /**
     * Log user activity
     */
    private function logActivity($userId, $action, $description) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $userId,
                $action,
                $description,
                $_SERVER['REMOTE_ADDR'] ?? '',
                $_SERVER['HTTP_USER_AGENT'] ?? ''
            ]);
        } catch (PDOException $e) {
            error_log("Activity log error: " . $e->getMessage());
        }
    }

    /**
     * Send success response
     */
    private function sendSuccess($data) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $data
        ]);
        exit();
    }

    /**
     * Send error response
     */
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
        exit();
    }
}

// Handle API requests
$auth = new SimpleAuthAPI();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        $auth->login();
        break;
    case 'logout':
        $auth->logout();
        break;
    case 'check':
        $auth->checkAuth();
        break;
    default:
        $auth->sendError('Invalid action specified', 400);
}
?>
