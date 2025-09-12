<?php
/**
 * Table Assignment API
 * Handles assigning empty table structures to offices for user data entry
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

// Check if user is authenticated and is admin
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
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
    'pwd' => ["Campus", "Year", "PWD Students", "PWD Employees", "Disability Type", "Sex"],
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid JSON input');
        }

        // Validate required fields
        if (!isset($input['reportTable']) || !isset($input['assignedOffice'])) {
            throw new Exception('Missing required fields');
        }

        $reportTable = $input['reportTable'];
        $assignedOffice = $input['assignedOffice'];
        $description = $input['description'] ?? '';

        // Validate report table
        if (!array_key_exists($reportTable, $tableStructures)) {
            throw new Exception('Invalid report table selected');
        }

        // Check if table is already assigned to this office
        if (isTableAlreadyAssigned($reportTable, $assignedOffice)) {
            throw new Exception('This table is already assigned to this office');
        }

        // Create table assignment
        $result = createTableAssignment($reportTable, $assignedOffice, $description, $_SESSION['user_id']);

        if ($result) {
            // Log the assignment activity
            logActivity($_SESSION['user_id'], 'table_assignment', "Assigned {$reportTable} table to {$assignedOffice}", $description);
            
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
            'message' => $e->getMessage()
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
 * Create table assignment
 */
function createTableAssignment($tableName, $assignedOffice, $description, $assignedBy) {
    global $pdo;
    
    try {
        $pdo->beginTransaction();

        // Insert into table_assignments
        $sql = "INSERT INTO table_assignments (table_name, assigned_office, description, assigned_by, assigned_date, status) 
                VALUES (:table_name, :assigned_office, :description, :assigned_by, NOW(), 'active')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'table_name' => $tableName,
            'assigned_office' => $assignedOffice,
            'description' => $description,
            'assigned_by' => $assignedBy
        ]);

        $pdo->commit();
        return true;

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Table assignment error: " . $e->getMessage());
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

