<?php
/**
 * Batch Upload API
 * Handles file uploads and data processing for report tables
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
        if (!isset($input['reportTable']) || !isset($input['assignedOffice']) || !isset($input['data'])) {
            throw new Exception('Missing required fields');
        }

        $reportTable = $input['reportTable'];
        $assignedOffice = $input['assignedOffice'];
        $description = $input['description'] ?? '';
        $data = $input['data'];

        // Validate report table
        if (!array_key_exists($reportTable, $tableStructures)) {
            throw new Exception('Invalid report table selected');
        }

        // Validate data
        if (!is_array($data) || empty($data)) {
            throw new Exception('No data provided');
        }

        // Validate data structure
        $expectedColumns = $tableStructures[$reportTable];
        foreach ($data as $index => $row) {
            if (!is_array($row)) {
                throw new Exception("Invalid data format in row " . ($index + 1));
            }
            
            // Check if row has at least one expected column
            $hasValidColumn = false;
            foreach ($expectedColumns as $column) {
                if (isset($row[$column]) && !empty(trim($row[$column]))) {
                    $hasValidColumn = true;
                    break;
                }
            }
            
            if (!$hasValidColumn) {
                throw new Exception("Row " . ($index + 1) . " has no valid data");
            }
        }

        // Save to database
        $result = saveBatchData($reportTable, $assignedOffice, $data, $description, $_SESSION['user_id']);

        if ($result) {
            // Log the upload activity
            logActivity($_SESSION['user_id'], 'batch_upload', "Uploaded {$reportTable} data for {$assignedOffice}", count($data) . ' records');
            
            echo json_encode([
                'success' => true,
                'message' => 'Data saved successfully',
                'data' => [
                    'records_processed' => count($data),
                    'table' => $reportTable,
                    'office' => $assignedOffice
                ]
            ]);
        } else {
            throw new Exception('Failed to save data to database');
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
 * Save batch data to database
 */
function saveBatchData($tableName, $assignedOffice, $data, $description, $uploadedBy) {
    global $pdo;
    
    try {
        $pdo->beginTransaction();

        // Create table if it doesn't exist
        createReportTable($tableName, $data[0]);

        // Insert data
        $columns = array_keys($data[0]);
        $placeholders = ':' . implode(', :', $columns);
        $sql = "INSERT INTO {$tableName} (" . implode(', ', $columns) . ", assigned_office, uploaded_by, upload_date, description) 
                VALUES ({$placeholders}, :assigned_office, :uploaded_by, NOW(), :description)";

        $stmt = $pdo->prepare($sql);
        
        foreach ($data as $row) {
            $row['assigned_office'] = $assignedOffice;
            $row['uploaded_by'] = $uploadedBy;
            $row['description'] = $description;
            
            if (!$stmt->execute($row)) {
                throw new Exception('Failed to insert data row');
            }
        }

        $pdo->commit();
        return true;

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Batch upload error: " . $e->getMessage());
        return false;
    }
}

/**
 * Create report table dynamically
 */
function createReportTable($tableName, $sampleRow) {
    global $pdo;
    
    $columns = [];
    foreach (array_keys($sampleRow) as $column) {
        $columns[] = "`{$column}` TEXT";
    }
    
    $columns[] = "`assigned_office` VARCHAR(100)";
    $columns[] = "`uploaded_by` INT";
    $columns[] = "`upload_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
    $columns[] = "`description` TEXT";
    $columns[] = "`id` INT AUTO_INCREMENT PRIMARY KEY";
    
    $sql = "CREATE TABLE IF NOT EXISTS `{$tableName}` (" . implode(', ', $columns) . ")";
    
    try {
        $pdo->exec($sql);
    } catch (PDOException $e) {
        error_log("Table creation error: " . $e->getMessage());
        throw new Exception('Failed to create table');
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
