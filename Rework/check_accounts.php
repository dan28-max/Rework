<?php
/**
 * Check if accounts exist in database
 */

require_once 'config/database.php';

echo "<h1>Checking Database Accounts</h1>";

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Check if users table exists
    $stmt = $conn->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "<p style='color: green;'>✅ Users table exists</p>";
    } else {
        echo "<p style='color: red;'>❌ Users table does not exist</p>";
        exit;
    }
    
    // Check table structure
    $stmt = $conn->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<p><strong>Table columns:</strong> " . implode(', ', $columns) . "</p>";
    
    // Count users
    $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "<p><strong>Total users:</strong> " . $result['count'] . "</p>";
    
    // List all users
    $stmt = $conn->query("SELECT id, email, name, role, campus, office, status FROM users ORDER BY id");
    $users = $stmt->fetchAll();
    
    if (count($users) > 0) {
        echo "<h2>All Users in Database:</h2>";
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>ID</th><th>Email</th><th>Name</th><th>Role</th><th>Campus</th><th>Office</th><th>Status</th></tr>";
        
        foreach ($users as $user) {
            echo "<tr>";
            echo "<td>" . $user['id'] . "</td>";
            echo "<td>" . $user['email'] . "</td>";
            echo "<td>" . $user['name'] . "</td>";
            echo "<td>" . $user['role'] . "</td>";
            echo "<td>" . ($user['campus'] ?? 'NULL') . "</td>";
            echo "<td>" . ($user['office'] ?? 'NULL') . "</td>";
            echo "<td>" . $user['status'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p style='color: red;'>❌ No users found in database</p>";
    }
    
    // Test specific accounts
    echo "<h2>Test Specific Accounts:</h2>";
    
    $testEmails = [
        'superadmin@spartandata.com',
        'admin.lipa@spartandata.com',
        'emu.san_juan@spartandata.com'
    ];
    
    foreach ($testEmails as $email) {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user) {
            echo "<p style='color: green;'>✅ Found: $email (Role: " . $user['role'] . ", Campus: " . ($user['campus'] ?? 'NULL') . ")</p>";
        } else {
            echo "<p style='color: red;'>❌ Not found: $email</p>";
        }
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>

<style>
body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
h1, h2 { color: #dc3545; }
table { margin: 20px 0; }
th, td { padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
</style>


