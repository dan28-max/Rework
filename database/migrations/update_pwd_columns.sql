-- Migration: Update PWD table column names
-- This updates the pwd table columns to match the new naming convention

USE spartan_data;

-- Rename columns in pwd table
ALTER TABLE pwd 
    CHANGE COLUMN pwd_students `no_of_pwd_students` INT DEFAULT 0,
    CHANGE COLUMN pwd_employees `no_of_pwd_employees` INT DEFAULT 0,
    CHANGE COLUMN disability_type `type_of_disability` VARCHAR(200);

-- Verify the changes
DESCRIBE pwd;

SELECT 'PWD table columns updated successfully!' as message;
