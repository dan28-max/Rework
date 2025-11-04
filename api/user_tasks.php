<?php
/**
 * User Tasks API
 * Handles fetching assigned data entry tasks for users
 */

// Start session first before any output
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Suppress error display to prevent HTML output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set headers to prevent caching
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

    // Check if user is authenticated
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
        exit();
    }
} catch (Exception $e) {
    error_log("User tasks initialization error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    exit();
}

try {
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
} catch (Exception $e) {
    error_log("User tasks action error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
} catch (Error $e) {
    error_log("User tasks fatal error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Fatal error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}

/**
 * Get assigned tasks for the current user
 */
function getAssignedTasks() {
    $pdo = getDB();
    
    try {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'] ?? 'user';
        
        // Get user's office and campus assignment
        $userInfo = getUserOfficeAndCampus($userId);
        if (!$userInfo || !$userInfo['office']) {
            // Fallback for testing - use URL parameter
            $userOffice = $_GET['office'] ?? 'EMU';
            $userCampus = $_GET['campus'] ?? null;
        } else {
            $userOffice = $userInfo['office'];
            $userCampus = $userInfo['campus'];
        }
        
        // Normalize office name for comparison
        $userOffice = strtolower(trim($userOffice));
        
        if (!$userOffice) {
            echo json_encode([
                'success' => true,
                'data' => [],
                'message' => 'No office assignment found'
            ]);
            return;
        }
        
        // Get active table assignments for this office AND campus ONLY
        // STRICTLY filter by campus to prevent cross-campus task access
        // Debug: Log the user ID, office, and campus
        error_log("Checking tasks for user_id: $userId, office: $userOffice, campus: " . ($userCampus ?? 'NULL'));
        
        // Build office+campus combination to match (e.g., "RGO San Juan")
        $officeCampusCombo = trim($userOffice . ' ' . ($userCampus ?? ''));
        
        // Filter STRICTLY by office and campus
        // Only show tasks where assigned_office matches office+campus OR office matches and assigner is from same campus
        $sql = "SELECT 
                    ta.id,
                    ta.table_name,
                    ta.assigned_office,
                    ta.description,
                    ta.assigned_date,
                    ta.status,
                    u.name as assigned_by_name,
                    u.campus as assigned_by_campus,
                    'pending' as task_status
                FROM table_assignments ta
                LEFT JOIN users u ON ta.assigned_by = u.id
                WHERE ta.status = 'active'
                AND (
                    -- Match if assigned_office equals the office+campus combination
                    LOWER(TRIM(ta.assigned_office)) = LOWER(?)
                    OR
                    -- Match if assigned_office equals just office AND assigner's campus matches (strict campus check)
                    (LOWER(TRIM(ta.assigned_office)) = LOWER(?) AND u.campus = ? AND u.campus IS NOT NULL)
                )
                ORDER BY ta.assigned_date DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$officeCampusCombo, $userOffice, $userCampus]);
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Debug: Log all tasks found
        error_log("Tasks found: " . count($tasks));
        foreach ($tasks as $task) {
            error_log("Task: {$task['table_name']}, Office: {$task['assigned_office']}");
        }
        
        // Debug: Check what submissions exist for this user (optional, skip if table doesn't exist)
        try {
            $debugStmt = $pdo->prepare("SELECT table_name, office, user_id FROM report_submissions WHERE user_id = ?");
            $debugStmt->execute([$userId]);
            $userSubmissions = $debugStmt->fetchAll();
            error_log("User $userId has " . count($userSubmissions) . " submissions:");
            foreach ($userSubmissions as $sub) {
                error_log("  - Table: {$sub['table_name']}, Office: '{$sub['office']}'");
            }
        } catch (PDOException $e) {
            error_log("Note: Could not query report_submissions (table may not exist yet): " . $e->getMessage());
        }
        
        // Tasks are already filtered by the SQL query, no need for additional filtering
        error_log("Available tasks after SQL filtering: " . count($tasks));
        
        echo json_encode([
            'success' => true,
            'data' => array_values($tasks)
        ]);
        
    } catch (PDOException $e) {
        error_log("Error fetching assigned tasks: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage(),
            'sql_state' => $e->getCode(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);
    } catch (Exception $e) {
        error_log("Unexpected error in getAssignedTasks: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
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
?>

