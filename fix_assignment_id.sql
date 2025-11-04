-- Make assignment_id nullable in report_submissions table
-- This allows submissions without a matching report_assignments record

USE spartan_data;

-- First, check if the column exists and show current structure
SHOW COLUMNS FROM report_submissions LIKE 'assignment_id';

-- Modify the column to allow NULL values
ALTER TABLE report_submissions 
MODIFY COLUMN assignment_id INT NULL;

-- Verify the change
SHOW COLUMNS FROM report_submissions LIKE 'assignment_id';

SELECT 'assignment_id column is now nullable' AS status;
