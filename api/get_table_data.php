<?php
/**
 * Get Table Data API
 * Fetches all records from a specific report table
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Include database configuration
    require_once __DIR__ . '/../config/database.php';
    
    // Start session to get admin info
    session_start();
    
    // Get table name from query parameter
    $tableName = $_GET['table'] ?? '';
    
    if (empty($tableName)) {
        throw new Exception('Table name is required');
    }
    
    // Validate table name to prevent SQL injection
    $allowedTables = [
        'campuspopulation',
        'admissiondata',
        'enrollmentdata',
        'graduatesdata',
        'employee',
        'leaveprivilege',
        'libraryvisitor',
        'pwd',
        'waterconsumption',
        'treatedwastewater',
        'electricityconsumption',
        'solidwaste',
        'foodwaste',
        'fuelconsumption',
        'distancetraveled',
        'budgetexpenditure',
        'flightaccommodation'
    ];
    
    if (!in_array($tableName, $allowedTables)) {
        throw new Exception('Invalid table name');
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if table exists
    $checkTable = $db->query("SHOW TABLES LIKE '$tableName'");
    if ($checkTable->rowCount() === 0) {
        echo json_encode([
            'success' => true,
            'data' => [],
            'message' => 'Table does not exist yet'
        ]);
        exit();
    }
    
    // Get admin info for campus filtering
    $adminCampus = null;
    $adminRole = 'user';
    if (isset($_SESSION['user_id'])) {
        $userStmt = $db->prepare("SELECT campus, role FROM users WHERE id = ?");
        $userStmt->execute([$_SESSION['user_id']]);
        $userInfo = $userStmt->fetch(PDO::FETCH_ASSOC);
        if ($userInfo) {
            $adminCampus = $userInfo['campus'];
            $adminRole = $userInfo['role'];
        }
    }
    
    // Fetch records from the table (filtered by campus for regular admins)
    if ($adminRole === 'super_admin') {
        // Super admin sees all data
        $query = "SELECT * FROM `$tableName` ORDER BY id DESC LIMIT 1000";
        $stmt = $db->prepare($query);
        $stmt->execute();
    } else if ($adminCampus) {
        // Regular admin sees only their campus data
        $query = "SELECT * FROM `$tableName` WHERE campus = ? OR campus IS NULL ORDER BY id DESC LIMIT 1000";
        $stmt = $db->prepare($query);
        $stmt->execute([$adminCampus]);
    } else {
        // No campus info - show all (fallback)
        $query = "SELECT * FROM `$tableName` ORDER BY id DESC LIMIT 1000";
        $stmt = $db->prepare($query);
        $stmt->execute();
    }
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $data,
        'count' => count($data),
        'table' => $tableName,
        'filtered_by_campus' => $adminCampus,
        'admin_role' => $adminRole
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
