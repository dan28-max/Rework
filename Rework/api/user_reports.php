<?php
/**
 * User Reports API
 * Handles fetching assigned reports for users
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database configuration
require_once '../config/database.php';
require_once '../includes/functions.php';

// Check if user is authenticated
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit();
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_assigned':
        getAssignedReports();
        break;
    case 'view_data':
        viewReportData();
        break;
    case 'export_data':
        exportReportData();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

/**
 * Get assigned reports for the current user
 */
function getAssignedReports() {
    global $pdo;
    
    try {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'] ?? 'user';
        
        // Get user's office/campus assignment
        $userOffice = getUserOffice($userId);
        
        if (!$userOffice) {
            echo json_encode([
                'success' => true,
                'data' => [],
                'message' => 'No office assignment found'
            ]);
            return;
        }
        
        // Get approved data submissions for this office
        $sql = "SELECT 
                    ds.table_name,
                    ds.assigned_office,
                    ds.record_count,
                    ds.submitted_at as upload_date,
                    ta.description,
                    u.name as uploaded_by_name
                FROM data_submissions ds
                LEFT JOIN table_assignments ta ON ds.table_name = ta.table_name AND ds.assigned_office = ta.assigned_office
                LEFT JOIN users u ON ds.submitted_by = u.id
                WHERE ds.assigned_office = :office 
                AND ds.status = 'approved'
                ORDER BY ds.submitted_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['office' => $userOffice]);
        $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get uploader names
        foreach ($reports as &$report) {
            if ($report['uploaded_by']) {
                $uploaderName = getUploaderName($report['uploaded_by']);
                $report['uploaded_by_name'] = $uploaderName;
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => $reports
        ]);
        
    } catch (PDOException $e) {
        error_log("Error fetching assigned reports: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error occurred'
        ]);
    }
}

/**
 * View report data
 */
function viewReportData() {
    global $pdo;
    
    try {
        $tableName = $_GET['table'] ?? '';
        $office = $_GET['office'] ?? '';
        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = ($page - 1) * $limit;
        
        if (empty($tableName) || empty($office)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
            return;
        }
        
        // Validate table name
        $allowedTables = [
            'admissiondata', 'enrollmentdata', 'graduatesdata', 'employee',
            'leaveprivilege', 'libraryvisitor', 'pwd', 'waterconsumption',
            'treatedwastewater', 'electricityconsumption', 'solidwaste',
            'campuspopulation', 'foodwaste', 'fuelconsumption',
            'distancetraveled', 'budgetexpenditure', 'flightaccommodation'
        ];
        
        if (!in_array($tableName, $allowedTables)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid table name']);
            return;
        }
        
        // Check if user has access to this office
        $userId = $_SESSION['user_id'];
        $userOffice = getUserOffice($userId);
        
        if ($userOffice !== $office) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied']);
            return;
        }
        
        // Get approved submission data
        $sql = "SELECT submission_data FROM data_submissions 
                WHERE table_name = :table_name 
                AND assigned_office = :office 
                AND status = 'approved'
                ORDER BY submitted_at DESC 
                LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'table_name' => $tableName,
            'office' => $office
        ]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $data = $result ? json_decode($result['submission_data'], true) : [];
        
        // Apply pagination to the data
        $totalCount = count($data);
        $data = array_slice($data, $offset, $limit);
        
        echo json_encode([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalCount,
                'pages' => ceil($totalCount / $limit)
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("Error viewing report data: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error occurred'
        ]);
    }
}

/**
 * Export report data
 */
function exportReportData() {
    // This would implement CSV/Excel export functionality
    // For now, just return a success message
    echo json_encode([
        'success' => true,
        'message' => 'Export functionality would be implemented here'
    ]);
}

/**
 * Get user's office assignment
 */
function getUserOffice($userId) {
    global $pdo;
    
    try {
        $sql = "SELECT office FROM users WHERE id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? $result['office'] : null;
        
    } catch (PDOException $e) {
        error_log("Error getting user office: " . $e->getMessage());
        return null;
    }
}

/**
 * Get uploader name
 */
function getUploaderName($userId) {
    global $pdo;
    
    try {
        $sql = "SELECT name FROM users WHERE id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? $result['name'] : 'Unknown';
        
    } catch (PDOException $e) {
        error_log("Error getting uploader name: " . $e->getMessage());
        return 'Unknown';
    }
}
?>
