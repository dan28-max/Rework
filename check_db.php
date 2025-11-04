<?php
/**
 * Database Connection Check Script
 * Run this to verify MySQL is running and database is set up
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$response = [
    'mysql_running' => false,
    'database_exists' => false,
    'tables_exist' => false,
    'required_tables' => [],
    'errors' => []
];

try {
    // Test MySQL connection
    $conn = new PDO("mysql:host=localhost", "root", "");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $response['mysql_running'] = true;
    
    // Check if database exists
    $stmt = $conn->query("SHOW DATABASES LIKE 'spartan_data'");
    if ($stmt->rowCount() > 0) {
        $response['database_exists'] = true;
        
        // Connect to the database
        $conn = new PDO("mysql:host=localhost;dbname=spartan_data", "root", "");
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Check required tables
        $requiredTables = ['users', 'user_sessions', 'activity_logs', 'system_settings'];
        $stmt = $conn->query("SHOW TABLES");
        $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($requiredTables as $table) {
            $exists = in_array($table, $existingTables);
            $response['required_tables'][$table] = $exists;
            if ($exists) {
                $response['tables_exist'] = true;
            }
        }
        
        // Check if users table has data
        if (in_array('users', $existingTables)) {
            $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $response['user_count'] = $result['count'];
        }
    } else {
        $response['errors'][] = 'Database "spartan_data" does not exist. Please run database/schema.sql';
    }
    
} catch (PDOException $e) {
    $response['errors'][] = $e->getMessage();
    
    if (strpos($e->getMessage(), 'refused') !== false) {
        $response['errors'][] = 'MySQL is not running. Please start MySQL in XAMPP Control Panel.';
    }
}

// Output result
http_response_code(200);
echo json_encode($response, JSON_PRETTY_PRINT);
?>
