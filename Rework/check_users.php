<?php
/**
 * Check users in database
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Check Users in Database</h1>";

try {
    require_once 'config/database.php';
    $db = new Database();
    $conn = $db->getConnection();
    
    // Check if users table exists
    $stmt = $conn->prepare("SHOW TABLES LIKE 'users'");
    $stmt->execute();
    if (!$stmt->fetch()) {
        echo "<p style='color: red;'>❌ Users table does not exist!</p>";
        echo "<p><a href='setup_fixed.php'>Run Database Setup</a></p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Users table exists</p>";
    
    // Get all users
    $stmt = $conn->prepare("SELECT id, email, name, role, status, created_at FROM users");
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    echo "<h2>Users in Database:</h2>";
    if (empty($users)) {
        echo "<p style='color: red;'>❌ No users found in database!</p>";
        echo "<p><a href='setup_fixed.php'>Run Database Setup</a></p>";
    } else {
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>ID</th><th>Email</th><th>Name</th><th>Role</th><th>Status</th><th>Created</th></tr>";
        foreach ($users as $user) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($user['id']) . "</td>";
            echo "<td>" . htmlspecialchars($user['email']) . "</td>";
            echo "<td>" . htmlspecialchars($user['name']) . "</td>";
            echo "<td>" . htmlspecialchars($user['role']) . "</td>";
            echo "<td>" . htmlspecialchars($user['status']) . "</td>";
            echo "<td>" . htmlspecialchars($user['created_at']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
    // Test password verification
    echo "<h2>Password Verification Test:</h2>";
    
    $testPasswords = [
        'admin123' => 'admin@spartandata.com',
        'user123' => 'user@spartandata.com'
    ];
    
    foreach ($testPasswords as $password => $email) {
        $stmt = $conn->prepare("SELECT password FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user) {
            $isValid = password_verify($password, $user['password']);
            $status = $isValid ? '✅ Valid' : '❌ Invalid';
            $color = $isValid ? 'green' : 'red';
            echo "<p style='color: $color;'>$status - $email / $password</p>";
        } else {
            echo "<p style='color: red;'>❌ User not found - $email</p>";
        }
    }
    
    echo "<hr>";
    echo "<p><a href='setup_fixed.php'>Re-run Database Setup</a></p>";
    echo "<p><a href='test_login.html'>Test Login Form</a></p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>

<style>
body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
table { margin: 20px 0; }
th, td { padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
</style>


