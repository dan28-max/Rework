<?php
/**
 * Admin Submissions API
 * Handles admin viewing and management of user report submissions
 */

// Disable error display and log errors instead
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Start session FIRST before any output
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set headers (but only if this isn't an export request)
$action = $_GET['action'] ?? '';
if ($action !== 'export') {
    header('Content-Type: application/json');
}
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

// Ensure session cookie is sent with requests
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);

class AdminSubmissionsAPI {
    private $db;
    
    public function __construct() {
        try {
            $this->db = getDB();
        } catch (Exception $e) {
            $this->sendError('Database connection failed', 500);
        }
    }

    /**
     * Check admin authentication and get admin info
     */
    private function checkAdminAuth() {
        // Check if user is logged in
        if (!isset($_SESSION['user_id'])) {
            error_log('No user_id in session');
            $this->sendError('Not logged in', 401);
        }
        
        $userId = $_SESSION['user_id'];
        // Check multiple possible session variable names for role
        $userRole = $_SESSION['user_role'] ?? $_SESSION['role'] ?? null;
        
        // Get user info from database
        $stmt = $this->db->prepare("
            SELECT id, name, username, role, campus, office
            FROM users 
            WHERE id = ? AND status = 'active'
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            error_log('User not found. User ID: ' . $userId);
            $this->sendError('User not found', 401);
        }
        
        // Verify user has admin role (check both session and database)
        $dbRole = strtolower(trim($user['role'] ?? ''));
        $sessionRole = $userRole ? strtolower(trim($userRole)) : '';
        
        // Check for admin roles (case-insensitive, with variations)
        $isAdmin = in_array($dbRole, ['admin', 'super_admin', 'administrator']) || 
                   in_array($sessionRole, ['admin', 'super_admin', 'administrator']);
        
        if (!$isAdmin) {
            error_log('SECURITY: Unauthorized access attempt blocked. User ID: ' . $userId . ', DB Role: "' . $dbRole . '", Session Role: "' . $sessionRole . '"');
            error_log('Session data: user_id=' . ($_SESSION['user_id'] ?? 'not set') . ', user_role=' . ($_SESSION['user_role'] ?? 'not set') . ', role=' . ($_SESSION['role'] ?? 'not set'));
            $this->sendError('Unauthorized access - Admin only. Your role: ' . ($dbRole ?: 'not set') . '. Only users with admin, super_admin, or administrator roles can access this feature.', 401);
        }
        
        // Double-check: Verify user is still active (defense in depth)
        if (strtolower($user['status'] ?? '') !== 'active') {
            error_log('SECURITY: Inactive user attempted access. User ID: ' . $userId);
            $this->sendError('Account is not active', 403);
        }
        
        return $user;
    }

    /**
     * Get accessible campuses for an admin based on their campus
     * Returns array of campus names the admin can access
     */
    private function getAccessibleCampuses($adminCampus) {
        if (!$adminCampus) {
            return [];
        }

        $campus = trim($adminCampus);
        
        // Pablo Borbon admin can access: Pablo Borbon, Rosario, San Juan, Lemery
        if ($campus === 'Pablo Borbon') {
            return ['Pablo Borbon', 'Rosario', 'San Juan', 'Lemery'];
        }
        
        // Alangilan admin can access: Alangilan, Lobo, Balayan, Mabini
        if ($campus === 'Alangilan') {
            return ['Alangilan', 'Lobo', 'Balayan', 'Mabini'];
        }
        
        // Solo campuses: Lipa, Malvar, Nasugbu - just their own campus
        if (in_array($campus, ['Lipa', 'Malvar', 'Nasugbu'])) {
            return [$campus];
        }
        
        // Default: return own campus only
        return [$campus];
    }

