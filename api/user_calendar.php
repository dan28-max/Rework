<?php
/**
 * User Calendar API
 * Handles fetching calendar events (deadlines, tasks) for the user
 */

// Start session first before any output
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Enable error display for debugging (set to 1 for debugging, 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);
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
    // Include database configuration and functions
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../includes/functions.php';
    
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
        exit();
    }

    $userId = $_SESSION['user_id'];
    $pdo = getDB();
    $action = $_GET['action'] ?? 'get_events';

    switch ($action) {
        case 'get_events':
            getCalendarEvents($pdo, $userId);
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    error_log("Error in user_calendar.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

/**
 * Get calendar events for the user
 */
function getCalendarEvents($pdo, $userId) {
    try {
        $events = [];
        
        // Get user info
        $userStmt = $pdo->prepare("SELECT office FROM users WHERE id = :user_id");
        $userStmt->execute(['user_id' => $userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || empty($user['office'])) {
            echo json_encode([
                'success' => true,
                'data' => []
            ]);
            return;
        }
        
        // 1. Get tasks with deadlines from table_assignments
        try {
            $assignmentsTableExists = $pdo->query("SHOW TABLES LIKE 'table_assignments'")->fetch();
            if ($assignmentsTableExists) {
                // Check if deadline column exists
                $columnsCheck = $pdo->query("SHOW COLUMNS FROM table_assignments LIKE 'deadline'");
                if ($columnsCheck && $columnsCheck->rowCount() > 0) {
                    $taskStmt = $pdo->prepare("
                    SELECT 
                        ta.id,
                        ta.table_name,
                        ta.deadline,
                        ta.priority,
                        ta.status,
                        ta.description
                    FROM table_assignments ta
                    WHERE ta.assigned_office = :office 
                    AND ta.status = 'active'
                    AND ta.deadline IS NOT NULL
                    AND ta.deadline != ''
                    ORDER BY ta.deadline ASC
                ");
                
                    $taskStmt->execute(['office' => $user['office']]);
                    $tasks = $taskStmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    // Check which tasks are completed
                    $submissionsTableExists = $pdo->query("SHOW TABLES LIKE 'report_submissions'")->fetch();
                    $completedTasks = [];
                    
                    if ($submissionsTableExists) {
                        $subStmt = $pdo->prepare("
                            SELECT DISTINCT table_name 
                            FROM report_submissions 
                            WHERE user_id = :user_id 
                            AND office = :office
                            AND status IN ('approved', 'pending')
                        ");
                        $subStmt->execute([
                            'user_id' => $userId,
                            'office' => $user['office']
                        ]);
                        $completedTasks = array_column($subStmt->fetchAll(PDO::FETCH_ASSOC), 'table_name');
                    }
                    
                    foreach ($tasks as $task) {
                        $reportName = getReportDisplayName($task['table_name']);
                        $isCompleted = in_array($task['table_name'], $completedTasks);
                        
                        $events[] = [
                            'id' => 'task_' . $task['id'],
                            'title' => $reportName,
                            'date' => $task['deadline'],
                            'type' => getEventType($task['deadline'], $isCompleted),
                            'priority' => $task['priority'] ?? 'medium',
                            'table_name' => $task['table_name'],
                            'description' => $task['description'] ?? ''
                        ];
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Error fetching assignments: " . $e->getMessage());
            // Continue without assignments
        }
        
        // 2. Get submission dates (optional - for tracking when reports were submitted)
        try {
            $submissionsTableExists = $pdo->query("SHOW TABLES LIKE 'report_submissions'")->fetch();
            if ($submissionsTableExists) {
                $subStmt = $pdo->prepare("
                    SELECT 
                        id,
                        table_name,
                        submission_date,
                        status
                    FROM report_submissions 
                    WHERE user_id = :user_id 
                    AND office = :office
                    AND submission_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
                    ORDER BY submission_date DESC
                    LIMIT 20
                ");
                
                $subStmt->execute([
                    'user_id' => $userId,
                    'office' => $user['office']
                ]);
                
                $submissions = $subStmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($submissions as $submission) {
                    $reportName = getReportDisplayName($submission['table_name']);
                    
                    $events[] = [
                        'id' => 'submission_' . $submission['id'],
                        'title' => $reportName . ' - Submitted',
                        'date' => $submission['submission_date'],
                        'type' => $submission['status'] === 'approved' ? 'completed' : 'pending',
                        'priority' => 'low',
                        'table_name' => $submission['table_name'],
                        'description' => 'Report submitted on ' . date('F j, Y', strtotime($submission['submission_date']))
                    ];
                }
            }
        } catch (Exception $e) {
            error_log("Error fetching submissions: " . $e->getMessage());
            // Continue without submissions
        }
        
        echo json_encode([
            'success' => true,
            'data' => $events
        ]);
    } catch (Exception $e) {
        error_log("Error fetching calendar events: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching calendar events: ' . $e->getMessage()
        ]);
    }
}

/**
 * Get event type based on deadline
 */
function getEventType($deadline, $isCompleted = false) {
    if ($isCompleted) {
        return 'completed';
    }
    
    $deadlineDate = new DateTime($deadline);
    $today = new DateTime();
    $today->setTime(0, 0, 0);
    $deadlineDate->setTime(0, 0, 0);
    
    $diff = $today->diff($deadlineDate);
    $daysLeft = (int)$diff->format('%r%a');
    
    if ($daysLeft < 0) {
        return 'overdue';
    } else if ($daysLeft <= 7) {
        return 'due-soon';
    } else {
        return 'upcoming';
    }
}

/**
 * Get display name for report table
 */
function getReportDisplayName($tableName) {
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
    
    return ucwords(str_replace(['_', '-'], ' ', $tableName));
}
?>

