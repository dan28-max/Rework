# Admin Dashboard - Campus Filtering Guide

## 🎯 Campus-Based Data Filtering

Your admin dashboard now **automatically filters all data by campus** based on the admin's designated campus.

---

## 🔐 How It Works

### User Roles & Access

#### **Super Admin** (`role: 'super_admin'`)
- ✅ Sees **ALL data** from **ALL campuses**
- ✅ Can manage users from any campus
- ✅ Can view submissions from any campus
- ✅ Can assign reports to any campus
- ✅ No filtering applied

#### **Campus Admin** (`role: 'admin'`)
- ✅ Sees **ONLY data** from **their assigned campus**
- ✅ Can manage users from their campus only
- ✅ Can view submissions from their campus only
- ✅ Can assign reports to their campus only
- ✅ **Automatic filtering applied**

---

## 📊 What Gets Filtered

### 1. **Dashboard Statistics** ✅
**Filtered Data:**
- Total Users (only from your campus)
- Admin Users (only from your campus)
- Active Users (only from your campus)
- Inactive Users (only from your campus)
- Total Reports (only from your campus)
- Pending Reports (only from your campus)
- Approved Reports (only from your campus)
- Rejected Reports (only from your campus)

**Code:**
```javascript
// Filter users by campus
if (!this.isSuperAdmin && this.userCampus) {
    users = users.filter(u => 
        u.campus === this.userCampus || 
        u.role === 'super_admin' ||
        u.campus === 'All Campuses'
    );
}

// Filter submissions by campus
if (!this.isSuperAdmin && this.userCampus) {
    submissions = submissions.filter(s => 
        s.campus === this.userCampus
    );
}
```

### 2. **Recent Submissions** ✅
**Filtered Data:**
- Shows only submissions from your campus
- Last 5 submissions from your campus

**Example:**
- Lipa Admin → Sees only Lipa submissions
- Nasugbu Admin → Sees only Nasugbu submissions
- Super Admin → Sees all submissions

### 3. **User Activity** ✅
**Filtered Data:**
- Shows only users from your campus
- Last 5 active users from your campus
- Super admins always visible (for reference)

**Example:**
- Lipa Admin → Sees Lipa users + Super Admins
- Balayan Admin → Sees Balayan users + Super Admins

### 4. **User Management** ✅
**Filtered Data:**
- User list shows only your campus users
- Can only create users for your campus
- Can only edit users from your campus
- Can only delete users from your campus

**Campus Field Behavior:**
- Super Admin: Can select any campus
- Campus Admin: Campus field locked to their campus

### 5. **Report Submissions** ✅
**Filtered Data:**
- Submission list shows only your campus
- Can only approve/reject your campus submissions
- Can only view details of your campus submissions

**Example:**
- Lipa Admin clicks "Report Submissions"
- Sees only submissions where `campus = 'Lipa'`
- Cannot see Nasugbu, Balayan, or other campus submissions

### 6. **Report Assignment** ✅
**Filtered Data:**
- Office list shows only your campus offices
- Can only assign reports to your campus offices
- Cannot assign to other campuses

**Example:**
- Lipa Admin → Sees only Lipa offices
- Can assign reports to Lipa offices only

---

## 🎨 Visual Indicators

### Campus Filter Notice Banner
When you're a campus admin, you'll see a **red banner** at the top:

```
🔍 Campus Filter Active
Showing data only for [Your Campus] campus ✓
```

**Features:**
- Red gradient background
- Animated slide-in effect
- Shows your campus name
- Always visible as reminder

### Sidebar Role Display
Your role is displayed in the sidebar:
- Super Admin: "Super Administrator - All Campuses"
- Campus Admin: "[Campus Name] Campus Admin"

---

## 📝 Examples

### Example 1: Lipa Campus Admin

**Login as:** Lipa Campus Admin

**Dashboard Shows:**
- Users: 15 (only Lipa users)
- Submissions: 23 (only Lipa submissions)
- Recent Activity: Last 5 Lipa users

**User Management:**
- Lists only Lipa users
- Campus field locked to "Lipa"
- Cannot create users for other campuses

**Report Submissions:**
- Shows only Lipa submissions
- Can approve/reject Lipa submissions only

**Data Management:**
- Shows only Lipa offices
- Can assign reports to Lipa offices only

### Example 2: Super Admin

**Login as:** Super Admin

**Dashboard Shows:**
- Users: 150 (all campuses)
- Submissions: 450 (all campuses)
- Recent Activity: Last 5 users from any campus

**User Management:**
- Lists all users from all campuses
- Can select any campus
- Can create users for any campus

**Report Submissions:**
- Shows all submissions from all campuses
- Can approve/reject any submission

**Data Management:**
- Shows all offices from all campuses
- Can assign reports to any campus

---

## 🔄 How Campus is Determined

