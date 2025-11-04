-- MySQL Backup for spartan_data database
-- Generated: 2025-11-04 04:54:33
-- Database: spartan_data

SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS `spartan_data`;
USE `spartan_data`;


-- Table structure for `activity_logs`
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=228 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `activity_logs`
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('170', '1', 'table_assignment', 'Assigned admissiondata table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:03');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('171', '1', 'table_assignment', 'Assigned enrollmentdata table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:03');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('172', '1', 'table_assignment', 'Assigned graduatesdata table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:03');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('173', '1', 'table_assignment', 'Assigned employee table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:03');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('174', '1', 'table_assignment', 'Assigned leaveprivilege table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('175', '1', 'table_assignment', 'Assigned libraryvisitor table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('176', '1', 'table_assignment', 'Assigned pwd table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('177', '1', 'table_assignment', 'Assigned waterconsumption table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('178', '1', 'table_assignment', 'Assigned treatedwastewater table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('179', '1', 'table_assignment', 'Assigned electricityconsumption table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('180', '1', 'table_assignment', 'Assigned solidwaste table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('181', '1', 'table_assignment', 'Assigned campuspopulation table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('182', '1', 'table_assignment', 'Assigned foodwaste table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('183', '1', 'table_assignment', 'Assigned fuelconsumption table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('184', '1', 'table_assignment', 'Assigned distancetraveled table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('185', '1', 'table_assignment', 'Assigned budgetexpenditure table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('186', '1', 'table_assignment', 'Assigned flightaccommodation table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('187', '1', 'table_assignment', 'Assigned admissiondata table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('188', '1', 'table_assignment', 'Assigned enrollmentdata table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('189', '1', 'table_assignment', 'Assigned graduatesdata table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('190', '1', 'table_assignment', 'Assigned employee table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('191', '1', 'table_assignment', 'Assigned leaveprivilege table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('192', '1', 'table_assignment', 'Assigned libraryvisitor table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('193', '1', 'table_assignment', 'Assigned pwd table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('194', '1', 'table_assignment', 'Assigned waterconsumption table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('195', '1', 'table_assignment', 'Assigned treatedwastewater table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('196', '1', 'table_assignment', 'Assigned electricityconsumption table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('197', '1', 'table_assignment', 'Assigned solidwaste table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('198', '1', 'table_assignment', 'Assigned campuspopulation table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('199', '1', 'table_assignment', 'Assigned foodwaste table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('200', '1', 'table_assignment', 'Assigned fuelconsumption table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('201', '1', 'table_assignment', 'Assigned distancetraveled table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('202', '1', 'table_assignment', 'Assigned budgetexpenditure table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('203', '1', 'table_assignment', 'Assigned flightaccommodation table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('204', '1', 'table_assignment', 'Assigned admissiondata table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('205', '1', 'table_assignment', 'Assigned enrollmentdata table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('206', '1', 'table_assignment', 'Assigned graduatesdata table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('207', '1', 'table_assignment', 'Assigned employee table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('208', '1', 'table_assignment', 'Assigned leaveprivilege table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('209', '1', 'table_assignment', 'Assigned libraryvisitor table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('210', '1', 'table_assignment', 'Assigned pwd table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('211', '1', 'table_assignment', 'Assigned waterconsumption table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('212', '1', 'table_assignment', 'Assigned treatedwastewater table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('213', '1', 'table_assignment', 'Assigned electricityconsumption table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('214', '1', 'table_assignment', 'Assigned solidwaste table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('215', '1', 'table_assignment', 'Assigned campuspopulation table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('216', '1', 'table_assignment', 'Assigned foodwaste table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('217', '1', 'table_assignment', 'Assigned fuelconsumption table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('218', '1', 'table_assignment', 'Assigned distancetraveled table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('219', '1', 'table_assignment', 'Assigned budgetexpenditure table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('220', '1', 'table_assignment', 'Assigned flightaccommodation table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('221', '32', 'report_submission', 'Submitted report: Admission Data (1 records)', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:19:09');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('222', '32', 'report_submission', 'Submitted report: Admission Data (1 records)', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:19:24');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('223', '32', 'report_submission', 'Submitted report: Admission Data (1 records)', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:19:36');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('224', '32', 'report_submission', 'Submitted report: Enrollment Data (1 records)', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:21:55');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('225', '32', 'report_submission', 'Submitted report: Admission Data (1 records)', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:28:15');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('226', '1', 'table_assignment', 'Assigned admissiondata table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:29:17');
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `description`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES ('227', '32', 'report_submission', 'Submitted report: Graduates Data (1 records)', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:31:10');


-- Table structure for `admissiondata`
DROP TABLE IF EXISTS `admissiondata`;
CREATE TABLE `admissiondata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `semester` varchar(50) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `program` varchar(200) DEFAULT NULL,
  `male` int(11) DEFAULT 0,
  `female` int(11) DEFAULT 0,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` varchar(255) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `budgetexpenditure`
DROP TABLE IF EXISTS `budgetexpenditure`;
CREATE TABLE `budgetexpenditure` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `year` varchar(10) DEFAULT NULL,
  `particulars` text DEFAULT NULL,
  `category` varchar(200) DEFAULT NULL,
  `budget_allocation` decimal(15,2) DEFAULT 0.00,
  `actual_expenditure` decimal(15,2) DEFAULT 0.00,
  `utilization_rate` decimal(5,2) DEFAULT 0.00,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `campuspopulation`
DROP TABLE IF EXISTS `campuspopulation`;
CREATE TABLE `campuspopulation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `year` varchar(10) NOT NULL,
  `students` int(11) DEFAULT 0,
  `is_students` int(11) DEFAULT 0,
  `employees` int(11) DEFAULT 0,
  `canteen` int(11) DEFAULT 0,
  `construction` int(11) DEFAULT 0,
  `total` int(11) DEFAULT 0,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `dashboard_stats`
DROP TABLE IF EXISTS `dashboard_stats`;
CREATE TABLE `dashboard_stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stat_name` varchar(255) NOT NULL,
  `stat_value` varchar(255) NOT NULL,
  `stat_type` enum('number','percentage','text') DEFAULT 'number',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `dashboard_stats`
INSERT INTO `dashboard_stats` (`id`, `stat_name`, `stat_value`, `stat_type`, `updated_at`) VALUES ('1', 'total_users', '24', 'number', '2025-10-10 02:08:53');
INSERT INTO `dashboard_stats` (`id`, `stat_name`, `stat_value`, `stat_type`, `updated_at`) VALUES ('2', 'data_records', '0', 'number', '2025-10-10 02:08:53');
INSERT INTO `dashboard_stats` (`id`, `stat_name`, `stat_value`, `stat_type`, `updated_at`) VALUES ('3', 'growth_rate', '0', 'percentage', '2025-10-10 02:08:53');
INSERT INTO `dashboard_stats` (`id`, `stat_name`, `stat_value`, `stat_type`, `updated_at`) VALUES ('4', 'security_score', '100', 'percentage', '2025-10-10 02:08:53');
INSERT INTO `dashboard_stats` (`id`, `stat_name`, `stat_value`, `stat_type`, `updated_at`) VALUES ('5', 'system_uptime', '99.9', 'percentage', '2025-10-10 02:08:53');
INSERT INTO `dashboard_stats` (`id`, `stat_name`, `stat_value`, `stat_type`, `updated_at`) VALUES ('6', 'response_time', '245', 'number', '2025-10-10 02:08:53');


-- Table structure for `data_submissions`
DROP TABLE IF EXISTS `data_submissions`;
CREATE TABLE `data_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `table_name` varchar(255) NOT NULL,
  `assigned_office` varchar(100) NOT NULL,
  `submitted_by` int(11) NOT NULL,
  `submission_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`submission_data`)),
  `record_count` int(11) DEFAULT 0,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `submitted_by` (`submitted_by`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `idx_office` (`assigned_office`),
  KEY `idx_status` (`status`),
  CONSTRAINT `data_submissions_ibfk_1` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `data_submissions_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `distancetraveled`
DROP TABLE IF EXISTS `distancetraveled`;
CREATE TABLE `distancetraveled` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `travel_date` date DEFAULT NULL,
  `plate_no` varchar(50) DEFAULT NULL,
  `vehicle` varchar(100) DEFAULT NULL,
  `fuel_type` varchar(50) DEFAULT NULL,
  `start_mileage` decimal(10,2) DEFAULT 0.00,
  `end_mileage` decimal(10,2) DEFAULT 0.00,
  `total_km` decimal(10,2) DEFAULT 0.00,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `drafts`
DROP TABLE IF EXISTS `drafts`;
CREATE TABLE `drafts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_type` varchar(255) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `office` varchar(100) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `drafts_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `electricityconsumption`
DROP TABLE IF EXISTS `electricityconsumption`;
CREATE TABLE `electricityconsumption` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `month` varchar(20) DEFAULT NULL,
  `year` varchar(10) DEFAULT NULL,
  `prev_reading` decimal(10,2) DEFAULT 0.00,
  `current_reading` decimal(10,2) DEFAULT 0.00,
  `actual_consumption` decimal(10,2) DEFAULT 0.00,
  `multiplier` decimal(10,2) DEFAULT 1.00,
  `total_consumption` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `price_per_kwh` decimal(10,2) DEFAULT 0.00,
  `remarks` text DEFAULT NULL,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `employee`
DROP TABLE IF EXISTS `employee`;
CREATE TABLE `employee` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `date_generated` date DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `faculty_rank` varchar(100) DEFAULT NULL,
  `sex` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `date_hired` date DEFAULT NULL,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `enrollmentdata`
DROP TABLE IF EXISTS `enrollmentdata`;
CREATE TABLE `enrollmentdata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `semester` varchar(50) DEFAULT NULL,
  `college` varchar(200) DEFAULT NULL,
  `graduate_undergrad` varchar(50) DEFAULT NULL,
  `program_course` varchar(200) DEFAULT NULL,
  `male` int(11) DEFAULT 0,
  `female` int(11) DEFAULT 0,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `enrollmentdata`
INSERT INTO `enrollmentdata` (`id`, `campus`, `academic_year`, `semester`, `college`, `graduate_undergrad`, `program_course`, `male`, `female`, `batch_id`, `submitted_by`, `submitted_at`, `created_at`, `updated_at`) VALUES ('5', '', '', 'First Semester', '', NULL, NULL, '0', '0', '20251104012155_690947235728d_RGO', '0', '2025-11-04 08:21:55', '2025-11-04 08:21:55', '2025-11-04 08:21:55');


-- Table structure for `flightaccommodation`
DROP TABLE IF EXISTS `flightaccommodation`;
CREATE TABLE `flightaccommodation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `department` varchar(200) DEFAULT NULL,
  `year` varchar(10) DEFAULT NULL,
  `traveler` varchar(255) DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `from_location` varchar(200) DEFAULT NULL,
  `to_location` varchar(200) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `rooms` int(11) DEFAULT 0,
  `nights` int(11) DEFAULT 0,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `foodwaste`
DROP TABLE IF EXISTS `foodwaste`;
CREATE TABLE `foodwaste` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `date` date DEFAULT NULL,
  `quantity_kg` decimal(10,2) DEFAULT 0.00,
  `remarks` text DEFAULT NULL,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `fuelconsumption`
DROP TABLE IF EXISTS `fuelconsumption`;
CREATE TABLE `fuelconsumption` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `date` date DEFAULT NULL,
  `driver` varchar(255) DEFAULT NULL,
  `vehicle` varchar(100) DEFAULT NULL,
  `plate_no` varchar(50) DEFAULT NULL,
  `fuel_type` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `transaction_no` varchar(100) DEFAULT NULL,
  `odometer` decimal(10,2) DEFAULT 0.00,
  `qty` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `graduatesdata`
DROP TABLE IF EXISTS `graduatesdata`;
CREATE TABLE `graduatesdata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `semester` varchar(50) DEFAULT NULL,
  `degree_level` varchar(100) DEFAULT NULL,
  `subject_area` varchar(200) DEFAULT NULL,
  `course` varchar(200) DEFAULT NULL,
  `category` varchar(200) DEFAULT NULL,
  `male` int(11) DEFAULT 0,
  `female` int(11) DEFAULT 0,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `graduatesdata`
INSERT INTO `graduatesdata` (`id`, `campus`, `academic_year`, `semester`, `degree_level`, `subject_area`, `course`, `category`, `male`, `female`, `batch_id`, `submitted_by`, `submitted_at`, `created_at`, `updated_at`) VALUES ('7', '', '', '', '', '', '', NULL, '0', '0', '20251104013110_6909494eca48b_RGO', '0', '2025-11-04 08:31:10', '2025-11-04 08:31:10', '2025-11-04 08:31:10');


-- Table structure for `leaveprivilege`
DROP TABLE IF EXISTS `leaveprivilege`;
CREATE TABLE `leaveprivilege` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `leave_type` varchar(100) DEFAULT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `duration_days` int(11) DEFAULT 0,
  `equivalent_pay` decimal(10,2) DEFAULT 0.00,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `libraryvisitor`
DROP TABLE IF EXISTS `libraryvisitor`;
CREATE TABLE `libraryvisitor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `visit_date` date DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `sex` varchar(20) DEFAULT NULL,
  `total_visitors` int(11) DEFAULT 0,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `pwd`
DROP TABLE IF EXISTS `pwd`;
CREATE TABLE `pwd` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `year` varchar(10) DEFAULT NULL,
  `disability_type` varchar(100) DEFAULT NULL,
  `male` int(11) DEFAULT 0,
  `female` int(11) DEFAULT 0,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `report_assignments`
DROP TABLE IF EXISTS `report_assignments`;
CREATE TABLE `report_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_type` varchar(255) NOT NULL,
  `assigned_office` varchar(100) NOT NULL,
  `assigned_campus` varchar(100) NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `assigned_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `report_assignments_ibfk_1` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `report_submission_data`
DROP TABLE IF EXISTS `report_submission_data`;
CREATE TABLE `report_submission_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `submission_id` int(11) NOT NULL,
  `row_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`row_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  CONSTRAINT `report_submission_data_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `report_submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `report_submission_data`
INSERT INTO `report_submission_data` (`id`, `submission_id`, `row_data`, `created_at`) VALUES ('58', '96', '{"Campus":"","Semester":"First Semester","Academic Year":"2025-2026","Category":"Total No. of Applicants","Program":"","Male":"","Female":""}', '2025-11-04 08:19:09');
INSERT INTO `report_submission_data` (`id`, `submission_id`, `row_data`, `created_at`) VALUES ('59', '97', '{"Campus":"","Semester":"First Semester","Academic Year":"2025-2026","Category":"Total No. of Applicants","Program":"","Male":"","Female":""}', '2025-11-04 08:19:24');
INSERT INTO `report_submission_data` (`id`, `submission_id`, `row_data`, `created_at`) VALUES ('60', '98', '{"Campus":"","Semester":"First Semester","Academic Year":"2025-2026","Category":"Total No. of Applicants","Program":"","Male":"","Female":""}', '2025-11-04 08:19:36');
INSERT INTO `report_submission_data` (`id`, `submission_id`, `row_data`, `created_at`) VALUES ('61', '99', '{"Campus":"","Academic Year":"","Semester":"First Semester","College":"","Graduate\\/Undergrad":"Graduate","Program\\/Course":"","Male":"","Female":""}', '2025-11-04 08:21:55');
INSERT INTO `report_submission_data` (`id`, `submission_id`, `row_data`, `created_at`) VALUES ('62', '100', '{"Campus":"","Semester":"First Semester","Academic Year":"2025-2026","Category":"Total No. of Applicants","Program":"","Male":"","Female":""}', '2025-11-04 08:28:15');
INSERT INTO `report_submission_data` (`id`, `submission_id`, `row_data`, `created_at`) VALUES ('63', '101', '{"Campus":"","Academic Year":"","Semester":"","Degree Level":"","Subject Area":"","Course":"","Category\\/Total No. of Applicants":"Total No. Applicants","Male":"","Female":""}', '2025-11-04 08:31:10');


-- Table structure for `report_submissions`
DROP TABLE IF EXISTS `report_submissions`;
CREATE TABLE `report_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` int(11) DEFAULT NULL,
  `report_type` varchar(255) NOT NULL,
  `campus` varchar(100) DEFAULT NULL,
  `office` varchar(100) DEFAULT NULL,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submission_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`submission_data`)),
  `record_count` int(11) DEFAULT 0,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `reviewed_date` datetime DEFAULT NULL COMMENT 'Timestamp when the submission was approved or rejected',
  PRIMARY KEY (`id`),
  KEY `assignment_id` (`assignment_id`),
  KEY `submitted_by` (`submitted_by`),
  KEY `reviewed_by` (`reviewed_by`),
  CONSTRAINT `report_submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `report_assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `report_submissions_ibfk_2` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `report_submissions_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `report_submissions`
INSERT INTO `report_submissions` (`id`, `assignment_id`, `report_type`, `campus`, `office`, `batch_id`, `submitted_by`, `submission_data`, `record_count`, `status`, `submitted_at`, `reviewed_by`, `reviewed_at`, `review_notes`, `reviewed_date`) VALUES ('96', NULL, 'admissiondata', 'Lipa', 'RGO', '20251104011909_6909467da61e7_RGO', '32', NULL, '0', 'pending', '2025-11-04 08:19:09', NULL, NULL, NULL, NULL);
INSERT INTO `report_submissions` (`id`, `assignment_id`, `report_type`, `campus`, `office`, `batch_id`, `submitted_by`, `submission_data`, `record_count`, `status`, `submitted_at`, `reviewed_by`, `reviewed_at`, `review_notes`, `reviewed_date`) VALUES ('97', NULL, 'admissiondata', 'Lipa', 'RGO', '20251104011924_6909468c8ef35_RGO', '32', NULL, '0', 'pending', '2025-11-04 08:19:24', NULL, NULL, NULL, NULL);
INSERT INTO `report_submissions` (`id`, `assignment_id`, `report_type`, `campus`, `office`, `batch_id`, `submitted_by`, `submission_data`, `record_count`, `status`, `submitted_at`, `reviewed_by`, `reviewed_at`, `review_notes`, `reviewed_date`) VALUES ('98', NULL, 'admissiondata', 'Lipa', 'RGO', '20251104011936_69094698a8133_RGO', '32', NULL, '0', 'pending', '2025-11-04 08:19:36', NULL, NULL, NULL, NULL);
INSERT INTO `report_submissions` (`id`, `assignment_id`, `report_type`, `campus`, `office`, `batch_id`, `submitted_by`, `submission_data`, `record_count`, `status`, `submitted_at`, `reviewed_by`, `reviewed_at`, `review_notes`, `reviewed_date`) VALUES ('99', NULL, 'enrollmentdata', 'Lipa', 'RGO', '20251104012155_690947235728d_RGO', '32', NULL, '0', 'pending', '2025-11-04 08:21:55', NULL, NULL, NULL, NULL);
INSERT INTO `report_submissions` (`id`, `assignment_id`, `report_type`, `campus`, `office`, `batch_id`, `submitted_by`, `submission_data`, `record_count`, `status`, `submitted_at`, `reviewed_by`, `reviewed_at`, `review_notes`, `reviewed_date`) VALUES ('100', NULL, 'admissiondata', 'Lipa', 'RGO', '20251104012815_6909489f8f4c9_RGO', '32', NULL, '0', 'pending', '2025-11-04 08:28:15', NULL, NULL, NULL, NULL);
INSERT INTO `report_submissions` (`id`, `assignment_id`, `report_type`, `campus`, `office`, `batch_id`, `submitted_by`, `submission_data`, `record_count`, `status`, `submitted_at`, `reviewed_by`, `reviewed_at`, `review_notes`, `reviewed_date`) VALUES ('101', NULL, 'graduatesdata', 'Lipa', 'RGO', '20251104013110_6909494eca48b_RGO', '32', NULL, '0', 'pending', '2025-11-04 08:31:10', NULL, NULL, NULL, NULL);


-- Table structure for `solidwaste`
DROP TABLE IF EXISTS `solidwaste`;
CREATE TABLE `solidwaste` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `month` varchar(20) DEFAULT NULL,
  `year` varchar(10) DEFAULT NULL,
  `waste_type` varchar(100) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT 0.00,
  `remarks` text DEFAULT NULL,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `system_settings`
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(255) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `system_settings`
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `created_at`, `updated_at`) VALUES ('1', 'system_name', 'Spartan Data', 'Name of the system', '2025-10-10 02:08:53', '2025-10-10 02:08:53');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `created_at`, `updated_at`) VALUES ('2', 'theme_color', 'white_red', 'Current theme colors', '2025-10-10 02:08:53', '2025-10-10 02:08:53');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `created_at`, `updated_at`) VALUES ('3', 'session_timeout', '3600', 'Session timeout in seconds', '2025-10-10 02:08:53', '2025-10-10 02:08:53');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `created_at`, `updated_at`) VALUES ('4', 'max_login_attempts', '5', 'Maximum login attempts before lockout', '2025-10-10 02:08:53', '2025-10-10 02:08:53');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `created_at`, `updated_at`) VALUES ('5', 'maintenance_mode', '0', 'System maintenance mode (0=off, 1=on)', '2025-10-10 02:08:53', '2025-10-10 02:08:53');


-- Table structure for `table_assignments`
DROP TABLE IF EXISTS `table_assignments`;
CREATE TABLE `table_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `table_name` varchar(255) NOT NULL,
  `assigned_office` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `has_deadline` tinyint(1) DEFAULT 0,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `notes` text DEFAULT NULL,
  `assigned_by` int(11) NOT NULL,
  `assigned_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `assigned_by` (`assigned_by`),
  KEY `idx_office` (`assigned_office`),
  KEY `idx_status` (`status`),
  KEY `idx_deadline` (`deadline`),
  KEY `idx_priority` (`priority`),
  KEY `idx_has_deadline` (`has_deadline`),
  CONSTRAINT `table_assignments_ibfk_1` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=188 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table `table_assignments`
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('136', 'admissiondata', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:03', 'completed', '2025-11-04 08:02:03', '2025-11-04 08:19:09');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('137', 'enrollmentdata', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:03', 'completed', '2025-11-04 08:02:03', '2025-11-04 08:21:55');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('138', 'graduatesdata', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:03', 'completed', '2025-11-04 08:02:03', '2025-11-04 08:31:10');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('139', 'employee', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:03', 'active', '2025-11-04 08:02:03', '2025-11-04 08:02:03');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('140', 'leaveprivilege', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:03', 'active', '2025-11-04 08:02:03', '2025-11-04 08:02:03');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('141', 'libraryvisitor', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('142', 'pwd', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('143', 'waterconsumption', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('144', 'treatedwastewater', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('145', 'electricityconsumption', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('146', 'solidwaste', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('147', 'campuspopulation', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('148', 'foodwaste', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('149', 'fuelconsumption', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('150', 'distancetraveled', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('151', 'budgetexpenditure', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('152', 'flightaccommodation', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('153', 'admissiondata', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('154', 'enrollmentdata', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('155', 'graduatesdata', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('156', 'employee', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('157', 'leaveprivilege', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('158', 'libraryvisitor', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('159', 'pwd', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('160', 'waterconsumption', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('161', 'treatedwastewater', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('162', 'electricityconsumption', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('163', 'solidwaste', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('164', 'campuspopulation', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('165', 'foodwaste', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('166', 'fuelconsumption', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('167', 'distancetraveled', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('168', 'budgetexpenditure', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('169', 'flightaccommodation', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('170', 'admissiondata', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 10:34:11', 'active', '2025-11-04 08:07:30', '2025-11-04 10:34:11');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('171', 'enrollmentdata', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'completed', '2025-11-04 08:07:30', '2025-11-04 08:21:55');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('172', 'graduatesdata', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'completed', '2025-11-04 08:07:30', '2025-11-04 08:31:10');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('173', 'employee', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('174', 'leaveprivilege', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('175', 'libraryvisitor', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('176', 'pwd', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('177', 'waterconsumption', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('178', 'treatedwastewater', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('179', 'electricityconsumption', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('180', 'solidwaste', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('181', 'campuspopulation', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('182', 'foodwaste', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('183', 'fuelconsumption', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('184', 'distancetraveled', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('185', 'budgetexpenditure', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('186', 'flightaccommodation', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO `table_assignments` (`id`, `table_name`, `assigned_office`, `description`, `deadline`, `has_deadline`, `priority`, `notes`, `assigned_by`, `assigned_date`, `status`, `created_at`, `updated_at`) VALUES ('187', 'admissiondata', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 10:34:11', 'active', '2025-11-04 08:29:17', '2025-11-04 10:34:11');


-- Table structure for `treatedwastewater`
DROP TABLE IF EXISTS `treatedwastewater`;
CREATE TABLE `treatedwastewater` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `date` date DEFAULT NULL,
  `treated_volume` decimal(10,2) DEFAULT 0.00,
  `reused_volume` decimal(10,2) DEFAULT 0.00,
  `effluent_volume` decimal(10,2) DEFAULT 0.00,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for `user_sessions`
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires` (`expires_at`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- Table structure for `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL COMMENT 'Primary and only login identifier',
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','user') NOT NULL DEFAULT 'user',
  `campus` varchar(100) DEFAULT NULL COMMENT 'Campus assignment',
  `office` varchar(100) DEFAULT NULL COMMENT 'Office assignment',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`),
  KEY `idx_campus` (`campus`),
  KEY `idx_office` (`office`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users`
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `campus`, `office`, `status`, `created_at`, `updated_at`, `last_login`, `remember_token`) VALUES ('1', 'superadmin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Administrator', 'super_admin', 'Main Campus', 'Administration', 'active', '2025-10-10 02:08:53', '2025-11-04 10:33:45', '2025-11-04 10:33:45', NULL);
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `campus`, `office`, `status`, `created_at`, `updated_at`, `last_login`, `remember_token`) VALUES ('31', 'admin-lipa', '$2y$10$HVxC4djS8Ryv1swIbFOuEOznuWVmjbwQGMs1mhXKC3rTyEzTvoq0W', 'admin-lipa', 'admin', 'Lipa', '', 'active', '2025-10-28 00:18:32', '2025-11-04 07:39:32', '2025-11-04 07:39:32', NULL);
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `campus`, `office`, `status`, `created_at`, `updated_at`, `last_login`, `remember_token`) VALUES ('32', 'lipa-rgo', '$2y$10$isKibZ2tXpWXfHK.btbn9.iaHF0By3Vzg/x3bdaB5grirlZ.wd4EK', 'lipa-rgo', 'user', 'Lipa', 'RGO', 'active', '2025-10-28 00:32:25', '2025-11-04 10:35:14', '2025-11-04 10:35:14', NULL);
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `campus`, `office`, `status`, `created_at`, `updated_at`, `last_login`, `remember_token`) VALUES ('34', 'admin-san-juan', '$2y$10$wv3lAx15nEW.rAJj9bHIdet2euqpFwnTrVUK5cWGaLXRFq9zytHMe', 'admin-san-juan', 'admin', 'San Juan', '', 'active', '2025-10-28 11:31:37', '2025-11-03 00:13:50', '2025-11-03 00:13:50', NULL);
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `campus`, `office`, `status`, `created_at`, `updated_at`, `last_login`, `remember_token`) VALUES ('35', 'gso-san-juan', '$2y$10$zEPqkaBIG2An9y0EAKM6pexItcTFwByRM2UFTx0hNSrHLrS.rL.6K', 'gso-san-juan', 'user', 'San Juan', 'GSO', 'active', '2025-10-28 11:34:21', '2025-11-03 00:18:58', '2025-11-03 00:18:58', NULL);
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `campus`, `office`, `status`, `created_at`, `updated_at`, `last_login`, `remember_token`) VALUES ('36', 'rgo-san-juan', '$2y$10$IFJxKhAyblSSpX01YWnlb.1A6M7oMO9aAW02SHUobb8cNKK.JTyw6', 'rgo-san-juan', 'user', 'San Juan', 'RGO', 'active', '2025-11-02 23:55:29', '2025-11-03 00:41:44', '2025-11-03 00:41:44', NULL);
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `campus`, `office`, `status`, `created_at`, `updated_at`, `last_login`, `remember_token`) VALUES ('37', 'lipa-gso', '$2y$10$o2V61P4Zm36QM.bBQOz7jeA0oZsKzMsP6M2DxDDmQ0j0VdrUzL9ci', 'lipa-gso', 'user', 'Lipa', 'GSO', 'active', '2025-11-03 00:17:17', '2025-11-04 08:06:06', '2025-11-04 08:06:06', NULL);
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `campus`, `office`, `status`, `created_at`, `updated_at`, `last_login`, `remember_token`) VALUES ('38', 'admin-alangilan', '$2y$10$7D3o4ffZnjw.yEGXpqwk9O7CNtLiMVD6LhtgoSraZxdMUMCcExdZC', 'admin-alangilan', 'admin', 'Alangilan', '', 'active', '2025-11-03 04:32:46', '2025-11-03 04:33:15', '2025-11-03 04:33:15', NULL);


-- Table structure for `waterconsumption`
DROP TABLE IF EXISTS `waterconsumption`;
CREATE TABLE `waterconsumption` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus` varchar(100) NOT NULL,
  `date` date DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `prev_reading` decimal(10,2) DEFAULT 0.00,
  `current_reading` decimal(10,2) DEFAULT 0.00,
  `quantity_m3` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `price_per_m3` decimal(10,2) DEFAULT 0.00,
  `month` varchar(20) DEFAULT NULL,
  `year` varchar(10) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `batch_id` varchar(100) DEFAULT NULL,
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_campus` (`campus`),
  KEY `idx_batch` (`batch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