    /**
     * List all submissions (filtered by campus for regular admins)
     */
    public function listSubmissions() {
        $admin = $this->checkAdminAuth();
        
        // Add debugging
        error_log('Listing submissions for admin: ' . ($admin['username'] ?? $admin['name']) . ', campus: ' . ($admin['campus'] ?? 'N/A') . ', role: ' . ($admin['role'] ?? 'N/A'));
        
        // Super admins can see all submissions, regular admins only see their campus
        if ($admin['role'] === 'super_admin') {
            $sql = "
                SELECT 
                    rs.id,
                    rs.table_name,
                    rs.campus,
                    rs.office,
                    rs.description,
                    rs.submission_date,
                    rs.status,
                    u.name as user_name,
                    u.username as user_email,
                    COUNT(rsd.id) as record_count
                FROM report_submissions rs
                LEFT JOIN report_submission_data rsd ON rs.id = rsd.submission_id
                LEFT JOIN users u ON rs.user_id = u.id
                GROUP BY rs.id
                ORDER BY rs.submission_date DESC
            ";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
        } else {
            // Regular admin - filter by accessible campuses
            $accessibleCampuses = $this->getAccessibleCampuses($admin['campus']);
            
            if (empty($accessibleCampuses)) {
                // No accessible campuses, return empty
                $this->sendSuccess([
                    'submissions' => [],
                    'admin_campus' => $admin['campus'],
                    'admin_role' => $admin['role']
                ]);
                return;
            }
            
            // Build placeholders for IN clause
            $placeholders = implode(',', array_fill(0, count($accessibleCampuses), '?'));
            
            $sql = "
                SELECT 
                    rs.id,
                    rs.table_name,
                    rs.campus,
                    rs.office,
                    rs.description,
                    rs.submission_date,
                    rs.status,
                    u.name as user_name,
                    u.username as user_email,
                    COUNT(rsd.id) as record_count
                FROM report_submissions rs
                LEFT JOIN report_submission_data rsd ON rs.id = rsd.submission_id
                LEFT JOIN users u ON rs.user_id = u.id
                WHERE rs.campus IN ($placeholders) OR rs.campus IS NULL
                GROUP BY rs.id
                ORDER BY rs.submission_date DESC
            ";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($accessibleCampuses);
        }
        
        $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log('Found submissions: ' . count($submissions));

        $this->sendSuccess([
            'submissions' => $submissions,
            'admin_campus' => $admin['campus'],
            'admin_role' => $admin['role']
        ]);
    }

    /**
     * Get all report submissions
     */
    public function getSubmissions() {
        $this->checkAdminAuth();

        try {
            // Check what columns exist in report_submissions table
            $columnsResult = $this->db->query("DESCRIBE report_submissions");
            $columns = $columnsResult->fetchAll(PDO::FETCH_COLUMN);
            
            // Determine which columns to use
            $userIdCol = in_array('user_id', $columns) ? 'rs.user_id' : (in_array('submitted_by', $columns) ? 'rs.submitted_by' : 'NULL');
            $tableNameCol = in_array('table_name', $columns) ? 'rs.table_name' : (in_array('report_type', $columns) ? 'rs.report_type' : 'NULL');
            $campusCol = in_array('campus', $columns) ? 'rs.campus' : 'NULL';
            $officeCol = in_array('office', $columns) ? 'rs.office' : 'NULL';
            $descCol = in_array('description', $columns) ? 'rs.description' : 'NULL';
            $submissionDateCol = in_array('submission_date', $columns) ? 'rs.submission_date' : (in_array('submitted_at', $columns) ? 'rs.submitted_at' : 'rs.created_at');
            $statusCol = in_array('status', $columns) ? 'rs.status' : "'pending'";
            
            $sql = "SELECT 
                        rs.id,
                        $tableNameCol as table_name,
                        $campusCol as campus,
                        $officeCol as office,
                        $descCol as description,
                        $submissionDateCol as submission_date,
                        $statusCol as status,
                        $userIdCol as user_id,
                        COALESCE(u.name, 'Unknown User') as user_name,
                        COALESCE(u.username, 'N/A') as user_email,
                        COUNT(rsd.id) as record_count
                    FROM report_submissions rs
                    LEFT JOIN users u ON $userIdCol = u.id
                    LEFT JOIN report_submission_data rsd ON rs.id = rsd.submission_id
                    GROUP BY rs.id
                    ORDER BY $submissionDateCol DESC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            error_log("Fetched " . count($submissions) . " submissions");
            error_log("User ID column used: $userIdCol");
            if (count($submissions) > 0) {
                error_log("Sample submission user_id: " . ($submissions[0]['user_id'] ?? 'NULL'));
                error_log("Sample submission user_name: " . ($submissions[0]['user_name'] ?? 'NULL'));
            }

            $this->sendSuccess($submissions);

        } catch (Exception $e) {
            error_log("Get submissions error: " . $e->getMessage());
            $this->sendError('Failed to fetch submissions: ' . $e->getMessage());
        }
    }

