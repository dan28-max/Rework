-- Add Professional Users with Different Campus Assignments
USE spartan_data;

-- Update existing admin user to have professional details
UPDATE users SET
    name = 'Dr. Maria Santos',
    email = 'maria.santos@batstate-u.edu.ph',
    campus = 'Alangilan',
    role = 'super_admin',
    office = 'University Administration'
WHERE id = 1;

-- Insert professional admin users for different campuses
INSERT INTO users (email, password, name, role, campus, office, status) VALUES
('admin.lipa@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Engr. Roberto Cruz', 'admin', 'Lipa', 'Campus Administration', 'active'),
('admin.nasugbu@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Elena Martinez', 'admin', 'Nasugbu', 'Campus Administration', 'active'),
('admin.balayan@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Prof. Antonio Reyes', 'admin', 'Balayan', 'Campus Administration', 'active'),
('admin.malvar@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Carmen Garcia', 'admin', 'Malvar', 'Campus Administration', 'active'),
('admin.alangilan@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Engr. Jose Mendoza', 'admin', 'Alangilan', 'Campus Administration', 'active')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    campus = VALUES(campus),
    office = VALUES(office),
    role = VALUES(role);

-- Insert professional users for different campuses with appropriate offices
INSERT INTO users (email, password, name, role, campus, office, status) VALUES
('registrar.lipa@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ms. Patricia Rivera', 'user', 'Lipa', 'Registrar Office', 'active'),
('hrman.nasugbu@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mr. Michael Torres', 'user', 'Nasugbu', 'Human Resource Management Office', 'active'),
('librarian.balayan@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ms. Angelica Santos', 'user', 'Balayan', 'Library Services', 'active'),
('nurse.malvar@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ms. Fatima Cruz', 'user', 'Malvar', 'Health Services', 'active'),
('eng.alangilan@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Engr. Rafael Gonzales', 'user', 'Alangilan', 'Engineering Services', 'active'),
('hr.lipa@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ms. Jennifer Lim', 'user', 'Lipa', 'Human Resource Management Office', 'active'),
('lib.nasugbu@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mr. Eduardo Rodriguez', 'user', 'Nasugbu', 'Library Services', 'active'),
('nurse.balayan@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ms. Lorena Bautista', 'user', 'Balayan', 'Health Services', 'active'),
('budget.malvar@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mr. Dennis Villanueva', 'user', 'Malvar', 'Budget Office', 'active'),
('it.alangilan@batstate-u.edu.ph', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Engr. Carlo Ramirez', 'user', 'Alangilan', 'Information Technology Services', 'active')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    campus = VALUES(campus),
    office = VALUES(office);

-- Note: Default password for all accounts is 'password'

SELECT 'Professional users with campus assignments created successfully!' as message;
SELECT 'Login credentials (Password: password for all):' as info;
SELECT 'Super Admin: maria.santos@batstate-u.edu.ph (Dr. Maria Santos)' as credentials;
SELECT 'Lipa Admin: admin.lipa@batstate-u.edu.ph (Engr. Roberto Cruz)' as credentials;
SELECT 'Nasugbu Admin: admin.nasugbu@batstate-u.edu.ph (Dr. Elena Martinez)' as credentials;
SELECT 'Balayan Admin: admin.balayan@batstate-u.edu.ph (Prof. Antonio Reyes)' as credentials;
SELECT 'Malvar Admin: admin.malvar@batstate-u.edu.ph (Dr. Carmen Garcia)' as credentials;
SELECT 'Alangilan Admin: admin.alangilan@batstate-u.edu.ph (Engr. Jose Mendoza)' as credentials;

SELECT '' as separator;
SELECT 'Lipa Campus Users:' as users;
SELECT 'registrar.lipa@batstate-u.edu.ph (Ms. Patricia Rivera - Registrar)' as credentials;
SELECT 'hr.lipa@batstate-u.edu.ph (Ms. Jennifer Lim - HRMO)' as credentials;

SELECT '' as separator;
SELECT 'Nasugbu Campus Users:' as users;
SELECT 'hrman.nasugbu@batstate-u.edu.ph (Mr. Michael Torres - HRMO)' as credentials;
SELECT 'lib.nasugbu@batstate-u.edu.ph (Mr. Eduardo Rodriguez - Library)' as credentials;

SELECT '' as separator;
SELECT 'Balayan Campus Users:' as users;
SELECT 'librarian.balayan@batstate-u.edu.ph (Ms. Angelica Santos - Library)' as credentials;
SELECT 'nurse.balayan@batstate-u.edu.ph (Ms. Lorena Bautista - Health Services)' as credentials;

SELECT '' as separator;
SELECT 'Malvar Campus Users:' as users;
SELECT 'nurse.malvar@batstate-u.edu.ph (Ms. Fatima Cruz - Health Services)' as credentials;
SELECT 'budget.malvar@batstate-u.edu.ph (Mr. Dennis Villanueva - Budget Office)' as credentials;

SELECT '' as separator;
SELECT 'Alangilan Campus Users:' as users;
SELECT 'eng.alangilan@batstate-u.edu.ph (Engr. Rafael Gonzales - Engineering)' as credentials;
SELECT 'it.alangilan@batstate-u.edu.ph (Engr. Carlo Ramirez - IT Services)' as credentials;
