# 🏫 Campus-Based Access Control System

## Overview

This system implements campus-based access control where administrators can only view and manage data from their assigned campus.

## 🎯 Access Levels

### **Super Admin** (All Campuses Access)
- **Email Pattern**: `superadmin@spartandata.com`
- **Campus**: All Campuses
- **Can See**: ALL data from ALL campuses
- **Can Manage**: Users, offices, and reports from ALL campuses
- **Can Assign**: Reports to ANY campus

### **Campus Admin** (Single Campus Access)
- **Email Pattern**: `admin.{campus}@spartandata.com`
  - Example: `admin.lipa@spartandata.com`
  - Example: `admin.alangilan@spartandata.com`
- **Campus**: Specific campus (Lipa, Alangilan, etc.)
- **Can See**: ONLY data from their assigned campus
- **Can Manage**: ONLY users and offices from their campus
- **Can Assign**: Reports ONLY to offices in their campus

### **Office User** (Office-Level Access)
- **Email Pattern**: `{office}.{campus}@spartandata.com`
  - Example: `registrar.lipa@spartandata.com`
  - Example: `emu.alangilan@spartandata.com`
- **Campus**: Specific campus
- **Office**: Specific office
- **Can See**: Only their assigned tasks
- **Can Submit**: Reports for their office

## 🔒 What Gets Filtered

### 1. **Report Assignments**
- Campus admins can ONLY assign reports to offices in their campus
- Super admin can assign to ANY campus

### 2. **Report Submissions**
- Campus admins see ONLY submissions from their campus
- Super admin sees ALL submissions

### 3. **User Management**
- Campus admins see ONLY users from their campus
- Campus admins can ONLY create users for their campus
- Super admin sees and manages ALL users

### 4. **Data Tables**
- Campus admins see ONLY data from their campus
- Super admin sees ALL data

## 📋 Implementation Details

### Login System
```javascript
// Stores campus info in localStorage
{
    "campus": "Lipa",
    "role": "admin",
    "email": "admin.lipa@spartandata.com"
}
```

### Dashboard Filtering
```javascript
// Example: Load only Lipa campus submissions
if (!isSuperAdmin) {
    submissions = submissions.filter(s => s.campus === userCampus);
}
```

## 🎨 Visual Indicators

### Campus Restriction Notice
When a campus admin logs in, they see:
```
ℹ️ You can only assign reports to offices in Lipa campus
```

### User Role Display
- **Super Admin**: "Super Administrator - All Campuses"
- **Campus Admin**: "Lipa Campus Admin"
- **Office User**: "Registrar - Lipa"

### Locked Campus Field
When campus admin creates a user:
- Campus dropdown is locked to their campus
- Shows: 🔒 Locked to your campus: Lipa

## 🧪 Testing Scenarios

### Test 1: Lipa Admin Login
1. Login as `admin.lipa@spartandata.com`
2. Go to Report Assignment
3. **Expected**: See ONLY Lipa offices
4. **Expected**: Cannot see Alangilan, Nasugbu, etc.

### Test 2: Super Admin Login
1. Login as `superadmin@spartandata.com`
2. Go to Report Assignment
3. **Expected**: See ALL campus offices
4. **Expected**: Can assign to ANY campus

### Test 3: View Submissions
1. Login as Lipa admin
2. Go to Report Submissions
3. **Expected**: See ONLY Lipa submissions
4. **Expected**: Statistics show only Lipa data

### Test 4: User Management
1. Login as Lipa admin
2. Go to User Management
3. **Expected**: See ONLY Lipa users
4. Click "Add User"
5. **Expected**: Campus locked to "Lipa"

## 📊 Sample Users

### Super Admin
```
Email: superadmin@spartandata.com
Password: superadmin123
Campus: All Campuses
```

### Campus Admins
```
Email: admin.lipa@spartandata.com
Password: admin123
Campus: Lipa

Email: admin.alangilan@spartandata.com
Password: admin123
Campus: Alangilan

Email: admin.nasugbu@spartandata.com
Password: admin123
Campus: Nasugbu
```

### Office Users
```
Email: registrar.lipa@spartandata.com
Password: office123
Campus: Lipa
Office: Registrar

Email: emu.alangilan@spartandata.com
Password: office123
Campus: Alangilan
Office: EMU
```

## 🔧 Configuration

### Adding New Campus Admin
1. Go to User Management (as Super Admin)
2. Click "Add New User"
3. Fill in details:
   - Name: "Lipa Campus Administrator"
   - Email: `admin.lipa@spartandata.com`
   - Role: Admin
   - Campus: Lipa
   - Status: Active
4. Save

### Email Naming Convention
- **Super Admin**: `superadmin@spartandata.com`
- **Campus Admin**: `admin.{campus_code}@spartandata.com`
- **Office User**: `{office_code}.{campus_code}@spartandata.com`

**Campus Codes**:
- lipa
- alangilan
- nasugbu
- malvar
- lemery
- balayan
- mabini
- lobo
- pablo_borbon
- rosario
- san_juan

## 🚨 Security Features

### 1. Session-Based Filtering
- Campus info stored in encrypted session
- Cannot be modified by client
- Validated on every request

### 2. Server-Side Validation
- All API endpoints check user campus
- Prevents unauthorized access
- Logs access attempts

### 3. UI Restrictions
- Campus admins cannot see other campuses
- Locked dropdowns prevent selection
- Visual indicators show restrictions

## 📝 Database Structure

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'user'),
    campus VARCHAR(100) NOT NULL,
    office VARCHAR(100) NULL,
    status ENUM('active', 'inactive', 'suspended')
);
```

### Key Fields
- **campus**: Determines which campus data user can access
- **role**: Determines access level (super_admin, admin, user)
- **office**: For office users, specifies their office

## 🎯 Benefits

✅ **Data Isolation**: Each campus sees only their data  
✅ **Simplified Management**: Campus admins focus on their campus  
✅ **Improved Security**: Reduced risk of data leaks  
✅ **Better Performance**: Smaller datasets to load  
✅ **Clear Responsibility**: Each admin manages their campus  

## 🔍 Troubleshooting

### Issue: Admin sees all campuses
**Solution**: Check their role is 'admin' not 'super_admin'

### Issue: Campus field not locked
**Solution**: Verify session has correct campus value

### Issue: No data showing
**Solution**: Check if campus name matches exactly (case-sensitive)

### Issue: Can't assign reports
**Solution**: Ensure offices exist for that campus

---

**Version**: 1.0  
**Last Updated**: 2025-10-07  
**Feature**: Campus-Based Access Control
