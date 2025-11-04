# Username-Based Login Migration Guide

## Overview
This guide explains how to migrate from email-based login to username-based login with professional usernames like `emu-lipa-sdo`, `admin-lipa`, etc.

## Changes Made

### 1. Database Changes
- Added `username` field to `users` table (VARCHAR(100), UNIQUE, NOT NULL)
- Added `username` field to `user_sessions` table for reference
- Made `email` field optional for login (username is now primary)
- Added index on username for faster lookups

### 2. Frontend Changes (login.html)
- Changed "Email Address" field to "Username"
- Updated icon from envelope to user icon
- Updated placeholder text
- Updated sample credentials display
- Changed input type from `email` to `text`

### 3. JavaScript Changes (login-script.js)
- Renamed all `email` variables to `username`
- Updated validation from email format to username format
- Username validation rules:
  - Required field
  - Minimum 3 characters
  - Only letters, numbers, hyphens, and underscores allowed
  - Regex: `/^[a-zA-Z0-9-_]+$/`

### 4. Backend Changes (simple_auth.php)
- Changed authentication to use `username` instead of `email`
- Updated SQL queries to search by username
- Removed email-based campus/office detection (no longer needed)
- Added username to session variables
- Updated response objects to include username

## Professional Username Format

### Super Admin
- **Username:** `superadmin`
- **Password:** `superadmin123`
- **Access:** All campuses, full system control

### Campus Admins
Format: `admin-{campus}`
- `admin-lipa` - Lipa Campus Admin
- `admin-pablo-borbon` - Pablo Borbon Campus Admin
- `admin-alangilan` - Alangilan Campus Admin
- `admin-rosario` - Rosario Campus Admin
- `admin-san-juan` - San Juan Campus Admin
- `admin-lemery` - Lemery Campus Admin
- `admin-lobo` - Lobo Campus Admin
- `admin-balayan` - Balayan Campus Admin
- `admin-mabini` - Mabini Campus Admin
- `admin-malvar` - Malvar Campus Admin
- `admin-nasugbo` - Nasugbo Campus Admin

**Default Password:** `admin123`

### Office Users
Format: `{office}-{campus}` or `{office}-{campus}-{department}`
- `emu-lipa-sdo` - EMU Office, Lipa SDO
- `emu-san-juan` - EMU Office, San Juan
- `registrar-pablo-borbon` - Registrar Office, Pablo Borbon
- `registrar-lipa` - Registrar Office, Lipa
- `hrmo-alangilan` - HRMO Office, Alangilan
- `accounting-rosario` - Accounting Office, Rosario
- `library-lemery` - Library Office, Lemery
- `guidance-lobo` - Guidance Office, Lobo
- `cashier-balayan` - Cashier Office, Balayan
- `supply-mabini` - Supply Office, Mabini
- `ict-malvar` - ICT Office, Malvar
- `research-nasugbo` - Research Office, Nasugbo

**Default Password:** `office123`

## Migration Steps

### Step 1: Backup Database
```sql
-- Create backup before migration
mysqldump -u root -p spartan_data > backup_before_username_migration.sql
```

### Step 2: Run Database Migration
Open phpMyAdmin or MySQL command line and run:

```sql
-- Run this file first
SOURCE C:/xampp/htdocs/Rework/database/migrations/add_username_field.sql;

-- Then run this file to insert sample users
SOURCE C:/xampp/htdocs/Rework/database/migrations/insert_sample_users_with_usernames.sql;
```

Or in phpMyAdmin:
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Select `spartan_data` database
3. Click "SQL" tab
4. Copy and paste contents of `add_username_field.sql`
5. Click "Go"
6. Repeat for `insert_sample_users_with_usernames.sql`

### Step 3: Clear Browser Cache
- Clear browser cache and localStorage
- Or use incognito/private browsing mode for testing

### Step 4: Test Login
1. Navigate to login page
2. Try logging in with username instead of email:
   - Username: `superadmin`
   - Password: `superadmin123`

## Username Naming Convention

### For New Users

When creating new users, follow this naming convention:

**Campus Admins:**
```
admin-{campus-name-lowercase}
Example: admin-lipa, admin-nasugbo
```

**Office Users:**
```
{office-abbreviation}-{campus-name-lowercase}
Example: emu-lipa-sdo, registrar-pablo-borbon
```

**With Department/Division:**
```
{office}-{campus}-{department}
Example: emu-lipa-sdo, accounting-rosario-budget
```

### Rules:
- Use lowercase letters only
- Separate words with hyphens (-)
- Use standard office abbreviations (EMU, HRMO, ICT, etc.)
- Keep it short but descriptive
- Must be unique across the system

## Updating Existing Users

If you have existing users with emails, update them manually:

```sql
-- Update specific user
UPDATE users 
SET username = 'new-username' 
WHERE email = 'old.email@domain.com';

-- Example
UPDATE users 
SET username = 'emu-lipa-sdo' 
WHERE email = 'emu.lipa@spartandata.com';
```

## API Changes

### Login Request
**Before:**
```json
{
  "email": "admin.lipa@spartandata.com",
  "password": "admin123",
  "remember": false
}
```

**After:**
```json
{
  "username": "admin-lipa",
  "password": "admin123",
  "remember": false
}
```

### Login Response
**Before:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin.lipa@spartandata.com",
      "name": "Lipa Campus Admin",
      "role": "admin",
      "campus": "Lipa"
    }
  }
}
```

**After:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin-lipa",
      "email": "admin.lipa@spartandata.com",
      "name": "Lipa Campus Admin",
      "role": "admin",
      "campus": "Lipa"
    }
  }
}
```

## Session Variables

Updated session variables now include username:
- `$_SESSION['user_id']`
- `$_SESSION['session_id']`
- `$_SESSION['user_role']`
- `$_SESSION['username']` ← **NEW**
- `$_SESSION['user_email']`
- `$_SESSION['user_campus']`
- `$_SESSION['user_office']`

## Troubleshooting

### Issue: "Username is required" error
**Solution:** Clear browser cache and localStorage, then try again.

### Issue: "Invalid credentials" error
**Solution:** Ensure you're using the username, not the email. Check the sample accounts list.

### Issue: Database error
**Solution:** Verify the migration SQL files ran successfully. Check if `username` column exists:
```sql
DESCRIBE users;
```

### Issue: Existing users can't login
**Solution:** Update their records with usernames:
```sql
UPDATE users SET username = 'desired-username' WHERE id = user_id;
```

## Rollback (If Needed)

If you need to rollback to email-based login:

```sql
-- Remove username column
ALTER TABLE users DROP COLUMN username;
ALTER TABLE user_sessions DROP COLUMN username;

-- Restore old files from backup
```

Then restore the old `login.html`, `login-script.js`, and `simple_auth.php` files from version control.

## Security Notes

1. **Usernames are case-sensitive** - Store and compare as-is
2. **Usernames are unique** - Database constraint prevents duplicates
3. **Email is still stored** - Can be used for password recovery
4. **Password requirements unchanged** - Still minimum 6 characters
5. **Session management unchanged** - Same security measures apply

## Future Enhancements

Consider implementing:
- Password reset via email
- Username availability check during registration
- Username change functionality (with admin approval)
- Two-factor authentication
- Account lockout after failed attempts

## Support

For issues or questions:
1. Check this guide first
2. Review error logs in `php_error.log`
3. Check browser console for JavaScript errors
4. Verify database structure matches migration files

---

**Last Updated:** 2025-10-09  
**Version:** 1.0  
**Migration Status:** ✅ Complete
