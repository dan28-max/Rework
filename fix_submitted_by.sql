-- Make submitted_by nullable in report_submissions table
-- This allows submissions without a valid user reference

USE spartan_data;

-- Check current structure
SHOW COLUMNS FROM report_submissions LIKE 'submitted_by';

-- Modify the column to allow NULL values
ALTER TABLE report_submissions 
MODIFY COLUMN submitted_by INT NULL;

-- Verify the change
SHOW COLUMNS FROM report_submissions LIKE 'submitted_by';

SELECT 'submitted_by column is now nullable' AS status;
