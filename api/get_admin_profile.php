<?php
/**
 * Get Admin Profile API
 * Returns the current user's profile information
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to prevent HTML output
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Include database configuration
    require_once __DIR__ . '/../config/database.php';
    
    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'User not authenticated. Please log in.'
        ]);
        exit();
    }

    // Get database connection using the standard helper function
    $db = getDB();
    
    if (!$db) {
        throw new Exception('Failed to connect to database');
    }

    // Get user ID from session
    $userId = $_SESSION['user_id'];

    // Prepare and execute query to get admin details
    // Handle case where username might not exist - check all possible columns
    $query = "SELECT id, name, role, campus, office, status, created_at, updated_at, last_login";
    
    // Check if username column exists
    try {
        $checkStmt = $db->query("SHOW COLUMNS FROM users LIKE 'username'");
        if ($checkStmt->rowCount() > 0) {
            $query .= ", username";
        }
    } catch (PDOException $e) {
        error_log("Could not check for username column: " . $e->getMessage());
    }
    
    // Check if email column exists (fallback for username)
    try {
        $checkStmt = $db->query("SHOW COLUMNS FROM users LIKE 'email'");
        if ($checkStmt->rowCount() > 0) {
            $query .= ", email";
        }
    } catch (PDOException $e) {
        error_log("Could not check for email column: " . $e->getMessage());
    }
    
    $query .= " FROM users WHERE id = :id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Format the response
        $response = [
            'success' => true,
            'data' => [
                'id' => $user['id'] ?? null,
                'username' => $user['username'] ?? ($user['email'] ?? 'N/A'),
                'name' => $user['name'] ?? 'N/A',
                'role' => isset($user['role']) ? ucfirst(str_replace('_', ' ', $user['role'])) : 'User',
                'campus' => $user['campus'] ?? 'Not specified',
                'office' => $user['office'] ?? 'Not specified',
                'status' => $user['status'] ?? 'unknown',
                'accountCreated' => $user['created_at'] ?? null,
                'lastUpdated' => $user['updated_at'] ?? null,
                'lastLogin' => $user['last_login'] ?? null
            ]
        ];
        
        echo json_encode($response);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
    }
    
} catch (PDOException $e) {
    error_log("Database error in get_admin_profile.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Error in get_admin_profile.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching admin profile: ' . $e->getMessage()
    ]);
}
