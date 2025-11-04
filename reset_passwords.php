<?php
/**
 * Reset user passwords with correct hashing
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Reset User Passwords</h1>";

try {
    require_once 'config/database.php';
    $db = new Database();
    $conn = $db->getConnection();
    
    // Reset admin password
    $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
    $stmt->execute([$adminPassword, 'admin@spartandata.com']);
    echo "<p style='color: green;'>✅ Admin password reset</p>";
    
    // Reset user password
    $userPassword = password_hash('user123', PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
    $stmt->execute([$userPassword, 'user@spartandata.com']);
    echo "<p style='color: green;'>✅ User password reset</p>";
    
    // Verify passwords
    echo "<h2>Verification:</h2>";
    
    $testCredentials = [
        ['admin@spartandata.com', 'admin123', 'admin'],
        ['user@spartandata.com', 'user123', 'user']
    ];
    
    foreach ($testCredentials as $cred) {
        $email = $cred[0];
        $password = $cred[1];
        $role = $cred[2];
        
        $stmt = $conn->prepare("
            SELECT id, email, password, name, role, status 
            FROM users 
            WHERE email = ? AND role = ? AND status = 'active'
        ");
        $stmt->execute([$email, $role]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            echo "<p style='color: green;'>✅ $email / $password ($role) - Valid</p>";
        } else {
            echo "<p style='color: red;'>❌ $email / $password ($role) - Invalid</p>";
        }
    }
    
    echo "<hr>";
    echo "<p><a href='test_login.html'>Test Login Now</a></p>";
    echo "<p><a href='login.html'>Go to Login Page</a></p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>

<style>
body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
</style>




