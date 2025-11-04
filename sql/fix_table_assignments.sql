      -- Fix table_assignments table - Add missing columns
      -- Run this if you get "Unknown column 'deadline'" error

      -- First, check what columns exist
      DESCRIBE table_assignments;

      -- Drop the table and recreate it properly
      DROP TABLE IF EXISTS `table_assignments`;

      -- Create the complete table with all columns
      CREATE TABLE `table_assignments` (
        `id` INT(11) NOT NULL AUTO_INCREMENT,
        `table_name` VARCHAR(255) NOT NULL COMMENT 'Name of the report/table to submit',
        `assigned_office` VARCHAR(255) NOT NULL COMMENT 'Office assigned to this task',
        `description` TEXT DEFAULT NULL COMMENT 'Task description and requirements',
        `assigned_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When the task was assigned',
        `deadline` DATETIME DEFAULT NULL COMMENT 'Task deadline',
        `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT 'Task priority level',
        `status` ENUM('active', 'inactive', 'completed') DEFAULT 'active' COMMENT 'Task status',
        `assigned_by` INT(11) DEFAULT NULL COMMENT 'Admin user who assigned the task',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        KEY `idx_assigned_office` (`assigned_office`),
        KEY `idx_deadline` (`deadline`),
        KEY `idx_status` (`status`),
        KEY `idx_priority` (`priority`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Insert sample tasks for testing
      -- Replace 'EMU' with your actual office name

      INSERT INTO `table_assignments` 
      (`table_name`, `assigned_office`, `description`, `deadline`, `priority`, `status`, `assigned_by`) 
      VALUES
      ('campuspopulation', 'EMU', 'Submit the quarterly campus population data for all departments and programs.', DATE_ADD(NOW(), INTERVAL 7 DAY), 'high', 'active', 1),
      ('enrollment', 'EMU', 'Update enrollment statistics for the current semester including new students and transfers.', DATE_ADD(NOW(), INTERVAL 14 DAY), 'medium', 'active', 1),
      ('graduates', 'EMU', 'Submit graduate statistics report for the previous academic year.', DATE_ADD(NOW(), INTERVAL -5 DAY), 'low', 'active', 1),
      ('faculty', 'EMU', 'Update faculty information including new hires and departures.', DATE_ADD(NOW(), INTERVAL 21 DAY), 'medium', 'active', 1),
      ('infrastructure', 'EMU', 'Report on campus infrastructure and facilities status.', DATE_ADD(NOW(), INTERVAL 30 DAY), 'low', 'active', 1);

      -- Add more sample tasks for other offices (optional)
      INSERT INTO `table_assignments` 
      (`table_name`, `assigned_office`, `description`, `deadline`, `priority`, `status`, `assigned_by`) 
      VALUES
      ('campuspopulation', 'Registrar', 'Submit the quarterly campus population data.', DATE_ADD(NOW(), INTERVAL 7 DAY), 'high', 'active', 1),
      ('enrollment', 'Registrar', 'Update enrollment statistics for the current semester.', DATE_ADD(NOW(), INTERVAL 14 DAY), 'high', 'active', 1);

      -- Verify the data
      SELECT 
          id,
          table_name,
          assigned_office,
          deadline,
          priority,
          status
      FROM table_assignments 
      ORDER BY deadline ASC;
