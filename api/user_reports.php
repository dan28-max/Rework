<?php
/**
 * User Reports API
 * Handles fetching assigned reports for users
 */

// Suppress error display to prevent HTML output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Include database configuration
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../includes/functions.php';

    // Check if user is authenticated
    session_start();
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
        exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit();
}

try {
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
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

/**
 * Get assigned reports for the current user
 */
function getAssignedReports() {
    $pdo = getDB();
    
    try {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'] ?? 'user';
        
        // Get user's office and campus assignment
        $userInfo = getUserOfficeAndCampus($userId);
        
        if (!$userInfo || !$userInfo['office']) {
            echo json_encode([
                'success' => true,
                'data' => [],
                'message' => 'No office assignment found'
            ]);
            return;
        }
        
        $userOffice = $userInfo['office'];
        $userCampus = $userInfo['campus'];
        
        // Build office+campus combination to check (e.g., "RGO San Juan")
        $officeCampusCombo = trim($userOffice . ' ' . ($userCampus ?? ''));
        
        // Get approved data submissions for this office AND campus ONLY
        // Join with users table to get campus of the submitter - MUST match user's campus
        // Filter strictly by office and campus to prevent cross-campus access
        $sql = "SELECT 
                    ds.table_name,
                    ds.assigned_office,
                    ds.record_count,
                    ds.submitted_at as upload_date,
                    ta.description,
                    u.name as uploaded_by_name,
                    u.campus as submitter_campus
                FROM data_submissions ds
                LEFT JOIN table_assignments ta ON ds.table_name = ta.table_name AND ds.assigned_office = ta.assigned_office
                INNER JOIN users u ON ds.submitted_by = u.id
                WHERE ds.status = 'approved'
                AND (
                    -- Match if assigned_office equals the office+campus combination
                    LOWER(TRIM(ds.assigned_office)) = LOWER(:officeCampusCombo)
                    OR 
                    -- Match if assigned_office equals just office AND submitter's campus matches
                    (LOWER(TRIM(ds.assigned_office)) = LOWER(:office) AND u.campus = :campus)
                )
                AND u.campus = :campus2
                AND u.campus IS NOT NULL
                ORDER BY ds.submitted_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'officeCampusCombo' => $officeCampusCombo,
            'office' => $userOffice,
            'campus' => $userCampus,
            'campus2' => $userCampus
        ]);
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
    $pdo = getDB();
    
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
        
        // Check if user has access to this office and campus
        $userId = $_SESSION['user_id'];
        $userInfo = getUserOfficeAndCampus($userId);
        
        if (!$userInfo || $userInfo['office'] !== $office) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied']);
            return;
        }
        
        $userCampus = $userInfo['campus'];
        
        // Build office+campus combination
        $officeCampusCombo = trim($userInfo['office'] . ' ' . ($userCampus ?? ''));
        
        // Get approved submission data - STRICTLY filter by campus to prevent cross-campus access
        // Use INNER JOIN to ensure submitter exists and has campus
        $sql = "SELECT ds.submission_data 
                FROM data_submissions ds
                INNER JOIN users u ON ds.submitted_by = u.id
                WHERE ds.table_name = :table_name 
                AND ds.status = 'approved'
                AND (
                    -- Match if assigned_office equals the office+campus combination
                    LOWER(TRIM(ds.assigned_office)) = LOWER(:officeCampusCombo)
                    OR 
                    -- Match if assigned_office equals just office AND submitter's campus matches
                    (LOWER(TRIM(ds.assigned_office)) = LOWER(:office) AND u.campus = :campus)
                )
                AND u.campus = :campus2
                AND u.campus IS NOT NULL
                ORDER BY ds.submitted_at DESC 
                LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'table_name' => $tableName,
            'officeCampusCombo' => $officeCampusCombo,
            'office' => $office,
            'campus' => $userCampus,
            'campus2' => $userCampus
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
    $pdo = getDB();
    
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
 * Get user's office and campus assignment
 */
function getUserOfficeAndCampus($userId) {
    $pdo = getDB();
    
    try {
        $sql = "SELECT office, campus FROM users WHERE id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['user_id' => $userId]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? ['office' => $result['office'], 'campus' => $result['campus']] : null;
        
    } catch (PDOException $e) {
        error_log("Error getting user office and campus: " . $e->getMessage());
        return null;
    }
}

/**
 * Get uploader name
 */
function getUploaderName($userId) {
    $pdo = getDB();
    
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