    /**
     * Get specific submission details with data
     */
    public function getSubmissionDetails() {
        $this->checkAdminAuth();

        $submissionId = $_GET['submission_id'] ?? null;
        
        if (!$submissionId) {
            $this->sendError('Submission ID required');
        }

        try {
            // Check columns
            $columnsResult = $this->db->query("DESCRIBE report_submissions");
            $columns = $columnsResult->fetchAll(PDO::FETCH_COLUMN);
            $userIdCol = in_array('user_id', $columns) ? 'rs.user_id' : (in_array('submitted_by', $columns) ? 'rs.submitted_by' : 'NULL');
            
            // Get submission info
            $sql = "SELECT 
                        rs.*,
                        COALESCE(u.name, 'Unknown User') as user_name,
                        COALESCE(u.username, 'N/A') as user_email
                    FROM report_submissions rs
                    LEFT JOIN users u ON $userIdCol = u.id
                    WHERE rs.id = ?";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$submissionId]);
            $submission = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$submission) {
                $this->sendError('Submission not found', 404);
            }

            // Get submission data
            $sql = "SELECT row_data FROM report_submission_data WHERE submission_id = ? ORDER BY id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$submissionId]);
            $dataRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $submission['data'] = array_map(function($row) {
                return json_decode($row['row_data'], true);
            }, $dataRows);

            error_log("Fetched submission details for ID: $submissionId with " . count($dataRows) . " data rows");

            $this->sendSuccess($submission);

        } catch (Exception $e) {
            error_log("Get submission details error: " . $e->getMessage());
            $this->sendError('Failed to fetch submission details: ' . $e->getMessage());
        }
    }

    /**
     * Export submission to CSV
     */
    public function exportSubmission() {
        // Allow anyone logged in to export - no role restriction
        // Just check if user is logged in
        if (!isset($_SESSION['user_id'])) {
            $this->sendError('Not logged in', 401);
        }
        
        $userId = $_SESSION['user_id'];
        
        // Get user info for logging (optional)
        try {
            $stmt = $this->db->prepare("SELECT id, name, username, role FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Log export attempt (for auditing purposes)
            if ($user) {
                error_log("Export attempt by user ID: " . ($user['id'] ?? 'unknown') . ", Role: " . ($user['role'] ?? 'unknown') . ", Username: " . ($user['username'] ?? $user['name'] ?? 'unknown'));
            }
        } catch (Exception $e) {
            // Log error but don't block export
            error_log("Error fetching user info for export: " . $e->getMessage());
        }

        $submissionId = $_GET['submission_id'] ?? null;
        
        if (!$submissionId) {
            $this->sendError('Submission ID required');
        }

        try {
            // Check which columns exist in report_submissions table
            $columnsResult = $this->db->query("DESCRIBE report_submissions");
            $columns = $columnsResult->fetchAll(PDO::FETCH_COLUMN);
            
            // Determine which columns to use
            $userIdCol = in_array('user_id', $columns) ? 'rs.user_id' : (in_array('submitted_by', $columns) ? 'rs.submitted_by' : 'NULL');
            $tableNameCol = in_array('table_name', $columns) ? 'rs.table_name' : (in_array('report_type', $columns) ? 'rs.report_type' : 'NULL');
            $campusCol = in_array('campus', $columns) ? 'rs.campus' : 'NULL';
            $officeCol = in_array('office', $columns) ? 'rs.office' : 'NULL';
            $descCol = in_array('description', $columns) ? 'rs.description' : 'NULL';
            $submissionDateCol = in_array('submission_date', $columns) ? 'rs.submission_date' : (in_array('submitted_at', $columns) ? 'rs.submitted_at' : 'rs.created_at');
            
            // Get submission info
            $sql = "SELECT 
                        rs.id,
                        rs.status,
                        COALESCE(u.name, 'Unknown User') as user_name,
                        COALESCE(u.username, 'N/A') as user_email,
                        $tableNameCol as table_name,
                        $campusCol as campus,
                        $officeCol as office,
                        $descCol as description,
                        $submissionDateCol as submission_date
                    FROM report_submissions rs
                    LEFT JOIN users u ON $userIdCol = u.id
                    WHERE rs.id = ?";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$submissionId]);
            $submission = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$submission) {
                $this->sendError('Submission not found', 404);
            }

            // Get submission data
            $sql = "SELECT row_data FROM report_submission_data WHERE submission_id = ? ORDER BY id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$submissionId]);
            $dataRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($dataRows)) {
                $this->sendError('No data found for this submission');
            }

            // Prepare CSV filename - handle missing submission_date gracefully
            $datePart = isset($submission['submission_date']) && $submission['submission_date'] 
                ? date('Y-m-d', strtotime($submission['submission_date'])) 
                : date('Y-m-d');
            $filename = ($submission['table_name'] ?? 'report') . '_' . ($submission['campus'] ?? 'unknown') . '_' . $datePart . '.csv';
            
            // Clear any previous headers and set CSV headers
            header_remove('Content-Type'); // Remove JSON header set at top of file
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Cache-Control: no-cache, must-revalidate');
            header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');

            // Output UTF-8 BOM for Excel compatibility
            echo "\xEF\xBB\xBF";

            $output = fopen('php://output', 'w');

            // Add metadata header
            fputcsv($output, ['Report Information']);
            fputcsv($output, ['Table Name', $submission['table_name'] ?? 'N/A']);
            fputcsv($output, ['Campus', $submission['campus'] ?? 'N/A']);
            fputcsv($output, ['Office', $submission['office'] ?? 'N/A']);
            fputcsv($output, ['Submitted By', $submission['user_name'] . ' (' . $submission['user_email'] . ')']);
            fputcsv($output, ['Submission Date', $submission['submission_date'] ?? 'N/A']);
            fputcsv($output, ['Description', $submission['description'] ?? 'N/A']);
            fputcsv($output, []);
            fputcsv($output, ['Data Records']);

            // Get column headers from first row
            $firstRow = json_decode($dataRows[0]['row_data'], true);
            if ($firstRow && is_array($firstRow)) {
                fputcsv($output, array_keys($firstRow));

                // Add data rows
                foreach ($dataRows as $row) {
                    $rowData = json_decode($row['row_data'], true);
                    if ($rowData && is_array($rowData)) {
                        fputcsv($output, array_values($rowData));
                    }
                }
            }

            fclose($output);
            exit();

        } catch (Exception $e) {
            error_log("Export submission error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            // Don't send JSON error if headers are already sent
            if (!headers_sent()) {
                $this->sendError('Failed to export submission: ' . $e->getMessage());
            } else {
                // Headers already sent, output error message
                echo "Error: Failed to export submission. Please check server logs for details.";
            }
        }
    }

    /**
     * Update submission status
     */
    public function updateStatus() {
        $this->checkAdminAuth();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendError('Method not allowed', 405);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['submission_id']) || !isset($input['status'])) {
            $this->sendError('Missing required fields: submission_id and status');
        }

        $submissionId = $input['submission_id'];
        $status = $input['status'];

        if (!in_array($status, ['pending', 'approved', 'rejected'])) {
            $this->sendError('Invalid status. Must be: pending, approved, or rejected');
        }

        try {
            $sql = "UPDATE report_submissions SET status = ?, reviewed_date = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$status, $submissionId]);

            if ($stmt->rowCount() === 0) {
                $this->sendError('Submission not found', 404);
            }

            $this->sendSuccess(['message' => 'Status updated successfully']);

        } catch (Exception $e) {
            error_log("Update status error: " . $e->getMessage());
            $this->sendError('Failed to update status');
        }
    }

    /**
     * Send success response
     */
    private function sendSuccess($data) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $data
        ]);
        exit();
    }

    /**
     * Send error response
     */
    private function sendError($message, $code = 400) {
        // Clear any previous output
        if (ob_get_level()) {
            ob_clean();
        }
        
        // Set JSON headers if not already set for export
        $action = $_GET['action'] ?? '';
        if ($action !== 'export') {
            header('Content-Type: application/json');
        }
        
        http_response_code($code);
        
        // For export actions, if we're sending an error, it should be JSON
        if ($action === 'export') {
            header('Content-Type: application/json');
        }
        
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
        exit();
    }
}

// Start output buffering to catch any unwanted output
ob_start();

// Handle API requests
try {
    $api = new AdminSubmissionsAPI();
    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'list':
            ob_end_clean(); // Clear buffer before API call
            $api->getSubmissions();
            break;
        case 'details':
            ob_end_clean();
            $api->getSubmissionDetails();
            break;
        case 'export':
            ob_end_clean();
            $api->exportSubmission();
            break;
        case 'update_status':
            ob_end_clean();
            $api->updateStatus();
            break;
        default:
            ob_end_clean();
            $api->sendError('Invalid action specified', 400);
    }
} catch (Exception $e) {
    ob_end_clean(); // Clear any output
    error_log("Admin submissions API error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Send JSON error
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
    exit();
} catch (Error $e) {
    ob_end_clean(); // Clear any output
    error_log("Admin submissions API fatal error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Send JSON error
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Fatal error: ' . $e->getMessage()
    ]);
    exit();
}
?>
