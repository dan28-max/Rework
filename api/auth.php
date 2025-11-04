<?php
/**
 * Authentication API for Spartan Data
 * Handles login, logout, and session management
 */

// Suppress error display to prevent HTML output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../includes/functions.php';

    // Configure session settings
    ini_set('session.use_strict_mode', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on');
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.gc_maxlifetime', 86400); // 24 hours
    
    // Set custom session name to avoid conflicts
    session_name('SPARTAN_SESSION');
    
    // Start the session
    session_start();
    
    // Regenerate session ID periodically for security
    if (!isset($_SESSION['last_regeneration'])) {
        session_regenerate_id(true);
        $_SESSION['last_regeneration'] = time();
    } elseif (time() - $_SESSION['last_regeneration'] > 1800) { // 30 minutes
        session_regenerate_id(true);
        $_SESSION['last_regeneration'] = time();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit();
}

class AuthAPI {
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
     * Handle login request
     */
    public function login() {
        if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendError('Method not allowed', 405);
        }

        // Get input data
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';
        $remember = !empty($input['remember']);
        $role = $input['role'] ?? 'user'; // Default to 'user' if not specified

        // Input validation
        if (empty($username) || empty($password)) {
            $this->sendError('Username and password are required');
        }

        try {
            // Get user from database using username
            $stmt = $this->db->prepare("
                SELECT id, username, email, password, name, role, campus, office, status, last_login 
                FROM users 
                WHERE username = ? AND role = ? AND status = 'active' LIMIT 1");
            
            $stmt->execute([$username, $role]);
            $user = $stmt->fetch();

            if (!$user) {
                $this->logActivity(null, 'login_failed', "Failed login attempt for username: $username with role: $role");
                $this->sendError('Invalid credentials or account not found');
            }

            // Verify password
            if (!password_verify($password, $user['password'])) {
                $this->logActivity($user['id'], 'login_failed', 'Invalid password');
                $this->sendError('Invalid credentials');
            }

            // Generate session ID
            $sessionId = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', time() + (24 * 60 * 60)); // 24 hours

            // Store session in database
            $stmt = $this->db->prepare("
                INSERT INTO user_sessions (user_id, session_id, ip_address, user_agent, expires_at, last_activity)
                VALUES (?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                    session_id = VALUES(session_id),
                    ip_address = VALUES(ip_address),
                    user_agent = VALUES(user_agent),
                    expires_at = VALUES(expires_at),
                    last_activity = NOW()
            ");
            
            $stmt->execute([
                $user['id'],
                $sessionId,
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                $expiresAt
            ]);

            // Update last login
            $stmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $stmt->execute([$user['id']]);

            // Regenerate session ID to prevent session fixation
            session_regenerate_id(true);
            
            // Set session variables
            $_SESSION = []; // Clear existing session data
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['session_id'] = $sessionId;
            $_SESSION['user_role'] = $user['role'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['user_campus'] = $user['campus'];
            $_SESSION['user_office'] = $user['office'];
            $_SESSION['last_activity'] = time();
            
            // Ensure session is written
            session_write_close();
            session_start(); // Restart session to ensure it's saved

            // Set remember me cookie if requested
            if ($remember) {
                $cookieValue = base64_encode($user['id'] . ':' . $sessionId);
                $cookieExpire = time() + (30 * 24 * 60 * 60); // 30 days
                
                // Set secure, httponly, and samesite attributes
                $cookieOptions = [
                    'expires' => $cookieExpire,
                    'path' => '/',
                    'domain' => $_SERVER['HTTP_HOST'],
                    'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
                    'httponly' => true,
                    'samesite' => 'Lax'
                ];
                
                setcookie('spartan_remember', $cookieValue, $cookieOptions);
            }

            // Log successful login
            $this->logActivity($user['id'], 'login', 'User logged in successfully');

            // Return success response with session info
            $response = [
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'campus' => $user['campus'],
                    'office' => $user['office'],
                    'last_login' => $user['last_login']
                ],
                'session_id' => $sessionId,
                'expires_at' => $expiresAt,
                'session_cookie' => session_name() . '=' . session_id()
            ];
            
            // For debugging
            error_log('Login successful for user: ' . $user['username']);
            error_log('Session ID: ' . session_id());
            error_log('Session data: ' . print_r($_SESSION, true));
            
            $this->sendSuccess($response);
        } catch (PDOException $e) {
            error_log("Login error: " . $e->getMessage());
            $this->sendError('Database error occurred');
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
     * Check if user is authenticated and return user data
     */
    public function checkAuth() {
        if (!isset($_SESSION['user_id']) || !isset($_SESSION['session_id'])) {
            $this->sendError('Not authenticated', 401);
            return;
        }
        
        try {
            // Verify session in database
            $stmt = $this->db->prepare("
                SELECT u.id, u.username, u.email, u.name, u.role, u.campus, u.office, u.status, s.expires_at
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
                    'username' => $user['username'],
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
     * Get current user's data
     */
    public function getUserData() {
        if (!isset($_SESSION['user_id'])) {
            $this->sendError('User not authenticated', 401);
            return;
        }

        try {
            $stmt = $this->db->prepare("
                SELECT id, username, email, name, role, campus, office, status, last_login 
                FROM users 
                WHERE id = ?
            ");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();

            if (!$user) {
                $this->sendError('User not found', 404);
                return;
            }

            // Remove sensitive data
            unset($user['password']);
            
            $this->sendSuccess([
                'user' => $user
            ]);
        } catch (Exception $e) {
            error_log("Error getting user data: " . $e->getMessage());
            $this->sendError('Failed to get user data', 500);
        }
    }

    /**
     * Get the current user's campus
     */
    public function getUserCampus() {
        // Debug: Log session data
        error_log("Session data: " . print_r($_SESSION, true));
        
        if (!isset($_SESSION['user'])) {
            error_log("User not logged in - session user not set");
            echo json_encode(['success' => false, 'message' => 'Not logged in', 'debug' => ['session' => $_SESSION]]);
            exit();
        }
        
        try {
            error_log("Getting campus for user ID: " . $_SESSION['user']['id']);
            
            // Get user's campus from database
            $stmt = $this->db->prepare("SELECT campus FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user']['id']]);
            $user = $stmt->fetch();
            
            error_log("Database query result: " . print_r($user, true));
            
            if ($user && !empty($user['campus'])) {
                $response = ['success' => true, 'campus' => $user['campus']];
                error_log("Returning campus: " . $user['campus']);
                echo json_encode($response);
            } else {
                $response = ['success' => false, 'message' => 'Campus not found', 'debug' => ['user' => $user]];
                error_log("Campus not found for user");
                echo json_encode($response);
            }
        } catch (Exception $e) {
            $error = "Error getting user campus: " . $e->getMessage();
            error_log($error);
            echo json_encode(['success' => false, 'message' => 'Error retrieving campus information', 'error' => $error]);
        }
        exit();
    }

    /**
     * Update session expiration time
     */
    public function updateSession() {
        // Log the request for debugging
        error_log('Update session request: ' . print_r([
            'session' => $_SESSION ?? [],
            'cookies' => $_COOKIE ?? [],
            'post' => $_POST ?? [],
            'get' => $_GET ?? [],
            'input' => file_get_contents('php://input')
        ], true));

        // Get JSON input if it exists
        $input = [];
        $jsonInput = file_get_contents('php://input');
        if (!empty($jsonInput)) {
            $input = json_decode($jsonInput, true) ?: [];
        }
        $office = $input['office'] ?? null;
        $campus = $input['campus'] ?? null;

        // Check session first
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Debug session state
        error_log('Session state: ' . print_r([
            'session_id' => session_id(),
            'session_data' => $_SESSION ?? []
        ], true));

        // If not authenticated, try to get user from remember me cookie
        if (empty($_SESSION['user_id']) || empty($_SESSION['session_id'])) {
            // Check for remember me cookie
            if (isset($_COOKIE['spartan_remember'])) {
                try {
                    $cookieValue = base64_decode($_COOKIE['spartan_remember']);
                    list($userId, $sessionId) = explode(':', $cookieValue, 2);
                    
                    // Verify session exists and is still valid
                    $stmt = $this->db->prepare("
                        SELECT u.id, u.username, u.role, u.campus, u.office 
                        FROM users u
                        JOIN user_sessions s ON u.id = s.user_id
                        WHERE s.session_id = ? AND s.expires_at > NOW() AND u.status = 'active'
                    ");
                    $stmt->execute([$sessionId]);
                    $user = $stmt->fetch();
                    
                    if ($user) {
                        // Regenerate session ID to prevent session fixation
                        session_regenerate_id(true);
                        
                        // Update office and campus if provided
                        if ($office !== null) {
                            $user['office'] = $office;
                        }
                        if ($campus !== null) {
                            $user['campus'] = $campus;
                        }
                        
                        // Set session variables
                        $_SESSION['user_id'] = $user['id'];
                        $_SESSION['session_id'] = $sessionId;
                        $_SESSION['user_role'] = $user['role'];
                        $_SESSION['username'] = $user['username'];
                        $_SESSION['user_campus'] = $user['campus'];
                        $_SESSION['user_office'] = $user['office'];
                        
                        // Extend session
                        $expiresAt = $this->extendSession($user['id'], $sessionId);
                        
                        $this->sendSuccess([
                            'message' => 'Session restored from remember me',
                            'user' => [
                                'id' => $user['id'],
                                'username' => $user['username'],
                                'role' => $user['role'],
                                'campus' => $user['campus'],
                                'office' => $user['office']
                            ],
                            'expires_at' => $expiresAt
                        ]);
                        return;
                    }
                } catch (Exception $e) {
                    error_log("Remember me validation error: " . $e->getMessage());
                }
            }
            
            // If we get here, no valid session or remember me token was found
            error_log('No valid session or remember me token found');
            $this->sendError('Session expired. Please log in again.', 401);
            return;
        }

        try {
            // Update office and campus in session if provided
            $updated = false;
            if ($office !== null) {
                $_SESSION['user_office'] = $office;
                $updated = true;
            }
            if ($campus !== null) {
                $_SESSION['user_campus'] = $campus;
                $updated = true;
            }
            
            // Update session expiration time
            $expiresAt = $this->extendSession($_SESSION['user_id'], $_SESSION['session_id']);
            
            $response = [
                'message' => 'Session updated' . ($updated ? ' with new settings' : ''),
                'expires_at' => $expiresAt,
                'user' => [
                    'id' => $_SESSION['user_id'],
                    'username' => $_SESSION['username'] ?? '',
                    'role' => $_SESSION['user_role'] ?? 'user',
                    'campus' => $_SESSION['user_campus'] ?? null,
                    'office' => $_SESSION['user_office'] ?? null
                ]
            ];
            
            $this->sendSuccess($response);
        } catch (Exception $e) {
            error_log("Session update error: " . $e->getMessage());
            $this->sendError('Failed to update session: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Extend session expiration time
     */
    private function extendSession($userId, $sessionId) {
        $expiresAt = date('Y-m-d H:i:s', time() + (24 * 60 * 60)); // 24 hours
        
        $stmt = $this->db->prepare("
            UPDATE user_sessions 
            SET expires_at = ? 
            WHERE session_id = ? AND user_id = ?
        ");
        $stmt->execute([$expiresAt, $sessionId, $userId]);
        
        // Also update the remember me cookie if it exists
        if (isset($_COOKIE['spartan_remember'])) {
            $cookieValue = base64_encode($userId . ':' . $sessionId);
            setcookie('spartan_remember', $cookieValue, time() + (30 * 24 * 60 * 60), '/'); // 30 days
        }
        
        return $expiresAt;
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
$auth = new AuthAPI();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        $auth->login();
        break;
    case 'logout':
        $auth->logout();
        break;
    case 'check_session':
        $auth->checkAuth();
        break;
    case 'get_campus':
        $auth->getUserCampus();
        break;
    case 'update_session':
        $auth->updateSession();
        break;
    case 'get_user_data':
        $auth->getUserData();
        break;
    default:
        $auth->sendError('Invalid action', 400);
}
