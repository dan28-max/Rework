<?php
/**
 * Database Setup Script for Spartan Data
 * Run this script to set up the database and initial data
 */

require_once 'config/database.php';

echo "<h1>Spartan Data - Database Setup</h1>";

try {
    // Test database connection
    $db = new Database();
    if (!$db->testConnection()) {
        throw new Exception("Cannot connect to database. Please check your XAMPP MySQL service.");
    }
    
    echo "<p style='color: green;'>✓ Database connection successful</p>";
    
    // Read and execute schema
    $schema = file_get_contents('database/schema.sql');
    if (!$schema) {
        throw new Exception("Cannot read schema file");
    }
    
    $conn = $db->getConnection();
    
    // Split schema into individual statements
    $statements = array_filter(array_map('trim', explode(';', $schema)));
    
    echo "<h2>Executing Database Schema...</h2>";
    
    foreach ($statements as $statement) {
        if (empty($statement) || strpos($statement, '--') === 0) {
            continue;
        }
        
        try {
            $conn->exec($statement);
            echo "<p style='color: green;'>✓ Executed: " . substr($statement, 0, 50) . "...</p>";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'already exists') !== false) {
                echo "<p style='color: orange;'>⚠ Skipped (already exists): " . substr($statement, 0, 50) . "...</p>";
            } else {
                echo "<p style='color: red;'>✗ Error: " . $e->getMessage() . "</p>";
            }
        }
    }
    
    echo "<h2>Verifying Setup...</h2>";
    
    // Check if tables exist
    $tables = ['users', 'user_sessions', 'system_settings', 'activity_logs', 'dashboard_stats'];
    foreach ($tables as $table) {
        $stmt = $conn->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$table]);
        if ($stmt->fetch()) {
            echo "<p style='color: green;'>✓ Table '$table' exists</p>";
        } else {
            echo "<p style='color: red;'>✗ Table '$table' missing</p>";
        }
    }
    
    // Check default users
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $userCount = $stmt->fetch()['count'];
    echo "<p style='color: green;'>✓ Found $userCount users in database</p>";
    
    // Check default settings
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM system_settings");
    $stmt->execute();
    $settingsCount = $stmt->fetch()['count'];
    echo "<p style='color: green;'>✓ Found $settingsCount system settings</p>";
    
    echo "<h2 style='color: green;'>🎉 Database setup completed successfully!</h2>";
    echo "<p><strong>Default Login Credentials:</strong></p>";
    echo "<ul>";
    echo "<li><strong>Admin:</strong> admin@spartandata.com / admin123</li>";
    echo "<li><strong>User:</strong> user@spartandata.com / user123</li>";
    echo "</ul>";
    echo "<p><a href='login.html' style='background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Go to Login Page</a></p>";
    
} catch (Exception $e) {
    echo "<h2 style='color: red;'>❌ Setup Failed</h2>";
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
    echo "<h3>Troubleshooting:</h3>";
    echo "<ul>";
    echo "<li>Make sure XAMPP is running</li>";
    echo "<li>Check that MySQL service is started</li>";
    echo "<li>Verify database credentials in config/database.php</li>";
    echo "<li>Ensure you have proper permissions</li>";
    echo "</ul>";
}
?>

<style>
body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: #f8f9fa;
}
h1, h2 {
    color: #dc3545;
}
p {
    margin: 5px 0;
}
ul {
    background: white;
    padding: 15px;
    border-radius: 5px;
    border-left: 4px solid #dc3545;
}
</style>

