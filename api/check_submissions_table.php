<?php
session_start();
require_once __DIR__ . '/../config/database.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h2>Check report_submissions Table Structure</h2>";

try {
    $pdo = getDB();
    
    // Check if table exists
    $result = $pdo->query("SHOW TABLES LIKE 'report_submissions'");
    
    if ($result->rowCount() > 0) {
        echo "<p style='color: green;'>✓ Table exists</p>";
        
        // Show structure
        echo "<h3>Table Structure:</h3>";
        $columns = $pdo->query("DESCRIBE report_submissions")->fetchAll(PDO::FETCH_ASSOC);
        echo "<table border='1' cellpadding='5'>";
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
        
        // Show sample data
        echo "<h3>Sample Data (first 5 rows):</h3>";
        $data = $pdo->query("SELECT * FROM report_submissions LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
        if (count($data) > 0) {
            echo "<pre>";
            print_r($data);
            echo "</pre>";
        } else {
            echo "<p>No data in table</p>";
        }
        
    } else {
        echo "<p style='color: red;'>✗ Table does NOT exist</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}
?>
