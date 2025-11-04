<?php
/**
 * Helper Functions for Spartan Data
 */

/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 */
function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return isset($_SESSION['user_id']) && isset($_SESSION['session_id']);
}

/**
 * Get current user data
 */
function getCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }

    try {
        $db = getDB();
        $stmt = $db->prepare("
            SELECT u.id, u.username, u.email, u.name, u.role, u.campus, u.office, u.status, u.last_login
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE s.session_id = ? AND s.expires_at > NOW() AND u.status = 'active'
        ");
        $stmt->execute([$_SESSION['session_id']]);
        return $stmt->fetch();
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Check if user has specific role
 */
function hasRole($role) {
    $user = getCurrentUser();
    return $user && $user['role'] === $role;
}

/**
 * Require authentication
 */
function requireAuth() {
    if (!isAuthenticated()) {
        header('Location: ../login.html');
        exit();
    }
}

/**
 * Require specific role
 */
function requireRole($role) {
    requireAuth();
    if (!hasRole($role)) {
        header('HTTP/1.1 403 Forbidden');
        echo json_encode(['error' => 'Insufficient permissions']);
        exit();
    }
}

/**
 * Log user activity
 */
function logActivity($action, $description = '', $userId = null) {
    if (!$userId && isAuthenticated()) {
        $user = getCurrentUser();
        $userId = $user ? $user['id'] : null;
    }

    try {
        $db = getDB();
        $stmt = $db->prepare("
            INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId,
            $action,
            $description,
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    } catch (Exception $e) {
        error_log("Activity log error: " . $e->getMessage());
    }
}

/**
 * Get dashboard statistics
 */
function getDashboardStats() {
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT stat_name, stat_value, stat_type FROM dashboard_stats");
        $stmt->execute();
        $stats = [];
        
        while ($row = $stmt->fetch()) {
            $stats[$row['stat_name']] = [
                'value' => $row['stat_value'],
                'type' => $row['stat_type']
            ];
        }
        
        return $stats;
    } catch (Exception $e) {
        error_log("Dashboard stats error: " . $e->getMessage());
        return [];
    }
}

/**
 * Update dashboard statistics
 */
function updateDashboardStat($statName, $statValue) {
    try {
        $db = getDB();
        $stmt = $db->prepare("
            INSERT INTO dashboard_stats (stat_name, stat_value) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE stat_value = VALUES(stat_value)
        ");
        $stmt->execute([$statName, $statValue]);
        return true;
    } catch (Exception $e) {
        error_log("Update stats error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get system settings
 */
function getSystemSettings() {
    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT setting_key, setting_value FROM system_settings");
        $stmt->execute();
        $settings = [];
        
        while ($row = $stmt->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        
        return $settings;
    } catch (Exception $e) {
        error_log("System settings error: " . $e->getMessage());
        return [];
    }
}

/**
 * Update system setting
 */
function updateSystemSetting($key, $value) {
    try {
        $db = getDB();
        $stmt = $db->prepare("
            INSERT INTO system_settings (setting_key, setting_value) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        ");
        $stmt->execute([$key, $value]);
        return true;
    } catch (Exception $e) {
        error_log("Update setting error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get recent activity logs
 */
function getRecentActivity($limit = 10) {
    try {
        $db = getDB();
        $stmt = $db->prepare("
            SELECT al.*, u.name as user_name, u.username as username, u.email as user_email
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("Recent activity error: " . $e->getMessage());
        return [];
    }
}

/**
 * Clean expired sessions
 */
function cleanExpiredSessions() {
    try {
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM user_sessions WHERE expires_at < NOW()");
        $stmt->execute();
        return $stmt->rowCount();
    } catch (Exception $e) {
        error_log("Clean sessions error: " . $e->getMessage());
        return 0;
    }
}

/**
 * Send JSON response
 */
function sendJSONResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

/**
 * Validate email format
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Generate random password
 */
function generateRandomPassword($length = 12) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';
    $password = '';
    for ($i = 0; $i < $length; $i++) {
        $password .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $password;
}

/**
 * Hash password
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * Verify password
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Format date for display
 */
function formatDate($date, $format = 'Y-m-d H:i:s') {
    return date($format, strtotime($date));
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}
?>

