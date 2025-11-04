<?php
/**
 * Update Submission Status API
 * Updates the status of a submission (approve/reject)
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log errors to a file
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log the incoming request for debugging
error_log('Incoming request: ' . print_r($_REQUEST, true));
error_log('Input data: ' . file_get_contents('php://input'));

try {
    require_once __DIR__ . '/../config/database.php';
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $submissionId = $input['submission_id'] ?? '';
    $batchId = $input['batch_id'] ?? '';
    $status = $input['status'] ?? '';
    
    // Extract submission ID from batch_id if needed
    if (empty($submissionId) && !empty($batchId)) {
        if (strpos($batchId, 'submission_') === 0) {
            $submissionId = str_replace('submission_', '', $batchId);
        }
    }
    
    if (empty($submissionId)) {
        throw new Exception('Submission ID is required');
    }
    
    if (!in_array($status, ['approved', 'rejected', 'pending'])) {
        throw new Exception('Invalid status. Must be: approved, rejected, or pending');
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Update submission status
    $query = "UPDATE report_submissions 
              SET status = :status, 
                  reviewed_date = NOW() 
              WHERE id = :id";
    
    $stmt = $db->prepare($query);
    $stmt->execute([
        'status' => $status,
        'id' => $submissionId
    ]);
    
    if ($stmt->rowCount() > 0) {
        $response = [
            'success' => true,
            'message' => "Submission {$status} successfully",
            'submission_id' => $submissionId,
            'status' => $status
        ];
        error_log('Success: ' . print_r($response, true));
        echo json_encode($response);
    } else {
        $errorMsg = 'Submission not found or status unchanged. Submission ID: ' . $submissionId . ', Status: ' . $status;
        error_log($errorMsg);
        throw new Exception($errorMsg);
    }
    
} catch (Exception $e) {
    $errorResponse = [
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ];
    error_log('Error: ' . print_r($errorResponse, true));
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode($errorResponse);
}
