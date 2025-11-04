-- Add campus and office columns to report_submissions table
-- This allows filtering submissions by campus and office in the admin dashboard

USE spartan_data;

-- Add campus column
ALTER TABLE report_submissions 
ADD COLUMN campus VARCHAR(100) NULL AFTER report_type;

-- Add office column
ALTER TABLE report_submissions 
ADD COLUMN office VARCHAR(100) NULL AFTER campus;

-- Verify the changes
SHOW COLUMNS FROM report_submissions;

SELECT 'Campus and office columns added successfully' AS status;
