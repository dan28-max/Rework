<?php
// Database configuration
$host = 'localhost';
$dbname = 'spartan_data';
$username = 'root';
$password = ''; // Default XAMPP password is empty

try {
    // Create connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Read the SQL file
    $sql = file_get_contents('sql/add_deadline_priority_safe.sql');
    
    // Split the SQL file into individual queries
    $queries = explode(';', $sql);
    
    echo "Starting migration...\n";
    
    // Execute each query
    foreach ($queries as $query) {
        $query = trim($query);
        if (!empty($query)) {
            try {
                $pdo->exec($query);
                echo "Executed: " . substr($query, 0, 60) . "...\n";
            } catch (PDOException $e) {
                // Skip duplicate column errors
                if (strpos($e->getMessage(), 'Duplicate column name') === false) {
                    throw $e;
                }
                echo "Skipped (column already exists): " . substr($query, 0, 60) . "...\n";
            }
        }
    }
    
    echo "\nMigration completed successfully!\n";
    
} catch (PDOException $e) {
    die("Error: " . $e->getMessage() . "\n");
}
?>
