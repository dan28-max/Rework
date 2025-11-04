<?php
// Get current table assignments API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Suppress error display
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . '/../config/database.php';
    
    // Temporarily disable authentication for testing
    session_start();
    if (!isset($_SESSION['user_id'])) {
        $_SESSION['user_id'] = 602; // Default admin ID
        $_SESSION['user_role'] = 'admin';
    }
    
    $pdo = getDB();
    
    // Get only active table assignments ordered by most recent first
    $stmt = $pdo->prepare("
        SELECT ta.*, u.name as assigned_by_name 
        FROM table_assignments ta 
        LEFT JOIN users u ON ta.assigned_by = u.id 
        WHERE ta.status = 'active'
        ORDER BY ta.assigned_date DESC
    ");
    $stmt->execute();
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $assignments,
        'count' => count($assignments)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
