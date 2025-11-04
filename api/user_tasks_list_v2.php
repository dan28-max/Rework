<?php
/**
 * User Tasks List API - Simplified Version
 * Fetches tasks assigned to the current user
 */

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Enable error display for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Set JSON header
header('Content-Type: application/json');

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// Include database
try {
    require_once __DIR__ . '/../config/database.php';
    $pdo = getDB();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    exit();
}

// Get user info
$userId = $_SESSION['user_id'];
$filter = $_GET['filter'] ?? 'all';

try {
    // Get user's office and campus
    $stmt = $pdo->prepare("SELECT office, campus FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !$user['office']) {
        echo json_encode([
            'success' => true,
            'tasks' => [],
            'stats' => ['total' => 0, 'pending' => 0, 'completed' => 0, 'overdue' => 0],
            'message' => 'No office assignment found'
        ]);
        exit();
    }
    
    $userOffice = $user['office'];
    $userCampus = $user['campus'];
    
    // Check if table exists
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'table_assignments'");
    if ($tableCheck->rowCount() === 0) {
        echo json_encode([
            'success' => true,
            'tasks' => [],
            'stats' => ['total' => 0, 'pending' => 0, 'completed' => 0, 'overdue' => 0],
            'message' => 'Tasks table not found. Please run the setup SQL.'
        ]);
        exit();
    }
    
    // Check which columns exist in table_assignments
    $columnsCheck = $pdo->query("SHOW COLUMNS FROM table_assignments");
    $existingColumns = [];
    while ($col = $columnsCheck->fetch(PDO::FETCH_ASSOC)) {
        $existingColumns[] = $col['Field'];
    }
    
    // Build SELECT clause based on existing columns
    $selectFields = [
        'ta.id',
        'ta.table_name',
        'ta.assigned_office',
        'ta.description',
        'ta.assigned_date',
        'ta.status'
    ];
    
    // Add optional columns if they exist
    if (in_array('has_deadline', $existingColumns)) {
        $selectFields[] = 'ta.has_deadline';
    }
    if (in_array('deadline', $existingColumns)) {
        $selectFields[] = 'ta.deadline';
    }
    if (in_array('priority', $existingColumns)) {
        $selectFields[] = 'ta.priority';
    }
    if (in_array('notes', $existingColumns)) {
        $selectFields[] = 'ta.notes';
    }
    
    // Don't join with users table - it causes duplicate rows
    // $selectFields[] = 'u.campus';
    
    // Build ORDER BY clause
    $orderBy = [];
    if (in_array('priority', $existingColumns)) {
        $orderBy[] = "CASE ta.priority
                        WHEN 'urgent' THEN 1
                        WHEN 'high' THEN 2
                        WHEN 'medium' THEN 3
                        WHEN 'low' THEN 4
                        ELSE 5
                    END";
    }
    if (in_array('deadline', $existingColumns)) {
        $orderBy[] = "ta.deadline ASC";
    }
    $orderBy[] = "ta.assigned_date DESC";
    
    // Build office+campus combination to match (e.g., "RGO San Juan")
    $officeCampusCombo = trim($userOffice . ' ' . ($userCampus ?? ''));
    
    // Filter STRICTLY by office and campus to prevent cross-campus access
    // Only show tasks where assigned_office matches office+campus OR office matches and assigner is from same campus
    $sql = "SELECT DISTINCT " . implode(', ', $selectFields) . "
            FROM table_assignments ta
            LEFT JOIN users u ON ta.assigned_by = u.id
            WHERE ta.status = 'active'
            AND (
                -- Match if assigned_office equals the office+campus combination
                LOWER(TRIM(ta.assigned_office)) = LOWER(:officeCampusCombo)
                OR
                -- Match if assigned_office equals just office AND assigner's campus matches (strict campus check)
                (LOWER(TRIM(ta.assigned_office)) = LOWER(:office) AND u.campus = :campus AND u.campus IS NOT NULL)
            )
            ORDER BY " . implode(', ', $orderBy);
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'officeCampusCombo' => $officeCampusCombo,
        'office' => $userOffice,
        'campus' => $userCampus
    ]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Now check for submissions separately to avoid JOIN issues
    // Match submissions by both table_name and office format (office or office+campus)
    $submissionsMap = [];
    try {
        $subSql = "SELECT * FROM report_submissions WHERE user_id = ?";
        $subStmt = $pdo->prepare($subSql);
        $subStmt->execute([$userId]);
        $submissions = $subStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Create a map of submissions by table_name (if that column exists)
        // Also check if office matches the assignment office format
        foreach ($submissions as $sub) {
            $key = isset($sub['table_name']) ? $sub['table_name'] : (isset($sub['report_type']) ? $sub['report_type'] : null);
            if ($key) {
                // Store submission with office info for matching
                $submissionsMap[$key] = $sub;
            }
        }
    } catch (Exception $e) {
        // If submissions table doesn't exist or has issues, continue without it
        error_log("Could not fetch submissions: " . $e->getMessage());
    }
    
    // Format tasks
    $formattedTasks = [];
    $now = new DateTime();
    
    foreach ($tasks as $task) {
        // Check if this task has a submission
        // Match by table_name and verify office format matches (handle both "RGO" and "RGO Lipa" formats)
        $submission = null;
        if (isset($submissionsMap[$task['table_name']])) {
            $sub = $submissionsMap[$task['table_name']];
            $subOffice = strtolower(trim($sub['office'] ?? ''));
            $taskOffice = strtolower(trim($task['assigned_office'] ?? ''));
            
            // Match if offices are exactly the same, or if submission office matches the first part of task office (office+campus format)
            if ($subOffice === $taskOffice || 
                $subOffice === strtolower(trim(explode(' ', $taskOffice)[0])) ||
                $taskOffice === trim($subOffice . ' ' . strtolower($userCampus ?? ''))) {
                $submission = $sub;
            }
        }
        
        // Calculate deadline info
        $deadline = null;
        $deadlineFormatted = null;
        $daysRemaining = null;
        $taskStatus = 'pending';
        
        if (isset($task['deadline']) && $task['deadline']) {
            try {
                $deadline = new DateTime($task['deadline']);
                $deadlineFormatted = $deadline->format('M d, Y');
                $interval = $now->diff($deadline);
                $daysRemaining = $interval->invert ? -$interval->days : $interval->days;
                
                // Determine status
                if ($submission) {
                    $taskStatus = 'completed';
                } elseif ($interval->invert) {
                    $taskStatus = 'overdue';
                } elseif ($daysRemaining <= 3) {
                    $taskStatus = 'due_soon';
                }
            } catch (Exception $e) {
                // Invalid date, skip
            }
        } else {
            $taskStatus = $submission ? 'completed' : 'pending';
        }
        
        // Format table name using proper mapping
        $title = formatTableNameForDisplay($task['table_name']);
        
        // Apply filter - if filter is 'pending', skip completed tasks
        if ($filter === 'pending' && $submission) continue;
        if ($filter === 'completed' && !$submission) continue;
        
        $formattedTasks[] = [
            'id' => (int)$task['id'],
            'table_name' => $task['table_name'],
            'title' => $title,
            'description' => $task['description'] ?? 'No description provided',
            'office' => $task['assigned_office'],
            'assigned_date' => $task['assigned_date'],
            'assigned_date_formatted' => $task['assigned_date'] ? (new DateTime($task['assigned_date']))->format('M d, Y') : null,
            'deadline' => isset($task['deadline']) ? $task['deadline'] : null,
            'deadline_formatted' => $deadlineFormatted,
            'days_remaining' => $daysRemaining,
            'priority' => isset($task['priority']) ? $task['priority'] : 'medium',
            'has_deadline' => isset($task['has_deadline']) ? (bool)$task['has_deadline'] : false,
            'notes' => isset($task['notes']) ? $task['notes'] : null,
            'status' => $taskStatus,
            'assigned_by' => 'Admin',
            'submission_id' => $submission ? $submission['id'] : null,
            'submission_date' => $submission ? ($submission['submitted_at'] ?? $submission['created_at'] ?? null) : null,
            'submission_status' => $submission ? ($submission['status'] ?? 'submitted') : null
        ];
    }
    
    // Calculate stats
    $totalTasks = count($formattedTasks);
    $pendingTasks = 0;
    $completedTasks = 0;
    $overdueTasks = 0;
    
    foreach ($formattedTasks as $task) {
        if ($task['status'] === 'completed') {
            $completedTasks++;
        } else {
            $pendingTasks++;
            if ($task['status'] === 'overdue') {
                $overdueTasks++;
            }
        }
    }
    
    // Return response
    echo json_encode([
        'success' => true,
        'tasks' => $formattedTasks,
        'stats' => [
            'total' => $totalTasks,
            'pending' => $pendingTasks,
            'completed' => $completedTasks,
            'overdue' => $overdueTasks
        ],
        'debug' => [
            'user_id' => $userId,
            'office' => $userOffice,
            'filter' => $filter
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

/**
 * Format table name for display
 */
function formatTableNameForDisplay($tableName) {
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
