<?php
/**
 * User Submissions API
 * Handles fetching user's submission history
 */

// Start session first before any output
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Enable error display for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Include database configuration
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../includes/functions.php';
    
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
        exit();
    }
} catch (Exception $e) {
    error_log("Error in user_submissions.php initialization: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
    exit();
}

try {
    $action = $_GET['action'] ?? 'get_submissions';

    switch ($action) {
        case 'get_submissions':
            getUserSubmissions();
            break;
        case 'details':
            getSubmissionDetails();
            break;
        default:
            getUserSubmissions();
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
 * Get submission history for the current user
 */
function getUserSubmissions() {
    $pdo = getDB();
    
    try {
        $userId = $_SESSION['user_id'];
        
        // Check if report_submissions table exists
        $tableCheckSql = "SHOW TABLES LIKE 'report_submissions'";
        $tableCheckStmt = $pdo->query($tableCheckSql);
        
        if ($tableCheckStmt->rowCount() === 0) {
            // Table doesn't exist, return empty array
            echo json_encode([
                'success' => true,
                'submissions' => [],
                'message' => 'No submissions table found'
            ]);
            return;
        }
        
        // Get user's submission history with record count from submission_data
        // CRITICAL: Filter by user_id to ensure users only see their own submissions
        
        // First, check what columns exist in report_submissions table
        $columnsResult = $pdo->query("DESCRIBE report_submissions");
        $columns = $columnsResult->fetchAll(PDO::FETCH_COLUMN);
        
        // Log available columns for debugging
        error_log("Available columns in report_submissions: " . implode(", ", $columns));
        
        // Determine which columns to use
        $userIdCol = in_array('user_id', $columns) ? 'rs.user_id' : (in_array('submitted_by', $columns) ? 'rs.submitted_by' : 'rs.id');
        $tableNameCol = in_array('table_name', $columns) ? 'rs.table_name' : (in_array('report_type', $columns) ? 'rs.report_type' : 'NULL');
        $officeCol = in_array('office', $columns) ? 'rs.office' : 'NULL';
        $campusCol = in_array('campus', $columns) ? 'rs.campus' : 'NULL';
        $statusCol = in_array('status', $columns) ? 'rs.status' : "'pending'";
        $descCol = in_array('description', $columns) ? 'rs.description' : 'NULL';
        $reviewedCol = in_array('reviewed_date', $columns) ? 'rs.reviewed_date' : (in_array('reviewed_at', $columns) ? 'rs.reviewed_at' : 'NULL');
        $submissionDateCol = in_array('submission_date', $columns) ? 'rs.submission_date' : (in_array('submitted_at', $columns) ? 'rs.submitted_at' : (in_array('created_at', $columns) ? 'rs.created_at' : 'NOW()'));
        
        error_log("Using user_id column: $userIdCol");
        
        // Try with report_submission_data join first
        try {
            $sql = "SELECT 
                        rs.id,
                        $tableNameCol as table_name,
                        $officeCol as office,
                        $campusCol as campus,
                        $submissionDateCol as submission_date,
                        $statusCol as status,
                        $descCol as description,
                        $reviewedCol as reviewed_date,
                        u.name as submitted_by_name,
                        COUNT(rsd.id) as record_count
                    FROM report_submissions rs
                    LEFT JOIN users u ON $userIdCol = u.id
                    LEFT JOIN report_submission_data rsd ON rs.id = rsd.submission_id
                    WHERE $userIdCol = ?
                    GROUP BY rs.id
                    ORDER BY $submissionDateCol DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$userId]);
            $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // If report_submission_data table doesn't exist, query without it
            error_log("report_submission_data table not found, querying without it: " . $e->getMessage());
            
            $sql = "SELECT 
                        rs.id,
                        $tableNameCol as table_name,
                        $officeCol as office,
                        $campusCol as campus,
                        $submissionDateCol as submission_date,
                        $statusCol as status,
                        $descCol as description,
                        $reviewedCol as reviewed_date,
                        u.name as submitted_by_name,
                        0 as record_count
                    FROM report_submissions rs
                    LEFT JOIN users u ON $userIdCol = u.id
                    WHERE $userIdCol = ?
                    ORDER BY $submissionDateCol DESC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$userId]);
            $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        // Format dates for display
        foreach ($submissions as &$submission) {
            if (isset($submission['submission_date'])) {
                $date = new DateTime($submission['submission_date']);
                $submission['submitted_at'] = $submission['submission_date'];
                $submission['submitted_at_formatted'] = $date->format('M d, Y h:i A');
            }
            if (isset($submission['reviewed_date']) && $submission['reviewed_date']) {
                $date = new DateTime($submission['reviewed_date']);
                $submission['reviewed_at_formatted'] = $date->format('M d, Y h:i A');
            }
        }
        
        echo json_encode([
            'success' => true,
            'submissions' => $submissions
        ]);
        
    } catch (PDOException $e) {
        error_log("Error fetching user submissions: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage(),
            'error' => $e->getMessage(),
            'code' => $e->getCode(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);
    } catch (Exception $e) {
        error_log("Unexpected error in getUserSubmissions: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);
    }
}

/**
 * Get detailed submission data including all rows
 */
function getSubmissionDetails() {
    $pdo = getDB();
    
    try {
        $userId = $_SESSION['user_id'];
        $submissionId = $_GET['submission_id'] ?? null;
        
        if (!$submissionId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Submission ID required']);
            return;
        }
        
        // Check columns in report_submissions table
        $columnsResult = $pdo->query("DESCRIBE report_submissions");
        $columns = $columnsResult->fetchAll(PDO::FETCH_COLUMN);
        $userIdCol = in_array('user_id', $columns) ? 'rs.user_id' : (in_array('submitted_by', $columns) ? 'rs.submitted_by' : 'rs.id');
        
        // Get submission info - ensure it belongs to the current user
        $sql = "SELECT 
                    rs.*,
                    u.name as submitted_by_name,
                    u.username as submitted_by_username
                FROM report_submissions rs
                LEFT JOIN users u ON $userIdCol = u.id
                WHERE rs.id = ? AND $userIdCol = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$submissionId, $userId]);
        $submission = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$submission) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Submission not found or access denied']);
            return;
        }
        
        // Get submission data rows
        $dataSql = "SELECT row_data FROM report_submission_data WHERE submission_id = ? ORDER BY id";
        $dataStmt = $pdo->prepare($dataSql);
        $dataStmt->execute([$submissionId]);
        $dataRows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Decode JSON data from each row
        $submission['data'] = array_map(function($row) {
            return json_decode($row['row_data'], true);
        }, $dataRows);
        
        echo json_encode([
            'success' => true,
            'data' => $submission
        ]);
        
    } catch (PDOException $e) {
        error_log("Error fetching submission details: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ]);
    }
}
?>
