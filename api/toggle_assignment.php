<?php
// Toggle assignment status API
ob_clean();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
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
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['assignment_id']) || !isset($input['status'])) {
        throw new Exception('Missing required fields');
    }
    
    $assignmentId = (int)$input['assignment_id'];
    $newStatus = $input['status'];
    
    // Validate status
    if (!in_array($newStatus, ['active', 'completed', 'cancelled'])) {
        throw new Exception('Invalid status value');
    }
    
    // Update assignment status
    $stmt = $pdo->prepare("UPDATE table_assignments SET status = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$newStatus, $assignmentId]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Assignment status updated successfully'
        ]);
    } else {
        throw new Exception('Assignment not found or no changes made');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
