<?php
/**
 * Get Reports API
 * Returns the list of all available reports
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Create logs directory if it doesn't exist
if (!is_dir(__DIR__ . '/../logs')) {
    mkdir(__DIR__ . '/../logs', 0755, true);
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Include database configuration
    require_once __DIR__ . '/../config/database.php';
    
    // For now, skip session check to allow testing
    // session_start();
    // if (!isset($_SESSION['user_id'])) {
    //     http_response_code(401);
    //     echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    //     exit();
    // }
    
    // Get database connection
    $database = new Database();
    try {
        $db = $database->getConnection();
    } catch (Exception $e) {
        error_log('Database connection error: ' . $e->getMessage());
        throw new Exception('Could not connect to database: ' . $e->getMessage());
    }
    
    error_log('Successfully connected to database');
    
    // For now, always return the default list of reports
    error_log('Using default reports list');
    $reports = [
        ['id' => 'admissiondata', 'display_name' => 'Admission Data', 'description' => 'Student admission records', 'table_name' => 'admissiondata'],
        ['id' => 'enrollmentdata', 'display_name' => 'Enrollment Data', 'description' => 'Student enrollment statistics', 'table_name' => 'enrollmentdata'],
        ['id' => 'graduatesdata', 'display_name' => 'Graduates Data', 'description' => 'Graduation records', 'table_name' => 'graduatesdata'],
        ['id' => 'employee', 'display_name' => 'Employee Data', 'description' => 'Staff and faculty information', 'table_name' => 'employee'],
        ['id' => 'leaveprivilege', 'display_name' => 'Leave Privilege', 'description' => 'Employee leave records', 'table_name' => 'leaveprivilege'],
        ['id' => 'libraryvisitor', 'display_name' => 'Library Visitor', 'description' => 'Library usage statistics', 'table_name' => 'libraryvisitor'],
        ['id' => 'pwd', 'display_name' => 'PWD Data', 'description' => 'Persons with disabilities records', 'table_name' => 'pwd'],
        ['id' => 'waterconsumption', 'display_name' => 'Water Consumption', 'description' => 'Water usage metrics', 'table_name' => 'waterconsumption'],
        ['id' => 'treatedwastewater', 'display_name' => 'Treated Wastewater', 'description' => 'Wastewater treatment data', 'table_name' => 'treatedwastewater'],
        ['id' => 'electricityconsumption', 'display_name' => 'Electricity Consumption', 'description' => 'Power usage metrics', 'table_name' => 'electricityconsumption'],
        ['id' => 'solidwaste', 'display_name' => 'Solid Waste', 'description' => 'Waste management data', 'table_name' => 'solidwaste'],
        ['id' => 'campuspopulation', 'display_name' => 'Campus Population', 'description' => 'Campus population statistics', 'table_name' => 'campuspopulation'],
        ['id' => 'foodwaste', 'display_name' => 'Food Waste', 'description' => 'Food waste tracking', 'table_name' => 'foodwaste'],
        ['id' => 'fuelconsumption', 'display_name' => 'Fuel Consumption', 'description' => 'Fuel usage metrics', 'table_name' => 'fuelconsumption'],
        ['id' => 'distancetraveled', 'display_name' => 'Distance Traveled', 'description' => 'Travel distance records', 'table_name' => 'distancetraveled'],
        ['id' => 'budgetexpenditure', 'display_name' => 'Budget Expenditure', 'description' => 'Budget and expenditure data', 'table_name' => 'budgetexpenditure'],
        ['id' => 'flightaccommodation', 'display_name' => 'Flight Accommodation', 'description' => 'Flight and accommodation records', 'table_name' => 'flightaccommodation']
    ];
    
    echo json_encode([
        'success' => true,
        'reports' => $reports
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
