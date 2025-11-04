-- Spartan Data Database Schema
-- Run this in phpMyAdmin or MySQL command line

CREATE DATABASE IF NOT EXISTS spartan_data;
USE spartan_data;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'user') NOT NULL DEFAULT 'user',
    campus VARCHAR(100) NOT NULL,
    office VARCHAR(100) NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    remember_token VARCHAR(255) NULL,
    email_verified_at TIMESTAMP NULL
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Dashboard statistics table
CREATE TABLE IF NOT EXISTS dashboard_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_name VARCHAR(255) NOT NULL,
    stat_value VARCHAR(255) NOT NULL,
    stat_type ENUM('number', 'percentage', 'text') DEFAULT 'number',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (email, password, name, role, status) VALUES 
('admin@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin', 'active'),
('user@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Regular User', 'user', 'active');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('system_name', 'Spartan Data', 'Name of the system'),
('theme_color', 'white_red', 'Current theme colors'),
('session_timeout', '3600', 'Session timeout in seconds'),
('max_login_attempts', '5', 'Maximum login attempts before lockout'),
('maintenance_mode', '0', 'System maintenance mode (0=off, 1=on)');

-- Insert default dashboard statistics
INSERT INTO dashboard_stats (stat_name, stat_value, stat_type) VALUES 
('total_users', '2', 'number'),
('data_records', '0', 'number'),
('growth_rate', '0', 'percentage'),
('security_score', '100', 'percentage'),
('system_uptime', '99.9', 'percentage'),
('response_time', '245', 'number');

-- Table assignments table
CREATE TABLE IF NOT EXISTS table_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    assigned_office VARCHAR(100) NOT NULL,
    description TEXT,
    assigned_by INT NOT NULL,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Data submissions table
CREATE TABLE IF NOT EXISTS data_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    assigned_office VARCHAR(100) NOT NULL,
    submitted_by INT NOT NULL,
    submission_data JSON,
    record_count INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Update activity_logs table to include details column
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS details TEXT;

-- Drafts table for saving draft data
CREATE TABLE IF NOT EXISTS drafts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(255) NOT NULL,
    data JSON,
    user_email VARCHAR(255) NOT NULL,
    office VARCHAR(100) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_office ON users(office);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_table_assignments_office ON table_assignments(assigned_office);
CREATE INDEX IF NOT EXISTS idx_table_assignments_status ON table_assignments(status);
CREATE INDEX IF NOT EXISTS idx_data_submissions_office ON data_submissions(assigned_office);
CREATE INDEX IF NOT EXISTS idx_data_submissions_status ON data_submissions(status);
