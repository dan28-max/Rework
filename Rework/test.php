<?php
/**
 * Simple test to verify PHP is working
 */
echo "<h1>PHP Test - Spartan Data</h1>";
echo "<p>✅ PHP is working!</p>";
echo "<p>✅ Server time: " . date('Y-m-d H:i:s') . "</p>";

// Test database connection
try {
    require_once 'config/database.php';
    $db = new Database();
    if ($db->testConnection()) {
        echo "<p>✅ Database connection successful!</p>";
    } else {
        echo "<p>❌ Database connection failed!</p>";
    }
} catch (Exception $e) {
    echo "<p>❌ Database error: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<h2>Next Steps:</h2>";
echo "<ol>";
echo "<li>Go to: <a href='setup.php'>setup.php</a> to create the database</li>";
echo "<li>Then go to: <a href='login.html'>login.html</a> to access the application</li>";
echo "</ol>";
?>


