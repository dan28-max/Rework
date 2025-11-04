-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    table_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default reports
INSERT INTO reports (report_id, name, description, table_name) VALUES
('admissiondata', 'Admission Data', 'Student admission records', 'admissiondata'),
('enrollmentdata', 'Enrollment Data', 'Student enrollment statistics', 'enrollmentdata'),
('graduatesdata', 'Graduates Data', 'Graduation records', 'graduatesdata'),
('employee', 'Employee Data', 'Staff and faculty information', 'employee'),
('leaveprivilege', 'Leave Privilege', 'Employee leave records', 'leaveprivilege'),
('libraryvisitor', 'Library Visitor', 'Library usage statistics', 'libraryvisitor'),
('pwd', 'PWD Data', 'Persons with disabilities records', 'pwd'),
('waterconsumption', 'Water Consumption', 'Water usage metrics', 'waterconsumption'),
('electricityconsumption', 'Electricity Consumption', 'Power usage metrics', 'electricityconsumption'),
('solidwaste', 'Solid Waste', 'Waste management data', 'solidwaste');
