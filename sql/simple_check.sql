-- Simple check: Show table structure
DESCRIBE table_assignments;

-- Show recent assignments
SELECT * FROM table_assignments ORDER BY id DESC LIMIT 3;
