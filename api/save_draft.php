<?php
/**
 * Save Draft API
 * Handles saving draft data for reports
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

    // Check if user is authenticated
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

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Invalid JSON input');
        }

        // Validate required fields
        if (!isset($input['report']) || !isset($input['data']) || !isset($input['user']) || !isset($input['office'])) {
            throw new Exception('Missing required fields');
        }

        $report = $input['report'];
        $data = $input['data'];
        $user = $input['user'];
        $office = $input['office'];
        $userId = $_SESSION['user_id'];

        // Validate data
        if (!is_array($data)) {
            throw new Exception('Invalid data format');
        }

        // Save draft
        $result = saveDraft($report, $data, $user, $office, $userId);

        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Draft saved successfully',
                'draft_id' => $result
            ]);
        } else {
            throw new Exception('Failed to save draft');
        }

    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    } catch (Error $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

/**
 * Save draft data
 */
function saveDraft($report, $data, $user, $office, $userId) {
    $pdo = getDB();
    
    try {
        $pdo->beginTransaction();

        // Insert into drafts table (we'll need to create this table)
        $sql = "INSERT INTO drafts (report_type, data, user_email, office, created_by, created_at) 
                VALUES (:report_type, :data, :user_email, :office, :created_by, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'report_type' => $report,
            'data' => json_encode($data),
            'user_email' => $user,
            'office' => $office,
            'created_by' => $userId
        ]);

        $draftId = $pdo->lastInsertId();
        $pdo->commit();
        return $draftId;

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Draft save error: " . $e->getMessage());
        return false;
    }
}
?>

