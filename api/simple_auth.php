<?php
/**
 * Simple Authentication API for Spartan Data
 * Username-based authentication (no email)
 */

// Error reporting (safe defaults)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);

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
require_once __DIR__ . '/../config/recaptcha.php';

// Start session
session_start();

// Get database connection
try {
    $db = getDB();
} catch (Exception $e) {
    sendError('Database connection failed: ' . $e->getMessage(), 500);
}

// Handle API requests
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin($db);
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check':
        checkAuth();
        break;
    case 'get_user_data':
        getUserData($db);
        break;
    default:
        sendError('Invalid action specified', 400);
}

/**
 * Handle login request
 */
function handleLogin($db) {
    // Only accept POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }

    try {
        // Get and parse input (JSON or form)
        $rawInput = file_get_contents('php://input');
        error_log("Raw input: " . $rawInput);
        
        $input = json_decode($rawInput, true);
        if (!is_array($input) || empty($input)) {
            $input = $_POST;
        }
        
        error_log("Parsed input: " . json_encode($input));

        // Extract credentials (use username per current schema)
        $identifier = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? (string)$input['password'] : '';
        $remember = isset($input['remember']) ? (bool)$input['remember'] : false;
        $recaptchaToken = isset($input['recaptcha_token']) ? trim($input['recaptcha_token']) : '';
        
        error_log("Login attempt - Username: '$identifier', Password length: " . strlen($password));

        // Validate input
        if ($identifier === '' || $password === '') {
            error_log("Validation failed - empty credentials");
            sendError('Username and password are required');
        }
        
        // Verify reCAPTCHA
        $remoteIp = $_SERVER['REMOTE_ADDR'] ?? null;
        $recaptchaResult = verifyRecaptcha($recaptchaToken, $remoteIp);
        
        if (!$recaptchaResult['success']) {
            error_log("reCAPTCHA verification failed: " . ($recaptchaResult['error'] ?? 'Unknown error'));
            sendError('reCAPTCHA verification failed. Please complete the reCAPTCHA challenge.', 400);
        }

        // Query by username (schema does not include email column)
        $stmt = $db->prepare(
            "SELECT id, username, password, name, role, campus, office, status, last_login FROM users WHERE username = ? LIMIT 1"
        );
        $stmt->execute([$identifier]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        error_log("User found: " . ($user ? 'YES' : 'NO'));
        if ($user) {
            error_log("User details - ID: {$user['id']}, Username: {$user['username']}, Role: {$user['role']}, Status: {$user['status']}");
        }

        if (!$user) {
            error_log("User not found for username: '$identifier'");
            sendError('Invalid credentials or account not found');
        }

        // Treat various representations of active status as active; default inactive only if explicitly disabled
        $statusValue = isset($user['status']) ? strtolower(trim((string)$user['status'])) : '';
        $isActive = true;
        if ($statusValue !== '') {
            if (in_array($statusValue, ['inactive', 'disabled', 'blocked', 'suspended', '0'], true)) {
                $isActive = false;
            }
        }
        if (!$isActive) {
            sendError('Account is not active. Please contact the administrator.', 403);
        }

        // Verify password with migration-friendly fallbacks
        $storedHash = (string)$user['password'];
        $isValid = false;
        $needsRehash = false;
        
        // Primary: bcrypt/argon2 verify
        if ($storedHash !== '' && (str_starts_with($storedHash, '$2y$') || str_starts_with($storedHash, '$argon2'))) {
            if (password_verify($password, $storedHash)) {
                $isValid = true;
                $needsRehash = password_needs_rehash($storedHash, PASSWORD_DEFAULT);
            }
        } else {
            // Legacy support: plain text or MD5
            if (hash_equals($storedHash, $password)) {
                $isValid = true;
                $needsRehash = true;
            } elseif (hash_equals($storedHash, md5($password))) {
                $isValid = true;
                $needsRehash = true;
            }
        }

        if (!$isValid) {
            error_log('Invalid password for user: ' . ($user['username'] ?? 'unknown'));
            sendError('Invalid credentials');
        }

        // Update last login
        $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);

        // If legacy password matched, upgrade to strong hash
        if ($needsRehash) {
            try {
                $newHash = password_hash($password, PASSWORD_DEFAULT);
                $rehashStmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
                $rehashStmt->execute([$newHash, $user['id']]);
            } catch (Exception $rehashEx) {
                error_log('Password rehash failed for user ' . ($user['username'] ?? 'unknown') . ': ' . $rehashEx->getMessage());
            }
        }

        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['user_campus'] = $user['campus'];

        // Prepare user data for response
        $userData = [
            'id' => $user['id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'role' => $user['role'],
            'campus' => $user['campus'],
            'office' => $user['office']
        ];

        sendResponse([
            'user' => $userData
        ]);
    } catch (Exception $e) {
        error_log("Login exception: " . $e->getMessage());
        sendError('Login failed');
    }
}

/**
 * Handle logout request
 */
function handleLogout() {
    // Clear session
    session_unset();
    session_destroy();
    
    sendResponse(['message' => 'Logged out successfully']);
}

/**
 * Check if user is authenticated
 */
function checkAuth() {
    if (isset($_SESSION['user_id'])) {
        sendResponse([
            'authenticated' => true,
            'user_id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'] ?? '',
            'role' => $_SESSION['role'] ?? ''
        ]);
    } else {
        sendResponse([
            'authenticated' => false
        ]);
    }
}

/**
 * Get current user's full data
 */
function getUserData($db) {
    if (!isset($_SESSION['user_id'])) {
        sendError('User not authenticated', 401);
    }

    try {
        $stmt = $db->prepare("
            SELECT id, username, name, role, campus, office, status, last_login 
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            sendError('User not found', 404);
        }

        sendResponse([
            'user' => $user
        ]);
    } catch (Exception $e) {
        error_log("Error getting user data: " . $e->getMessage());
        sendError('Failed to get user data', 500);
    }
}

/**
 * Send error response
 */
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit();
}

/**
 * Send success response
 */
function sendResponse($data) {
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    exit();
}
?>