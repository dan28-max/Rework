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
$path = str_replace('/Rework/api/report_tables', '', $path);
$pathSegments = explode('/', trim($path, '/'));

// Handle different endpoints
$response = [];

try {
    switch ($method) {
        case 'GET':
            // GET /api/report_tables - List all report types
            if (empty($pathSegments[0])) {
                $reports = $reportManager->getReportMetadata();
                $response = [
                    'success' => true,
                    'data' => $reports
                ];
            } 
            // GET /api/report_tables/{reportId} - Get report metadata
            elseif (is_numeric($pathSegments[0]) || !empty($pathSegments[0])) {
                $reportId = $pathSegments[0];
                $report = $reportManager->getReportMetadata($reportId);
                
                if ($report) {
                    $response = [
                        'success' => true,
                        'data' => $report
                    ];
                } else {
                    http_response_code(404);
                    $response = [
                        'success' => false,
                        'message' => 'Report not found'
                    ];
                }
            }
            break;
            
        case 'POST':
            // POST /api/report_tables - Create a new report type
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['report_id']) || empty($data['display_name'])) {
                http_response_code(400);
                $response = [
                    'success' => false,
                    'message' => 'Missing required fields: report_id and display_name are required'
                ];
                break;
            }
            
            $result = $reportManager->createReportType(
                $data['report_id'],
                $data['display_name'],
                $data['description'] ?? '',
                $data['created_by'] ?? 1, // Default to admin user
                $data['columns'] ?? []
            );
            
            if ($result['success']) {
                http_response_code(201);
                $response = [
                    'success' => true,
                    'message' => 'Report type created successfully',
                    'data' => [
                        'table_name' => $result['table_name']
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
            // PUT /api/report_tables/{reportId} - Update report metadata
            $reportId = $pathSegments[0] ?? null;
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$reportId) {
                http_response_code(400);
                $response = [
                    'success' => false,
                    'message' => 'Report ID is required'
                ];
                break;
            }
            
            // Get existing metadata
            $existing = $reportManager->getReportMetadata($reportId);
            if (!$existing) {
                http_response_code(404);
                $response = [
                    'success' => false,
                    'message' => 'Report not found'
                ];
                break;
            }
            
            // Update fields
            $updateFields = [];
            $params = [':id' => $reportId];
            
            if (!empty($data['display_name'])) {
                $updateFields[] = 'display_name = :display_name';
                $params[':display_name'] = $data['display_name'];
            }
            
            if (isset($data['description'])) {
                $updateFields[] = 'description = :description';
                $params[':description'] = $data['description'];
            }
            
            if (isset($data['is_active']) && is_bool($data['is_active'])) {
                $updateFields[] = 'is_active = :is_active';
                $params[':is_active'] = $data['is_active'] ? 1 : 0;
            }
            
            if (empty($updateFields)) {
                $response = [
                    'success' => true,
                    'message' => 'No fields to update'
                ];
                break;
            }
            
            $sql = "UPDATE reports_metadata SET " . implode(', ', $updateFields) . " WHERE report_id = :id";
            $stmt = $db->prepare($sql);
            $result = $stmt->execute($params);
            
            $response = [
                'success' => $result,
                'message' => $result ? 'Report updated successfully' : 'Failed to update report'
            ];
            break;
            
        case 'DELETE':
            // DELETE /api/report_tables/{reportId} - Delete a report type
            $reportId = $pathSegments[0] ?? null;
            $deleteData = isset($_GET['delete_data']) && $_GET['delete_data'] === 'true';
            
            if (!$reportId) {
                http_response_code(400);
                $response = [
                    'success' => false,
                    'message' => 'Report ID is required'
                ];
                break;
            }
            
            $result = $reportManager->deleteReportType($reportId, $deleteData);
            
            if ($result['success']) {
                $response = [
                    'success' => true,
                    'message' => 'Report type deleted successfully',
                    'data_deleted' => $deleteData
                ];
            } else {
                http_response_code(400);
                $response = [
                    'success' => false,
                    'message' => $result['message']
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
