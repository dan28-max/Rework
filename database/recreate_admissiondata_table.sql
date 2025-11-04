-- Drop and Recreate Admission Data Table
-- This script will delete the existing admissiondata table and create a new one

USE spartan_data;

-- Drop the existing table if it exists
DROP TABLE IF EXISTS admissiondata;

-- Create the new Admission Data Table
CREATE TABLE admissiondata (
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

-- Verify the table was created
SELECT 'Admission Data table created successfully!' AS message;
SELECT COUNT(*) AS table_exists FROM information_schema.tables 
WHERE table_schema = 'spartan_data' AND table_name = 'admissiondata';

