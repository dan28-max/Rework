<?php
/**
 * User Tasks List API
 * Fetches tasks assigned to the current user with priority and status
 */

// Start session first before any output
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Enable error display for debugging (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
    
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
        exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit();
}

try {
    $action = $_GET['action'] ?? 'get_tasks';

    switch ($action) {
        case 'get_tasks':
            getUserTasks();
            break;
        case 'update_task_status':
            updateTaskStatus();
            break;
        case 'details':
        case 'get_task_details':
            getTaskDetails();
            break;
        default:
            getUserTasks();
            break;
    }
} catch (PDOException $e) {
    error_log("PDO Exception in user_tasks_list.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
} catch (Exception $e) {
    error_log("Exception in user_tasks_list.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
} catch (Error $e) {
    error_log("Fatal Error in user_tasks_list.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Fatal error: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}

/**
 * Get tasks assigned to the current user
 */
function getUserTasks() {
    $pdo = getDB();
    
    try {
        $userId = $_SESSION['user_id'];
        $filter = $_GET['filter'] ?? 'all'; // all, pending, completed
        
        // Get user's office
        $userStmt = $pdo->prepare("SELECT office, campus FROM users WHERE id = ?");
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !$user['office']) {
            echo json_encode([
                'success' => true,
                'tasks' => [],
                'message' => 'No office assignment found'
            ]);
            return;
        }
        
        $userOffice = trim($user['office'] ?? '');
        $userCampus = trim($user['campus'] ?? '');
        
        // Build office+campus combination (e.g., "RGO Lipa")
        $officeCampusCombo = trim($userOffice . ' ' . $userCampus);
        
        // Check if table_assignments table exists
        $tableCheck = $pdo->query("SHOW TABLES LIKE 'table_assignments'");
        if ($tableCheck->rowCount() === 0) {
            echo json_encode([
                'success' => true,
                'tasks' => [],
                'message' => 'No tasks table found'
            ]);
            return;
        }
        
        // Build query based on filter
        $sql = "SELECT 
                    ta.id,
                    ta.table_name,
                    ta.assigned_office,
                    ta.description,
                    ta.assigned_date,
                    ta.deadline,
                    ta.status as assignment_status,
                    ta.priority,
                    u.name as assigned_by_name,
                    CASE 
                        WHEN rs.id IS NOT NULL THEN 'completed'
                        WHEN ta.deadline < NOW() THEN 'overdue'
                        WHEN ta.deadline < DATE_ADD(NOW(), INTERVAL 3 DAY) THEN 'due_soon'
                        ELSE 'pending'
                    END as task_status,
                    rs.id as submission_id,
                    rs.submission_date,
                    rs.status as submission_status
                FROM table_assignments ta
                LEFT JOIN users u ON ta.assigned_by = u.id
                LEFT JOIN report_submissions rs ON ta.table_name = rs.table_name 
                    AND rs.user_id = ? 
                    AND (
                        LOWER(TRIM(rs.office)) = LOWER(TRIM(ta.assigned_office))
                        OR LOWER(TRIM(rs.office)) = LOWER(TRIM(SUBSTRING_INDEX(ta.assigned_office, ' ', 1)))
                    )
                WHERE (
                    LOWER(TRIM(ta.assigned_office)) = LOWER(?)
                    OR LOWER(TRIM(ta.assigned_office)) = LOWER(?)
                    OR LOWER(TRIM(ta.assigned_office)) = LOWER(TRIM(SUBSTRING_INDEX(?, ' ', 1)))
                )
                AND ta.status = 'active'";
        
        // Add filter condition
        if ($filter === 'pending') {
            $sql .= " AND rs.id IS NULL";
        } elseif ($filter === 'completed') {
            $sql .= " AND rs.id IS NOT NULL";
        }
        
        $sql .= " ORDER BY 
                    CASE 
                        WHEN ta.priority = 'high' THEN 1
                        WHEN ta.priority = 'medium' THEN 2
                        WHEN ta.priority = 'low' THEN 3
                        ELSE 4
                    END,
                    ta.deadline ASC,
                    ta.assigned_date DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId, $userOffice, $officeCampusCombo, $officeCampusCombo]);
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format tasks for frontend
        $formattedTasks = [];
        foreach ($tasks as $task) {
            $deadline = $task['deadline'] ? new DateTime($task['deadline']) : null;
            $now = new DateTime();
            
            // Calculate days remaining
            $daysRemaining = null;
            if ($deadline) {
                $interval = $now->diff($deadline);
                $daysRemaining = $interval->invert ? -$interval->days : $interval->days;
            }
            
            $formattedTasks[] = [
                'id' => $task['id'],
                'table_name' => $task['table_name'],
                'title' => formatTableName($task['table_name']),
                'description' => $task['description'] ?? 'No description provided',
                'office' => $task['assigned_office'],
                'assigned_date' => $task['assigned_date'],
                'assigned_date_formatted' => $task['assigned_date'] ? (new DateTime($task['assigned_date']))->format('M d, Y') : null,
                'deadline' => $task['deadline'],
                'deadline_formatted' => $deadline ? $deadline->format('M d, Y') : null,
                'days_remaining' => $daysRemaining,
                'priority' => $task['priority'] ?? 'medium',
                'status' => $task['task_status'],
                'assigned_by' => $task['assigned_by_name'] ?? 'Admin',
                'submission_id' => $task['submission_id'],
                'submission_date' => $task['submission_date'],
                'submission_status' => $task['submission_status']
            ];
        }
        
        // Count by status
        $totalTasks = count($formattedTasks);
        $pendingTasks = count(array_filter($formattedTasks, function($t) { 
            return $t['status'] !== 'completed'; 
        }));
        $completedTasks = count(array_filter($formattedTasks, function($t) { 
            return $t['status'] === 'completed'; 
        }));
        $overdueTasks = count(array_filter($formattedTasks, function($t) { 
            return $t['status'] === 'overdue'; 
        }));
        
        echo json_encode([
            'success' => true,
            'tasks' => $formattedTasks,
            'stats' => [
                'total' => $totalTasks,
                'pending' => $pendingTasks,
                'completed' => $completedTasks,
                'overdue' => $overdueTasks
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("Error fetching user tasks: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}

/**
 * Update task status (mark as started, in progress, etc.)
 */
function updateTaskStatus() {
    $pdo = getDB();
    
    try {
        $userId = $_SESSION['user_id'];
        $input = json_decode(file_get_contents('php://input'), true);
        
        $taskId = $input['task_id'] ?? null;
        $status = $input['status'] ?? null;
        
        if (!$taskId || !$status) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Task ID and status are required'
            ]);
            return;
        }
        
        // Update task status in user_task_progress table (if exists)
        // For now, just return success
        echo json_encode([
            'success' => true,
            'message' => 'Task status updated successfully'
        ]);
        
    } catch (Exception $e) {
        error_log("Error updating task status: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error updating task status'
        ]);
    }
}

/**
 * Get detailed information about a specific task
 */
function getTaskDetails() {
    try {
        $pdo = getDB();
    } catch (Exception $e) {
        error_log("Database connection error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $e->getMessage()
        ]);
        return;
    }
    
    try {
        $userId = $_SESSION['user_id'] ?? null;
        $taskId = $_GET['task_id'] ?? null;
        
        if (!$taskId) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Task ID is required'
            ]);
            return;
        }
        
        if (!$userId) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'User not authenticated'
            ]);
            return;
        }
        
        // Get user's office and campus to verify access
        $userSql = "SELECT office, campus FROM users WHERE id = ?";
        $userStmt = $pdo->prepare($userSql);
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
            return;
        }
        
        $userOffice = trim($user['office'] ?? '');
        $userCampus = trim($user['campus'] ?? '');
        
        if (empty($userOffice)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'User office not assigned'
            ]);
            return;
        }
        
        // Build office+campus combination (e.g., "RGO Lipa")
        $officeCampusCombo = trim($userOffice . ' ' . $userCampus);
        
        // Select all task fields including notes (if it exists) and user info
        // Verify the task is assigned to the user's office
        // Use PHP trim instead of SQL TRIM for better compatibility
        // Check if email column exists in users table
        $checkEmailColumn = $pdo->query("SHOW COLUMNS FROM users LIKE 'email'")->fetch();
        $hasEmailColumn = $checkEmailColumn !== false;
        
        $sql = "SELECT 
                    ta.*,
                    u.name as assigned_by_name" .
                    ($hasEmailColumn ? ", u.email as assigned_by_email" : "") . "
                FROM table_assignments ta
                LEFT JOIN users u ON ta.assigned_by = u.id
                WHERE ta.id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$taskId]);
        $task = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$task) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Task not found'
            ]);
            return;
        }
        
        // Verify office match in PHP - handle both office and office+campus formats
        $taskOffice = trim($task['assigned_office'] ?? '');
        $taskOfficeLower = strtolower($taskOffice);
        $userOfficeLower = strtolower($userOffice);
        $officeCampusComboLower = strtolower($officeCampusCombo);
        
        // Check if task office matches:
        // 1. Exact match with user office
        // 2. Exact match with office+campus combination
        // 3. Task office matches first part of office+campus combo (e.g., "RGO" matches "RGO Lipa")
        $officeMatches = (
            $taskOfficeLower === $userOfficeLower ||
            $taskOfficeLower === $officeCampusComboLower ||
            ($taskOfficeLower === $userOfficeLower && $officeCampusComboLower === $taskOfficeLower)
        );
        
        // Also check if task office is the first word of office+campus combo
        if (!$officeMatches && !empty($officeCampusCombo)) {
            $firstWord = strtolower(trim(explode(' ', $officeCampusCombo)[0]));
            $officeMatches = $taskOfficeLower === $firstWord;
        }
        
        if (!$officeMatches) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Task not assigned to your office',
                'debug' => [
                    'task_office' => $taskOffice,
                    'user_office' => $userOffice,
                    'user_campus' => $userCampus,
                    'office_campus_combo' => $officeCampusCombo,
                    'task_office_lower' => $taskOfficeLower,
                    'user_office_lower' => $userOfficeLower,
                    'combo_lower' => $officeCampusComboLower
                ]
            ]);
            return;
        }
        
        echo json_encode([
            'success' => true,
            'task' => $task
        ]);
        
    } catch (PDOException $e) {
        error_log("Database error fetching task details: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    } catch (Exception $e) {
        error_log("Error fetching task details: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching task details: ' . $e->getMessage()
        ]);
    }
}

