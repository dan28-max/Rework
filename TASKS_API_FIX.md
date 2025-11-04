# Tasks API 500 Error - Complete Fix Guide 🔧

## Current Issue
Getting 500 Internal Server Error when loading My Tasks section.

---

## 🚀 Quick Fix Steps

### Step 1: Create the Database Table
1. Open **phpMyAdmin** (http://localhost/phpmyadmin)
2. Select your database
3. Click **SQL** tab
4. Run this file: **`sql/fix_table_assignments.sql`**

### Step 2: Test the API
Open this page to test if the API works:
```
http://localhost/Rework/test_tasks_api.html
```

This will show you:
- ✅ If the API is responding
- ✅ What data is being returned
- ✅ Any errors in JSON format

### Step 3: Run Debug Script
If the test page shows errors, run:
```
http://localhost/Rework/api/debug_tasks.php
```

This will diagnose:
- Session status
- Database connection
- User office assignment
- Table existence
- Sample queries

---

## 📁 Files Created for Fixing

### API Files:
1. **`api/user_tasks_list_v2.php`** - Simplified, working version
2. **`api/debug_tasks.php`** - Diagnostic tool

### SQL Files:
1. **`sql/fix_table_assignments.sql`** - Complete table setup
2. **`sql/add_missing_columns.sql`** - Add columns to existing table

### Test Files:
1. **`test_tasks_api.html`** - Interactive API tester

### Documentation:
1. **`FIX_DEADLINE_ERROR.md`** - Fix for missing columns
2. **`TASKS_SETUP_GUIDE.md`** - Complete setup guide
3. **`MY_TASKS_BACKEND.md`** - Backend documentation

---

## 🔍 Common Causes of 500 Error

### 1. Table Doesn't Exist
**Check:** Run debug script
**Fix:** Run `sql/fix_table_assignments.sql`

### 2. Missing Columns
**Check:** Run `DESCRIBE table_assignments;` in phpMyAdmin
**Fix:** Run `sql/fix_table_assignments.sql` (drops and recreates)

### 3. No Office Assignment
**Check:** Run debug script
**Fix:** 
```sql
UPDATE users SET office = 'YOUR_OFFICE' WHERE id = YOUR_USER_ID;
```

### 4. PHP Syntax Error
**Check:** Look at API directly in browser
**Fix:** Use the v2 API (already updated in JS)

### 5. Database Connection Error
**Check:** Run debug script
**Fix:** Check `config/database.php` settings

---

## ✅ Verification Checklist

After running the fixes, verify:

- [ ] Table `table_assignments` exists
- [ ] Table has all required columns (id, table_name, assigned_office, description, deadline, priority, status)
- [ ] Your user has an office assigned
- [ ] Sample tasks exist in the table
- [ ] API returns JSON (test with test_tasks_api.html)
- [ ] Dashboard shows tasks without errors

---

## 🧪 Testing Commands

### Test 1: Check Table Structure
```sql
DESCRIBE table_assignments;
```

Should show these columns:
- id
- table_name
- assigned_office
- description
- assigned_date
- deadline ← Important!
- priority
- status
- assigned_by
- created_at
- updated_at

### Test 2: Check Your Office
```sql
SELECT id, username, office, campus FROM users WHERE id = YOUR_USER_ID;
```

### Test 3: Check Tasks for Your Office
```sql
SELECT * FROM table_assignments 
WHERE LOWER(assigned_office) = LOWER('YOUR_OFFICE')
AND status = 'active';
```

### Test 4: Test API Directly
Visit in browser:
```
http://localhost/Rework/api/user_tasks_list_v2.php?filter=all
```

Should return JSON like:
```json
{
  "success": true,
  "tasks": [...],
  "stats": {...}
}
```

---

## 🎯 Expected Behavior After Fix

### Dashboard:
1. Click "My Tasks" in sidebar
2. See loading spinner
3. Tasks appear in cards
4. Badge shows pending count

### Task Cards:
- Priority badge (High/Medium/Low)
- Deadline with countdown
- Description
- "Start Task" button
- "Details" button

### Filters:
- All: Shows everything
- Pending: Only unsubmitted
- Completed: Only submitted

---

## 🆘 Still Not Working?

### Option 1: Use Test Page
```
http://localhost/Rework/test_tasks_api.html
```
This will show the exact error message.

### Option 2: Check PHP Error Log
Location: `xampp/apache/logs/error.log`

Look for recent errors related to `user_tasks_list`.

### Option 3: Enable Debug Mode
The v2 API already has `display_errors = 1`, so you'll see errors directly.

### Option 4: Check Browser Console
1. Open DevTools (F12)
2. Go to Network tab
3. Click on the failed request
4. Look at Response tab

---

## 📋 Quick Setup SQL

If you just want to get it working fast:

```sql
-- Drop and recreate table
DROP TABLE IF EXISTS `table_assignments`;

CREATE TABLE `table_assignments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `table_name` VARCHAR(255) NOT NULL,
  `assigned_office` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `assigned_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `deadline` DATETIME DEFAULT NULL,
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `status` ENUM('active', 'inactive', 'completed') DEFAULT 'active',
  `assigned_by` INT(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add sample task (replace 'RGO' with your office)
INSERT INTO `table_assignments` 
(`table_name`, `assigned_office`, `description`, `deadline`, `priority`, `status`) 
VALUES
('campuspopulation', 'RGO', 'Submit campus population data', DATE_ADD(NOW(), INTERVAL 7 DAY), 'high', 'active');

-- Verify
SELECT * FROM table_assignments;
```

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ No 500 errors in console
- ✅ Tasks appear in the dashboard
- ✅ Badge shows correct count
- ✅ Filters work (All/Pending/Completed)
- ✅ "Start Task" button works
- ✅ Test page shows JSON response

---

## 📞 Next Steps

1. **Run the SQL** to create the table
2. **Test the API** using test_tasks_api.html
3. **Refresh dashboard** and check My Tasks
4. **Add more tasks** for your office as needed

**The v2 API is simpler and more robust - it should work now!** 🎉
