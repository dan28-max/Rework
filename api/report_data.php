<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/ReportManager.php';

header('Content-Type: application/json');

// Initialize database connection and ReportManager
$database = new Database();
$db = $database->getConnection();
$reportManager = new ReportManager($db);

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/Rework/api/report_data', '', $path);
$pathSegments = explode('/', trim($path, '/'));

// Get query parameters
$queryParams = $_GET;

// Handle different endpoints
$response = [];

try {
    switch ($method) {
        case 'GET':
            // GET /api/report_data/{tableName} - Get report data with pagination
            $tableName = $pathSegments[0] ?? null;
            
            if (!$tableName) {
                http_response_code(400);
                $response = [
                    'success' => false,
                    'message' => 'Table name is required'
                ];
                break;
            }
            
            // Get pagination parameters
            $page = isset($queryParams['page']) ? (int)$queryParams['page'] : 1;
            $pageSize = isset($queryParams['page_size']) ? (int)$queryParams['page_size'] : 10;
            
            // Build filters from query parameters (exclude pagination params)
            $filters = [];
            $excludeParams = ['page', 'page_size', 'sort_by', 'sort_dir'];
            
            foreach ($queryParams as $key => $value) {
                if (!in_array($key, $excludeParams)) {
                    $filters[$key] = $value;
                }
            }
            
            $result = $reportManager->getReportData($tableName, $page, $pageSize, $filters);
            
            if ($result['success']) {
                $response = [
                    'success' => true,
                    'data' => $result['data'],
                    'pagination' => $result['pagination']
                ];
            } else {
                http_response_code(400);
                $response = [
                    'success' => false,
                    'message' => $result['message']
                ];
            }
            break;
            
        case 'POST':
            // POST /api/report_data/{tableName} - Submit new report data
            $tableName = $pathSegments[0] ?? null;
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$tableName) {
                http_response_code(400);
                $response = [
                    'success' => false,
                    'message' => 'Table name is required'
                ];
                break;
            }
            
            // Get user ID from session or token (for now using a default)
            $submittedBy = 1; // Should be replaced with actual user ID from session/token
            $officeId = $data['office_id'] ?? null;
            
            if (!$officeId) {
                http_response_code(400);
                $response = [
                    'success' => false,
                    'message' => 'Office ID is required'
                ];
                break;
            }
            
            // Remove metadata fields from the data
            unset($data['submitted_by'], $data['office_id'], $data['status']);
            
            $result = $reportManager->submitReportData($tableName, $data, $submittedBy, $officeId);
            
            if ($result['success']) {
                http_response_code(201);
                $response = [
                    'success' => true,
                    'message' => 'Report data submitted successfully',
                    'data' => [
                        'id' => $result['id']
                    ]
                ];
            } else {
                http_response_code(400);
                $response = [
                    'success' => false,
                    'message' => $result['message']
                ];
            }
            break;
            
        case 'PUT':
            // PUT /api/report_data/{tableName}/{recordId} - Update report data
            $tableName = $pathSegments[0] ?? null;
            $recordId = $pathSegments[1] ?? null;
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$tableName || !$recordId) {
                http_response_code(400);
                $response = [
                    'success' => false,
                    'message' => 'Table name and record ID are required'
                ];
                break;
            }
            
            // Check if this is a status update
            if (isset($data['status'])) {
                $reviewedBy = $data['reviewed_by'] ?? 1; // Should be from session/token
                $reviewNotes = $data['review_notes'] ?? '';
                
                $result = $reportManager->updateReportStatus(
                    $tableName, 
                    $recordId, 
                    $data['status'], 
                    $reviewedBy, 
                    $reviewNotes
                );
                
                if ($result['success']) {
                    $response = [
                        'success' => true,
                        'message' => 'Report status updated successfully',
                        'affected_rows' => $result['affected_rows']
                    ];
                } else {
                    http_response_code(400);
                    $response = [
                        'success' => false,
                        'message' => $result['message']
                    ];
                }
            } else {
                // Handle other field updates if needed
                http_response_code(501); // Not implemented
                $response = [
                    'success' => false,
                    'message' => 'Updating report data fields is not yet implemented'
                ];
            }
            break;
            
        case 'DELETE':
            // DELETE /api/report_data/{tableName}/{recordId} - Delete report data
            $tableName = $pathSegments[0] ?? null;
            $recordId = $pathSegments[1] ?? null;
            
            if (!$tableName || !$recordId) {
                http_response_code(400);
                $response = [
                    'success' => false,
                    'message' => 'Table name and record ID are required'
                ];
                break;
            }
            
            try {
                $sql = "DELETE FROM `{$tableName}` WHERE id = :id";
                $stmt = $db->prepare($sql);
                $result = $stmt->execute([':id' => $recordId]);
                
                $response = [
                    'success' => $result,
                    'message' => $result ? 'Record deleted successfully' : 'Failed to delete record',
                    'affected_rows' => $stmt->rowCount()
                ];
                
                if ($stmt->rowCount() === 0) {
                    http_response_code(404);
                    $response['message'] = 'Record not found';
                }
                
            } catch (PDOException $e) {
                http_response_code(500);
                $response = [
                    'success' => false,
                    'message' => 'Database error: ' . $e->getMessage()
                ];
            }
            break;
            
        default:
            http_response_code(405);
            $response = [
                'success' => false,
                'message' => 'Method not allowed'
            ];
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    $response = [
        'success' => false,
        'message' => 'An error occurred: ' . $e->getMessage()
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
