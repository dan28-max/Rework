<?php
/**
 * Debug script to check tasks API issues
 */

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Tasks API Debug</h2>";

// Check session
echo "<h3>1. Session Check</h3>";
echo "Session ID: " . session_id() . "<br>";
echo "User ID: " . ($_SESSION['user_id'] ?? 'NOT SET') . "<br>";
echo "Username: " . ($_SESSION['username'] ?? 'NOT SET') . "<br>";

if (!isset($_SESSION['user_id'])) {
    echo "<p style='color: red;'>ERROR: User not logged in!</p>";
    echo "<a href='../login.html'>Go to Login</a>";
    exit;
}

// Check database connection
echo "<h3>2. Database Connection</h3>";
try {
    require_once __DIR__ . '/../config/database.php';
    $pdo = getDB();
    echo "<p style='color: green;'>✓ Database connected successfully</p>";
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Database connection failed: " . $e->getMessage() . "</p>";
    exit;
}

// Check user info
echo "<h3>3. User Information</h3>";
try {
    $userId = $_SESSION['user_id'];
    $stmt = $pdo->prepare("SELECT id, name, username, office, campus FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "<pre>";
        print_r($user);
        echo "</pre>";
        
        if (!$user['office']) {
            echo "<p style='color: orange;'>⚠ Warning: User has no office assigned</p>";
        }
    } else {
        echo "<p style='color: red;'>✗ User not found in database</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error: " . $e->getMessage() . "</p>";
}

// Check if table_assignments table exists
echo "<h3>4. Table Assignments Check</h3>";
try {
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'table_assignments'");
    if ($tableCheck->rowCount() > 0) {
        echo "<p style='color: green;'>✓ table_assignments table exists</p>";
        
        // Check table structure
        $columns = $pdo->query("DESCRIBE table_assignments")->fetchAll(PDO::FETCH_ASSOC);
        echo "<h4>Table Structure:</h4>";
        echo "<pre>";
        print_r($columns);
        echo "</pre>";
        
        // Count total assignments
        $count = $pdo->query("SELECT COUNT(*) FROM table_assignments")->fetchColumn();
        echo "<p>Total assignments in table: $count</p>";
        
        // Check assignments for user's office
        if (isset($user['office']) && $user['office']) {
            $stmt = $pdo->prepare("SELECT * FROM table_assignments WHERE LOWER(assigned_office) = LOWER(?)");
            $stmt->execute([$user['office']]);
            $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "<h4>Assignments for office '{$user['office']}':</h4>";
            if (count($assignments) > 0) {
                echo "<pre>";
                print_r($assignments);
                echo "</pre>";
            } else {
                echo "<p style='color: orange;'>⚠ No assignments found for this office</p>";
            }
        }
    } else {
        echo "<p style='color: red;'>✗ table_assignments table does NOT exist</p>";
        echo "<p>The table needs to be created. Here's the SQL:</p>";
        echo "<pre>
CREATE TABLE table_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    assigned_office VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    deadline DATETIME,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('active', 'inactive') DEFAULT 'active',
    assigned_by INT,
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);
        </pre>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error: " . $e->getMessage() . "</p>";
}

// Check report_submissions table
echo "<h3>5. Report Submissions Check</h3>";
try {
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'report_submissions'");
    if ($tableCheck->rowCount() > 0) {
        echo "<p style='color: green;'>✓ report_submissions table exists</p>";
        
        // Count submissions for this user
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM report_submissions WHERE user_id = ?");
        $stmt->execute([$userId]);
        $count = $stmt->fetchColumn();
        echo "<p>Total submissions by this user: $count</p>";
    } else {
        echo "<p style='color: orange;'>⚠ report_submissions table does NOT exist</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error: " . $e->getMessage() . "</p>";
}

// Test the actual API call
echo "<h3>6. Test API Call</h3>";
echo "<p>Testing: api/user_tasks_list.php?action=get_tasks</p>";
try {
    // Simulate the API call
    $userId = $_SESSION['user_id'];
    $filter = 'all';
    
    // Get user's office
    $userStmt = $pdo->prepare("SELECT office, campus FROM users WHERE id = ?");
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !$user['office']) {
        echo "<p style='color: orange;'>⚠ User has no office assignment</p>";
        echo json_encode([
            'success' => true,
            'tasks' => [],
            'message' => 'No office assignment found'
        ]);
    } else {
        $userOffice = $user['office'];
        echo "<p>User office: $userOffice</p>";
        
        // Check if table exists
        $tableCheck = $pdo->query("SHOW TABLES LIKE 'table_assignments'");
        if ($tableCheck->rowCount() === 0) {
            echo "<p style='color: orange;'>⚠ table_assignments table not found</p>";
            echo "<pre>";
            echo json_encode([
                'success' => true,
                'tasks' => [],
                'stats' => [
                    'total' => 0,
                    'pending' => 0,
                    'completed' => 0,
                    'overdue' => 0
                ],
                'message' => 'No tasks table found'
            ], JSON_PRETTY_PRINT);
            echo "</pre>";
        } else {
            // Try the actual query
            $sql = "SELECT 
                        ta.id,
                        ta.table_name,
                        ta.assigned_office,
                        ta.description,
                        ta.assigned_date,
                        ta.deadline,
                        ta.status as assignment_status,
                        ta.priority
                    FROM table_assignments ta
                    WHERE LOWER(ta.assigned_office) = LOWER(?)
                    AND ta.status = 'active'
                    LIMIT 5";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$userOffice]);
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "<p style='color: green;'>✓ Query executed successfully</p>";
            echo "<p>Found " . count($tasks) . " tasks</p>";
            echo "<pre>";
            print_r($tasks);
            echo "</pre>";
        }
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error: " . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

echo "<hr>";
echo "<p><a href='user_tasks_list.php?action=get_tasks'>Try the actual API</a></p>";
echo "<p><a href='../user-dashboard-enhanced.html'>Back to Dashboard</a></p>";
?>
