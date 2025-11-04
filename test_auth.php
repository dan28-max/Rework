<?php
/**
 * Test Authentication Status
 * This script helps debug authentication issues
 */

session_start();

echo "<h1>Authentication Debug Info</h1>";
echo "<pre>";

echo "=== SESSION DATA ===\n";
echo "Session ID: " . session_id() . "\n";
echo "Session Status: " . session_status() . " (1=disabled, 2=active)\n";
echo "\nSession Variables:\n";
print_r($_SESSION);

echo "\n=== COOKIES ===\n";
print_r($_COOKIE);

echo "\n=== SERVER INFO ===\n";
echo "Request Method: " . ($_SERVER['REQUEST_METHOD'] ?? 'N/A') . "\n";
echo "Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A') . "\n";
echo "Remote Addr: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n";

echo "\n=== AUTHENTICATION CHECK ===\n";
if (isset($_SESSION['user_id'])) {
    echo "✓ User ID is set: " . $_SESSION['user_id'] . "\n";
    echo "✓ User Role: " . ($_SESSION['user_role'] ?? 'N/A') . "\n";
    echo "✓ Username: " . ($_SESSION['username'] ?? 'N/A') . "\n";
    echo "✓ Session ID: " . ($_SESSION['session_id'] ?? 'N/A') . "\n";
    echo "\n✅ USER IS AUTHENTICATED\n";
} else {
    echo "✗ User ID is NOT set\n";
    echo "\n❌ USER IS NOT AUTHENTICATED\n";
    echo "\nTo authenticate:\n";
    echo "1. Go to: http://localhost/Rework/login.html\n";
    echo "2. Log in with valid credentials\n";
    echo "3. Refresh this page\n";
}

echo "\n=== DATABASE CONNECTION TEST ===\n";
try {
    require_once __DIR__ . '/config/database.php';
    $db = getDB();
    echo "✓ Database connection successful\n";
    
    // Check if users table exists
    $stmt = $db->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "✓ Users table exists\n";
        
        // Count users
        $stmt = $db->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch();
        echo "✓ Total users in database: " . $result['count'] . "\n";
    } else {
        echo "✗ Users table does NOT exist\n";
        echo "  Run setup.php to create tables\n";
    }
} catch (Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
}

echo "\n=== API TEST ===\n";
echo "Testing user_tasks.php API...\n";
try {
    require_once __DIR__ . '/config/database.php';
    require_once __DIR__ . '/includes/functions.php';
    
    if (!isset($_SESSION['user_id'])) {
        echo "✗ Cannot test API - not authenticated\n";
    } else {
        $userId = $_SESSION['user_id'];
        $db = getDB();
        
        // Check if user exists
        $stmt = $db->prepare("SELECT id, username, office FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if ($user) {
            echo "✓ User found in database\n";
            echo "  - Username: " . $user['username'] . "\n";
            echo "  - Office: " . ($user['office'] ?? 'N/A') . "\n";
        } else {
            echo "✗ User ID {$userId} not found in database\n";
        }
        
        // Check if table_assignments table exists
        $stmt = $db->query("SHOW TABLES LIKE 'table_assignments'");
        if ($stmt->rowCount() > 0) {
            echo "✓ table_assignments table exists\n";
        } else {
            echo "✗ table_assignments table does NOT exist\n";
        }
    }
} catch (Exception $e) {
    echo "✗ API test error: " . $e->getMessage() . "\n";
}

echo "</pre>";

echo "<hr>";
echo "<h2>Quick Actions</h2>";
echo "<ul>";
echo "<li><a href='login.html'>Go to Login Page</a></li>";
echo "<li><a href='user-dashboard-enhanced.html'>Go to User Dashboard</a></li>";
echo "<li><a href='api/auth.php?action=check'>Test Auth API</a></li>";
if (isset($_SESSION['user_id'])) {
    echo "<li><a href='api/auth.php?action=logout'>Logout</a></li>";
}
echo "</ul>";
?>
