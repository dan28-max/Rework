<?php
/**
 * Table Assignment API
 * Handles assigning empty table structures to offices for user data entry
 */

// Clean output buffer and set headers first
ob_clean();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Suppress error display to prevent HTML output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Include database configuration
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../includes/functions.php';

    // Start session for authentication
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Require authentication - don't set default user ID
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized. Please log in.'
        ]);
        exit();
    }
    
    $pdo = getDB();
    error_log("Admin assignment API accessed by user: " . $_SESSION['user_id']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit();
}

// Table structures mapping
$tableStructures = [
    'admissiondata' => ["Campus", "Semester", "Academic Year", "Category", "Program", "Male", "Female"],
    'enrollmentdata' => ["Campus", "Academic Year", "Semester", "College", "Graduate/Undergrad", "Program/Course", "Male", "Female"],
    'graduatesdata' => ["Campus", "Academic Year", "Semester", "Degree Level", "Subject Area", "Course", "Category/Total No. of Applicants", "Male", "Female"],
    'employee' => ["Campus", "Date Generated", "Category", "Faculty Rank", "Sex", "Status", "Date Hired"],
    'leaveprivilege' => ["Campus", "Leave Type", "Employee Name", "Duration Days", "Equivalent Pay"],
    'libraryvisitor' => ["Campus", "Visit Date", "Category", "Sex", "Total Visitors"],
    'pwd' => ["Campus", "Year", "No. of PWD Students", "No. of PWD Employees", "Type of Disability", "Sex"],
    'waterconsumption' => ["Campus", "Date", "Category", "Prev Reading", "Current Reading", "Quantity (m^3)", "Total Amount", "Price/m^3", "Month", "Year", "Remarks"],
    'treatedwastewater' => ["Campus", "Date", "Treated Volume", "Reused Volume", "Effluent Volume"],
    'electricityconsumption' => ["Campus", "Category", "Month", "Year", "Prev Reading", "Current Reading", "Actual Consumption", "Multiplier", "Total Consumption", "Total Amount", "Price/kWh", "Remarks"],
    'solidwaste' => ["Campus", "Month", "Year", "Waste Type", "Quantity", "Remarks"],
    'campuspopulation' => ["Campus", "Year", "Students", "IS Students", "Employees", "Canteen", "Construction", "Total"],
    'foodwaste' => ["Campus", "Date", "Quantity (kg)", "Remarks"],
    'fuelconsumption' => ["Campus", "Date", "Driver", "Vehicle", "Plate No", "Fuel Type", "Description", "Transaction No", "Odometer", "Qty", "Total Amount"],
    'distancetraveled' => ["Campus", "Travel Date", "Plate No", "Vehicle", "Fuel Type", "Start Mileage", "End Mileage", "Total KM"],
    'budgetexpenditure' => ["Campus", "Year", "Particulars", "Category", "Budget Allocation", "Actual Expenditure", "Utilization Rate"],
    'flightaccommodation' => ["Campus", "Department", "Year", "Traveler", "Purpose", "From", "To", "Country", "Type", "Rooms", "Nights"]
];

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get JSON input
        $rawInput = file_get_contents('php://input');
        error_log("Received assignment request: " . $rawInput);
        
        $input = json_decode($rawInput, true);
        
        if (!$input) {
            error_log("Failed to decode JSON: " . json_last_error_msg());
            throw new Exception('Invalid JSON input: ' . json_last_error_msg());
        }
        
        error_log("Decoded input: " . print_r($input, true));

        // Check if this is a batch assignment (multiple reports and offices)
        if (isset($input['reports']) && isset($input['offices'])) {
            // Batch assignment
            $reports = $input['reports'];
            $offices = $input['offices'];
            
            // Get deadline and priority settings
            $hasDeadline = $input['hasDeadline'] ?? false;
            $deadline = $input['deadline'] ?? null;
            $priority = $input['priority'] ?? 'medium';
            $notes = $input['notes'] ?? '';
            
            if (!is_array($reports) || !is_array($offices)) {
                throw new Exception('Reports and offices must be arrays');
            }
            
            if (empty($reports) || empty($offices)) {
                throw new Exception('Please select at least one report and one office');
            }
            
            $successCount = 0;
            $errors = [];
            
            // Assign each report to each office
            foreach ($reports as $reportTable) {
                // Validate report table
                if (!array_key_exists($reportTable, $tableStructures)) {
                    $errors[] = "Invalid report table: {$reportTable}";
                    continue;
                }
                
                foreach ($offices as $officeId) {
                    // Determine if officeId is a user ID (integer) or office name (string)
                    if (is_numeric($officeId)) {
                        // Get office details from user ID
                        $officeStmt = $pdo->prepare("SELECT office, campus FROM users WHERE id = ? LIMIT 1");
                        $officeStmt->execute([$officeId]);
                        $officeData = $officeStmt->fetch(PDO::FETCH_ASSOC);
                        
                        if (!$officeData) {
                            $errors[] = "Office not found: ID {$officeId}";
                            continue;
                        }
                        
                        $officeName = trim($officeData['office']);
                        $officeCampus = trim($officeData['campus'] ?? '');
                        
                        // Validate that office is not empty
                        if (empty($officeName)) {
                            $errors[] = "User ID {$officeId} does not have an office assigned";
                            continue;
                        }
                        
                        // Build office+campus combination for proper matching (e.g., "RGO Lipa")
                        // This ensures users can see their assigned reports correctly
                        if (!empty($officeCampus)) {
                            $assignedOffice = trim($officeName . ' ' . $officeCampus);
                        } else {
                            $assignedOffice = $officeName;
                        }
                    } else {
                        // Use office name directly
                        $assignedOffice = trim($officeId);
                        
                        // Validate office name is not empty
                        if (empty($assignedOffice)) {
                            $errors[] = "Invalid office name: empty or whitespace";
                            continue;
                        }
                    }
                    
                    // Check if already assigned
                    if (isTableAlreadyAssigned($reportTable, $assignedOffice)) {
                        // Reactivate existing assignment with new deadline and priority
                        $updateSql = "UPDATE table_assignments 
                                     SET status = 'active', 
                                         assigned_date = NOW(), 
                                         assigned_by = ?,
                                         has_deadline = ?,
                                         deadline = ?,
                                         priority = ?,
                                         notes = ?
                                     WHERE table_name = ? 
                                     AND assigned_office = ?";
                        $reactivateStmt = $pdo->prepare($updateSql);
                        $reactivateStmt->execute([
                            $_SESSION['user_id'],
                            $hasDeadline ? 1 : 0,
                            $hasDeadline && $deadline ? $deadline : null,
                            $priority,
                            $notes,
                            $reportTable,
                            $assignedOffice
                        ]);
                        $successCount++;
                    } else {
                        // Create new assignment with deadline and priority
                        $result = createTableAssignment($reportTable, $assignedOffice, '', $_SESSION['user_id'], $hasDeadline, $deadline, $priority, $notes);
                        if ($result === true) {
                            // Try to log activity, but don't fail if it errors
                            try {
                                logActivity('table_assignment', "Assigned {$reportTable} table to {$assignedOffice}", $_SESSION['user_id']);
                            } catch (Exception $e) {
                                error_log("Activity logging failed: " . $e->getMessage());
                            }
                            $successCount++;
                        } else {
                            $errorMsg = is_string($result) ? $result : "Failed to assign {$reportTable} to {$assignedOffice}";
                            $errors[] = $errorMsg;
                            error_log("Assignment failed for {$reportTable} to {$assignedOffice}: " . $errorMsg);
                        }
                    }
                }
            }
            
            $response = [
                'success' => $successCount > 0,
                'message' => "Successfully assigned {$successCount} report(s)",
                'assigned_count' => $successCount
            ];
            
            if (!empty($errors)) {
                $response['errors'] = $errors;
            }
            
            echo json_encode($response);
            exit();
        }
        
        // Single assignment (legacy support)
        if (!isset($input['reportTable']) || !isset($input['assignedOffice'])) {
            throw new Exception('Missing required fields: reportTable and assignedOffice');
        }

        $reportTable = $input['reportTable'];
        $assignedOffice = $input['assignedOffice'];
        $description = $input['description'] ?? '';
        $hasDeadline = $input['hasDeadline'] ?? false;
        $deadline = $input['deadline'] ?? null;
        $priority = $input['priority'] ?? 'medium';
        $notes = $input['notes'] ?? '';

        // Validate report table
        if (!array_key_exists($reportTable, $tableStructures)) {
            throw new Exception('Invalid report table selected');
        }

        // Check if table is already assigned to this office with active status
        if (isTableAlreadyAssigned($reportTable, $assignedOffice)) {
            // Instead of blocking, reactivate the existing assignment
            $reactivateStmt = $pdo->prepare("UPDATE table_assignments SET status = 'active', assigned_date = NOW(), assigned_by = ? WHERE table_name = ? AND assigned_office = ?");
            $reactivateStmt->execute([$_SESSION['user_id'], $reportTable, $assignedOffice]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Table assignment reactivated successfully',
                'data' => [
                    'table' => $reportTable,
                    'office' => $assignedOffice,
                    'columns' => $tableStructures[$reportTable]
                ]
            ]);
            exit();
        }

        // Create table assignment
        $result = createTableAssignment($reportTable, $assignedOffice, $description, $_SESSION['user_id'], $hasDeadline, $deadline, $priority, $notes);

        if ($result) {
            // Try to log the assignment activity
            try {
                logActivity('table_assignment', "Assigned {$reportTable} table to {$assignedOffice}", $_SESSION['user_id']);
            } catch (Exception $e) {
                error_log("Activity logging failed: " . $e->getMessage());
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Table assigned successfully',
                'data' => [
                    'table' => $reportTable,
                    'office' => $assignedOffice,
                    'columns' => $tableStructures[$reportTable]
                ]
            ]);
        } else {
            throw new Exception('Failed to assign table');
        }

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage(),
            'error' => $e->getMessage()
        ]);
    } catch (Error $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage(),
            'error' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

/**
 * Check if table is already assigned to office
 */
function isTableAlreadyAssigned($tableName, $office) {
    $pdo = getDB();
    
    try {
        // Use case-insensitive comparison for office and exact match for table_name
        $sql = "SELECT COUNT(*) FROM table_assignments 
                WHERE LOWER(table_name) = LOWER(:table_name) 
                AND LOWER(TRIM(assigned_office)) = LOWER(TRIM(:office)) 
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
 * Create table assignment
 */
function createTableAssignment($tableName, $assignedOffice, $description, $assignedBy, $hasDeadline = false, $deadline = null, $priority = 'medium', $notes = '') {
    $pdo = getDB();
    
    try {
        // Validate required parameters
        if (empty($tableName)) {
            return "Table name cannot be empty";
        }
        if (empty($assignedOffice)) {
            return "Assigned office cannot be empty";
        }
        if (empty($assignedBy)) {
            return "Assigned by user ID cannot be empty";
        }
        
        // Validate that assigned_by user exists
        $userCheck = $pdo->prepare("SELECT id, name, role FROM users WHERE id = ? LIMIT 1");
        $userCheck->execute([$assignedBy]);
        $userData = $userCheck->fetch(PDO::FETCH_ASSOC);
        if (!$userData) {
            error_log("Assignment failed: User ID {$assignedBy} does not exist in database");
            return "Invalid assigned_by user ID: {$assignedBy}. User not found in database. Please log in again.";
        }
        
        // Log successful user validation
        error_log("Assignment user validation: User ID {$assignedBy} ({$userData['name']}, {$userData['role']}) is valid");
        
        $pdo->beginTransaction();

        // Log what we're trying to insert
        error_log("Creating assignment: table=$tableName, office=$assignedOffice, hasDeadline=$hasDeadline, deadline=$deadline, priority=$priority, assignedBy=$assignedBy");

        // Check if columns exist first
        $columnsCheck = $pdo->query("SHOW COLUMNS FROM table_assignments");
        $existingColumns = [];
        while ($col = $columnsCheck->fetch(PDO::FETCH_ASSOC)) {
            $existingColumns[] = $col['Field'];
        }
        
        // Build INSERT based on existing columns
        $columns = ['table_name', 'assigned_office', 'description', 'assigned_by', 'assigned_date', 'status'];
        $values = [':table_name', ':assigned_office', ':description', ':assigned_by', 'NOW()', ':status'];
        $params = [
            'table_name' => $tableName,
            'assigned_office' => $assignedOffice,
            'description' => $description,
            'assigned_by' => $assignedBy,
            'status' => 'active'
        ];
        
        // Add optional columns if they exist
        if (in_array('has_deadline', $existingColumns)) {
            $columns[] = 'has_deadline';
            $values[] = ':has_deadline';
            $params['has_deadline'] = $hasDeadline ? 1 : 0;
        }
        
        if (in_array('deadline', $existingColumns)) {
            $columns[] = 'deadline';
            $values[] = ':deadline';
            $params['deadline'] = $hasDeadline && $deadline ? $deadline : null;
        }
        
        if (in_array('priority', $existingColumns)) {
            $columns[] = 'priority';
            $values[] = ':priority';
            $params['priority'] = $priority;
        }
        
        if (in_array('notes', $existingColumns)) {
            $columns[] = 'notes';
            $values[] = ':notes';
            $params['notes'] = $notes;
        }
        
        $sql = "INSERT INTO table_assignments (" . implode(', ', $columns) . ") 
                VALUES (" . implode(', ', $values) . ")";
        
        error_log("SQL: $sql");
        error_log("Params: " . print_r($params, true));
        
        $stmt = $pdo->prepare($sql);
        
        // Execute and check for errors
        $execResult = $stmt->execute($params);
        if (!$execResult) {
            $errorInfo = $stmt->errorInfo();
            throw new PDOException("SQL execution failed: " . ($errorInfo[2] ?? 'Unknown error') . " (Code: " . ($errorInfo[0] ?? 'N/A') . ")");
        }

        $insertedId = $pdo->lastInsertId();
        error_log("Assignment created successfully with ID: $insertedId");

        $pdo->commit();
        return true;

    } catch (PDOException $e) {
        $pdo->rollBack();
        $errorMsg = "Table assignment error: " . $e->getMessage() . " (SQL State: " . $e->getCode() . ")";
        error_log($errorMsg);
        error_log("Stack trace: " . $e->getTraceAsString());
        // Return error message instead of just false for better debugging
        return $errorMsg;
    } catch (Exception $e) {
        $pdo->rollBack();
        $errorMsg = "Table assignment exception: " . $e->getMessage();
        error_log($errorMsg);
        error_log("Stack trace: " . $e->getTraceAsString());
        return $errorMsg;
    }
}

?>

