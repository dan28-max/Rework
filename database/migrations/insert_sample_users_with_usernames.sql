-- Insert sample users with professional usernames
-- Run this AFTER running add_username_field.sql

USE spartan_data;

-- Clear existing users (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE user_sessions;
-- DELETE FROM users;

-- Insert Super Admin
INSERT INTO users (username, email, password, name, role, campus, office, status) VALUES 
('superadmin', 'superadmin@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Administrator', 'super_admin', 'All Campuses', NULL, 'active')
ON DUPLICATE KEY UPDATE username = 'superadmin';

-- Insert Campus Admins
INSERT INTO users (username, email, password, name, role, campus, office, status) VALUES 
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
('admin-nasugbo', 'admin.nasugbo@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nasugbo Campus Admin', 'admin', 'Nasugbo', NULL, 'active')
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- Insert Office Users (format: office-campus)
INSERT INTO users (username, email, password, name, role, campus, office, status) VALUES 
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
('research-nasugbo', 'research.nasugbo@spartandata.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Research Office - Nasugbo', 'user', 'Nasugbo', 'Research', 'active')
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- Note: Default password for all accounts is 'password' (hashed)
-- Super Admin: superadmin / superadmin123
-- Campus Admins: admin123
-- Office Users: office123

SELECT 'Sample users with professional usernames inserted successfully!' AS status;
SELECT COUNT(*) as total_users FROM users;
