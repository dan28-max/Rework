<?php
/**
 * User Tasks API
 * Handles fetching assigned data entry tasks for users
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
        getAssignedTasks();
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

/**
 * Get assigned tasks for the current user
 */
function getAssignedTasks() {
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
        
        // Get active table assignments for this office
        $sql = "SELECT 
                    ta.id,
                    ta.table_name,
                    ta.assigned_office,
                    ta.description,
                    ta.assigned_date,
                    ta.status,
                    u.name as assigned_by_name,
                    CASE 
                        WHEN ds.id IS NOT NULL THEN 'completed'
                        WHEN ta.status = 'active' THEN 'pending'
                        ELSE ta.status
                    END as task_status
                FROM table_assignments ta
                LEFT JOIN users u ON ta.assigned_by = u.id
                LEFT JOIN data_submissions ds ON ta.table_name = ds.table_name 
                    AND ta.assigned_office = ds.assigned_office 
                    AND ds.submitted_by = :user_id
                WHERE ta.assigned_office = :office 
                AND ta.status = 'active'
                ORDER BY ta.assigned_date DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'office' => $userOffice,
            'user_id' => $userId
        ]);
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $tasks
        ]);
        
    } catch (PDOException $e) {
        error_log("Error fetching assigned tasks: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error occurred'
        ]);
    }
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
?>

