-- Add missing columns to existing table_assignments table
-- Use this if you want to keep existing data

-- Add deadline column if it doesn't exist
ALTER TABLE `table_assignments` 
ADD COLUMN IF NOT EXISTS `deadline` DATETIME DEFAULT NULL COMMENT 'Task deadline' AFTER `assigned_date`;

-- Add priority column if it doesn't exist
ALTER TABLE `table_assignments` 
ADD COLUMN IF NOT EXISTS `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT 'Task priority level' AFTER `deadline`;

-- Add status column if it doesn't exist
ALTER TABLE `table_assignments` 
ADD COLUMN IF NOT EXISTS `status` ENUM('active', 'inactive', 'completed') DEFAULT 'active' COMMENT 'Task status' AFTER `priority`;

-- Add description column if it doesn't exist
ALTER TABLE `table_assignments` 
ADD COLUMN IF NOT EXISTS `description` TEXT DEFAULT NULL COMMENT 'Task description and requirements' AFTER `assigned_office`;

-- Add assigned_date column if it doesn't exist
ALTER TABLE `table_assignments` 
ADD COLUMN IF NOT EXISTS `assigned_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When the task was assigned' AFTER `description`;

-- Add assigned_by column if it doesn't exist
ALTER TABLE `table_assignments` 
ADD COLUMN IF NOT EXISTS `assigned_by` INT(11) DEFAULT NULL COMMENT 'Admin user who assigned the task' AFTER `status`;

-- Add timestamps if they don't exist
ALTER TABLE `table_assignments` 
ADD COLUMN IF NOT EXISTS `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `assigned_by`;

ALTER TABLE `table_assignments` 
ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- Add indexes for better performance
ALTER TABLE `table_assignments` 
ADD INDEX IF NOT EXISTS `idx_assigned_office` (`assigned_office`);

ALTER TABLE `table_assignments` 
ADD INDEX IF NOT EXISTS `idx_deadline` (`deadline`);

ALTER TABLE `table_assignments` 
ADD INDEX IF NOT EXISTS `idx_status` (`status`);

ALTER TABLE `table_assignments` 
ADD INDEX IF NOT EXISTS `idx_priority` (`priority`);

-- Verify the structure
DESCRIBE table_assignments;

-- Show existing data
SELECT * FROM table_assignments;
