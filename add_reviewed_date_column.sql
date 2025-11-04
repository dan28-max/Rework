-- Add reviewed_date column to report_submissions table
-- This tracks when a submission was approved or rejected

USE spartan_data;

-- Add reviewed_date column
ALTER TABLE report_submissions 
ADD COLUMN reviewed_date DATETIME NULL 
COMMENT 'Timestamp when the submission was approved or rejected';

-- Verify the change
SHOW COLUMNS FROM report_submissions LIKE 'reviewed_date';

SELECT 'Reviewed date column added successfully' AS status;
