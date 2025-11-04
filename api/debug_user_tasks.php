<?php
/**
 * Debug User Tasks API
 * Shows detailed error information
 */

// Enable all error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>User Tasks API Debug</h1>";
echo "<pre>";

// Start session
session_start();

echo "=== STEP 1: Session Check ===\n";
if (isset($_SESSION['user_id'])) {
    echo "✓ Session user_id: " . $_SESSION['user_id'] . "\n";
    $userId = $_SESSION['user_id'];
} else {
    echo "✗ No user_id in session\n";
    echo "You need to log in first!\n";
    echo "</pre>";
    echo "<a href='../login.html'>Go to Login</a>";
    exit();
}

echo "\n=== STEP 2: Include Files ===\n";
try {
    require_once __DIR__ . '/../config/database.php';
    echo "✓ database.php included\n";
    
    require_once __DIR__ . '/../includes/functions.php';
    echo "✓ functions.php included\n";
} catch (Exception $e) {
    echo "✗ Error including files: " . $e->getMessage() . "\n";
    exit();
}

echo "\n=== STEP 3: Database Connection ===\n";
try {
    $pdo = getDB();
    echo "✓ Database connection successful\n";
} catch (Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
    exit();
}

echo "\n=== STEP 4: Check Tables ===\n";
try {
    // Check users table
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "✓ users table exists\n";
    } else {
        echo "✗ users table NOT found\n";
    }
    
    // Check table_assignments table
    $stmt = $pdo->query("SHOW TABLES LIKE 'table_assignments'");
    if ($stmt->rowCount() > 0) {
        echo "✓ table_assignments table exists\n";
    } else {
        echo "✗ table_assignments table NOT found - THIS IS THE PROBLEM!\n";
        echo "   You need to create this table first.\n";
    }
} catch (Exception $e) {
    echo "✗ Error checking tables: " . $e->getMessage() . "\n";
}

echo "\n=== STEP 5: Get User Info ===\n";
try {
    $stmt = $pdo->prepare("SELECT id, username, office, campus FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "✓ User found:\n";
        echo "  - ID: " . $user['id'] . "\n";
        echo "  - Username: " . $user['username'] . "\n";
        echo "  - Office: " . ($user['office'] ?? 'NULL') . "\n";
        echo "  - Campus: " . ($user['campus'] ?? 'NULL') . "\n";
        $userOffice = $user['office'];
    } else {
        echo "✗ User ID {$userId} not found in database\n";
        exit();
    }
} catch (Exception $e) {
    echo "✗ Error getting user: " . $e->getMessage() . "\n";
    exit();
}

echo "\n=== STEP 6: Try to Get Assignments ===\n";
try {
    $sql = "SELECT 
                ta.id,
                ta.table_name,
                ta.assigned_office,
                ta.description,
                ta.assigned_date,
                ta.status,
                u.name as assigned_by_name,
                'pending' as task_status
            FROM table_assignments ta
            LEFT JOIN users u ON ta.assigned_by = u.id
            WHERE LOWER(ta.assigned_office) = LOWER(?)
            AND ta.status = 'active'
            ORDER BY ta.assigned_date DESC";
    
    echo "SQL Query:\n" . $sql . "\n\n";
    echo "Parameters: [" . ($userOffice ?? 'NULL') . "]\n\n";
    
    if (!$userOffice) {
        echo "⚠ Warning: User office is NULL, query will return no results\n";
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userOffice ?? '']);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "✓ Query executed successfully\n";
    echo "✓ Found " . count($tasks) . " tasks\n\n";
    
    if (count($tasks) > 0) {
        echo "Tasks:\n";
        foreach ($tasks as $task) {
            echo "  - " . $task['table_name'] . " (Office: " . $task['assigned_office'] . ")\n";
        }
    } else {
        echo "No tasks found for office: " . ($userOffice ?? 'NULL') . "\n";
    }
    
} catch (PDOException $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
    echo "SQL State: " . $e->errorInfo[0] . "\n";
    
    if (strpos($e->getMessage(), "doesn't exist") !== false) {
        echo "\n⚠ TABLE DOESN'T EXIST!\n";
        echo "You need to create the table_assignments table.\n";
    }
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\n=== STEP 7: Final JSON Output ===\n";
$result = [
    'success' => true,
    'data' => $tasks ?? [],
    'debug' => [
        'user_id' => $userId,
        'user_office' => $userOffice ?? null,
        'task_count' => count($tasks ?? [])
    ]
];
echo json_encode($result, JSON_PRETTY_PRINT);

echo "</pre>";

echo "<hr>";
echo "<h2>Quick Actions</h2>";
echo "<ul>";
echo "<li><a href='user_tasks.php?action=get_assigned'>Try Real API</a></li>";
echo "<li><a href='../user-dashboard-enhanced.html'>Back to Dashboard</a></li>";
echo "<li><a href='../test_auth.php'>Test Authentication</a></li>";
echo "</ul>";
?>
