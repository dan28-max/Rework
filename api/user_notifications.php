<?php
/**
 * User Notifications API
 * Handles fetching, marking as read, and deleting user notifications
 */

// Start session first before any output
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Enable error display for debugging (set to 1 for debugging, 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Disable HTML error output - return JSON instead
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
    $action = $_GET['action'] ?? 'get_notifications';

    switch ($action) {
        case 'get_notifications':
            getNotifications($pdo, $userId);
            break;
        case 'mark_read':
            markNotificationRead($pdo, $userId);
            break;
        case 'mark_all_read':
            markAllNotificationsRead($pdo, $userId);
            break;
        case 'delete':
            deleteNotification($pdo, $userId);
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    error_log("Error in user_notifications.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
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

/**
 * Get all notifications for the user from multiple sources
 */
function getNotifications($pdo, $userId) {
    try {
        $allNotifications = [];
        
        // Get user's office and campus for filtering
        $userInfo = getUserOfficeAndCampus($userId);
        $userOffice = $userInfo['office'] ?? null;
        $userCampus = $userInfo['campus'] ?? null;
        $officeCampusCombo = $userOffice && $userCampus ? trim($userOffice . ' ' . $userCampus) : null;
        
        // Log user info for debugging
        error_log("Notification request - User ID: {$userId}, Office: " . ($userOffice ?? 'NULL') . ", Campus: " . ($userCampus ?? 'NULL'));
        
        // 1. Get stored notifications from notifications table
        $notificationsTableExists = $pdo->query("SHOW TABLES LIKE 'notifications'")->fetch();
        if ($notificationsTableExists) {
            $stmt = $pdo->prepare("
                SELECT 
                    id,
                    type,
                    title,
                    message,
                    is_read as read,
                    created_at
                FROM notifications 
                WHERE user_id = :user_id 
                AND deleted_at IS NULL
                ORDER BY created_at DESC
                LIMIT 50
            ");
            
            $stmt->execute(['user_id' => $userId]);
            $storedNotifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($storedNotifications as $notif) {
                $allNotifications[] = [
                    'id' => 'notif_' . $notif['id'],
                    'type' => $notif['type'],
                    'title' => $notif['title'],
                    'message' => $notif['message'],
                    'read' => (bool)$notif['read'],
                    'time' => getRelativeTime($notif['created_at']),
                    'created_at' => $notif['created_at']
                ];
            }
        }
        
        // 2. Get recent submissions status changes (approved/rejected)
        try {
            $submissionsTableExists = $pdo->query("SHOW TABLES LIKE 'report_submissions'")->fetch();
            if ($submissionsTableExists) {
                // Get approved/rejected submissions for user - always try, even without office/campus
                // Check if reviewed_date column exists
                $columnsCheck = $pdo->query("SHOW COLUMNS FROM report_submissions LIKE 'reviewed_date'");
                $hasReviewedDate = $columnsCheck && $columnsCheck->rowCount() > 0;
                
                // Check which user_id column name is used
                $userIdColumnsCheck = $pdo->query("SHOW COLUMNS FROM report_submissions LIKE 'user_id'");
                $hasUserId = $userIdColumnsCheck && $userIdColumnsCheck->rowCount() > 0;
                $userIdCol = $hasUserId ? 'rs.user_id' : 'rs.submitted_by';
                
                $sql = "SELECT 
                    rs.id,
                    rs.table_name,
                    rs.status,
                    rs.office,
                    rs.campus,
                    rs.submission_date";
                    
                    if ($hasReviewedDate) {
                        $sql .= ", rs.reviewed_date";
                    }
                    
                    // Get approved/rejected submissions for this user
                    // Since we filter by user_id/submitted_by, these are already the user's own submissions
                    // No need for additional office/campus filtering - user should see their own approved/rejected reports!
                    $sql .= " FROM report_submissions rs
                        WHERE {$userIdCol} = :user_id
                        AND rs.status IN ('approved', 'rejected')";
                    
                    if ($hasReviewedDate) {
                        $sql .= " AND reviewed_date IS NOT NULL
                            AND reviewed_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                    } else {
                        $sql .= " AND submission_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
                    }
                    
                    $sql .= " ORDER BY " . ($hasReviewedDate ? "reviewed_date" : "submission_date") . " DESC
                        LIMIT 10";
                    
                    $submissionStmt = $pdo->prepare($sql);
                    
                    // Execute with just user_id - no office/campus filtering needed for user's own submissions
                    $submissionStmt->execute([
                        'user_id' => $userId
                    ]);
                    
                    $submissions = $submissionStmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    // Log found submissions for debugging
                    error_log("Found " . count($submissions) . " approved/rejected submissions for user {$userId}");
                    foreach ($submissions as $sub) {
                        error_log("  - Submission ID: {$sub['id']}, Table: {$sub['table_name']}, Status: {$sub['status']}, Office: " . ($sub['office'] ?? 'NULL'));
                    }
                    
                    foreach ($submissions as $submission) {
                        $reportName = getReportDisplayName($submission['table_name']);
                        $reviewDate = $hasReviewedDate ? ($submission['reviewed_date'] ?? $submission['submission_date']) : $submission['submission_date'];
                        
                        if ($submission['status'] === 'approved') {
                            $allNotifications[] = [
                                'id' => 'sub_approved_' . $submission['id'],
                                'type' => 'success',
                                'title' => 'Report Approved',
                                'message' => "Your {$reportName} report has been approved by the admin.",
                                'read' => false,
                                'time' => getRelativeTime($reviewDate),
                                'created_at' => $reviewDate
                            ];
                        } else if ($submission['status'] === 'rejected') {
                            $allNotifications[] = [
                                'id' => 'sub_rejected_' . $submission['id'],
                                'type' => 'error',
                                'title' => 'Submission Rejected',
                                'message' => "Your {$reportName} report needs corrections. Please review the feedback.",
                                'read' => false,
                                'time' => getRelativeTime($reviewDate),
                                'created_at' => $reviewDate
                            ];
                        }
                    }
                }
        } catch (Exception $e) {
            error_log("Error fetching submissions for notifications: " . $e->getMessage());
            // Continue without submission notifications
        }
        
        // 3. Get recent task assignments
        try {
            $assignmentsTableExists = $pdo->query("SHOW TABLES LIKE 'table_assignments'")->fetch();
            if ($assignmentsTableExists) {
                // Use already fetched user info with campus
                // If no campus, still try to show notifications but with office filtering only
                if ($userOffice) {
                    // Check which columns exist
                    $columnsCheck = $pdo->query("SHOW COLUMNS FROM table_assignments");
                    $existingColumns = [];
                    while ($col = $columnsCheck->fetch(PDO::FETCH_ASSOC)) {
                        $existingColumns[] = $col['Field'];
                    }
                    
                    $selectFields = ['id', 'table_name', 'assigned_office', 'assigned_date', 'status'];
                    if (in_array('deadline', $existingColumns)) {
                        $selectFields[] = 'deadline';
                    }
                    if (in_array('priority', $existingColumns)) {
                        $selectFields[] = 'priority';
                    }
                    
                    // Filter STRICTLY by office and campus to prevent cross-campus notifications
                    if ($userCampus) {
                        $sql = "SELECT " . implode(', ', $selectFields) . "
                            FROM table_assignments ta
                            LEFT JOIN users u ON ta.assigned_by = u.id
                            WHERE ta.status = 'active'
                            AND ta.assigned_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                            AND (
                                LOWER(TRIM(ta.assigned_office)) = LOWER(:officeCampusCombo)
                                OR
                                (LOWER(TRIM(ta.assigned_office)) = LOWER(:office) AND u.campus = :campus AND u.campus IS NOT NULL)
                            )
                            ORDER BY ta.assigned_date DESC
                            LIMIT 10";
                        
                        $assignmentStmt = $pdo->prepare($sql);
                        $assignmentStmt->execute([
                            'officeCampusCombo' => $officeCampusCombo,
                            'office' => $userOffice,
                            'campus' => $userCampus
                        ]);
                    } else {
                        // Fallback to office-only filtering if no campus
                        $sql = "SELECT " . implode(', ', $selectFields) . "
                            FROM table_assignments ta
                            WHERE ta.status = 'active'
                            AND ta.assigned_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                            AND LOWER(TRIM(ta.assigned_office)) = LOWER(:office)
                            ORDER BY ta.assigned_date DESC
                            LIMIT 10";
                        
                        $assignmentStmt = $pdo->prepare($sql);
                        $assignmentStmt->execute([
                            'office' => $userOffice
                        ]);
                    }
                    $assignments = $assignmentStmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    foreach ($assignments as $assignment) {
                        $reportName = getReportDisplayName($assignment['table_name']);
                        
                        // Check if deadline is approaching (within 7 days)
                        if (isset($assignment['deadline']) && !empty($assignment['deadline'])) {
                            try {
                                $deadlineDate = new DateTime($assignment['deadline']);
                                $now = new DateTime();
                                $diff = $now->diff($deadlineDate);
                                $daysLeft = (int)$diff->format('%r%a');
                                
                                if ($daysLeft >= 0 && $daysLeft <= 7) {
                                    $deadlineText = " (Due in {$daysLeft} day" . ($daysLeft != 1 ? 's' : '') . ")";
                                    
                                    $allNotifications[] = [
                                        'id' => 'task_deadline_' . $assignment['id'],
                                        'type' => 'warning',
                                        'title' => 'Deadline Approaching',
                                        'message' => "{$reportName} report{$deadlineText}.",
                                        'read' => false,
                                        'time' => getRelativeTime($assignment['assigned_date']),
                                        'created_at' => $assignment['assigned_date']
                                    ];
                                } else if ($daysLeft < 0) {
                                    $daysOverdue = abs($daysLeft);
                                    $allNotifications[] = [
                                        'id' => 'task_overdue_' . $assignment['id'],
                                        'type' => 'error',
                                        'title' => 'Task Overdue',
                                        'message' => "{$reportName} report is {$daysOverdue} day" . ($daysOverdue != 1 ? 's' : '') . " overdue.",
                                        'read' => false,
                                        'time' => getRelativeTime($assignment['assigned_date']),
                                        'created_at' => $assignment['assigned_date']
                                    ];
                                }
                            } catch (Exception $e) {
                                error_log("Error processing deadline: " . $e->getMessage());
                            }
                        }
                        
                        // New task assignment notification
                        $deadlineText = '';
                        if (isset($assignment['deadline']) && !empty($assignment['deadline'])) {
                            try {
                                $deadlineText = " Deadline: " . date('M d, Y', strtotime($assignment['deadline']));
                            } catch (Exception $e) {
                                // Skip if date is invalid
                            }
                        }
                        
                        $allNotifications[] = [
                            'id' => 'task_new_' . $assignment['id'],
                            'type' => 'info',
                            'title' => 'New Task Assigned',
                            'message' => "{$reportName} report has been assigned to you." . $deadlineText,
                            'read' => false,
                            'time' => getRelativeTime($assignment['assigned_date']),
                            'created_at' => $assignment['assigned_date']
                        ];
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Error fetching task assignments for notifications: " . $e->getMessage());
            // Continue without task notifications
        }
        
        // 4. Get recent submissions (submitted but not reviewed yet) from report_submissions
        try {
            if (isset($submissionsTableExists) && $submissionsTableExists && $userOffice) {
                // Filter by office AND campus to prevent cross-campus notifications
                if ($userCampus) {
                    $pendingStmt = $pdo->prepare("
                        SELECT 
                            rs.id,
                            rs.table_name,
                            rs.submission_date,
                            rs.status
                        FROM report_submissions rs
                        INNER JOIN users u ON rs.user_id = u.id
                        WHERE rs.user_id = :user_id
                        AND (
                            LOWER(TRIM(rs.office)) = LOWER(:officeCampusCombo)
                            OR 
                            (LOWER(TRIM(rs.office)) = LOWER(:office) AND u.campus = :campus)
                        )
                        AND rs.status = 'pending'
                        AND u.campus = :campus2
                        AND u.campus IS NOT NULL
                        AND rs.submission_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                        ORDER BY rs.submission_date DESC
                        LIMIT 5
                    ");
                    
                    $pendingStmt->execute([
                        'user_id' => $userId,
                        'officeCampusCombo' => $officeCampusCombo,
                        'office' => $userOffice,
                        'campus' => $userCampus,
                        'campus2' => $userCampus
                    ]);
                } else {
                    // Fallback to office-only filtering if no campus
                    $pendingStmt = $pdo->prepare("
                        SELECT 
                            rs.id,
                            rs.table_name,
                            rs.submission_date,
                            rs.status
                        FROM report_submissions rs
                        WHERE rs.user_id = :user_id
                        AND LOWER(TRIM(rs.office)) = LOWER(:office)
                        AND rs.status = 'pending'
                        AND rs.submission_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                        ORDER BY rs.submission_date DESC
                        LIMIT 5
                    ");
                    
                    $pendingStmt->execute([
                        'user_id' => $userId,
                        'office' => $userOffice
                    ]);
                }
                
                $pendingSubmissions = $pendingStmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($pendingSubmissions as $submission) {
                    $reportName = getReportDisplayName($submission['table_name']);
                    
                    $allNotifications[] = [
                        'id' => 'sub_pending_' . $submission['id'],
                        'type' => 'info',
                        'title' => 'Report Submitted',
                        'message' => "Your {$reportName} report has been successfully submitted and is pending review.",
                        'read' => false,
                        'time' => getRelativeTime($submission['submission_date']),
                        'created_at' => $submission['submission_date']
                    ];
                }
            }
        } catch (Exception $e) {
            error_log("Error fetching pending submissions for notifications: " . $e->getMessage());
            // Continue without pending submission notifications
        }
        
        // 5. Get notifications from data_submissions table (approved/rejected/pending)
        try {
            $dataSubmissionsTableExists = $pdo->query("SHOW TABLES LIKE 'data_submissions'")->fetch();
            if ($dataSubmissionsTableExists && $userOffice) {
                // Get approved/rejected data submissions with campus filtering
                if ($userCampus) {
                    $dataSubmissionsSql = "SELECT 
                            ds.id,
                            ds.table_name,
                            ds.assigned_office,
                            ds.status,
                            ds.submitted_at,
                            ds.reviewed_at,
                            u.campus as submitter_campus
                        FROM data_submissions ds
                        INNER JOIN users u ON ds.submitted_by = u.id
                        WHERE ds.submitted_by = :user_id
                        AND (
                            LOWER(TRIM(ds.assigned_office)) = LOWER(:officeCampusCombo)
                            OR 
                            (LOWER(TRIM(ds.assigned_office)) = LOWER(:office) AND u.campus = :campus)
                        )
                        AND ds.status IN ('approved', 'rejected', 'pending')
                        AND u.campus = :campus2
                        AND u.campus IS NOT NULL
                        AND ds.submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                        ORDER BY ds.submitted_at DESC
                        LIMIT 10";
                    
                    $dataSubmissionsStmt = $pdo->prepare($dataSubmissionsSql);
                    $dataSubmissionsStmt->execute([
                        'user_id' => $userId,
                        'officeCampusCombo' => $officeCampusCombo,
                        'office' => $userOffice,
                        'campus' => $userCampus,
                        'campus2' => $userCampus
                    ]);
                } else {
                    // Fallback to office-only filtering if no campus
                    $dataSubmissionsSql = "SELECT 
                            ds.id,
                            ds.table_name,
                            ds.assigned_office,
                            ds.status,
                            ds.submitted_at,
                            ds.reviewed_at
                        FROM data_submissions ds
                        WHERE ds.submitted_by = :user_id
                        AND LOWER(TRIM(ds.assigned_office)) = LOWER(:office)
                        AND ds.status IN ('approved', 'rejected', 'pending')
                        AND ds.submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                        ORDER BY ds.submitted_at DESC
                        LIMIT 10";
                    
                    $dataSubmissionsStmt = $pdo->prepare($dataSubmissionsSql);
                    $dataSubmissionsStmt->execute([
                        'user_id' => $userId,
                        'office' => $userOffice
                    ]);
                }
                
                $dataSubmissions = $dataSubmissionsStmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($dataSubmissions as $submission) {
                    $reportName = getReportDisplayName($submission['table_name']);
                    $reviewDate = $submission['reviewed_at'] ?? $submission['submitted_at'];
                    
                    if ($submission['status'] === 'approved') {
                        $allNotifications[] = [
                            'id' => 'data_sub_approved_' . $submission['id'],
                            'type' => 'success',
                            'title' => 'Data Report Approved',
                            'message' => "Your {$reportName} data submission has been approved.",
                            'read' => false,
                            'time' => getRelativeTime($reviewDate),
                            'created_at' => $reviewDate
                        ];
                    } else if ($submission['status'] === 'rejected') {
                        $allNotifications[] = [
                            'id' => 'data_sub_rejected_' . $submission['id'],
                            'type' => 'error',
                            'title' => 'Data Submission Rejected',
                            'message' => "Your {$reportName} data submission has been rejected. Please review and resubmit.",
                            'read' => false,
                            'time' => getRelativeTime($reviewDate),
                            'created_at' => $reviewDate
                        ];
                    } else if ($submission['status'] === 'pending') {
                        $allNotifications[] = [
                            'id' => 'data_sub_pending_' . $submission['id'],
                            'type' => 'info',
                            'title' => 'Data Submission Pending',
                            'message' => "Your {$reportName} data submission is pending review.",
                            'read' => false,
                            'time' => getRelativeTime($submission['submitted_at']),
                            'created_at' => $submission['submitted_at']
                        ];
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Error fetching data_submissions notifications: " . $e->getMessage());
            // Continue without data_submissions notifications
        }
        
        // Sort all notifications by created_at (most recent first)
        usort($allNotifications, function($a, $b) {
            $timeA = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
            $timeB = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
            return $timeB - $timeA;
        });
        
        // Limit to 50 most recent
        $allNotifications = array_slice($allNotifications, 0, 50);
        
        // Log notification count for debugging
        error_log("User {$userId} (Office: {$userOffice}, Campus: {$userCampus}) - Found " . count($allNotifications) . " notifications");
        
        echo json_encode([
            'success' => true,
            'data' => $allNotifications,
            'debug' => [
                'user_id' => $userId,
                'office' => $userOffice,
                'campus' => $userCampus,
                'count' => count($allNotifications)
            ]
        ]);
    } catch (Exception $e) {
        error_log("Error fetching notifications: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error fetching notifications: ' . $e->getMessage()
        ]);
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
    
    // Convert to lowercase for matching
    $tableNameLower = strtolower($tableName);
    
    if (isset($reportNames[$tableNameLower])) {
        return $reportNames[$tableNameLower];
    }
    
    // Fallback: convert table_name to readable format
    return ucwords(str_replace(['_', '-'], ' ', $tableName));
}

/**
 * Mark a notification as read
 */
function markNotificationRead($pdo, $userId) {
    try {
        $notificationId = $_GET['id'] ?? null;
        
        if (!$notificationId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Notification ID required']);
            return;
        }

        // Check if notifications table exists
        $tableCheck = $pdo->query("SHOW TABLES LIKE 'notifications'")->fetch();
        if (!$tableCheck) {
            echo json_encode(['success' => true]);
            return;
        }

        // Update notification
        $stmt = $pdo->prepare("
            UPDATE notifications 
            SET is_read = 1, updated_at = NOW()
            WHERE id = :id AND user_id = :user_id
        ");
        
        $stmt->execute([
            'id' => $notificationId,
            'user_id' => $userId
        ]);

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        error_log("Error marking notification as read: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error updating notification'
        ]);
    }
}

/**
 * Mark all notifications as read
 */
function markAllNotificationsRead($pdo, $userId) {
    try {
        // Check if notifications table exists
        $tableCheck = $pdo->query("SHOW TABLES LIKE 'notifications'")->fetch();
        if (!$tableCheck) {
            echo json_encode(['success' => true]);
            return;
        }

        // Update all notifications
        $stmt = $pdo->prepare("
            UPDATE notifications 
            SET is_read = 1, updated_at = NOW()
            WHERE user_id = :user_id AND is_read = 0
        ");
        
        $stmt->execute(['user_id' => $userId]);

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        error_log("Error marking all notifications as read: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error updating notifications'
        ]);
    }
}

/**
 * Delete a notification
 */
function deleteNotification($pdo, $userId) {
    try {
        $notificationId = $_GET['id'] ?? null;
        
        if (!$notificationId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Notification ID required']);
            return;
        }

        // Check if notifications table exists
        $tableCheck = $pdo->query("SHOW TABLES LIKE 'notifications'")->fetch();
        if (!$tableCheck) {
            echo json_encode(['success' => true]);
            return;
        }

        // Soft delete notification
        $stmt = $pdo->prepare("
            UPDATE notifications 
            SET deleted_at = NOW(), updated_at = NOW()
            WHERE id = :id AND user_id = :user_id
        ");
        
        $stmt->execute([
            'id' => $notificationId,
            'user_id' => $userId
        ]);

        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        error_log("Error deleting notification: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error deleting notification'
        ]);
    }
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
function getRelativeTime($datetime) {
    if (!$datetime) return 'Just now';
    
    $timestamp = is_string($datetime) ? strtotime($datetime) : $datetime;
    $now = time();
    $diff = $now - $timestamp;
    
    if ($diff < 60) {
        return 'Just now';
    } elseif ($diff < 3600) {
        $minutes = floor($diff / 60);
        return $minutes . ' minute' . ($minutes > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 86400) {
        $hours = floor($diff / 3600);
        return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 604800) {
        $days = floor($diff / 86400);
        return $days . ' day' . ($days > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 2592000) {
        $weeks = floor($diff / 604800);
        return $weeks . ' week' . ($weeks > 1 ? 's' : '') . ' ago';
    } elseif ($diff < 31536000) {
        $months = floor($diff / 2592000);
        return $months . ' month' . ($months > 1 ? 's' : '') . ' ago';
    } else {
        $years = floor($diff / 31536000);
        return $years . ' year' . ($years > 1 ? 's' : '') . ' ago';
    }
}
?>

