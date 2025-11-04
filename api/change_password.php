<?php
// Enable error reporting for debugging
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/error.log');
error_reporting(E_ALL);

// Set headers for JSON response
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Start session with secure settings
session_start([
    'cookie_httponly' => true,
    'cookie_secure' => isset($_SERVER['HTTPS']),
    'use_strict_mode' => true
]);

// Database connection
$dbFile = __DIR__ . '/../includes/db_connect.php';
if (!file_exists($dbFile)) {
    error_log('Database connection file not found: ' . $dbFile);
    sendResponse(false, 'System configuration error');
}

require_once $dbFile;

// Verify database connection
if (!isset($pdo) || !($pdo instanceof PDO)) {
    error_log('Database connection not properly initialized');
    sendResponse(false, 'Database connection error');
}

// Function to send JSON response
function sendResponse($success, $message = '', $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    sendResponse(false, 'User not authenticated');
}

// Get the request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input
if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
    sendResponse(false, 'Missing required fields');
}

$currentPassword = trim($data['currentPassword']);
$newPassword = trim($data['newPassword']);

// Validate password strength
if (strlen($newPassword) < 8) {
    sendResponse(false, 'Password must be at least 8 characters long');
}

try {
    // Get user's current password hash from database
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = :user_id");
    $stmt->execute(['user_id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        sendResponse(false, 'User not found');
    }
    
    // Verify current password
    if (!password_verify($currentPassword, $user['password'])) {
        sendResponse(false, 'Current password is incorrect');
    }
    
    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update password in database
    $updateStmt = $pdo->prepare("UPDATE users SET password = :password, updated_at = NOW() WHERE id = :user_id");
    $result = $updateStmt->execute([
        'password' => $hashedPassword,
        'user_id' => $_SESSION['user_id']
    ]);
    
    if ($result) {
        // Log the password change activity
        try {
            $activityStmt = $pdo->prepare("
                INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
                VALUES (:user_id, 'password_change', 'Password changed successfully', :ip_address, :user_agent)
            ");
            $activityStmt->execute([
                'user_id' => $_SESSION['user_id'],
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
            ]);
        } catch (PDOException $e) {
            error_log("Failed to log password change activity: " . $e->getMessage());
        }
        
        sendResponse(true, 'Password changed successfully');
    } else {
        sendResponse(false, 'Failed to update password');
    }
    
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    sendResponse(false, 'A database error occurred. Please try again later.');
} catch (Exception $e) {
    error_log('Error: ' . $e->getMessage());
    sendResponse(false, 'An error occurred. Please try again.');
}
