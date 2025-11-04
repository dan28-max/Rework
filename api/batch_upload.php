<?php
/**
 * Batch Upload API
 * Handles file uploads and data processing for report tables
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

    // Check if user is authenticated and is admin
    session_start();
    if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
        exit();
    }
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
            logActivity('batch_upload', "Uploaded {$reportTable} data for {$assignedOffice}", $_SESSION['user_id']);
            
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
 * Convert display column name to database column name
 */
function convertToDbColumn($displayName) {
    // Convert to lowercase and replace spaces/special chars with underscores
    $dbColumn = strtolower($displayName);
    $dbColumn = preg_replace('/[^a-z0-9]+/', '_', $dbColumn);
    $dbColumn = trim($dbColumn, '_');
    
    // Special mappings for specific columns
    $mappings = [
        'no_of_pwd_students' => 'no_of_pwd_students',
        'no_of_pwd_employees' => 'no_of_pwd_employees',
        'type_of_disability' => 'type_of_disability',
        'graduate_undergrad' => 'graduate_undergrad',
        'program_course' => 'program_course',
        'category_total_no_of_applicants' => 'category',
        'quantity_m_3' => 'quantity_m3',
        'price_m_3' => 'price_per_m3',
        'price_kwh' => 'price_per_kwh',
        'quantity_kg' => 'quantity_kg',
        'plate_no' => 'plate_no',
        'from' => 'from_location',
        'to' => 'to_location'
    ];
    
    return $mappings[$dbColumn] ?? $dbColumn;
}

/**
 * Save batch data to database
 */
function saveBatchData($tableName, $assignedOffice, $data, $description, $uploadedBy) {
    $pdo = getDB();
    
    try {
        $pdo->beginTransaction();

        // Convert display column names to database column names
        $convertedData = [];
        foreach ($data as $row) {
            $convertedRow = [];
            foreach ($row as $key => $value) {
                $dbColumn = convertToDbColumn($key);
                $convertedRow[$dbColumn] = $value;
            }
            $convertedData[] = $convertedRow;
        }

        // Insert data
        $columns = array_keys($convertedData[0]);
        $placeholders = ':' . implode(', :', $columns);
        $columnsList = '`' . implode('`, `', $columns) . '`';
        $sql = "INSERT INTO {$tableName} ({$columnsList}, batch_id, submitted_by, submitted_at) 
                VALUES ({$placeholders}, :batch_id, :submitted_by, NOW())";

        $stmt = $pdo->prepare($sql);
        
        $batchId = 'batch_' . uniqid();
        
        foreach ($convertedData as $row) {
            $row['batch_id'] = $batchId;
            $row['submitted_by'] = $uploadedBy;
            
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
    $pdo = getDB();
    
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

?>
