<?php
/**
 * Dashboard API for Spartan Data
 * Handles dashboard data and statistics
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../includes/functions.php';

// Start session
session_start();

class DashboardAPI {
    private $db;
    
    public function __construct() {
        try {
            $this->db = getDB();
        } catch (Exception $e) {
            $this->sendError('Database connection failed', 500);
        }
    }

    /**
     * Get dashboard overview data
     */
    public function getOverview() {
        requireAuth();
        
        try {
            $user = getCurrentUser();
            $stats = getDashboardStats();
            $recentActivity = getRecentActivity(5);
            
            // Get user-specific data based on role
            $userStats = $this->getUserSpecificStats($user['role']);
            
            $this->sendSuccess([
                'user' => $user,
                'stats' => array_merge($stats, $userStats),
                'recent_activity' => $recentActivity,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            
        } catch (Exception $e) {
            error_log("Dashboard overview error: " . $e->getMessage());
            $this->sendError('Failed to load dashboard data');
        }
    }

    /**
     * Get analytics data
     */
    public function getAnalytics() {
        requireAuth();
        
        try {
            $analytics = [
                'performance' => $this->getPerformanceMetrics(),
                'engagement' => $this->getEngagementMetrics(),
                'users' => $this->getUserMetrics(),
                'system' => $this->getSystemMetrics()
            ];
            
            $this->sendSuccess($analytics);
            
        } catch (Exception $e) {
            error_log("Analytics error: " . $e->getMessage());
            $this->sendError('Failed to load analytics data');
        }
    }

    /**
     * Get users list (Admin only)
     */
    public function getUsers() {
        requireRole('admin');
        
        try {
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = min(50, max(10, intval($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;
            
            // Get total count
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM users");
            $stmt->execute();
            $total = $stmt->fetch()['total'];
            
            // Get users
            $stmt = $this->db->prepare("
                SELECT id, email, name, role, status, created_at, last_login
                FROM users 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$limit, $offset]);
            $users = $stmt->fetchAll();
            
            $this->sendSuccess([
                'users' => $users,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (Exception $e) {
            error_log("Users list error: " . $e->getMessage());
            $this->sendError('Failed to load users');
        }
    }

    /**
     * Update dashboard statistics
     */
    public function updateStats() {
        requireAuth();
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendError('Method not allowed', 405);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['stats'])) {
            $this->sendError('Stats data required');
        }
        
        try {
            foreach ($input['stats'] as $statName => $statValue) {
                updateDashboardStat($statName, $statValue);
            }
            
            logActivity('stats_updated', 'Dashboard statistics updated');
            $this->sendSuccess(['message' => 'Statistics updated successfully']);
            
        } catch (Exception $e) {
            error_log("Update stats error: " . $e->getMessage());
            $this->sendError('Failed to update statistics');
        }
    }

    /**
     * Get user-specific statistics based on role
     */
    private function getUserSpecificStats($role) {
        $stats = [];
        
        if ($role === 'admin') {
            // Admin gets full statistics
            $stats = [
                'total_users' => $this->getUserCount(),
                'active_sessions' => $this->getActiveSessionCount(),
                'system_uptime' => $this->getSystemUptime(),
                'error_rate' => $this->getErrorRate()
            ];
        } else {
            // Regular users get limited statistics
            $stats = [
                'my_activity' => $this->getUserActivityCount(),
                'last_login' => $this->getLastLoginTime()
            ];
        }
        
        return $stats;
    }

    /**
     * Get performance metrics
     */
    private function getPerformanceMetrics() {
        return [
            'response_time' => '245ms',
            'uptime' => '99.9%',
            'error_rate' => '0.1%',
            'cpu_usage' => '45%',
            'memory_usage' => '67%',
            'disk_usage' => '23%'
        ];
    }

    /**
     * Get engagement metrics
     */
    private function getEngagementMetrics() {
        return [
            'page_views' => '12,456',
            'unique_visitors' => '3,789',
            'avg_session_duration' => '4m 32s',
            'bounce_rate' => '23%',
            'conversion_rate' => '8.5%'
        ];
    }

    /**
     * Get user metrics
     */
    private function getUserMetrics() {
        return [
            'total_users' => $this->getUserCount(),
            'active_users' => $this->getActiveUserCount(),
            'new_users_today' => $this->getNewUsersToday(),
            'user_growth_rate' => '+12.5%'
        ];
    }

    /**
     * Get system metrics
     */
    private function getSystemMetrics() {
        return [
            'database_size' => '2.3 GB',
            'backup_status' => 'Completed',
            'security_score' => '98%',
            'last_backup' => '2 hours ago',
            'maintenance_mode' => 'Off'
        ];
    }

    /**
     * Get total user count
     */
    private function getUserCount() {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'");
        $stmt->execute();
        return $stmt->fetch()['count'];
    }

    /**
     * Get active user count
     */
    private function getActiveUserCount() {
        $stmt = $this->db->prepare("
            SELECT COUNT(DISTINCT user_id) as count 
            FROM user_sessions 
            WHERE expires_at > NOW()
        ");
        $stmt->execute();
        return $stmt->fetch()['count'];
    }

    /**
     * Get new users today
     */
    private function getNewUsersToday() {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count 
            FROM users 
            WHERE DATE(created_at) = CURDATE()
        ");
        $stmt->execute();
        return $stmt->fetch()['count'];
    }

    /**
     * Get active session count
     */
    private function getActiveSessionCount() {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count 
            FROM user_sessions 
            WHERE expires_at > NOW()
        ");
        $stmt->execute();
        return $stmt->fetch()['count'];
    }

    /**
     * Get system uptime
     */
    private function getSystemUptime() {
        // This would typically come from system monitoring
        return '99.9%';
    }

    /**
     * Get error rate
     */
    private function getErrorRate() {
        // This would typically come from error logs
        return '0.1%';
    }

    /**
     * Get user activity count
     */
    private function getUserActivityCount() {
        if (!isAuthenticated()) return 0;
        
        $user = getCurrentUser();
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count 
            FROM activity_logs 
            WHERE user_id = ? AND DATE(created_at) = CURDATE()
        ");
        $stmt->execute([$user['id']]);
        return $stmt->fetch()['count'];
    }

    /**
     * Get last login time
     */
    private function getLastLoginTime() {
        if (!isAuthenticated()) return null;
        
        $user = getCurrentUser();
        return $user['last_login'];
    }

    /**
     * Send success response
     */
    private function sendSuccess($data) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $data
        ]);
        exit();
    }

    /**
     * Send error response
     */
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
        exit();
    }
}

// Handle API requests
$dashboard = new DashboardAPI();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'overview':
        $dashboard->getOverview();
        break;
    case 'analytics':
        $dashboard->getAnalytics();
        break;
    case 'users':
        $dashboard->getUsers();
        break;
    case 'update_stats':
        $dashboard->updateStats();
        break;
    default:
        $dashboard->sendError('Invalid action specified', 400);
}
?>

