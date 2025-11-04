<?php
/**
 * Database Connection Configuration
 */

try {
    // Database configuration - Updated for spartan_data
    $db_host = 'localhost';
    $db_name = 'spartan_data'; // Using spartan_data database
    $db_user = 'root';         // Default XAMPP username
    $db_pass = '';             // Default XAMPP password is empty

    // Create a PDO instance
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    // Test the connection
    $pdo->query('SELECT 1');
    
} catch (PDOException $e) {
    // Log the error details
    error_log('Database Connection Error: ' . $e->getMessage());
    
    // Return a generic error message
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed. Please try again later.'
    ]);
    exit;
}

// Function to log errors to a file
function logError($message) {
    $logDir = __DIR__ . '/../logs';
    if (!file_exists($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/error.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message" . PHP_EOL;
    
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}
