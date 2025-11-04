<?php
// Check users table structure and data
require_once 'config/database.php';

try {
    $db = getDB();
    
    echo "<h2>Users Table Structure</h2>";
    
    // Get table structure
    $stmt = $db->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
    foreach ($columns as $col) {
        echo "<tr>";
        echo "<td><strong>{$col['Field']}</strong></td>";
        echo "<td>{$col['Type']}</td>";
        echo "<td>{$col['Null']}</td>";
        echo "<td>{$col['Key']}</td>";
        echo "<td>{$col['Default']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h2>Users in Database</h2>";
    
    // Get all users
    $stmt = $db->query("SELECT * FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($users)) {
        echo "<p style='color: red;'>No users found in database!</p>";
    } else {
        echo "<table border='1' cellpadding='5' style='border-collapse: collapse;'>";
        echo "<tr>";
        foreach (array_keys($users[0]) as $key) {
            if ($key !== 'password') {
                echo "<th>$key</th>";
            }
        }
        echo "<th>password (first 20 chars)</th>";
        echo "</tr>";
        
        foreach ($users as $user) {
            echo "<tr>";
            foreach ($user as $key => $value) {
                if ($key !== 'password') {
                    echo "<td>$value</td>";
                }
            }
            echo "<td>" . substr($user['password'], 0, 20) . "...</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}
?>
