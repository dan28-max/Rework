<?php
/**
 * Debug database connection
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Database Debug</h1>";

try {
    require_once 'config/database.php';
    $db = new Database();
    
    if ($db->testConnection()) {
        echo "<p style='color: green;'>✅ Database connection successful!</p>";
        
        // Test if tables exist
        $conn = $db->getConnection();
        $tables = ['users', 'user_sessions', 'system_settings', 'activity_logs', 'dashboard_stats'];
        
        foreach ($tables as $table) {
            $stmt = $conn->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$table]);
            if ($stmt->fetch()) {
                echo "<p style='color: green;'>✅ Table '$table' exists</p>";
            } else {
                echo "<p style='color: red;'>❌ Table '$table' missing</p>";
            }
        }
        
        // Check if users exist
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users");
        $stmt->execute();
        $userCount = $stmt->fetch()['count'];
        echo "<p style='color: blue;'>📊 Found $userCount users in database</p>";
        
    } else {
        echo "<p style='color: red;'>❌ Database connection failed!</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<p><a href='setup.php'>Run Database Setup</a></p>";
echo "<p><a href='login.html'>Go to Login</a></p>";
?>


