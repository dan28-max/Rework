-- Add Test Users with Different Campus Assignments
USE spartan_data;

-- Update existing admin user to have a specific campus
UPDATE users SET campus = 'Alangilan', role = 'super_admin' WHERE id = 1;

-- Insert test admins for different campuses
INSERT INTO users (email, password, name, role, campus, office, status) VALUES
('admin.lipa@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lipa Campus Admin', 'admin', 'Lipa', 'Admin Office', 'active'),
('admin.nasugbu@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nasugbu Campus Admin', 'admin', 'Nasugbu', 'Admin Office', 'active'),
('admin.balayan@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Balayan Campus Admin', 'admin', 'Balayan', 'Admin Office', 'active'),
('admin.malvar@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Malvar Campus Admin', 'admin', 'Malvar', 'Admin Office', 'active'),
('admin.alangilan@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alangilan Campus Admin', 'admin', 'Alangilan', 'Admin Office', 'active')
ON DUPLICATE KEY UPDATE campus = VALUES(campus), role = VALUES(role);

-- Insert test users for different campuses
INSERT INTO users (email, password, name, role, campus, office, status) VALUES
('user.lipa@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lipa User', 'user', 'Lipa', 'Health Services', 'active'),
('user.nasugbu@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nasugbu User', 'user', 'Nasugbu', 'EMU', 'active'),
('user.balayan@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Balayan User', 'user', 'Balayan', 'Registrar', 'active'),
('user.malvar@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Malvar User', 'user', 'Malvar', 'HRMO', 'active'),
('user.alangilan@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alangilan User', 'user', 'Alangilan', 'Library', 'active')
ON DUPLICATE KEY UPDATE campus = VALUES(campus), office = VALUES(office);

-- Note: Default password for all test accounts is 'password'

SELECT 'Test users with campus assignments created successfully!' as message;
SELECT 'Login credentials:' as info;
SELECT 'Super Admin: admin@batstate-u.edu.ph / password' as credentials;
SELECT 'Lipa Admin: admin.lipa@batstate-u.edu.ph / password' as credentials;
SELECT 'Nasugbu Admin: admin.nasugbu@batstate-u.edu.ph / password' as credentials;
