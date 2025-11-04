-- ============================================
-- COMPLETE USERNAME MIGRATION
-- Run this single file to migrate to username-based login
-- ============================================

USE spartan_data;

-- ============================================
-- STEP 1: Add username column
-- ============================================
ALTER TABLE users 
ADD COLUMN username VARCHAR(100) UNIQUE NOT NULL AFTER id;

-- ============================================
-- STEP 2: Update existing users with usernames
-- ============================================

-- Super Admin
UPDATE users SET username = 'superadmin' WHERE email = 'superadmin@spartandata.com';

-- Campus Admins
UPDATE users SET username = 'admin-lipa' WHERE email = 'admin.lipa@spartandata.com';
UPDATE users SET username = 'admin-pablo-borbon' WHERE email = 'admin.pablo_borbon@spartandata.com';
UPDATE users SET username = 'admin-alangilan' WHERE email = 'admin.alangilan@spartandata.com';
UPDATE users SET username = 'admin-rosario' WHERE email = 'admin.rosario@spartandata.com';
UPDATE users SET username = 'admin-san-juan' WHERE email = 'admin.san_juan@spartandata.com';
UPDATE users SET username = 'admin-lemery' WHERE email = 'admin.lemery@spartandata.com';
UPDATE users SET username = 'admin-lobo' WHERE email = 'admin.lobo@spartandata.com';
UPDATE users SET username = 'admin-balayan' WHERE email = 'admin.balayan@spartandata.com';
UPDATE users SET username = 'admin-mabini' WHERE email = 'admin.mabini@spartandata.com';
UPDATE users SET username = 'admin-malvar' WHERE email = 'admin.malvar@spartandata.com';
UPDATE users SET username = 'admin-nasugbo' WHERE email = 'admin.nasugbo@spartandata.com';

-- Office Users
UPDATE users SET username = 'emu-lipa-sdo' WHERE email = 'emu.lipa@spartandata.com';
UPDATE users SET username = 'emu-san-juan' WHERE email = 'emu.san_juan@spartandata.com';
UPDATE users SET username = 'registrar-pablo-borbon' WHERE email = 'registrar.pablo_borbon@spartandata.com';
UPDATE users SET username = 'registrar-lipa' WHERE email = 'registrar.lipa@spartandata.com';
UPDATE users SET username = 'hrmo-alangilan' WHERE email = 'hrmo.alangilan@spartandata.com';
UPDATE users SET username = 'accounting-rosario' WHERE email = 'accounting.rosario@spartandata.com';
UPDATE users SET username = 'library-lemery' WHERE email = 'library.lemery@spartandata.com';
UPDATE users SET username = 'guidance-lobo' WHERE email = 'guidance.lobo@spartandata.com';
UPDATE users SET username = 'cashier-balayan' WHERE email = 'cashier.balayan@spartandata.com';
UPDATE users SET username = 'supply-mabini' WHERE email = 'supply.mabini@spartandata.com';
UPDATE users SET username = 'ict-malvar' WHERE email = 'ict.malvar@spartandata.com';
UPDATE users SET username = 'research-nasugbo' WHERE email = 'research.nasugbo@spartandata.com';

-- ============================================
-- STEP 3: Add index for faster lookups
-- ============================================
CREATE INDEX idx_username ON users(username);

-- ============================================
-- STEP 4: Update session table
-- ============================================
ALTER TABLE user_sessions 
ADD COLUMN username VARCHAR(100) AFTER user_id;

-- Populate username in existing sessions
UPDATE user_sessions us
JOIN users u ON us.user_id = u.id
SET us.username = u.username;

-- ============================================
-- STEP 5: Make email optional for login
-- ============================================
ALTER TABLE users 
MODIFY COLUMN email VARCHAR(255) NULL COMMENT 'Email address (optional for login, username is primary)';

-- ============================================
-- STEP 6: Insert sample users if they don't exist
-- ============================================

-- Super Admin
INSERT IGNORE INTO users (username, email, password, name, role, campus, office, status) VALUES 
('superadmin', 'superadmin@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Administrator', 'super_admin', 'All Campuses', NULL, 'active');

