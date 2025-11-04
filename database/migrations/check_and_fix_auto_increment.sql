-- ============================================
-- CHECK AND FIX AUTO_INCREMENT FOR ALL TABLES
-- This script checks which tables are missing AUTO_INCREMENT
-- and provides the commands to fix them
-- ============================================

USE spartan_data;

-- ============================================
-- STEP 1: Check which tables are missing AUTO_INCREMENT
-- ============================================

SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    EXTRA,
    CASE 
        WHEN EXTRA LIKE '%auto_increment%' THEN '✓ Has AUTO_INCREMENT'
        ELSE '✗ MISSING AUTO_INCREMENT'
    END AS STATUS
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = 'spartan_data'
    AND COLUMN_NAME = 'id'
    AND COLUMN_KEY = 'PRI'
ORDER BY 
    STATUS DESC,
    TABLE_NAME;

-- ============================================
-- STEP 2: Get the current AUTO_INCREMENT values
-- ============================================

SELECT 
    TABLE_NAME,
    AUTO_INCREMENT AS 'Current AUTO_INCREMENT Value'
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = 'spartan_data'
    AND AUTO_INCREMENT IS NOT NULL
ORDER BY 
    TABLE_NAME;

-- ============================================
-- STEP 3: List all tables in the database
-- ============================================

SELECT 
    TABLE_NAME,
    TABLE_ROWS AS 'Row Count',
    CREATE_TIME AS 'Created At',
    UPDATE_TIME AS 'Last Updated'
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = 'spartan_data'
    AND TABLE_TYPE = 'BASE TABLE'
ORDER BY 
    TABLE_NAME;

-- ============================================
-- STEP 4: Generate ALTER statements for all tables
-- This will show you the exact commands needed
-- ============================================

SELECT 
    CONCAT(
        'ALTER TABLE ', 
        TABLE_NAME, 
        ' MODIFY id INT AUTO_INCREMENT;'
    ) AS 'SQL Command to Add AUTO_INCREMENT'
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = 'spartan_data'
    AND COLUMN_NAME = 'id'
    AND COLUMN_KEY = 'PRI'
ORDER BY 
    TABLE_NAME;

-- ============================================
-- NOTES:
-- ============================================
-- 1. Run the queries above to see the current state
-- 2. Copy and run the generated ALTER statements if needed
-- 3. Make sure to backup your database before making changes
-- 4. AUTO_INCREMENT will start from the next available number
--    based on existing data in the table
