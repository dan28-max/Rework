-- ============================================
-- RESET AUTO_INCREMENT TO 1
-- ⚠️ WARNING: This will DELETE ALL DATA!
-- Only use this for development/testing
-- ============================================

USE spartan_data;

-- ============================================
-- BACKUP REMINDER
-- ============================================
-- STOP! Have you backed up your database?
-- Go to phpMyAdmin > Export > Go
-- ============================================

-- ============================================
-- Option 1: TRUNCATE (Deletes data, resets to 1)
-- ============================================

-- System Tables (Be careful with users table!)
-- TRUNCATE TABLE users;  -- Uncomment to delete all users
TRUNCATE TABLE user_sessions;
TRUNCATE TABLE system_settings;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE dashboard_stats;
TRUNCATE TABLE table_assignments;
TRUNCATE TABLE data_submissions;
TRUNCATE TABLE drafts;
TRUNCATE TABLE report_submissions;
TRUNCATE TABLE report_submission_data;

-- Report Tables
TRUNCATE TABLE campuspopulation;
TRUNCATE TABLE admissiondata;
TRUNCATE TABLE enrollmentdata;
TRUNCATE TABLE graduatesdata;
TRUNCATE TABLE employee;
TRUNCATE TABLE leaveprivilege;
TRUNCATE TABLE libraryvisitor;
TRUNCATE TABLE pwd;
TRUNCATE TABLE waterconsumption;
TRUNCATE TABLE treatedwastewater;
TRUNCATE TABLE electricityconsumption;
TRUNCATE TABLE solidwaste;
TRUNCATE TABLE foodwaste;
TRUNCATE TABLE fuelconsumption;
TRUNCATE TABLE distancetraveled;
TRUNCATE TABLE budgetexpenditure;
TRUNCATE TABLE flightaccommodation;

-- ============================================
-- Option 2: Reset counter without deleting
-- (Not recommended - may cause ID conflicts)
-- ============================================

-- Uncomment these if you want to keep data but reset counter
-- ALTER TABLE users AUTO_INCREMENT = 1;
-- ALTER TABLE campuspopulation AUTO_INCREMENT = 1;
-- etc...

-- ============================================
-- Verify
-- ============================================

-- Check current AUTO_INCREMENT values
SELECT 
    TABLE_NAME,
    AUTO_INCREMENT
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = 'spartan_data'
    AND TABLE_NAME IN (
        'users', 'campuspopulation', 'admissiondata', 
        'enrollmentdata', 'graduatesdata'
    );

-- ============================================
-- Re-insert default users (if you truncated users table)
-- ============================================

-- Uncomment if you deleted users
-- INSERT INTO users (email, password, name, role, campus, status) VALUES 
-- ('superadmin@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin', 'super_admin', 'All Campuses', 'active'),
-- ('admin.lipa@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lipa Admin', 'admin', 'Lipa', 'active'),
-- ('registrar.pablo_borbon@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Registrar User', 'user', 'Pablo Borbon', 'active');

-- Default password for all: password
