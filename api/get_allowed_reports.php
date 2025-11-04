<?php
/**
 * Get Allowed Reports API
 * Returns the list of reports assigned to a user's office
 */

// Suppress error display to prevent HTML output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Include database configuration
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../includes/functions.php';

    // Start session to get user info
    session_start();
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
        exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit();
}

try {
    // Get office from session (real user's office)
    $office = $_SESSION['user_office'] ?? '';
    
    // Allow override via POST for testing purposes
    if (isset($_POST['office']) && !empty($_POST['office'])) {
        $office = $_POST['office'];
    }
    
    if (empty($office)) {
        echo json_encode(['success' => false, 'message' => 'Office not specified in user profile']);
        exit();
    }

    // Office to reports mapping
    $officeReports = [
        "Registrar" => ["enrollmentdata", "graduatesdata"],
        "HRMO" => ["employee", "leaveprivilege"],
        "Library" => ["libraryvisitor"],
        "Health Services" => ["pwd"],
        "EMU" => ["waterconsumption", "treatedwastewater", "electricityconsumption", "solidwaste"],
        "RGO" => ["campuspopulation", "foodwaste"],
        "GSO" => ["fuelconsumption", "distancetraveled"],
        "TAO" => ["admissiondata"],
        "Budget Office" => ["budgetexpenditure"],
        "All" => ["flightaccommodation"]
    ];

    // Get reports for the office
    $assignedReports = $officeReports[$office] ?? [];
    
    // Also check if there are any table assignments in the database
    $pdo = getDB();
    $sql = "SELECT DISTINCT table_name FROM table_assignments 
            WHERE assigned_office = :office AND status = 'active'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['office' => $office]);
    $dbReports = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Merge and deduplicate reports
    $allReports = array_unique(array_merge($assignedReports, $dbReports));
    
    // Return the reports as a simple array
    echo json_encode($allReports);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>

