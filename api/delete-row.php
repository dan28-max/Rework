<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get the raw POST data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate JSON data
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit();
}

// Get database connection
require_once __DIR__ . '/../includes/db_connect.php';

// Get table and ID from POST data
$table = isset($data['table']) ? trim($data['table']) : '';
$id = isset($data['id']) ? trim($data['id']) : '';

// Validate input
if (empty($table) || empty($id)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'Table name and ID are required',
        'received_data' => $data
    ]);
    exit();
}

// Sanitize table name to prevent SQL injection
if (!preg_match('/^[a-zA-Z0-9_]+$/', $table)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid table name']);
    exit();
}

try {
    // Check if table exists
    $stmt = $pdo->prepare("SHOW TABLES LIKE :table");
    $stmt->execute([':table' => $table]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Table not found']);
        exit();
    }
    
    // Start transaction
    $pdo->beginTransaction();
    
    // Prepare and execute the delete query
    $stmt = $pdo->prepare("DELETE FROM `$table` WHERE ID = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_STR);
    $stmt->execute();
    
    // Check if any row was actually deleted
    if ($stmt->rowCount() === 0) {
        throw new Exception('No matching record found to delete');
    }
    
    // Commit the transaction
    $pdo->commit();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Row deleted successfully',
        'id' => $id
    ]);
    
} catch (Exception $e) {
    // Rollback in case of error
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error deleting row: ' . $e->getMessage()
    ]);
}
?>
