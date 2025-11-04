<?php
/**
 * Database Configuration for Spartan Data
 * XAMPP MySQL Configuration
 */

class Database {
    private $host = 'localhost';
    private $db_name = 'spartan_data';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';
    public $conn;

    /**
     * Get database connection
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            throw new Exception("Database connection failed");
        }

        return $this->conn;
    }

    /**
     * Test database connection
     */
    public function testConnection() {
        try {
            $conn = $this->getConnection();
            return $conn !== null;
        } catch(Exception $e) {
            return false;
        }
    }
}

// Global database instance
function getDB() {
    static $db = null;
    if ($db === null) {
        $db = new Database();
    }
    return $db->getConnection();
}

// Database configuration constants
define('DB_HOST', 'localhost');
define('DB_NAME', 'spartan_data');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');
?>

