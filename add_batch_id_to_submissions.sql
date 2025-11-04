-- Add batch_id column to report_submissions table
-- This links submissions to their data in target tables

USE spartan_data;

-- Add batch_id column
ALTER TABLE report_submissions 
ADD COLUMN batch_id VARCHAR(100) NULL AFTER office;

-- Verify the change
SHOW COLUMNS FROM report_submissions;

SELECT 'batch_id column added successfully' AS status;
