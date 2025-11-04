<?php
/**
 * Fetch Draft API
 * Handles fetching draft data by ID
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

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $draftId = $_GET['id'] ?? '';
        
        if (empty($draftId)) {
            throw new Exception('Draft ID not provided');
        }

        // Fetch draft
        $result = fetchDraft($draftId);

        if ($result) {
            echo json_encode([
                'success' => true,
                'data' => $result['data'],
                'report_type' => $result['report_type']
            ]);
        } else {
            throw new Exception('Draft not found');
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
 * Fetch draft data
 */
function fetchDraft($draftId) {
    $pdo = getDB();
    
    try {
        $sql = "SELECT report_type, data FROM drafts WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $draftId]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($result) {
            $result['data'] = json_decode($result['data'], true);
            return $result;
        }
        return false;
        
    } catch (PDOException $e) {
        error_log("Draft fetch error: " . $e->getMessage());
        return false;
    }
}
?>

