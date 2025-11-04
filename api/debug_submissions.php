<?php
/**
 * Debug Submissions API
 * Shows what submissions are being returned and why
 */

// Enable all error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

echo "<h1>Submissions Debug</h1>";
echo "<pre>";

echo "=== STEP 1: Check Session ===\n";
if (isset($_SESSION['user_id'])) {
    echo "✓ Logged in as user_id: " . $_SESSION['user_id'] . "\n";
    echo "  Username: " . ($_SESSION['username'] ?? 'N/A') . "\n";
    echo "  Role: " . ($_SESSION['user_role'] ?? 'N/A') . "\n";
    $userId = $_SESSION['user_id'];
} else {
    echo "✗ NOT LOGGED IN\n";
    echo "Please log in first!\n";
    echo "</pre>";
    echo "<a href='../login.html'>Go to Login</a>";
    exit();
}

echo "\n=== STEP 2: Database Connection ===\n";
try {
    require_once __DIR__ . '/../config/database.php';
    $pdo = getDB();
    echo "✓ Database connected\n";
} catch (Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
    exit();
}

echo "\n=== STEP 3: Check report_submissions Table ===\n";
try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'report_submissions'");
    if ($stmt->rowCount() > 0) {
        echo "✓ report_submissions table exists\n";
        
        // Get table structure
        $stmt = $pdo->query("DESCRIBE report_submissions");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "  Columns: " . implode(', ', $columns) . "\n";
    } else {
        echo "✗ report_submissions table NOT found\n";
        exit();
    }
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit();
}

echo "\n=== STEP 4: Get ALL Submissions (No Filter) ===\n";
try {
    $stmt = $pdo->query("SELECT id, user_id, table_name, office, submission_date FROM report_submissions ORDER BY submission_date DESC");
    $allSubmissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Total submissions in database: " . count($allSubmissions) . "\n\n";
    
    if (count($allSubmissions) > 0) {
        echo "All submissions:\n";
        foreach ($allSubmissions as $sub) {
            $isMine = ($sub['user_id'] == $userId) ? '👤 YOURS' : '👥 Other';
            echo "  [{$isMine}] ID: {$sub['id']}, User: {$sub['user_id']}, Table: {$sub['table_name']}, Office: {$sub['office']}\n";
        }
    } else {
        echo "No submissions found in database.\n";
    }
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\n=== STEP 5: Get YOUR Submissions (With Filter) ===\n";
try {
    $sql = "SELECT 
                rs.id,
                rs.user_id,
                rs.table_name,
                rs.office,
                rs.campus,
                rs.submission_date,
                rs.status,
                u.name as submitted_by_name
            FROM report_submissions rs
            LEFT JOIN users u ON rs.user_id = u.id
            WHERE rs.user_id = ?
            ORDER BY rs.submission_date DESC";
    
    echo "SQL Query:\n" . $sql . "\n";
    echo "Parameter: user_id = {$userId}\n\n";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $yourSubmissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "✓ Query executed successfully\n";
    echo "Your submissions: " . count($yourSubmissions) . "\n\n";
    
    if (count($yourSubmissions) > 0) {
        echo "Details:\n";
        foreach ($yourSubmissions as $sub) {
            echo "  - ID: {$sub['id']}, Table: {$sub['table_name']}, Office: {$sub['office']}, Submitted by: {$sub['submitted_by_name']}\n";
        }
    } else {
        echo "You have no submissions.\n";
    }
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\n=== STEP 6: What the API Returns ===\n";
try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $result = [
        'success' => true,
        'submissions' => $submissions,
        'debug' => [
            'user_id' => $userId,
            'total_in_db' => count($allSubmissions),
            'your_submissions' => count($submissions)
        ]
    ];
    
    echo json_encode($result, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\n\n=== DIAGNOSIS ===\n";
if (count($allSubmissions) > count($yourSubmissions)) {
    echo "⚠️ ISSUE FOUND!\n";
    echo "There are " . count($allSubmissions) . " total submissions in the database,\n";
    echo "but only " . count($yourSubmissions) . " belong to you (user_id: {$userId}).\n\n";
    
    echo "If you're seeing OTHER users' submissions on the dashboard,\n";
    echo "the problem is likely:\n";
    echo "1. The frontend is using cached/demo data\n";
    echo "2. The frontend is not calling this API correctly\n";
    echo "3. Browser cache needs to be cleared\n";
} else {
    echo "✓ The API is correctly filtering submissions by user_id.\n";
    echo "If you're still seeing other users' data, check:\n";
    echo "1. Clear browser cache (Ctrl+Shift+Delete)\n";
    echo "2. Check if frontend is using demo data\n";
    echo "3. Check browser console for errors\n";
}

echo "</pre>";

echo "<hr>";
echo "<h2>Quick Actions</h2>";
echo "<ul>";
echo "<li><a href='user_submissions.php'>Test Real API</a></li>";
echo "<li><a href='../user-dashboard-enhanced.html'>Back to Dashboard</a></li>";
echo "<li><strong>Clear browser cache and try again!</strong></li>";
echo "</ul>";
?>
