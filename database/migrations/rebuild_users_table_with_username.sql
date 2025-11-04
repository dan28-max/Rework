-- ============================================================================
-- MIGRATION: Rebuild Users Table with Username-Based Authentication
-- ============================================================================
-- This migration completely rebuilds the users table to use username as the
-- primary login method instead of email. Email becomes optional.
-- ============================================================================

USE spartan_data;

-- Disable foreign key checks temporarily to allow table rebuild
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 0;

-- Step 1: Backup existing users data to temporary table
-- ============================================================================
DROP TABLE IF EXISTS users_backup;
CREATE TABLE users_backup AS SELECT * FROM users;

SELECT CONCAT('Backed up ', COUNT(*), ' users') AS backup_status FROM users_backup;

-- Step 2: Drop existing users table and recreate with new schema
-- ============================================================================
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL COMMENT 'Primary login identifier',
    email VARCHAR(255) NULL COMMENT 'Optional email address',
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'user') NOT NULL DEFAULT 'user',
    campus VARCHAR(100) NULL COMMENT 'Campus assignment',
    office VARCHAR(100) NULL COMMENT 'Office assignment',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    remember_token VARCHAR(255) NULL,
    email_verified_at TIMESTAMP NULL,
    
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_campus (campus),
    INDEX idx_office (office)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Restore users with proper usernames
-- ============================================================================

-- Super Admin
INSERT INTO users (id, username, email, password, name, role, campus, office, status, created_at, last_login)
SELECT 
    id,
    'superadmin' as username,
    email,
    password,
    name,
    role,
    campus,
    office,
    status,
    created_at,
    last_login
FROM users_backup 
WHERE email = 'superadmin@spartandata.com'
LIMIT 1;

-- Campus Admins
INSERT INTO users (id, username, email, password, name, role, campus, office, status, created_at, last_login)
SELECT 
    id,
    CASE 
        WHEN email = 'admin.lipa@spartandata.com' THEN 'admin-lipa'
        WHEN email = 'admin.pablo_borbon@spartandata.com' THEN 'admin-pablo-borbon'
        WHEN email = 'admin.alangilan@spartandata.com' THEN 'admin-alangilan'
        WHEN email = 'admin.rosario@spartandata.com' THEN 'admin-rosario'
        WHEN email = 'admin.san_juan@spartandata.com' THEN 'admin-san-juan'
        WHEN email = 'admin.lemery@spartandata.com' THEN 'admin-lemery'
        WHEN email = 'admin.lobo@spartandata.com' THEN 'admin-lobo'
        WHEN email = 'admin.balayan@spartandata.com' THEN 'admin-balayan'
        WHEN email = 'admin.mabini@spartandata.com' THEN 'admin-mabini'
        WHEN email = 'admin.malvar@spartandata.com' THEN 'admin-malvar'
        WHEN email = 'admin.nasugbo@spartandata.com' THEN 'admin-nasugbo'
    END as username,
    email,
    password,
    name,
    role,
    campus,
    office,
    status,
    created_at,
    last_login
FROM users_backup 
WHERE email IN (
    'admin.lipa@spartandata.com',
    'admin.pablo_borbon@spartandata.com',
    'admin.alangilan@spartandata.com',
    'admin.rosario@spartandata.com',
    'admin.san_juan@spartandata.com',
    'admin.lemery@spartandata.com',
    'admin.lobo@spartandata.com',
    'admin.balayan@spartandata.com',
    'admin.mabini@spartandata.com',
    'admin.malvar@spartandata.com',
    'admin.nasugbo@spartandata.com'
);