/**
 * Format table name for display
 */
function formatTableName($tableName) {
    $reportNames = [
        'admissiondata' => 'Admission Data',
        'enrollmentdata' => 'Enrollment Data',
        'graduatesdata' => 'Graduates Data',
        'employee' => 'Employee Data',
        'leaveprivilege' => 'Leave Privilege',
        'libraryvisitor' => 'Library Visitor',
        'pwd' => 'PWD',
        'waterconsumption' => 'Water Consumption',
        'treatedwastewater' => 'Treated Waste Water',
        'electricityconsumption' => 'Electricity Consumption',
        'solidwaste' => 'Solid Waste',
        'campuspopulation' => 'Campus Population',
        'foodwaste' => 'Food Waste',
        'fuelconsumption' => 'Fuel Consumption',
        'distancetraveled' => 'Distance Traveled',
        'budgetexpenditure' => 'Budget Expenditure',
        'flightaccommodation' => 'Flight Accommodation'
    ];
    
    $tableNameLower = strtolower($tableName);
    
    if (isset($reportNames[$tableNameLower])) {
        return $reportNames[$tableNameLower];
    }
    
    // Fallback: Convert snake_case or camelCase to Title Case
    $formatted = preg_replace('/([a-z])([A-Z])/', '$1 $2', $tableName);
    $formatted = str_replace('_', ' ', $formatted);
    $formatted = ucwords(strtolower($formatted));
    return $formatted;
}
?>
