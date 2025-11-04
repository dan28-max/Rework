<?php
/**
 * Get Submission Details API
 * Fetches detailed records for a specific submission from report_submission_data
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    error_log("=== get_submission_details.php called ===");
    require_once __DIR__ . '/../config/database.php';
    
    $submissionId = $_GET['submission_id'] ?? '';
    $batchId = $_GET['batch_id'] ?? '';
    
    error_log("Submission ID: $submissionId, Batch ID: $batchId");
    
    // Extract submission ID from batch_id if needed
    if (empty($submissionId) && !empty($batchId)) {
        if (strpos($batchId, 'submission_') === 0) {
            $submissionId = str_replace('submission_', '', $batchId);
        }
    }
    
    if (empty($submissionId)) {
        throw new Exception('Submission ID is required');
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get submission details
    $query = "SELECT * FROM report_submissions WHERE id = :id";
    error_log("Query: $query with id=$submissionId");
    $stmt = $db->prepare($query);
    $stmt->execute(['id' => $submissionId]);
    $submission = $stmt->fetch(PDO::FETCH_ASSOC);
    
    error_log("Submission found: " . ($submission ? 'YES' : 'NO'));
    if ($submission) {
        error_log("Submission data: " . print_r($submission, true));
    }
    
    if (!$submission) {
        throw new Exception('Submission not found');
    }
    
    // Get submission data - check if table exists first
    $data = [];
    try {
        $tableCheck = $db->query("SHOW TABLES LIKE 'report_submission_data'");
        if ($tableCheck->rowCount() > 0) {
            $dataQuery = "SELECT row_data FROM report_submission_data WHERE submission_id = :submission_id ORDER BY id ASC";
            $dataStmt = $db->prepare($dataQuery);
            $dataStmt->execute(['submission_id' => $submissionId]);
            $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Decode JSON data
            foreach ($rows as $row) {
                $data[] = json_decode($row['row_data'], true);
            }
        } else {
            error_log("report_submission_data table does not exist, will fetch from target table");
        }
    } catch (Exception $e) {
        error_log("Error fetching from report_submission_data: " . $e->getMessage());
    }
    
    // Get table name - handle both table_name and report_type columns
    $tableName = $submission['table_name'] ?? $submission['report_type'] ?? 'unknown';
    
    // If no data in report_submission_data, try to get from target table
    if (empty($data) && $tableName !== 'unknown') {
        try {
            // Check which columns exist in the target table
            $targetColsCheck = $db->query("SHOW COLUMNS FROM `$tableName`");
            $targetCols = [];
            while ($col = $targetColsCheck->fetch(PDO::FETCH_ASSOC)) {
                $targetCols[] = $col['Field'];
            }
            
            // Build WHERE clause based on available columns
            $whereConditions = [];
            $params = [];
            
            // PRIORITY: Filter by batch_id if it exists in both tables
            if (in_array('batch_id', $targetCols) && !empty($submission['batch_id'])) {
                $whereConditions[] = "batch_id = :batch_id";
                $params['batch_id'] = $submission['batch_id'];
                error_log("Filtering by batch_id: " . $submission['batch_id']);
            } else {
                // Fallback: Filter by campus and office
                if (in_array('campus', $targetCols) && !empty($submission['campus'])) {
                    $whereConditions[] = "campus = :campus";
                    $params['campus'] = $submission['campus'];
                }
                if (in_array('office', $targetCols) && !empty($submission['office'])) {
                    $whereConditions[] = "office = :office";
                    $params['office'] = $submission['office'];
                }
            }
            
            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
            
            // Get data directly from the target table
            $targetQuery = "SELECT * FROM `$tableName` $whereClause ORDER BY created_at DESC";
            error_log("Fetching from target table: $targetQuery");
            $targetStmt = $db->prepare($targetQuery);
            $targetStmt->execute($params);
            $data = $targetStmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Found " . count($data) . " rows in target table");
        } catch (Exception $e) {
            error_log("Could not fetch from target table: " . $e->getMessage());
        }
    }
    
    // Filter out metadata columns from the data display
    $columnsToHide = ['id', 'batch_id', 'submitted_by', 'submitted_at', 'created_at', 'updated_at', 'office'];
    $filteredData = [];
    foreach ($data as $row) {
        $filteredRow = [];
        foreach ($row as $key => $value) {
            if (!in_array(strtolower($key), $columnsToHide)) {
                $filteredRow[$key] = $value;
            }
        }
        $filteredData[] = $filteredRow;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $filteredData,
        'submission' => $submission,
        'table' => $tableName,
        'submission_id' => $submissionId
    ]);
    
} catch (Exception $e) {
    error_log("ERROR in get_submission_details.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