-- Campus Admins
INSERT IGNORE INTO users (username, email, password, name, role, campus, office, status) VALUES 
('admin-lipa', 'admin.lipa@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lipa Campus Admin', 'admin', 'Lipa', NULL, 'active'),
('admin-pablo-borbon', 'admin.pablo_borbon@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pablo Borbon Campus Admin', 'admin', 'Pablo Borbon', NULL, 'active'),
('admin-alangilan', 'admin.alangilan@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alangilan Campus Admin', 'admin', 'Alangilan', NULL, 'active'),
('admin-rosario', 'admin.rosario@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rosario Campus Admin', 'admin', 'Rosario', NULL, 'active'),
('admin-san-juan', 'admin.san_juan@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'San Juan Campus Admin', 'admin', 'San Juan', NULL, 'active'),
('admin-lemery', 'admin.lemery@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lemery Campus Admin', 'admin', 'Lemery', NULL, 'active'),
('admin-lobo', 'admin.lobo@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lobo Campus Admin', 'admin', 'Lobo', NULL, 'active'),
('admin-balayan', 'admin.balayan@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Balayan Campus Admin', 'admin', 'Balayan', NULL, 'active'),
('admin-mabini', 'admin.mabini@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mabini Campus Admin', 'admin', 'Mabini', NULL, 'active'),
('admin-malvar', 'admin.malvar@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Malvar Campus Admin', 'admin', 'Malvar', NULL, 'active'),
('admin-nasugbo', 'admin.nasugbo@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nasugbo Campus Admin', 'admin', 'Nasugbo', NULL, 'active');

-- Office Users
INSERT IGNORE INTO users (username, email, password, name, role, campus, office, status) VALUES 
('emu-lipa-sdo', 'emu.lipa@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMU Office - Lipa SDO', 'user', 'Lipa', 'EMU', 'active'),
('emu-san-juan', 'emu.san_juan@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMU Office - San Juan', 'user', 'San Juan', 'EMU', 'active'),
('registrar-pablo-borbon', 'registrar.pablo_borbon@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Registrar Office - Pablo Borbon', 'user', 'Pablo Borbon', 'Registrar', 'active'),
('registrar-lipa', 'registrar.lipa@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Registrar Office - Lipa', 'user', 'Lipa', 'Registrar', 'active'),
('hrmo-alangilan', 'hrmo.alangilan@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HRMO Office - Alangilan', 'user', 'Alangilan', 'HRMO', 'active'),
('accounting-rosario', 'accounting.rosario@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Accounting Office - Rosario', 'user', 'Rosario', 'Accounting', 'active'),
('library-lemery', 'library.lemery@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Library Office - Lemery', 'user', 'Lemery', 'Library', 'active'),
('guidance-lobo', 'guidance.lobo@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Guidance Office - Lobo', 'user', 'Lobo', 'Guidance', 'active'),
('cashier-balayan', 'cashier.balayan@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cashier Office - Balayan', 'user', 'Balayan', 'Cashier', 'active'),
('supply-mabini', 'supply.mabini@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supply Office - Mabini', 'user', 'Mabini', 'Supply', 'active'),
('ict-malvar', 'ict.malvar@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ICT Office - Malvar', 'user', 'Malvar', 'ICT', 'active'),
('research-nasugbo', 'research.nasugbo@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Research Office - Nasugbo', 'user', 'Nasugbo', 'Research', 'active');

-- ============================================
-- VERIFICATION
-- ============================================
SELECT '✅ Migration completed successfully!' AS status;
SELECT '' AS '';
SELECT 'Total users in system:' AS info, COUNT(*) as count FROM users;
SELECT '' AS '';
SELECT 'Sample login credentials:' AS info;
SELECT '  Super Admin: superadmin / superadmin123' AS credentials
UNION ALL SELECT '  Campus Admin: admin-lipa / admin123'
UNION ALL SELECT '  Office User: emu-lipa-sdo / office123';
SELECT '' AS '';
SELECT 'Username format examples:' AS info;
SELECT username, role, campus, office FROM users ORDER BY role, campus LIMIT 10;
