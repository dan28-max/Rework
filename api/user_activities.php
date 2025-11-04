<?php
/**
 * User Activities API
 * Fetches user activity logs with campus access control
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';

try {
    // Start session
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Unauthorized access'
        ]);
        exit();
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get current admin info
    $adminId = $_SESSION['user_id'];
    $adminStmt = $db->prepare("SELECT id, role, campus FROM users WHERE id = ?");
    $adminStmt->execute([$adminId]);
    $admin = $adminStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$admin) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Admin not found'
        ]);
        exit();
    }
    
    // Get accessible campuses based on admin role
    function getAccessibleCampuses($adminCampus, $adminRole) {
        if ($adminRole === 'super_admin' || $adminCampus === 'Main Campus') {
            // Super admin can see all campuses
            return null; // null means no filtering
        }
        
        $campus = trim($adminCampus);
        
        // Pablo Borbon admin can access: Pablo Borbon, Rosario, San Juan, Lemery
        if ($campus === 'Pablo Borbon') {
            return ['Pablo Borbon', 'Rosario', 'San Juan', 'Lemery'];
        }
        
        // Alangilan admin can access: Alangilan, Lobo, Balayan, Mabini
        if ($campus === 'Alangilan') {
            return ['Alangilan', 'Lobo', 'Balayan', 'Mabini'];
        }
        
        // Solo campuses: Lipa, Malvar, Nasugbu - only their own campus
        if (in_array($campus, ['Lipa', 'Malvar', 'Nasugbu'])) {
            return [$campus];
        }
        
        // Default: only own campus
        return [$campus];
    }
    
    $accessibleCampuses = getAccessibleCampuses($admin['campus'], $admin['role']);
    
    // Get filter parameters
    $campusFilter = isset($_GET['campus']) ? trim($_GET['campus']) : '';
    $dateFrom = isset($_GET['date_from']) ? trim($_GET['date_from']) : '';
    $dateTo = isset($_GET['date_to']) ? trim($_GET['date_to']) : '';
    
    // Build query to get activities with user info
    $baseQuery = "
        SELECT 
            al.id,
            al.user_id,
            al.action,
            al.description,
            al.ip_address,
            al.user_agent,
            al.created_at,
            u.name as user_name,
            u.username,
            u.campus as user_campus,
            u.office as user_office,
            u.role as user_role
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE 1=1
    ";
    
    $params = [];
    
    // Apply campus filtering - check accessible campuses first
    if ($accessibleCampuses !== null && count($accessibleCampuses) > 0) {
        // If specific campus filter is provided, validate it's accessible
        if ($campusFilter !== '') {
            if (in_array($campusFilter, $accessibleCampuses)) {
                $baseQuery .= " AND u.campus = ?";
                $params[] = $campusFilter;
            } else {
                // Invalid campus filter, return empty result
                $baseQuery .= " AND 1=0";
            }
        } else {
            // No specific filter, use accessible campuses
            $placeholders = implode(',', array_fill(0, count($accessibleCampuses), '?'));
            $baseQuery .= " AND (u.campus IN ($placeholders) OR al.user_id IS NULL)";
            $params = array_merge($params, $accessibleCampuses);
        }
    } elseif ($campusFilter !== '') {
        // Super admin with campus filter
        $baseQuery .= " AND u.campus = ?";
        $params[] = $campusFilter;
    }
    
    // Apply date filtering
    if ($dateFrom !== '') {
        $baseQuery .= " AND DATE(al.created_at) >= ?";
        $params[] = $dateFrom;
    }
    
    if ($dateTo !== '') {
        $baseQuery .= " AND DATE(al.created_at) <= ?";
        $params[] = $dateTo;
    }
    
    // Add sorting and pagination
    $baseQuery .= " ORDER BY al.created_at DESC LIMIT 500";
    
    $stmt = $db->prepare($baseQuery);
    $stmt->execute($params);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format activities with user-friendly action labels
    $formattedActivities = array_map(function($activity) {
        $actionLabels = [
            'login' => 'Logged in',
            'login_failed' => 'Failed login attempt',
            'logout' => 'Logged out',
            'password_change' => 'Changed password',
            'password_reset' => 'Reset password',
            'report_submission' => 'Submitted report',
            'data_submission' => 'Submitted data',
            'report_approved' => 'Approved report',
            'report_rejected' => 'Rejected report',
            'user_created' => 'Created user',
            'user_updated' => 'Updated user',
            'user_deleted' => 'Deleted user',
            'profile_updated' => 'Updated profile'
        ];
        
        $actionLabel = $actionLabels[$activity['action']] ?? ucfirst(str_replace('_', ' ', $activity['action']));
        
        // Get action icon
        $actionIcons = [
            'login' => 'fa-sign-in-alt',
            'login_failed' => 'fa-exclamation-circle',
            'logout' => 'fa-sign-out-alt',
            'password_change' => 'fa-key',
            'password_reset' => 'fa-key',
            'report_submission' => 'fa-file-upload',
            'data_submission' => 'fa-database',
            'report_approved' => 'fa-check-circle',
            'report_rejected' => 'fa-times-circle',
            'user_created' => 'fa-user-plus',
            'user_updated' => 'fa-user-edit',
            'user_deleted' => 'fa-user-times',
            'profile_updated' => 'fa-user-cog'
        ];
        
        $actionIcon = $actionIcons[$activity['action']] ?? 'fa-circle';
        
        // Get action color
        $actionColors = [
            'login' => '#10b981',
            'login_failed' => '#ef4444',
            'logout' => '#6b7280',
            'password_change' => '#3b82f6',
            'password_reset' => '#3b82f6',
            'report_submission' => '#f59e0b',
            'data_submission' => '#8b5cf6',
            'report_approved' => '#10b981',
            'report_rejected' => '#ef4444',
            'user_created' => '#10b981',
            'user_updated' => '#3b82f6',
            'user_deleted' => '#ef4444',
            'profile_updated' => '#8b5cf6'
        ];
        
        $actionColor = $actionColors[$activity['action']] ?? '#6b7280';
        
        return [
            'id' => $activity['id'],
            'user_id' => $activity['user_id'],
            'user_name' => $activity['user_name'] ?? 'Unknown User',
            'username' => $activity['username'] ?? 'N/A',
            'user_campus' => $activity['user_campus'] ?? 'Unknown',
            'user_office' => $activity['user_office'] ?? '',
            'user_role' => $activity['user_role'] ?? 'user',
            'action' => $activity['action'],
            'action_label' => $actionLabel,
            'action_icon' => $actionIcon,
            'action_color' => $actionColor,
            'description' => $activity['description'] ?? '',
            'ip_address' => $activity['ip_address'] ?? '',
            'created_at' => $activity['created_at']
        ];
    }, $activities);
    
    // Get list of available campuses for filter dropdown
    $availableCampuses = [];
    if ($accessibleCampuses !== null) {
        $availableCampuses = $accessibleCampuses;
    } else {
        // Super admin - get all unique campuses
        $campusQuery = "SELECT DISTINCT campus FROM users WHERE campus IS NOT NULL AND campus != '' ORDER BY campus";
        $campusStmt = $db->query($campusQuery);
        $availableCampuses = $campusStmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    echo json_encode([
        'success' => true,
        'activities' => $formattedActivities,
        'count' => count($formattedActivities),
        'admin_campus' => $admin['campus'],
        'admin_role' => $admin['role'],
        'available_campuses' => $availableCampuses
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

