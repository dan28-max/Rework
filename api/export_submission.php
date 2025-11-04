<?php
/**
 * Export Submission to CSV
 * Exports a single submission's data to CSV format
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

// Start session for authentication
session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

// Get submission ID
$submission_id = isset($_GET['submission_id']) ? intval($_GET['submission_id']) : 0;

if ($submission_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid submission ID']);
    exit;
}

try {
    // Get database connection
    $pdo = getDB();
    
    // Get submission details
    $stmt = $pdo->prepare("
        SELECT 
            s.id,
            s.table_name,
            s.campus,
            s.office,
            s.submitted_by,
            s.submitted_at,
            s.status,
            u.username as submitted_by_username
        FROM submissions s
        LEFT JOIN users u ON s.submitted_by = u.id
        WHERE s.id = ?
    ");
    $stmt->execute([$submission_id]);
    $submission = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$submission) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Submission not found']);
        exit;
    }
    
    // Get submission data from report_submission_data table
    $table_name = $submission['table_name'];
    $data_stmt = $pdo->prepare("
        SELECT row_data 
        FROM report_submission_data 
        WHERE submission_id = ?
        ORDER BY id
    ");
    $data_stmt->execute([$submission_id]);
    $data_rows = $data_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($data_rows)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'No data found for this submission']);
        exit;
    }
    
    // Decode JSON data from each row
    $data = [];
    foreach ($data_rows as $row) {
        $decoded = json_decode($row['row_data'], true);
        if ($decoded) {
            $data[] = $decoded;
        }
    }
    
    if (empty($data)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Invalid data format']);
        exit;
    }
    
    // Set headers for CSV download
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $table_name . '_submission_' . $submission_id . '_' . date('Y-m-d') . '.csv"');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    // Open output stream
    $output = fopen('php://output', 'w');
    
    // Add BOM for UTF-8
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    // Add metadata header
    fputcsv($output, ['Submission Information']);
    fputcsv($output, ['Submission ID', $submission['id']]);
    fputcsv($output, ['Report Type', ucwords(str_replace('_', ' ', $table_name))]);
    fputcsv($output, ['Campus', $submission['campus'] ?? 'N/A']);
    fputcsv($output, ['Office', $submission['office'] ?? 'N/A']);
    fputcsv($output, ['Submitted By', $submission['submitted_by_username'] ?? 'Unknown']);
    fputcsv($output, ['Submitted Date', $submission['submitted_at']]);
    fputcsv($output, ['Status', ucfirst($submission['status'])]);
    fputcsv($output, []);
    fputcsv($output, ['Report Data']);
    fputcsv($output, []);
    
    // Write column headers
    if (!empty($data) && is_array($data[0])) {
        $headers = array_keys($data[0]);
        fputcsv($output, $headers);
        
        // Write data rows
        foreach ($data as $row) {
            $row_data = [];
            foreach ($headers as $header) {
                $row_data[] = isset($row[$header]) ? $row[$header] : '';
            }
            fputcsv($output, $row_data);
        }
    }
    
    fclose($output);
    exit;
    
} catch (PDOException $e) {
    error_log("Export submission error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    exit;
}
?>
