# Fix: Unknown column 'deadline' in 'field list' ❌➡️✅

## Problem
You're getting this error:
```
MySQL said: #1054 - Unknown column 'deadline' in 'field list'
```

This means the `table_assignments` table exists but is **missing the `deadline` column** (and possibly other columns).

---

## 🔧 Solution: Choose ONE of these options

### **Option 1: Drop and Recreate (RECOMMENDED)** ⭐
**Use this if:** You don't have important data in the table yet.

**File:** `sql/fix_table_assignments.sql`

**Steps:**
1. Open **phpMyAdmin** → Select your database
2. Click **SQL** tab
3. Copy and paste the contents of `sql/fix_table_assignments.sql`
4. Click **Go**

This will:
- ✅ Drop the old incomplete table
- ✅ Create a new complete table with all columns
- ✅ Insert sample tasks

---

### **Option 2: Add Missing Columns**
**Use this if:** You have existing data you want to keep.

**File:** `sql/add_missing_columns.sql`

**Steps:**
1. Open **phpMyAdmin** → Select your database
2. Click **SQL** tab
3. Copy and paste the contents of `sql/add_missing_columns.sql`
4. Click **Go**

This will:
- ✅ Add missing columns to existing table
- ✅ Keep your existing data
- ✅ Add indexes for performance

---

### **Option 3: Quick Manual Fix**
Run these SQL commands one by one in phpMyAdmin:

```sql
-- Check current structure
DESCRIBE table_assignments;

-- Add missing columns
ALTER TABLE `table_assignments` 
ADD COLUMN `deadline` DATETIME DEFAULT NULL AFTER `assigned_date`;

ALTER TABLE `table_assignments` 
ADD COLUMN `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium' AFTER `deadline`;

ALTER TABLE `table_assignments` 
ADD COLUMN `status` ENUM('active', 'inactive', 'completed') DEFAULT 'active' AFTER `priority`;

ALTER TABLE `table_assignments` 
ADD COLUMN `description` TEXT DEFAULT NULL AFTER `assigned_office`;

ALTER TABLE `table_assignments` 
ADD COLUMN `assigned_date` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `description`;

-- Verify it worked
DESCRIBE table_assignments;
```

---

## ✅ After Running the Fix

### 1. Verify the table structure:
```sql
DESCRIBE table_assignments;
```

You should see these columns:
- ✅ id
- ✅ table_name
- ✅ assigned_office
- ✅ description
- ✅ assigned_date
- ✅ **deadline** ← This was missing!
- ✅ priority
- ✅ status
- ✅ assigned_by
- ✅ created_at
- ✅ updated_at

### 2. Insert sample tasks:
```sql
INSERT INTO `table_assignments` 
(`table_name`, `assigned_office`, `description`, `deadline`, `priority`, `status`) 
VALUES
('campuspopulation', 'EMU', 'Submit campus population data', DATE_ADD(NOW(), INTERVAL 7 DAY), 'high', 'active'),
('enrollment', 'EMU', 'Update enrollment statistics', DATE_ADD(NOW(), INTERVAL 14 DAY), 'medium', 'active');
```

**⚠️ Replace 'EMU' with your actual office name!**

### 3. Test the dashboard:
1. Refresh your browser
2. Go to **My Tasks** section
3. You should now see your tasks! 🎉

---

## 🎯 Why This Happened

The table was likely created from an older script or manually without all the required columns. The My Tasks feature needs these specific columns:

| Column | Purpose |
|--------|---------|
| `deadline` | When the task is due |
| `priority` | High, Medium, or Low |
| `status` | Active, Inactive, or Completed |
| `description` | Task details |
| `assigned_date` | When task was assigned |

---

## 🧪 Test Your Fix

Run this query to see if everything works:
```sql
SELECT 
    id,
    table_name,
    assigned_office,
    description,
    deadline,
    priority,
    status
FROM table_assignments 
WHERE assigned_office = 'YOUR_OFFICE_NAME'
ORDER BY deadline ASC;
```

If you see results, **it's working!** ✅

---

## 🚀 Next Steps

1. ✅ Run one of the fix scripts above
2. ✅ Insert sample tasks for your office
3. ✅ Refresh the dashboard
4. ✅ Click "My Tasks" in the sidebar
5. ✅ See your tasks displayed beautifully!

---

## Still Having Issues?

Run the debug script:
```
http://localhost/Rework/api/debug_tasks.php
```

This will show you exactly what's wrong and what needs to be fixed.

---

**After running the fix, your My Tasks section will work perfectly!** 🎊
