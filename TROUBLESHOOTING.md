# Troubleshooting Guide - Spartan Data

## 500 Internal Server Error on Login

### Root Cause
The 500 error occurs when MySQL/MariaDB is not running in XAMPP, causing the PHP authentication script to fail when trying to connect to the database.

### Quick Fix

#### Option 1: Use System Check Tool (Recommended)
1. Open your browser and navigate to: `http://localhost/Rework/check_system.html`
2. The page will automatically check your system status
3. Follow the on-screen instructions to fix any issues

#### Option 2: Manual Fix
1. **Start MySQL in XAMPP:**
   - Open XAMPP Control Panel (`C:\xampp\xampp-control.exe`)
   - Click "Start" next to MySQL
   - Wait until status shows green "Running"

2. **Verify Database Exists:**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Check if `spartan_data` database exists
   - If not, import `database/schema.sql`

3. **Test the Fix:**
   - Try logging in again at `http://localhost/Rework/login.html`

### Common Issues

#### Issue 1: MySQL Won't Start
**Symptoms:** MySQL button in XAMPP turns red or shows error

**Solutions:**
- Port 3306 might be in use by another program
- Check XAMPP error logs: `C:\xampp\mysql\data\mysql_error.log`
- Try changing MySQL port in `C:\xampp\mysql\bin\my.ini`
- Restart your computer and try again

#### Issue 2: Database Not Found
**Symptoms:** Error message "Database 'spartan_data' does not exist"

**Solutions:**
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click "Import" tab
3. Choose file: `database/schema.sql`
4. Click "Go" to import

#### Issue 3: Authentication Still Failing
**Symptoms:** Login fails even after MySQL is running

**Solutions:**
1. Clear browser cache and cookies
2. Check if users exist in database:
   ```sql
   SELECT * FROM users;
   ```
3. Verify default credentials:
   - Email: `admin@spartandata.com`
   - Password: `password`

#### Issue 4: Session Errors
**Symptoms:** "Session cannot be started" warnings

**Solutions:**
1. Check PHP session directory exists: `C:\xampp\tmp`
2. Verify PHP session settings in `php.ini`
3. Clear old session files from `C:\xampp\tmp`

### Testing Tools

#### 1. System Check Page
- URL: `http://localhost/Rework/check_system.html`
- Shows: MySQL status, database status, table status
- Provides: Step-by-step fix instructions

#### 2. Database Check API
- URL: `http://localhost/Rework/check_db.php`
- Returns: JSON with detailed system status
- Use: For debugging or automated checks

### Error Codes Reference

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 500 | Internal Server Error | Check MySQL is running |
| 401 | Unauthorized | Check credentials or session |
| 404 | Not Found | Check file paths and URLs |
| 405 | Method Not Allowed | Check HTTP method (GET/POST) |

### Debug Mode

To enable detailed error messages:

1. Edit `api/simple_auth.php`
2. Add at the top (after `<?php`):
   ```php
   error_reporting(E_ALL);
   ini_set('display_errors', 1);
   ```

3. Check browser console for detailed errors

### Contact & Support

If issues persist:
1. Check XAMPP error logs
2. Verify PHP version compatibility (7.4+)
3. Ensure all required PHP extensions are enabled
4. Review browser console for JavaScript errors

### Preventive Measures

To avoid future issues:
1. Always start MySQL before accessing the application
2. Keep XAMPP updated
3. Regularly backup the database
4. Monitor XAMPP error logs
5. Use the system check tool periodically

---

**Last Updated:** 2025-10-09
**Version:** 1.0
