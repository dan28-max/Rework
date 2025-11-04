-- Create All Missing Report Tables with Correct Column Names
USE spartan_data;

-- 1. Admission Data Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Enrollment Data Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Graduates Data Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Employee Data Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Leave Privilege Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Library Visitor Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Water Consumption Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Treated Wastewater Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Electricity Consumption Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Solid Waste Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Campus Population Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Food Waste Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Fuel Consumption Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Distance Traveled Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Budget Expenditure Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Flight Accommodation Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campus (campus),
    INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Success message
SELECT 'All report tables created successfully!' as message;
