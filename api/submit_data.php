<?php
/**
 * Submit Data API
 * Handles user data submissions for assigned tables
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

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid JSON input');
        }

        // Handle both old and new format
        if (isset($input['report_type'])) {
            // New format from report.html
            $tableName = $input['report_type'];
            $submittedBy = $input['submitted_by'] ?? '';
            $data = $input['data'];
            $userId = $_SESSION['user_id'];
            
            // Get user's office
            $office = getUserOffice($userId);
            if (!$office) {
                throw new Exception('User office not found');
            }
        } else {
            // Old format
        if (!isset($input['tableName']) || !isset($input['office']) || !isset($input['data'])) {
            throw new Exception('Missing required fields');
        }
        $tableName = $input['tableName'];
        $office = $input['office'];
        $data = $input['data'];
        $userId = $_SESSION['user_id'];
        }

        // Validate data
        if (!is_array($data) || empty($data)) {
            throw new Exception('No data provided');
        }

        // For new format, we already have the office from getUserOffice
        // For old format, check if user has access to this office
        if (!isset($input['report_type'])) {
        $userOffice = getUserOffice($userId);
        if ($userOffice !== $office) {
            throw new Exception('Access denied to this office');
        }
        }

        // Check if table is assigned to this office (optional check for flexibility)
        // if (!isTableAssignedToOffice($tableName, $office)) {
        //     throw new Exception('Table is not assigned to this office');
        // }

        // Save submission
        $result = saveDataSubmission($tableName, $office, $data, $userId);

        if ($result) {
            // Log the submission activity
            logActivity('data_submission', "Submitted {$tableName} data for {$office}", $userId);
            
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
    } catch (Error $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
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
 * Check if table is assigned to office
 */
function isTableAssignedToOffice($tableName, $office) {
    $pdo = getDB();
    
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
    $pdo = getDB();
    
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
    $pdo = getDB();
    
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




