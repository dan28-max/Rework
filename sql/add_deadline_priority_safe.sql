-- Safe migration: Add deadline and priority fields to table_assignments
-- This script checks if columns exist before adding them

-- First, let's check what we have and add only missing columns

-- Add has_deadline if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'table_assignments' 
AND COLUMN_NAME = 'has_deadline';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE table_assignments ADD COLUMN has_deadline TINYINT(1) DEFAULT 0 AFTER deadline',
    'SELECT "Column has_deadline already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add priority if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'table_assignments' 
AND COLUMN_NAME = 'priority';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE table_assignments ADD COLUMN priority ENUM(\'low\', \'medium\', \'high\', \'urgent\') DEFAULT \'medium\' AFTER has_deadline',
    'SELECT "Column priority already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add notes if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'table_assignments' 
AND COLUMN_NAME = 'notes';

SET @query = IF(@col_exists = 0, 
    'ALTER TABLE table_assignments ADD COLUMN notes TEXT NULL AFTER priority',
    'SELECT "Column notes already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create indexes if they don't exist
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'table_assignments' 
AND INDEX_NAME = 'idx_deadline';

SET @query = IF(@index_exists = 0, 
    'CREATE INDEX idx_deadline ON table_assignments(deadline)',
    'SELECT "Index idx_deadline already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'table_assignments' 
AND INDEX_NAME = 'idx_priority';

SET @query = IF(@index_exists = 0, 
    'CREATE INDEX idx_priority ON table_assignments(priority)',
    'SELECT "Index idx_priority already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'table_assignments' 
AND INDEX_NAME = 'idx_has_deadline';

SET @query = IF(@index_exists = 0, 
    'CREATE INDEX idx_has_deadline ON table_assignments(has_deadline)',
    'SELECT "Index idx_has_deadline already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing records to have default values
UPDATE table_assignments 
SET has_deadline = 0 
WHERE has_deadline IS NULL;

UPDATE table_assignments 
SET priority = 'medium' 
WHERE priority IS NULL;

-- Show final table structure
SHOW COLUMNS FROM table_assignments;
