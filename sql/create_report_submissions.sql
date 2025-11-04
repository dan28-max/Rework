-- Create report_submissions table for storing user report submissions
-- This table stores submissions that need admin review

CREATE TABLE IF NOT EXISTS `report_submissions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL COMMENT 'User who submitted the report',
  `table_name` VARCHAR(255) NOT NULL COMMENT 'Name of the report table',
  `campus` VARCHAR(255) DEFAULT NULL COMMENT 'Campus of the submitter',
  `office` VARCHAR(255) DEFAULT NULL COMMENT 'Office of the submitter',
  `description` TEXT DEFAULT NULL COMMENT 'Submission description',
  `submission_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'When the report was submitted',
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'Submission status',
  `reviewed_by` INT(11) DEFAULT NULL COMMENT 'Admin who reviewed the submission',
  `reviewed_at` DATETIME DEFAULT NULL COMMENT 'When the submission was reviewed',
  `review_notes` TEXT DEFAULT NULL COMMENT 'Admin review notes',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_table_name` (`table_name`),
  KEY `idx_status` (`status`),
  KEY `idx_submission_date` (`submission_date`),
  KEY `fk_reviewed_by` (`reviewed_by`),
  CONSTRAINT `fk_report_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_report_submissions_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create report_submission_data table for storing the actual data rows
CREATE TABLE IF NOT EXISTS `report_submission_data` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `submission_id` INT(11) NOT NULL COMMENT 'Reference to report_submissions',
  `row_data` JSON NOT NULL COMMENT 'The actual row data in JSON format',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_submission_id` (`submission_id`),
  CONSTRAINT `fk_submission_data` FOREIGN KEY (`submission_id`) REFERENCES `report_submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify the tables
SHOW TABLES LIKE 'report_submission%';
