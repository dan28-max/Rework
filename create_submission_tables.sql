-- Create database tables for report submissions
USE spartan_data;

-- Create report_submissions table
CREATE TABLE IF NOT EXISTS report_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT 1,
    table_name VARCHAR(100) NOT NULL,
    campus VARCHAR(100) NOT NULL,
    office VARCHAR(100) NOT NULL,
    description TEXT,
    submission_date DATETIME NOT NULL,
    reviewed_date DATETIME NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_table_name (table_name),
    INDEX idx_campus (campus),
    INDEX idx_status (status),
    INDEX idx_submission_date (submission_date)
);

-- Create report_submission_data table
CREATE TABLE IF NOT EXISTS report_submission_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    row_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES report_submissions(id) ON DELETE CASCADE,
    INDEX idx_submission_id (submission_id)
);

-- Verify tables were created
SHOW TABLES LIKE 'report_submission%';

-- Show table structures
DESCRIBE report_submissions;
DESCRIBE report_submission_data;
