-- Create All Report Data Tables
-- Run this SQL to create all report tables in the database

USE spartan_data;

-- 1. Campus Population Table
CREATE TABLE IF NOT EXISTS campuspopulation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL,
    students INT DEFAULT 0,
    is_students INT DEFAULT 0,
    employees INT DEFAULT 0,
    canteen INT DEFAULT 0,
    construction INT DEFAULT 0,
    total INT DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Admission Data Table
CREATE TABLE IF NOT EXISTS admissiondata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    semester VARCHAR(50),
    academic_year VARCHAR(20),
    category VARCHAR(100),
    program VARCHAR(200),
    male INT DEFAULT 0,
    female INT DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Enrollment Data Table
CREATE TABLE IF NOT EXISTS enrollmentdata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20),
    semester VARCHAR(50),
    college VARCHAR(200),
    graduate_undergrad VARCHAR(50),
    program_course VARCHAR(200),
    male INT DEFAULT 0,
    female INT DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Graduates Data Table
CREATE TABLE IF NOT EXISTS graduatesdata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20),
    semester VARCHAR(50),
    degree_level VARCHAR(100),
    subject_area VARCHAR(200),
    course VARCHAR(200),
    category VARCHAR(200),
    male INT DEFAULT 0,
    female INT DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Employee Data Table
CREATE TABLE IF NOT EXISTS employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    date_generated DATE,
    category VARCHAR(100),
    faculty_rank VARCHAR(100),
    sex VARCHAR(20),
    status VARCHAR(50),
    date_hired DATE,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Leave Privilege Table
