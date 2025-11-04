<?php
/**
 * Get All Submissions API
 * Fetches all report submissions from report_submissions table
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once __DIR__ . '/../config/database.php';
    
    $database = new Database();
    $db = $database->getConnection();
    if (session_status() === PHP_SESSION_NONE) { session_start(); }
    $sessionCampus = isset($_SESSION['user_campus']) ? trim((string)$_SESSION['user_campus']) : '';
    
    // Check if report_submissions table exists
    $checkTable = $db->query("SHOW TABLES LIKE 'report_submissions'");
    if ($checkTable->rowCount() === 0) {
        throw new Exception('report_submissions table does not exist. Please run the database setup.');
    }
    
    // Get columns from report_submissions table dynamically
    $columnsCheck = $db->query("SHOW COLUMNS FROM report_submissions");
    $existingColumns = [];
    while ($col = $columnsCheck->fetch(PDO::FETCH_ASSOC)) {
        $existingColumns[] = $col['Field'];
    }
    
    error_log("report_submissions columns for fetching: " . implode(', ', $existingColumns));
    
    // Build SELECT based on available columns
    $selectFields = ['rs.id', 'rs.status'];
    
    // Add table identifier
    if (in_array('table_name', $existingColumns)) {
        $selectFields[] = 'rs.table_name';
    } elseif (in_array('report_type', $existingColumns)) {
        $selectFields[] = 'rs.report_type as table_name';
    }
    
    // Add timestamp
    if (in_array('submission_date', $existingColumns)) {
        $selectFields[] = 'rs.submission_date as submitted_at';
    } elseif (in_array('submitted_at', $existingColumns)) {
        $selectFields[] = 'rs.submitted_at';
    }
    
    // Add optional fields
    if (in_array('campus', $existingColumns)) {
        $selectFields[] = 'rs.campus';
    }
    if (in_array('office', $existingColumns)) {
        $selectFields[] = 'rs.office';
    }
    if (in_array('description', $existingColumns)) {
        $selectFields[] = 'rs.description';
    }
    // Always calculate record_count from report_submission_data table using JOIN for accuracy
    $selectFields[] = "COALESCE(COUNT(rsd.id), 0) as record_count";
    
    // Handle user reference
    $userJoin = '';
    if (in_array('user_id', $existingColumns)) {
        $selectFields[] = 'rs.user_id';
        $selectFields[] = 'u.name as user_name';
        $selectFields[] = 'u.username as submitted_by';
        $userJoin = 'LEFT JOIN users u ON rs.user_id = u.id';
    } elseif (in_array('submitted_by', $existingColumns)) {
        $selectFields[] = 'rs.submitted_by';
        $selectFields[] = 'u.name as user_name';
        $userJoin = 'LEFT JOIN users u ON rs.submitted_by = u.id';
    }
    
    // Check if report_submission_data table exists
    $checkDataTable = $db->query("SHOW TABLES LIKE 'report_submission_data'");
    $dataTableExists = $checkDataTable->rowCount() > 0;
    
    $dataJoin = '';
    if ($dataTableExists) {
        $dataJoin = 'LEFT JOIN report_submission_data rsd ON rs.id = rsd.submission_id';
    } else {
        // If table doesn't exist, use subquery as fallback
        $selectFields = array_filter($selectFields, function($field) {
            return !str_contains($field, 'COUNT(rsd.id)');
        });
        $selectFields[] = "0 as record_count";
    }
    
    $query = "SELECT " . implode(', ', $selectFields) . "
              FROM report_submissions rs
              $userJoin
              $dataJoin
              GROUP BY rs.id
              ORDER BY rs.id DESC";
    
    error_log("Fetching submissions with query: $query");
    
    $stmt = $db->query($query);
    $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Add batch_id for compatibility (use submission id as batch identifier)
    foreach ($submissions as &$submission) {
        $submission['batch_id'] = 'submission_' . $submission['id'];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $submissions,
        'count' => count($submissions)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
