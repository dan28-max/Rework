<?php
/**
 * Fixed Database Setup Script for Spartan Data
 * Handles existing databases and duplicate indexes
 */

require_once 'config/database.php';

echo "<h1>Spartan Data - Database Setup (Fixed)</h1>";

try {
    // Test database connection
    $db = new Database();
    if (!$db->testConnection()) {
        throw new Exception("Cannot connect to database. Please check your XAMPP MySQL service.");
    }
    
    echo "<p style='color: green;'>✓ Database connection successful</p>";
    
    $conn = $db->getConnection();
    
    // Check if database exists, if not create it
    $stmt = $conn->prepare("CREATE DATABASE IF NOT EXISTS spartan_data");
    $stmt->execute();
    echo "<p style='color: green;'>✓ Database 'spartan_data' ready</p>";
    
    // Use the database
    $conn->exec("USE spartan_data");
    
    echo "<h2>Creating Tables...</h2>";
    
    // Create tables one by one with error handling
    $tables = [
        "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
            status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            remember_token VARCHAR(255) NULL,
            email_verified_at TIMESTAMP NULL
        )",
        
        "CREATE TABLE IF NOT EXISTS user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_id VARCHAR(255) UNIQUE NOT NULL,
            ip_address VARCHAR(45),
            user_agent TEXT,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",
        
        "CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(255) UNIQUE NOT NULL,
            setting_value TEXT,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )",
        
        "CREATE TABLE IF NOT EXISTS activity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            action VARCHAR(255) NOT NULL,
            description TEXT,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )",
        
        "CREATE TABLE IF NOT EXISTS dashboard_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            stat_name VARCHAR(255) NOT NULL,
            stat_value VARCHAR(255) NOT NULL,
            stat_type ENUM('number', 'percentage', 'text') DEFAULT 'number',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )"
    ];
    
    foreach ($tables as $tableSQL) {
        try {
            $conn->exec($tableSQL);
            echo "<p style='color: green;'>✓ Table created/verified</p>";
        } catch (PDOException $e) {
            echo "<p style='color: orange;'>⚠ Table already exists or error: " . $e->getMessage() . "</p>";
        }
    }
    
    echo "<h2>Inserting Default Data...</h2>";
    
    // Insert default users (only if they don't exist)
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users WHERE email = ?");
    $stmt->execute(['admin@spartandata.com']);
    if ($stmt->fetch()['count'] == 0) {
        $stmt = $conn->prepare("INSERT INTO users (email, password, name, role, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['admin@spartandata.com', password_hash('admin123', PASSWORD_DEFAULT), 'Admin User', 'admin', 'active']);
        echo "<p style='color: green;'>✓ Admin user created</p>";
    } else {
        echo "<p style='color: blue;'>ℹ Admin user already exists</p>";
    }
    
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users WHERE email = ?");
    $stmt->execute(['user@spartandata.com']);
    if ($stmt->fetch()['count'] == 0) {
        $stmt = $conn->prepare("INSERT INTO users (email, password, name, role, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute(['user@spartandata.com', password_hash('user123', PASSWORD_DEFAULT), 'Regular User', 'user', 'active']);
        echo "<p style='color: green;'>✓ User created</p>";
    } else {
        echo "<p style='color: blue;'>ℹ User already exists</p>";
    }
    
    // Insert default settings
    $settings = [
        ['system_name', 'Spartan Data', 'Name of the system'],
        ['theme_color', 'white_red', 'Current theme colors'],
        ['session_timeout', '3600', 'Session timeout in seconds'],
        ['max_login_attempts', '5', 'Maximum login attempts before lockout'],
        ['maintenance_mode', '0', 'System maintenance mode (0=off, 1=on)']
    ];
    
    foreach ($settings as $setting) {
        $stmt = $conn->prepare("INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES (?, ?, ?)");
        $stmt->execute($setting);
    }
    echo "<p style='color: green;'>✓ System settings updated</p>";
    
    // Insert default dashboard statistics
    $stats = [
        ['total_users', '2', 'number'],
        ['data_records', '0', 'number'],
        ['growth_rate', '0', 'percentage'],
        ['security_score', '100', 'percentage'],
        ['system_uptime', '99.9', 'percentage'],
        ['response_time', '245', 'number']
    ];
    
    foreach ($stats as $stat) {
        $stmt = $conn->prepare("INSERT INTO dashboard_stats (stat_name, stat_value, stat_type) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE stat_value = VALUES(stat_value)");
        $stmt->execute($stat);
    }
    echo "<p style='color: green;'>✓ Dashboard statistics updated</p>";
    
    echo "<h2>Creating Indexes...</h2>";
    
    // Create indexes safely
    $indexes = [
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
        "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)",
        "CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)",
        "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at)",
        "CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_logs(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at)"
    ];
    
    foreach ($indexes as $indexSQL) {
        try {
            $conn->exec($indexSQL);
            echo "<p style='color: green;'>✓ Index created/verified</p>";
        } catch (PDOException $e) {
            echo "<p style='color: orange;'>⚠ Index already exists or error: " . $e->getMessage() . "</p>";
        }
    }
    
    echo "<h2>Verification...</h2>";
    
    // Check if tables exist
    $tables = ['users', 'user_sessions', 'system_settings', 'activity_logs', 'dashboard_stats'];
    foreach ($tables as $table) {
        $stmt = $conn->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$table]);
        if ($stmt->fetch()) {
            echo "<p style='color: green;'>✓ Table '$table' exists</p>";
        } else {
            echo "<p style='color: red;'>✗ Table '$table' missing</p>";
        }
    }
    
    // Check default users
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $userCount = $stmt->fetch()['count'];
    echo "<p style='color: green;'>✓ Found $userCount users in database</p>";
    
    // Check default settings
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM system_settings");
    $stmt->execute();
    $settingsCount = $stmt->fetch()['count'];
    echo "<p style='color: green;'>✓ Found $settingsCount system settings</p>";
    
    echo "<h2 style='color: green;'>🎉 Database setup completed successfully!</h2>";
    echo "<p><strong>Default Login Credentials:</strong></p>";
    echo "<ul>";
    echo "<li><strong>Admin:</strong> admin@spartandata.com / admin123</li>";
    echo "<li><strong>User:</strong> user@spartandata.com / user123</li>";
    echo "</ul>";
    echo "<p><a href='login.html' style='background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Go to Login Page</a></p>";
    
} catch (Exception $e) {
    echo "<h2 style='color: red;'>❌ Setup Failed</h2>";
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
    echo "<h3>Troubleshooting:</h3>";
    echo "<ul>";
    echo "<li>Make sure XAMPP is running</li>";
    echo "<li>Check that MySQL service is started</li>";
    echo "<li>Verify database credentials in config/database.php</li>";
    echo "<li>Ensure you have proper permissions</li>";
    echo "</ul>";
}
?>

<style>
body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: #f8f9fa;
}
h1, h2 {
    color: #dc3545;
}
p {
    margin: 5px 0;
}
ul {
    background: white;
    padding: 15px;
    border-radius: 5px;
    border-left: 4px solid #dc3545;
}
</style>