CREATE TABLE IF NOT EXISTS leaveprivilege (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    leave_type VARCHAR(100),
    employee_name VARCHAR(255),
    duration_days INT DEFAULT 0,
    equivalent_pay DECIMAL(10,2) DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Library Visitor Table
CREATE TABLE IF NOT EXISTS libraryvisitor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    visit_date DATE,
    category VARCHAR(100),
    sex VARCHAR(20),
    total_visitors INT DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. PWD Data Table
CREATE TABLE IF NOT EXISTS pwd (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    year VARCHAR(10),
    no_of_pwd_students INT DEFAULT 0,
    no_of_pwd_employees INT DEFAULT 0,
    type_of_disability VARCHAR(200),
    sex VARCHAR(20),
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Water Consumption Table
CREATE TABLE IF NOT EXISTS waterconsumption (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    date DATE,
    category VARCHAR(100),
    prev_reading DECIMAL(10,2) DEFAULT 0,
    current_reading DECIMAL(10,2) DEFAULT 0,
    quantity_m3 DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    price_per_m3 DECIMAL(10,2) DEFAULT 0,
    month VARCHAR(20),
    year VARCHAR(10),
    remarks TEXT,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Treated Wastewater Table
CREATE TABLE IF NOT EXISTS treatedwastewater (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    date DATE,
    treated_volume DECIMAL(10,2) DEFAULT 0,
    reused_volume DECIMAL(10,2) DEFAULT 0,
    effluent_volume DECIMAL(10,2) DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Electricity Consumption Table
CREATE TABLE IF NOT EXISTS electricityconsumption (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    month VARCHAR(20),
    year VARCHAR(10),
    prev_reading DECIMAL(10,2) DEFAULT 0,
    current_reading DECIMAL(10,2) DEFAULT 0,
    actual_consumption DECIMAL(10,2) DEFAULT 0,
    multiplier DECIMAL(10,2) DEFAULT 1,
    total_consumption DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    price_per_kwh DECIMAL(10,2) DEFAULT 0,
    remarks TEXT,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Solid Waste Table
CREATE TABLE IF NOT EXISTS solidwaste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    month VARCHAR(20),
    year VARCHAR(10),
    waste_type VARCHAR(100),
    quantity DECIMAL(10,2) DEFAULT 0,
    remarks TEXT,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Food Waste Table
CREATE TABLE IF NOT EXISTS foodwaste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    date DATE,
    quantity_kg DECIMAL(10,2) DEFAULT 0,
    remarks TEXT,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Fuel Consumption Table
CREATE TABLE IF NOT EXISTS fuelconsumption (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    date DATE,
    driver VARCHAR(255),
    vehicle VARCHAR(100),
    plate_no VARCHAR(50),
    fuel_type VARCHAR(50),
    description TEXT,
    transaction_no VARCHAR(100),
    odometer DECIMAL(10,2) DEFAULT 0,
    qty DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Distance Traveled Table
CREATE TABLE IF NOT EXISTS distancetraveled (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    travel_date DATE,
    plate_no VARCHAR(50),
    vehicle VARCHAR(100),
    fuel_type VARCHAR(50),
    start_mileage DECIMAL(10,2) DEFAULT 0,
    end_mileage DECIMAL(10,2) DEFAULT 0,
    total_km DECIMAL(10,2) DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Budget Expenditure Table
CREATE TABLE IF NOT EXISTS budgetexpenditure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    year VARCHAR(10),
    particulars TEXT,
    category VARCHAR(200),
    budget_allocation DECIMAL(15,2) DEFAULT 0,
    actual_expenditure DECIMAL(15,2) DEFAULT 0,
    utilization_rate DECIMAL(5,2) DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Flight Accommodation Table
CREATE TABLE IF NOT EXISTS flightaccommodation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    department VARCHAR(200),
    year VARCHAR(10),
    traveler VARCHAR(255),
    purpose TEXT,
    from_location VARCHAR(200),
    to_location VARCHAR(200),
    country VARCHAR(100),
    type VARCHAR(50),
    rooms INT DEFAULT 0,
    nights INT DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_campus ON campuspopulation(campus);
CREATE INDEX idx_campus ON admissiondata(campus);
CREATE INDEX idx_campus ON enrollmentdata(campus);
CREATE INDEX idx_campus ON graduatesdata(campus);
CREATE INDEX idx_campus ON employee(campus);
CREATE INDEX idx_campus ON leaveprivilege(campus);
CREATE INDEX idx_campus ON libraryvisitor(campus);
CREATE INDEX idx_campus ON pwd(campus);
CREATE INDEX idx_campus ON waterconsumption(campus);
CREATE INDEX idx_campus ON treatedwastewater(campus);
CREATE INDEX idx_campus ON electricityconsumption(campus);
CREATE INDEX idx_campus ON solidwaste(campus);
CREATE INDEX idx_campus ON foodwaste(campus);
CREATE INDEX idx_campus ON fuelconsumption(campus);
CREATE INDEX idx_campus ON distancetraveled(campus);
CREATE INDEX idx_campus ON budgetexpenditure(campus);
CREATE INDEX idx_campus ON flightaccommodation(campus);

-- Create indexes on batch_id for tracking
CREATE INDEX idx_batch ON campuspopulation(batch_id);
CREATE INDEX idx_batch ON admissiondata(batch_id);
CREATE INDEX idx_batch ON enrollmentdata(batch_id);
CREATE INDEX idx_batch ON graduatesdata(batch_id);
CREATE INDEX idx_batch ON employee(batch_id);
CREATE INDEX idx_batch ON leaveprivilege(batch_id);
CREATE INDEX idx_batch ON libraryvisitor(batch_id);
CREATE INDEX idx_batch ON pwd(batch_id);
CREATE INDEX idx_batch ON waterconsumption(batch_id);
CREATE INDEX idx_batch ON treatedwastewater(batch_id);
CREATE INDEX idx_batch ON electricityconsumption(batch_id);
CREATE INDEX idx_batch ON solidwaste(batch_id);
CREATE INDEX idx_batch ON foodwaste(batch_id);
CREATE INDEX idx_batch ON fuelconsumption(batch_id);
CREATE INDEX idx_batch ON distancetraveled(batch_id);
CREATE INDEX idx_batch ON budgetexpenditure(batch_id);
CREATE INDEX idx_batch ON flightaccommodation(batch_id);

-- Insert sample data for Campus Population (for testing)
INSERT INTO campuspopulation (campus, year, students, is_students, employees, canteen, construction, total, batch_id, submitted_by) VALUES
('Alangilan', '2025', 10, 10, 10, 10, 10, 50, 'batch_68a0be2987999', 'perezdandainiel@gmail.com'),
('Pablo Borbon', '2025', 15, 12, 8, 5, 3, 43, 'batch_68a0be2987999', 'perezdandainiel@gmail.com'),
('Lipa', '2025', 20, 18, 12, 7, 5, 62, 'batch_68a0be2987999', 'perezdandainiel@gmail.com');

-- Success message
SELECT 'All report tables created successfully!' as message;
