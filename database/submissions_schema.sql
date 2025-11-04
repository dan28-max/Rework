-- Database schema for report submissions system

-- Table to store report submissions
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

-- Table to store the actual data rows for each submission
CREATE TABLE IF NOT EXISTS report_submission_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    row_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES report_submissions(id) ON DELETE CASCADE,
    INDEX idx_submission_id (submission_id)
);

-- Add some sample data for testing (optional)
-- INSERT INTO report_submissions (user_id, table_name, campus, office, description, submission_date, status) 
-- VALUES (2, 'admissiondata', 'Alangilan', 'Registrar Office', 'Monthly admission data for January 2024', NOW(), 'pending');
