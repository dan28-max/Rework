-- Check and add missing columns to table_assignments
-- Run this in phpMyAdmin

-- First, let's see what columns currently exist
SELECT 'Current table structure:' AS Info;
SHOW COLUMNS FROM table_assignments;

-- Add has_deadline column (if it doesn't exist)
-- If you get an error "Duplicate column name", that's OK - it means it already exists
ALTER TABLE table_assignments 
ADD COLUMN has_deadline TINYINT(1) DEFAULT 0 AFTER deadline;

-- Add priority column (if it doesn't exist)
ALTER TABLE table_assignments 
ADD COLUMN priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' AFTER has_deadline;

-- Add notes column (if it doesn't exist)
ALTER TABLE table_assignments 
ADD COLUMN notes TEXT NULL AFTER priority;

-- Create indexes (if they don't exist)
-- If you get an error "Duplicate key name", that's OK - it means it already exists
CREATE INDEX idx_deadline ON table_assignments(deadline);
CREATE INDEX idx_priority ON table_assignments(priority);
CREATE INDEX idx_has_deadline ON table_assignments(has_deadline);

-- Update existing records to have default values
UPDATE table_assignments 
SET has_deadline = 0 
WHERE has_deadline IS NULL;

UPDATE table_assignments 
SET priority = 'medium' 
WHERE priority IS NULL;

-- Show final structure
SELECT 'Updated table structure:' AS Info;
SHOW COLUMNS FROM table_assignments;

-- Show sample data
SELECT 'Sample assignments with new fields:' AS Info;
SELECT id, table_name, assigned_office, has_deadline, deadline, priority, notes, status
FROM table_assignments
LIMIT 5;
