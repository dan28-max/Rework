<?php
/**
 * Submit Data API
 * Handles user data submissions for assigned tables
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid JSON input');
        }

        // Validate required fields
        if (!isset($input['tableName']) || !isset($input['office']) || !isset($input['data'])) {
            throw new Exception('Missing required fields');
        }

        $tableName = $input['tableName'];
        $office = $input['office'];
        $data = $input['data'];
        $userId = $_SESSION['user_id'];

        // Validate data
        if (!is_array($data) || empty($data)) {
            throw new Exception('No data provided');
        }

        // Check if user has access to this office
        $userOffice = getUserOffice($userId);
        if ($userOffice !== $office) {
            throw new Exception('Access denied to this office');
        }

        // Check if table is assigned to this office
        if (!isTableAssignedToOffice($tableName, $office)) {
            throw new Exception('Table is not assigned to this office');
        }

        // Save submission
        $result = saveDataSubmission($tableName, $office, $data, $userId);

        if ($result) {
            // Log the submission activity
            logActivity($userId, 'data_submission', "Submitted {$tableName} data for {$office}", count($data) . ' records');
            
            echo json_encode([
                'success' => true,
                'message' => 'Data submitted successfully',
                'data' => [
                    'records_submitted' => count($data),
                    'table' => $tableName,
                    'office' => $office
                ]
            ]);
        } else {
            throw new Exception('Failed to save data submission');
        }

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
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
 * Check if table is assigned to office
 */
function isTableAssignedToOffice($tableName, $office) {
    global $pdo;
    
    try {
        $sql = "SELECT COUNT(*) FROM table_assignments 
                WHERE table_name = :table_name 
                AND assigned_office = :office 
                AND status = 'active'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'table_name' => $tableName,
            'office' => $office
        ]);
        
        return $stmt->fetchColumn() > 0;
    } catch (PDOException $e) {
        error_log("Error checking table assignment: " . $e->getMessage());
        return false;
    }
}

/**
 * Save data submission
 */
function saveDataSubmission($tableName, $office, $data, $submittedBy) {
    global $pdo;
    
    try {
        $pdo->beginTransaction();

        // Insert into data_submissions
        $sql = "INSERT INTO data_submissions (table_name, assigned_office, submitted_by, submission_data, record_count, status) 
                VALUES (:table_name, :assigned_office, :submitted_by, :submission_data, :record_count, 'pending')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'table_name' => $tableName,
            'assigned_office' => $office,
            'submitted_by' => $submittedBy,
            'submission_data' => json_encode($data),
            'record_count' => count($data)
        ]);

        $pdo->commit();
        return true;

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Data submission error: " . $e->getMessage());
        return false;
    }
}

/**
 * Log activity
 */
function logActivity($userId, $action, $description, $details = '') {
    global $pdo;
    
    try {
        $sql = "INSERT INTO activity_logs (user_id, action, description, details, created_at) 
                VALUES (:user_id, :action, :description, :details, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'details' => $details
        ]);
    } catch (PDOException $e) {
        error_log("Activity log error: " . $e->getMessage());
    }
}
?>

