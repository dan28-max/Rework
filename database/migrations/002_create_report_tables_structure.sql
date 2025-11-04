-- Migration to create individual report tables
-- This will create a new structure where each report has its own table

-- 1. Create a reports_metadata table to track all report tables
CREATE TABLE IF NOT EXISTS reports_metadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    table_name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 2. Create a procedure to add a new report type
DELIMITER //
CREATE PROCEDURE create_report_table(
    IN p_report_id VARCHAR(50),
    IN p_display_name VARCHAR(255),
    IN p_description TEXT,
    IN p_created_by INT
)
BEGIN
    DECLARE v_table_name VARCHAR(100);
    
    -- Generate a safe table name
    SET v_table_name = CONCAT('report_', LOWER(REGEXP_REPLACE(p_report_id, '[^a-zA-Z0-9_]', '')));
    
    -- Add to metadata
    INSERT INTO reports_metadata (report_id, table_name, display_name, description, created_by)
    VALUES (p_report_id, v_table_name, p_display_name, p_description, p_created_by)
    ON DUPLICATE KEY UPDATE 
        display_name = VALUES(display_name),
        description = VALUES(description),
        updated_at = CURRENT_TIMESTAMP;
    
    -- Create the table with common fields
    SET @sql = CONCAT('CREATE TABLE IF NOT EXISTS `', v_table_name, '` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        submission_id INT NOT NULL,
        submitted_by INT NOT NULL,
        office_id INT NOT NULL,
        status ENUM("draft", "submitted", "approved", "rejected") DEFAULT "draft",
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP NULL,
        reviewed_by INT NULL,
        reviewed_at TIMESTAMP NULL,
        review_notes TEXT,
        FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- Return the table name
    SELECT v_table_name AS new_table_name;
END //
DELIMITER ;

-- 3. Create a view to list all reports with their metadata
CREATE OR REPLACE VIEW vw_reports_list AS
SELECT 
    rm.id,
    rm.report_id,
    rm.table_name,
    rm.display_name,
    rm.description,
    rm.is_active,
    rm.created_at,
    rm.updated_at,
    u.name AS created_by_name,
    u.email AS created_by_email,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = DATABASE() AND table_name = rm.table_name) > 0 AS table_exists
FROM reports_metadata rm
LEFT JOIN users u ON rm.created_by = u.id
ORDER BY rm.display_name;

-- 4. Create a procedure to add columns to a report table
DELIMITER //
CREATE PROCEDURE add_report_column(
    IN p_table_name VARCHAR(100),
    IN p_column_name VARCHAR(100),
    IN p_data_type VARCHAR(50),
    IN p_is_required BOOLEAN,
    IN p_default_value VARCHAR(255),
    IN p_description TEXT
)
BEGIN
    DECLARE v_sql TEXT;
    
    -- Build the ALTER TABLE statement
    SET v_sql = CONCAT('ALTER TABLE `', p_table_name, '` ADD COLUMN `', p_column_name, '` ', p_data_type);
    
    -- Add NOT NULL if required
    IF p_is_required THEN
        SET v_sql = CONCAT(v_sql, ' NOT NULL');
    END IF;
    
    -- Add default value if provided
    IF p_default_value IS NOT NULL THEN
        SET v_sql = CONCAT(v_sql, ' DEFAULT "', p_default_value, '"');
    END IF;
    
    -- Execute the statement
    SET @sql = v_sql;
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SELECT 'Column added successfully' AS message;
END //
DELIMITER ;

-- 5. Create a procedure to get report data with pagination
DELIMITER //
CREATE PROCEDURE get_report_data(
    IN p_table_name VARCHAR(100),
    IN p_page INT,
    IN p_page_size INT
)
BEGIN
    DECLARE v_offset INT;
    SET v_offset = (p_page - 1) * p_page_size;
    
    -- Get paginated data
    SET @sql = CONCAT('SELECT * FROM `', p_table_name, '` LIMIT ', v_offset, ', ', p_page_size);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- Get total count for pagination
    SET @count_sql = CONCAT('SELECT COUNT(*) AS total FROM `', p_table_name, '`');
    PREPARE count_stmt FROM @count_sql;
    EXECUTE count_stmt;
    DEALLOCATE PREPARE count_stmt;
