-- Add notes column to table_assignments table
ALTER TABLE `table_assignments` 
ADD COLUMN `notes` TEXT DEFAULT NULL COMMENT 'Additional notes or instructions for the task' 
AFTER `description`;

-- Verify the column was added
DESCRIBE table_assignments;
