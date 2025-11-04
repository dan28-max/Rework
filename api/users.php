<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Temporarily bypass authentication for development
// In production, implement proper authentication

require_once '../config/database.php';

class UsersAPI {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function handleRequest() {
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'list':
                $this->listUsers();
                break;
            case 'create':
                $this->createUser();
                break;
            case 'update':
                $this->updateUser();
                break;
            case 'delete':
                $this->deleteUser();
                break;
            case 'get':
                $this->getUser();
                break;
            default:
                echo json_encode(['success' => false, 'error' => 'Invalid action']);
        }
    }
    
    /**
     * Get accessible campuses for an admin based on their campus
     */
    private function getAccessibleCampuses($adminCampus) {
        if (!$adminCampus) {
            return [];
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
        
        // Solo campuses: Lipa, Malvar, Nasugbu - just their own campus
        if (in_array($campus, ['Lipa', 'Malvar', 'Nasugbu'])) {
            return [$campus];
        }
        
        // Default: return own campus only
        return [$campus];
    }

    private function listUsers() {
        try {
            // Enforce campus scoping from session for admins
            if (session_status() === PHP_SESSION_NONE) { session_start(); }
            
            // Get admin info if logged in
            $isSuperAdmin = false;
            $accessibleCampuses = [];
            
            if (isset($_SESSION['user_id'])) {
                $stmt = $this->conn->prepare("
                    SELECT role, campus 
                    FROM users 
                    WHERE id = ? AND LOWER(role) IN ('admin', 'super_admin') AND status = 'active'
                ");
                $stmt->execute([$_SESSION['user_id']]);
                $adminInfo = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($adminInfo) {
                    $isSuperAdmin = strtolower($adminInfo['role']) === 'super_admin' || 
                                   trim($adminInfo['campus']) === 'Main Campus';
                    
                    if (!$isSuperAdmin && $adminInfo['campus']) {
                        $accessibleCampuses = $this->getAccessibleCampuses($adminInfo['campus']);
                    }
                }
            }
            
            $campus = isset($_GET['campus']) ? trim((string)$_GET['campus']) : '';
            $role = isset($_GET['role']) ? trim((string)$_GET['role']) : '';
            $search = isset($_GET['search']) ? trim((string)$_GET['search']) : '';
            $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
            $perPage = isset($_GET['per_page']) ? max(1, min(100, (int)$_GET['per_page'])) : 20;

            $where = [];
            $params = [];
            
            // Apply campus filtering
            if (!$isSuperAdmin && !empty($accessibleCampuses)) {
                // Filter by accessible campuses using positional parameters
                $placeholders = implode(',', array_fill(0, count($accessibleCampuses), '?'));
                $where[] = "LOWER(TRIM(campus)) IN ($placeholders)";
                foreach ($accessibleCampuses as $ac) {
                    $params[] = $ac;
                }
            } elseif ($campus !== '') {
                // Single campus filter (for backward compatibility)
                $where[] = 'LOWER(TRIM(campus)) = ?';
                $params[] = $campus;
            }
            if ($role !== '') {
                $where[] = 'role = ?';
                $params[] = $role;
            }
            if ($search !== '') {
                $where[] = '(username LIKE ? OR name LIKE ? OR office LIKE ? OR campus LIKE ?)';
                $searchParam = '%' . $search . '%';
                $params[] = $searchParam;
                $params[] = $searchParam;
                $params[] = $searchParam;
                $params[] = $searchParam;
            }

            $base = 'FROM users';
            if (!empty($where)) {
                $base .= ' WHERE ' . implode(' AND ', $where);
            }

            // Count total
            $countSql = 'SELECT COUNT(*) AS total ' . $base;
            $countStmt = $this->conn->prepare($countSql);
            $countStmt->execute($params);
            $total = (int)$countStmt->fetchColumn();

            // Fetch page
            $offset = ($page - 1) * $perPage;
            $listSql = 'SELECT id, username, name, role, status, campus, office, created_at, last_login ' . $base . ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            $listStmt = $this->conn->prepare($listSql);
            $queryParams = array_merge($params, [$perPage, $offset]);
            $listStmt->execute($queryParams);
            $users = $listStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'users' => $users,
                'meta' => [
                    'page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'total_pages' => (int)ceil($total / $perPage)
                ]
            ]);
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'error' => 'Failed to load users: ' . $e->getMessage()
            ]);
        }
    }
    
    private function getUser() {
        try {
            $userId = $_GET['id'] ?? null;
            
            if (!$userId) {
                echo json_encode(['success' => false, 'error' => 'User ID required']);
                return;
            }
            
            $query = "SELECT id, username, name, role, status, campus, office 
                      FROM users WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $userId);
            $stmt->execute();
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                echo json_encode([
                    'success' => true,
                    'user' => $user
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'User not found']);
            }
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'error' => 'Failed to get user: ' . $e->getMessage()
            ]);
        }
    }
    
    private function createUser() {
        try {
            // Accept JSON or form-encoded
            $payload = json_decode(file_get_contents('php://input'), true);
            if (!is_array($payload) || empty($payload)) {
                $payload = $_POST;
            }

            // Debug logging
            error_log('Create User Payload: ' . json_encode($payload));

            $username = isset($payload['username']) ? trim((string)$payload['username']) : '';
            $name = isset($payload['name']) ? trim((string)$payload['name']) : '';
            $password = isset($payload['password']) ? (string)$payload['password'] : '';
            $role = isset($payload['role']) ? strtolower(trim((string)$payload['role'])) : 'user';
            $status = isset($payload['status']) ? strtolower(trim((string)$payload['status'])) : 'active';
            $campus = isset($payload['campus']) ? trim((string)$payload['campus']) : null;
            $office = isset($payload['office']) ? trim((string)$payload['office']) : null;
            
            // Debug logging
            error_log('Role after processing: ' . $role);
            error_log('Campus from payload: ' . ($campus ?? 'null'));

            // Enforce campus scoping from session (if present)
            // BUT allow Main Campus users (super admins) to set any campus
            if (session_status() === PHP_SESSION_NONE) { session_start(); }
            $sessionCampus = isset($_SESSION['user_campus']) ? trim((string)$_SESSION['user_campus']) : '';
            $sessionRole = isset($_SESSION['user_role']) ? trim((string)$_SESSION['user_role']) : '';
            
            // Only enforce campus lock if NOT Main Campus and NOT super_admin
            if ($sessionCampus !== '' && 
                $sessionCampus !== 'Main Campus' && 
                $sessionRole !== 'super_admin' &&
                strtolower($sessionCampus) !== 'all campuses') {
                $campus = $sessionCampus;
                error_log('Campus locked to session campus: ' . $sessionCampus);
            } else {
                error_log('Campus selection allowed - using payload campus: ' . ($campus ?? 'null'));
            }

            // Basic validation
            if ($username === '' || $password === '') {
                echo json_encode(['success' => false, 'error' => 'Username and password are required']);
                return;
            }
            // If name not provided, default to username
            if ($name === '' || $name === null) {
                $name = $username;
            }
            if (!preg_match('/^[a-zA-Z0-9-_]+$/', $username)) {
                echo json_encode(['success' => false, 'error' => 'Username may contain letters, numbers, hyphen, underscore']);
                return;
            }
            if (!in_array($role, ['super_admin','admin','user'], true)) {
                error_log('Role validation failed! Role was: ' . $role . ' - Setting to user');
                $role = 'user';
            } else {
                error_log('Role validation passed! Role is: ' . $role);
            }
            if (!in_array($status, ['active','inactive','disabled','blocked','suspended'], true)) {
                $status = 'active';
            }

            // Ensure username unique
            $checkUser = $this->conn->prepare("SELECT id FROM users WHERE username = :username");
            $checkUser->bindParam(':username', $username);
            $checkUser->execute();
            if ($checkUser->fetch()) {
                echo json_encode(['success' => false, 'error' => 'Username already exists']);
                return;
            }

            // Hash password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            // Insert user
            $insert = $this->conn->prepare(
                "INSERT INTO users (username, name, password, role, status, campus, office, created_at) 
                 VALUES (:username, :name, :password, :role, :status, :campus, :office, NOW())"
            );
            $insert->bindParam(':username', $username);
            $insert->bindParam(':name', $name);
            $insert->bindParam(':password', $hashedPassword);
            $insert->bindParam(':role', $role);
            $insert->bindParam(':status', $status);
            $insert->bindParam(':campus', $campus);
            $insert->bindParam(':office', $office);

            if ($insert->execute()) {
                $newId = $this->conn->lastInsertId();
                
                // Log user creation activity
                try {
                    $adminId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
                    $adminName = isset($_SESSION['username']) ? $_SESSION['username'] : 'System';
                    $activityStmt = $this->conn->prepare("
                        INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
                        VALUES (:admin_id, 'user_created', :description, :ip_address, :user_agent)
                    ");
                    $description = "Created user: $name ($username) with role: $role at campus: " . ($campus ?? 'N/A');
                    $activityStmt->execute([
                        'admin_id' => $adminId,
                        'description' => $description,
                        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
                        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
                    ]);
                } catch (Exception $e) {
                    error_log("Failed to log user creation activity: " . $e->getMessage());
                }
                
                // Return created user snapshot (without password)
                $get = $this->conn->prepare("SELECT id, username, name, role, status, campus, office, created_at FROM users WHERE id = :id");
                $get->bindParam(':id', $newId);
                $get->execute();
                $created = $get->fetch(PDO::FETCH_ASSOC);

                echo json_encode([
                    'success' => true,
                    'message' => 'User created successfully',
                    'user' => $created
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to create user']);
            }
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'error' => 'Failed to create user: ' . $e->getMessage()
            ]);
        }
    }
    
    private function updateUser() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id'])) {
                echo json_encode(['success' => false, 'error' => 'User ID required']);
                return;
            }
            
            // Build update query dynamically based on provided fields
            $updateFields = [];
            $params = [':id' => $data['id']];
            
            if (isset($data['username'])) {
                // Check if new username is unique
                $checkQuery = "SELECT id FROM users WHERE username = :username AND id != :id";
                $checkStmt = $this->conn->prepare($checkQuery);
                $checkStmt->bindParam(':username', $data['username']);
                $checkStmt->bindParam(':id', $data['id']);
                $checkStmt->execute();
                if ($checkStmt->fetch()) {
                    echo json_encode(['success' => false, 'error' => 'Username already exists']);
                    return;
                }
                $updateFields[] = "username = :username";
                $params[':username'] = $data['username'];
            }
            if (isset($data['name'])) {
                $updateFields[] = "name = :name";
                $params[':name'] = $data['name'];
            }
            // email column not used in current schema
            if (isset($data['role'])) {
                $updateFields[] = "role = :role";
                $params[':role'] = $data['role'];
            }
            if (isset($data['status'])) {
                $updateFields[] = "status = :status";
                $params[':status'] = $data['status'];
            }
            if (isset($data['campus'])) {
                $updateFields[] = "campus = :campus";
                $params[':campus'] = $data['campus'];
            }
            if (isset($data['office'])) {
                $updateFields[] = "office = :office";
                $params[':office'] = $data['office'];
            }
            if (!empty($data['password'])) {
                $updateFields[] = "password = :password";
                $params[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            }
            
            if (empty($updateFields)) {
                echo json_encode(['success' => false, 'error' => 'No fields to update']);
                return;
            }
            
            // Get user info before update for activity log
            $getUserStmt = $this->conn->prepare("SELECT username, name FROM users WHERE id = :id");
            $getUserStmt->bindParam(':id', $data['id']);
            $getUserStmt->execute();
            $userInfo = $getUserStmt->fetch(PDO::FETCH_ASSOC);
            
            $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            if ($stmt->execute()) {
                // Log user update activity
                try {
                    $adminId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
                    $updatedFields = array_keys(array_filter($data, fn($k) => $k !== 'id' && isset($updateFields)));
                    $description = "Updated user: " . ($userInfo['name'] ?? 'N/A') . " (" . ($userInfo['username'] ?? 'N/A') . ")";
                    $activityStmt = $this->conn->prepare("
                        INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
                        VALUES (:admin_id, 'user_updated', :description, :ip_address, :user_agent)
                    ");
                    $activityStmt->execute([
                        'admin_id' => $adminId,
                        'description' => $description,
                        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
                        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
                    ]);
                } catch (Exception $e) {
                    error_log("Failed to log user update activity: " . $e->getMessage());
                }
                
                echo json_encode([
                    'success' => true,
                    'message' => 'User updated successfully'
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to update user']);
            }
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'error' => 'Failed to update user: ' . $e->getMessage()
            ]);
        }
    }
    
    private function deleteUser() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['id'])) {
                echo json_encode(['success' => false, 'error' => 'User ID required']);
                return;
            }
            
            // Don't allow deleting the last admin
            $checkQuery = "SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin' AND status = 'active'";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->execute();
            $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result['admin_count'] <= 1) {
                $userQuery = "SELECT role FROM users WHERE id = :id";
                $userStmt = $this->conn->prepare($userQuery);
                $userStmt->bindParam(':id', $data['id']);
                $userStmt->execute();
                $user = $userStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user && $user['role'] === 'admin') {
                    echo json_encode(['success' => false, 'error' => 'Cannot delete the last admin user']);
                    return;
                }
            }
            
            // Get user info before deletion for activity log
            $getUserStmt = $this->conn->prepare("SELECT username, name FROM users WHERE id = :id");
            $getUserStmt->bindParam(':id', $data['id']);
            $getUserStmt->execute();
            $userInfo = $getUserStmt->fetch(PDO::FETCH_ASSOC);
            
            $query = "DELETE FROM users WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $data['id']);
            
            if ($stmt->execute()) {
                // Log user deletion activity
                try {
                    $adminId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
                    $description = "Deleted user: " . ($userInfo['name'] ?? 'N/A') . " (" . ($userInfo['username'] ?? 'N/A') . ")";
                    $activityStmt = $this->conn->prepare("
                        INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
                        VALUES (:admin_id, 'user_deleted', :description, :ip_address, :user_agent)
                    ");
                    $activityStmt->execute([
                        'admin_id' => $adminId,
                        'description' => $description,
                        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
                        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
                    ]);
                } catch (Exception $e) {
                    error_log("Failed to log user deletion activity: " . $e->getMessage());
                }
                
                echo json_encode([
                    'success' => true,
                    'message' => 'User deleted successfully'
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to delete user']);
            }
        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'error' => 'Failed to delete user: ' . $e->getMessage()
            ]);
        }
    }
}

$api = new UsersAPI();
$api->handleRequest();