END //
DELIMITER ;

-- 6. Create a procedure to submit report data
DELIMITER //
CREATE PROCEDURE submit_report_data(
    IN p_table_name VARCHAR(100),
    IN p_data JSON,
    IN p_submitted_by INT,
    IN p_office_id INT
)
BEGIN
    DECLARE v_columns TEXT;
    DECLARE v_values TEXT;
    DECLARE v_column_name VARCHAR(100);
    DECLARE i INT DEFAULT 0;
    DECLARE col_count INT;
    
    -- Start building the INSERT statement
    SET v_columns = 'submitted_by, office_id, created_at, updated_at, submitted_at, status';
    SET v_values = CONCAT(p_submitted_by, ', ', p_office_id, ', NOW(), NOW(), NOW(), "submitted"');
    
    -- Process each column from the JSON data
    SET col_count = JSON_LENGTH(p_data);
    
    WHILE i < col_count DO
        SET v_column_name = JSON_UNQUOTE(JSON_KEYS(p_data)[i]);
        SET v_column_value = JSON_UNQUOTE(JSON_EXTRACT(p_data, CONCAT('$.', v_column_name)));
        
        -- Add to columns and values
        SET v_columns = CONCAT(v_columns, ', `', v_column_name, '`');
        SET v_values = CONCAT(v_values, ', "', REPLACE(v_column_value, '"', '\\"'), '"');
        
        SET i = i + 1;
    END WHILE;
    
    -- Build and execute the final INSERT statement
    SET @insert_sql = CONCAT('INSERT INTO `', p_table_name, '` (', v_columns, ') VALUES (', v_values, ')');
    
    PREPARE stmt FROM @insert_sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- Return the ID of the inserted record
    SELECT LAST_INSERT_ID() AS new_record_id;
END //
DELIMITER ;

-- 7. Create a procedure to update report data status
DELIMITER //
CREATE PROCEDURE update_report_status(
    IN p_table_name VARCHAR(100),
    IN p_record_id INT,
    IN p_status VARCHAR(20),
    IN p_reviewed_by INT,
    IN p_review_notes TEXT
)
BEGIN
    SET @sql = CONCAT('UPDATE `', p_table_name, '` 
                      SET status = "', p_status, '",
                          reviewed_by = ', p_reviewed_by, ',
                          reviewed_at = NOW(),
                          review_notes = "', p_review_notes, '",
                          updated_at = NOW()
                      WHERE id = ', p_record_id);
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    SELECT ROW_COUNT() AS affected_rows;
END //
DELIMITER ;

-- 8. Create a procedure to delete a report type
DELIMITER //
CREATE PROCEDURE delete_report_type(
    IN p_report_id VARCHAR(50),
    IN p_delete_data BOOLEAN
)
BEGIN
    DECLARE v_table_name VARCHAR(100);
    
    -- Get the table name
    SELECT table_name INTO v_table_name 
    FROM reports_metadata 
    WHERE report_id = p_report_id
    LIMIT 1;
    
    -- Delete the metadata
    DELETE FROM reports_metadata WHERE report_id = p_report_id;
    
    -- Delete the table if requested and it exists
    IF p_delete_data AND v_table_name IS NOT NULL THEN
        SET @sql = CONCAT('DROP TABLE IF EXISTS `', v_table_name, '`');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
    
    SELECT ROW_COUNT() AS affected_rows;
END //
DELIMITER ;

-- 9. Create a procedure to get report schema
DELIMITER //
CREATE PROCEDURE get_report_schema(IN p_table_name VARCHAR(100))
BEGIN
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_COMMENT
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = p_table_name
    ORDER BY ORDINAL_POSITION;
END //
DELIMITER ;

-- 10. Create a procedure to get report statistics
DELIMITER //
CREATE PROCEDURE get_report_statistics(IN p_table_name VARCHAR(100))
BEGIN
    -- Get record count by status
    SET @sql = CONCAT('SELECT 
        status,
        COUNT(*) AS record_count,
        MIN(created_at) AS first_submission,
        MAX(created_at) AS last_submission
    FROM `', p_table_name, '`
    GROUP BY status');
    
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //
DELIMITER ;
