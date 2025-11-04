-- Create PWD table with correct column names
USE spartan_data;

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

-- Create indexes for better performance
CREATE INDEX idx_campus ON pwd(campus);
CREATE INDEX idx_batch ON pwd(batch_id);

SELECT 'PWD table created successfully!' as message;