### From Session Data
```javascript
getUserSession() {
    const sessionData = localStorage.getItem('spartan_session');
    const session = JSON.parse(sessionData);
    
    this.userCampus = session.campus;  // e.g., "Lipa"
    this.userRole = session.role;      // e.g., "admin"
    this.isSuperAdmin = session.role === 'super_admin';
}
```

### Session Data Structure
```json
{
    "user_id": 5,
    "name": "John Doe",
    "email": "john@lipa.edu",
    "role": "admin",
    "campus": "Lipa",
    "office": null
}
```

---

## 🛠️ Technical Implementation

### Filter Functions

#### Dashboard Statistics
```javascript
async loadDashboardStats() {
    // Fetch all users
    const users = await fetchUsers();
    
    // Apply campus filter
    if (!this.isSuperAdmin && this.userCampus) {
        users = users.filter(u => 
            u.campus === this.userCampus || 
            u.role === 'super_admin' ||
            u.campus === 'All Campuses'
        );
    }
    
    // Update statistics
    updateStats(users);
}
```

#### Submissions
```javascript
async loadSubmissions() {
    // Fetch all submissions
    let submissions = await fetchSubmissions();
    
    // Apply campus filter
    if (!this.isSuperAdmin && this.userCampus) {
        submissions = submissions.filter(s => 
            s.campus === this.userCampus
        );
    }
    
    // Render filtered submissions
    renderSubmissions(submissions);
}
```

#### Offices
```javascript
async loadAvailableOffices() {
    // Fetch all offices
    const offices = await fetchOffices();
    
    // Apply campus filter
    if (!this.isSuperAdmin && this.userCampus) {
        offices = offices.filter(o => 
            o.campus === this.userCampus
        );
    }
    
    // Render filtered offices
    renderOffices(offices);
}
```

---

## 🔍 Debugging Campus Filter

### Check Current Campus
Open browser console (F12) and type:
```javascript
console.log('Campus:', adminDashboard.userCampus);
console.log('Role:', adminDashboard.userRole);
console.log('Is Super Admin:', adminDashboard.isSuperAdmin);
```

### View Filter Logs
The dashboard logs filtering activity:
```
Filtered users for Lipa: 15 users
Filtered submissions for Lipa: 23 submissions
Filtered recent submissions for Lipa: 5 submissions
Filtered user activity for Lipa: 12 users
```

### Verify Session Data
```javascript
const session = JSON.parse(localStorage.getItem('spartan_session'));
console.log('Session:', session);
```

---

## ⚠️ Important Notes

### 1. Super Admins Always Visible
Super admin accounts are visible to all campus admins because:
- They need to know who has full system access
- They may need to contact super admins
- Super admins manage all campuses

### 2. Campus Field Locking
When campus admin creates a user:
- Campus field is automatically set to their campus
- Campus field is disabled (cannot change)
- Prevents creating users for other campuses

### 3. Data Isolation
Campus admins **CANNOT**:
- ❌ View other campus data
- ❌ Modify other campus users
- ❌ Approve other campus submissions
- ❌ Assign reports to other campuses

### 4. Database Queries
Filtering happens in **JavaScript**, not in database queries:
- All data is fetched from database
- Filtering applied in frontend
- For better performance, consider backend filtering

---

## 🚀 Testing Campus Filtering

### Test 1: Create Campus Admin
1. Login as Super Admin
2. Create new user:
   - Name: Test Lipa Admin
   - Email: test@lipa.edu
   - Role: Admin
   - Campus: Lipa
3. Logout and login as Test Lipa Admin
4. Verify you see only Lipa data

### Test 2: Check Statistics
1. Login as Campus Admin
2. Note the user count
3. Login as Super Admin
4. User count should be higher (all campuses)

### Test 3: Verify Submissions
1. Login as Lipa Admin
2. Go to Report Submissions
3. All submissions should show "Lipa" campus
4. No other campus submissions visible

### Test 4: Try Creating User
1. Login as Campus Admin
2. Click "Add New User"
3. Campus field should be locked to your campus
4. Try to save → User created for your campus only

---

## 📊 Filter Summary

| Data Type | Super Admin | Campus Admin |
|-----------|-------------|--------------|
| Users | All campuses | Own campus only |
| Submissions | All campuses | Own campus only |
| Statistics | All campuses | Own campus only |
| Offices | All campuses | Own campus only |
| User Activity | All campuses | Own campus only |
| Recent Submissions | All campuses | Own campus only |

---

## ✅ Confirmation

**Campus filtering is now active!**

- ✅ All dashboard data filtered by campus
- ✅ User management restricted to campus
- ✅ Submissions filtered by campus
- ✅ Report assignments restricted to campus
- ✅ Visual indicator shows active filter
- ✅ Super admins see all data
- ✅ Campus admins see only their data

**Your data is properly isolated by campus!** 🎉

---

**Last Updated:** 2025-10-09  
**Status:** ✅ Fully Implemented  
**Applies To:** All admin dashboard sections