-- Office Users
INSERT INTO users (id, username, email, password, name, role, campus, office, status, created_at, last_login)
SELECT 
    id,
    CASE 
        WHEN email = 'emu.lipa@spartandata.com' THEN 'emu-lipa-sdo'
        WHEN email = 'emu.san_juan@spartandata.com' THEN 'emu-san-juan'
        WHEN email = 'registrar.pablo_borbon@spartandata.com' THEN 'registrar-pablo-borbon'
        WHEN email = 'registrar.lipa@spartandata.com' THEN 'registrar-lipa'
        WHEN email = 'hrmo.alangilan@spartandata.com' THEN 'hrmo-alangilan'
        WHEN email = 'accounting.rosario@spartandata.com' THEN 'accounting-rosario'
        WHEN email = 'library.lemery@spartandata.com' THEN 'library-lemery'
        WHEN email = 'guidance.lobo@spartandata.com' THEN 'guidance-lobo'
        WHEN email = 'cashier.balayan@spartandata.com' THEN 'cashier-balayan'
        WHEN email = 'supply.mabini@spartandata.com' THEN 'supply-mabini'
        WHEN email = 'ict.malvar@spartandata.com' THEN 'ict-malvar'
        WHEN email = 'research.nasugbo@spartandata.com' THEN 'research-nasugbo'
    END as username,
    email,
    password,
    name,
    role,
    campus,
    office,
    status,
    created_at,
    last_login
FROM users_backup 
WHERE email IN (
    'emu.lipa@spartandata.com',
    'emu.san_juan@spartandata.com',
    'registrar.pablo_borbon@spartandata.com',
    'registrar.lipa@spartandata.com',
    'hrmo.alangilan@spartandata.com',
    'accounting.rosario@spartandata.com',
    'library.lemery@spartandata.com',
    'guidance.lobo@spartandata.com',
    'cashier.balayan@spartandata.com',
    'supply.mabini@spartandata.com',
    'ict.malvar@spartandata.com',
    'research.nasugbo@spartandata.com'
);

-- Handle any remaining users not covered by explicit mappings
INSERT INTO users (id, username, email, password, name, role, campus, office, status, created_at, last_login)
SELECT 
    id,
    CONCAT('user_', id) as username,
    email,
    password,
    name,
    role,
    campus,
    office,
    status,
    created_at,
    last_login
FROM users_backup 
WHERE id NOT IN (SELECT id FROM users);

-- Step 4: Reset AUTO_INCREMENT to continue from last ID
-- ============================================================================
SET @max_id = (SELECT IFNULL(MAX(id), 0) FROM users);
SET @sql = CONCAT('ALTER TABLE users AUTO_INCREMENT = ', @max_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Update user_sessions table to include username
-- ============================================================================
-- Add username column if it doesn't exist
SET @col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user_sessions'
      AND COLUMN_NAME = 'username'
);

SET @sql_add_col := IF(@col_exists = 0,
    'ALTER TABLE user_sessions ADD COLUMN username VARCHAR(100) NULL AFTER user_id',
    'SELECT "user_sessions.username already exists" AS info'
);
PREPARE stmt FROM @sql_add_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Populate username in existing sessions
UPDATE user_sessions us
JOIN users u ON us.user_id = u.id
SET us.username = u.username;

-- Step 6: Update related tables that reference users
-- ============================================================================

-- Update drafts table to use username instead of user_email
ALTER TABLE drafts 
MODIFY COLUMN user_email VARCHAR(255) NULL COMMENT 'Deprecated - use created_by instead';

-- Step 7: Verification and Summary
-- ============================================================================
SELECT '========================================' AS '';
SELECT 'MIGRATION COMPLETED SUCCESSFULLY' AS status;
SELECT '========================================' AS '';
SELECT '' AS '';

SELECT 'Users migrated:' AS summary, COUNT(*) AS count FROM users;
SELECT 'Super admins:' AS summary, COUNT(*) AS count FROM users WHERE role = 'super_admin';
SELECT 'Campus admins:' AS summary, COUNT(*) AS count FROM users WHERE role = 'admin';
SELECT 'Office users:' AS summary, COUNT(*) AS count FROM users WHERE role = 'user';
SELECT '' AS '';

SELECT 'Sample usernames:' AS info;
SELECT id, username, email, role, campus, office FROM users ORDER BY role DESC, id LIMIT 10;

SELECT '' AS '';
SELECT '========================================' AS '';
SELECT 'IMPORTANT: Update your login forms to use USERNAME instead of EMAIL' AS notice;
SELECT 'Backend: api/simple_auth.php already uses username' AS notice;
SELECT 'Frontend: login.html already uses username field' AS notice;
SELECT '========================================' AS '';

-- Re-enable foreign key checks
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- Optional: Drop backup table after verification (comment out if you want to keep it)
-- DROP TABLE IF EXISTS users_backup;
