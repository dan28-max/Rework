-- ============================================
-- Ensure AUTO_INCREMENT on ALL Tables
-- This script adds AUTO_INCREMENT to all ID columns
-- Run this in phpMyAdmin or MySQL command line
-- ============================================

USE spartan_data;

-- ============================================
-- SYSTEM TABLES
-- ============================================

-- Users table
ALTER TABLE users MODIFY id INT AUTO_INCREMENT;

-- User sessions table
ALTER TABLE user_sessions MODIFY id INT AUTO_INCREMENT;

-- System settings table
ALTER TABLE system_settings MODIFY id INT AUTO_INCREMENT;

-- Activity logs table
ALTER TABLE activity_logs MODIFY id INT AUTO_INCREMENT;

-- Dashboard statistics table
ALTER TABLE dashboard_stats MODIFY id INT AUTO_INCREMENT;

-- Table assignments table
ALTER TABLE table_assignments MODIFY id INT AUTO_INCREMENT;

-- Data submissions table
ALTER TABLE data_submissions MODIFY id INT AUTO_INCREMENT;

-- Drafts table
ALTER TABLE drafts MODIFY id INT AUTO_INCREMENT;

-- Report submissions table
ALTER TABLE report_submissions MODIFY id INT AUTO_INCREMENT;

-- Report submission data table
ALTER TABLE report_submission_data MODIFY id INT AUTO_INCREMENT;

-- ============================================
-- REPORT DATA TABLES
-- ============================================

-- 1. Campus Population
ALTER TABLE campuspopulation MODIFY id INT AUTO_INCREMENT;

-- 2. Admission Data
ALTER TABLE admissiondata MODIFY id INT AUTO_INCREMENT;

-- 3. Enrollment Data
ALTER TABLE enrollmentdata MODIFY id INT AUTO_INCREMENT;

-- 4. Graduates Data
ALTER TABLE graduatesdata MODIFY id INT AUTO_INCREMENT;

-- 5. Employee Data
ALTER TABLE employee MODIFY id INT AUTO_INCREMENT;

-- 6. Leave Privilege
ALTER TABLE leaveprivilege MODIFY id INT AUTO_INCREMENT;

-- 7. Library Visitor
ALTER TABLE libraryvisitor MODIFY id INT AUTO_INCREMENT;

-- 8. PWD (Persons with Disabilities)
ALTER TABLE pwd MODIFY id INT AUTO_INCREMENT;

-- 9. Water Consumption
ALTER TABLE waterconsumption MODIFY id INT AUTO_INCREMENT;

-- 10. Treated Wastewater
ALTER TABLE treatedwastewater MODIFY id INT AUTO_INCREMENT;

-- 11. Electricity Consumption
ALTER TABLE electricityconsumption MODIFY id INT AUTO_INCREMENT;

-- 12. Solid Waste
ALTER TABLE solidwaste MODIFY id INT AUTO_INCREMENT;

-- 13. Food Waste
ALTER TABLE foodwaste MODIFY id INT AUTO_INCREMENT;

-- 14. Fuel Consumption
ALTER TABLE fuelconsumption MODIFY id INT AUTO_INCREMENT;

-- 15. Distance Traveled
ALTER TABLE distancetraveled MODIFY id INT AUTO_INCREMENT;

-- 16. Budget Expenditure
ALTER TABLE budgetexpenditure MODIFY id INT AUTO_INCREMENT;

-- 17. Flight Accommodation
ALTER TABLE flightaccommodation MODIFY id INT AUTO_INCREMENT;

-- ============================================
-- VERIFICATION QUERY
-- Run this to check all tables have AUTO_INCREMENT
-- ============================================

SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    EXTRA
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = 'spartan_data'
    AND COLUMN_NAME = 'id'
    AND COLUMN_KEY = 'PRI'
ORDER BY 
    TABLE_NAME;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If no errors appear above, all tables now have AUTO_INCREMENT enabled!
-- You can verify by running the SELECT query above.
