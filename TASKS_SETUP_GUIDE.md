# My Tasks - Setup & Troubleshooting Guide 🔧

## 🚨 Error: 500 Internal Server Error

If you're seeing this error when loading My Tasks, follow these steps:

---

## Step 1: Run Debug Script

Visit this URL in your browser:
```
http://localhost/Rework/api/debug_tasks.php
```

This will show you:
- ✅ Session status
- ✅ Database connection
- ✅ User information
- ✅ Whether table_assignments exists
- ✅ What tasks are assigned to your office

---

## Step 2: Create the table_assignments Table

If the debug script shows that `table_assignments` table doesn't exist:

### Option A: Using phpMyAdmin
1. Open **phpMyAdmin** (http://localhost/phpmyadmin)
2. Select your database (usually `bsu_db` or similar)
3. Click **SQL** tab
4. Copy and paste the contents of `sql/create_table_assignments.sql`
5. Click **Go**

### Option B: Using MySQL Command Line
```bash
mysql -u root -p your_database_name < sql/create_table_assignments.sql
```

### Option C: Manual SQL
Run this SQL in phpMyAdmin:

```sql
CREATE TABLE IF NOT EXISTS `table_assignments` (
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
```

---

## Step 3: Add Sample Tasks

After creating the table, add some test tasks:

```sql
INSERT INTO `table_assignments` 
(`table_name`, `assigned_office`, `description`, `deadline`, `priority`) 
VALUES
('campuspopulation', 'YOUR_OFFICE_NAME', 'Submit campus population data', DATE_ADD(NOW(), INTERVAL 7 DAY), 'high'),
('enrollment', 'YOUR_OFFICE_NAME', 'Update enrollment statistics', DATE_ADD(NOW(), INTERVAL 14 DAY), 'medium');
```

**Replace `YOUR_OFFICE_NAME`** with your actual office name (e.g., 'EMU', 'Registrar', etc.)

---

## Step 4: Verify Your Office Assignment

Make sure your user account has an office assigned:

```sql
-- Check your office
SELECT id, username, office, campus FROM users WHERE id = YOUR_USER_ID;

-- Update if needed
UPDATE users SET office = 'EMU' WHERE id = YOUR_USER_ID;
```

---

## Step 5: Test the API Directly

Visit this URL:
```
http://localhost/Rework/api/user_tasks_list.php?action=get_tasks
```

You should see JSON output like:
```json
{
  "success": true,
  "tasks": [...],
  "stats": {
    "total": 2,
    "pending": 2,
    "completed": 0
  }
}
```

---

## Common Issues & Solutions

### Issue 1: "No office assignment found"
**Solution**: Update your user record to include an office
```sql
UPDATE users SET office = 'EMU' WHERE username = 'your_username';
```

### Issue 2: "No tasks table found"
**Solution**: Run the SQL to create `table_assignments` table (see Step 2)

### Issue 3: "No tasks assigned"
**Solution**: Add tasks for your office (see Step 3)

### Issue 4: Session not working
**Solution**: 
1. Clear browser cookies
2. Log out and log back in
3. Check if `session_start()` is called in your files

### Issue 5: Database connection error
**Solution**: 
1. Check `config/database.php` settings
2. Verify MySQL is running
3. Check database credentials

---

## Debugging Checklist

- [ ] MySQL/XAMPP is running
- [ ] You are logged in to the dashboard
- [ ] Your user has an `office` assigned
- [ ] `table_assignments` table exists
- [ ] There are tasks assigned to your office
- [ ] The tasks have `status = 'active'`
- [ ] Office names match exactly (case-insensitive)

---

## Quick Test Commands

### Check if logged in:
```php
<?php
session_start();
echo "User ID: " . ($_SESSION['user_id'] ?? 'Not logged in');
?>
```

### Check database connection:
```php
<?php
require_once 'config/database.php';
$pdo = getDB();
echo "Connected!";
?>
```

### Check table exists:
```sql
SHOW TABLES LIKE 'table_assignments';
```

### Check your tasks:
```sql
SELECT ta.* 
FROM table_assignments ta
JOIN users u ON LOWER(ta.assigned_office) = LOWER(u.office)
WHERE u.id = YOUR_USER_ID
AND ta.status = 'active';
```

---

## After Setup

Once everything is working:

1. **Disable debug mode** in `api/user_tasks_list.php`:
   ```php
   ini_set('display_errors', 0);
   ```

2. **Refresh your dashboard**:
   - Go to Dashboard
   - Click "My Tasks"
   - You should see your tasks!

3. **Badge counter** should show pending task count

---

## Need More Help?

1. Check the browser console for JavaScript errors
2. Check PHP error logs: `xampp/apache/logs/error.log`
3. Run the debug script: `api/debug_tasks.php`
4. Check the network tab in browser DevTools

---

## Sample Office Names

Common office names in the system:
- EMU (Extension and Monitoring Unit)
- Registrar
- HRMO (Human Resource Management Office)
- Accounting
- Planning
- Library
- IT

Make sure the office name in `table_assignments` matches exactly with the office name in the `users` table!

---

## Success! ✅

If everything is set up correctly, you should see:
- ✅ Tasks displayed in cards
- ✅ Priority badges (High/Medium/Low)
- ✅ Deadline countdown
- ✅ "Start Task" buttons
- ✅ Badge counter in sidebar
- ✅ Filter buttons working

**Enjoy your new task management system!** 🎉
