-- Migration: Add username field and update existing users
-- This migration adds a username field to replace email-based login

USE spartan_data;

-- Add username column to users table (nullable first, then make NOT NULL after populating)
ALTER TABLE users 
ADD COLUMN username VARCHAR(100) UNIQUE NULL AFTER id;

-- Update existing users with professional usernames
-- Super Admin
UPDATE users SET username = 'superadmin' WHERE email = 'superadmin@spartandata.com';

-- Campus Admins
UPDATE users SET username = 'admin-lipa' WHERE email = 'admin.lipa@spartandata.com';
UPDATE users SET username = 'admin-pablo-borbon' WHERE email = 'admin.pablo_borbon@spartandata.com';
UPDATE users SET username = 'admin-alangilan' WHERE email = 'admin.alangilan@spartandata.com';
UPDATE users SET username = 'admin-rosario' WHERE email = 'admin.rosario@spartandata.com';
UPDATE users SET username = 'admin-san-juan' WHERE email = 'admin.san_juan@spartandata.com';
UPDATE users SET username = 'admin-lemery' WHERE email = 'admin.lemery@spartandata.com';
UPDATE users SET username = 'admin-lobo' WHERE email = 'admin.lobo@spartandata.com';
UPDATE users SET username = 'admin-balayan' WHERE email = 'admin.balayan@spartandata.com';
UPDATE users SET username = 'admin-mabini' WHERE email = 'admin.mabini@spartandata.com';
UPDATE users SET username = 'admin-malvar' WHERE email = 'admin.malvar@spartandata.com';
UPDATE users SET username = 'admin-nasugbo' WHERE email = 'admin.nasugbo@spartandata.com';

-- Office Users (format: office-campus)
UPDATE users SET username = 'emu-lipa-sdo' WHERE email = 'emu.lipa@spartandata.com';
UPDATE users SET username = 'emu-san-juan' WHERE email = 'emu.san_juan@spartandata.com';
UPDATE users SET username = 'registrar-pablo-borbon' WHERE email = 'registrar.pablo_borbon@spartandata.com';
UPDATE users SET username = 'registrar-lipa' WHERE email = 'registrar.lipa@spartandata.com';
UPDATE users SET username = 'hrmo-alangilan' WHERE email = 'hrmo.alangilan@spartandata.com';
UPDATE users SET username = 'accounting-rosario' WHERE email = 'accounting.rosario@spartandata.com';
UPDATE users SET username = 'library-lemery' WHERE email = 'library.lemery@spartandata.com';
UPDATE users SET username = 'guidance-lobo' WHERE email = 'guidance.lobo@spartandata.com';
UPDATE users SET username = 'cashier-balayan' WHERE email = 'cashier.balayan@spartandata.com';
UPDATE users SET username = 'supply-mabini' WHERE email = 'supply.mabini@spartandata.com';
UPDATE users SET username = 'ict-malvar' WHERE email = 'ict.malvar@spartandata.com';
UPDATE users SET username = 'research-nasugbo' WHERE email = 'research.nasugbo@spartandata.com';

-- Handle any remaining users without usernames (generate from email or ID)
UPDATE users 
SET username = CONCAT('user_', id) 
WHERE username IS NULL OR username = '';

-- Verify all users have usernames before proceeding
SELECT 'Checking for users without usernames...' AS status;
SELECT id, email, username FROM users WHERE username IS NULL OR username = '';

-- Now make username NOT NULL after all values are populated
ALTER TABLE users 
MODIFY COLUMN username VARCHAR(100) UNIQUE NOT NULL;

-- Add index for faster username lookups
CREATE INDEX idx_username ON users(username);

-- Update session table to include username reference
ALTER TABLE user_sessions 
ADD COLUMN username VARCHAR(100) AFTER user_id;

-- Populate username in existing sessions (if any)
UPDATE user_sessions us
JOIN users u ON us.user_id = u.id
SET us.username = u.username;

-- Add comment to email field indicating it's now optional for login
ALTER TABLE users 
MODIFY COLUMN email VARCHAR(255) NULL COMMENT 'Email address (optional for login, username is primary)';

SELECT 'Migration completed successfully! Username field added and existing users updated.' AS status;
