# My Tasks Backend Implementation 🚀

## Overview
The My Tasks section now has a fully functional backend that fetches real tasks from the database, calculates priorities, tracks deadlines, and manages task status.

---

## 📁 Files Created

### 1. **API Endpoint**
**File**: `api/user_tasks_list.php`

**Purpose**: Backend API for managing user tasks

**Features**:
- ✅ Fetch tasks assigned to user's office
- ✅ Filter by status (all, pending, completed)
- ✅ Calculate days remaining until deadline
- ✅ Determine task status (pending, overdue, due_soon, completed)
- ✅ Sort by priority and deadline
- ✅ Return task statistics

---

## 🔌 API Endpoints

### **GET /api/user_tasks_list.php?action=get_tasks**

Fetches all tasks assigned to the current user's office.

**Query Parameters**:
- `filter` (optional): `all`, `pending`, `completed`

**Response**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": 1,
      "table_name": "campuspopulation",
      "title": "Campus Population",
      "description": "Submit campus population data",
      "office": "EMU",
      "assigned_date": "2025-10-01",
      "assigned_date_formatted": "Oct 01, 2025",
      "deadline": "2025-10-20",
      "deadline_formatted": "Oct 20, 2025",
      "days_remaining": 6,
      "priority": "high",
      "status": "due_soon",
      "assigned_by": "Admin Name",
      "submission_id": null,
      "submission_date": null,
      "submission_status": null
    }
  ],
  "stats": {
    "total": 5,
    "pending": 3,
    "completed": 2,
    "overdue": 0
  }
}
```

### **GET /api/user_tasks_list.php?action=get_task_details**

Get detailed information about a specific task.

**Query Parameters**:
- `task_id` (required): ID of the task

**Response**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "table_name": "campuspopulation",
    "description": "Submit campus population data",
    "assigned_office": "EMU",
    "assigned_by": 1,
    "assigned_by_name": "Admin Name",
    "assigned_by_email": "admin@example.com",
    "deadline": "2025-10-20",
    "priority": "high",
    "status": "active"
  }
}
```

### **POST /api/user_tasks_list.php?action=update_task_status**

Update task status (for future use - tracking progress).

**Request Body**:
```json
{
  "task_id": 1,
  "status": "in_progress"
}
```

---

## 🎯 Task Status Logic

The system automatically determines task status based on:

| Status | Condition |
|--------|-----------|
| **completed** | User has submitted the report |
| **overdue** | Deadline has passed and not submitted |
| **due_soon** | Deadline is within 3 days |
| **pending** | Normal pending task |

---

## 🔢 Priority Sorting

Tasks are sorted by:
1. **Priority** (High → Medium → Low)
2. **Deadline** (Earliest first)
3. **Assigned Date** (Most recent first)

---

## 💾 Database Requirements

### **Required Tables**:

1. **`table_assignments`** - Stores task assignments
   ```sql
   - id
   - table_name
   - assigned_office
   - description
   - assigned_date
   - deadline
   - priority (high, medium, low)
   - status (active, inactive)
   - assigned_by (user_id)
   ```

2. **`report_submissions`** - Tracks completed submissions
   ```sql
   - id
   - table_name
   - user_id
   - office
   - submission_date
   - status
   ```

3. **`users`** - User information
   ```sql
   - id
   - name
   - office
   - campus
   ```

---

## 🎨 Frontend Integration

### **JavaScript Functions**:

#### **Load Tasks**
```javascript
async loadMyTasks(filter = 'all')
```
- Fetches tasks from API
- Displays loading state
- Handles errors gracefully
- Redirects to login if unauthorized

#### **Render Tasks**
```javascript
renderTasks(tasks, stats)
```
- Renders task cards with proper styling
- Shows priority badges
- Displays deadline countdown
- Handles completed vs pending states

#### **Filter Tasks**
```javascript
filterTasks(filter)
```
- Filters by: all, pending, completed
- Reloads tasks with filter
- Shows notification

#### **Start Task**
```javascript
startTask(tableName, taskId)
```
- Redirects to report submission page
- Passes table name and task ID

---

## 🎨 Visual Features

### **Task Card States**:
- **High Priority**: Red left border with glow
- **Medium Priority**: Orange left border
- **Low Priority**: Blue left border
- **Completed**: Green left border, faded, strikethrough
- **Overdue**: Red text, exclamation icon

### **Dynamic Content**:
- Days remaining countdown
- Overdue indicator (red)
- Due soon indicator (orange)
- Completion status
- Assigned by name

---

## 🔐 Security

### **Authentication**:
- ✅ Session-based authentication required
- ✅ Returns 401 if not logged in
- ✅ Filters tasks by user's office
- ✅ Only shows tasks assigned to user's office

### **Authorization**:
- ✅ Users can only see tasks for their office
- ✅ Cannot access other offices' tasks
- ✅ Proper SQL filtering with prepared statements

---

## 📊 Task Statistics

The API returns statistics:
- **Total**: All tasks
- **Pending**: Not yet submitted
- **Completed**: Already submitted
- **Overdue**: Past deadline

These stats are used to:
- Update badge counter in sidebar
- Show progress metrics
- Display completion rate

---

## 🧪 Testing

### **Test Scenarios**:

1. **No Tasks**:
   - Shows "No tasks assigned" message
   - Empty state with icon

2. **Pending Tasks**:
   - Shows all pending tasks
   - Sorted by priority and deadline
   - "Start Task" button visible

3. **Completed Tasks**:
   - Shows with green border
   - Strikethrough title
   - "View Submission" button

4. **Overdue Tasks**:
   - Red text for days overdue
   - Exclamation icon
   - High priority styling

5. **Filter Functionality**:
   - All: Shows everything
   - Pending: Only unsubmitted
   - Completed: Only submitted

---

## 🔄 Data Flow

```
User clicks "My Tasks"
    ↓
JavaScript calls loadMyTasks()
    ↓
Fetch API: user_tasks_list.php
    ↓
Backend checks authentication
    ↓
Get user's office from database
    ↓
Query table_assignments for that office
    ↓
Join with report_submissions to check completion
    ↓
Calculate status, days remaining, etc.
    ↓
Return formatted tasks + stats
    ↓
JavaScript renders task cards
    ↓
Update badge counter
```

---

## 🎯 Future Enhancements

### **Planned Features**:
1. **Task Progress Tracking** - Track "in progress" status
2. **Task Comments** - Add notes to tasks
3. **Task Reminders** - Email/push notifications
4. **Task History** - View past tasks
5. **Bulk Actions** - Mark multiple as complete
6. **Task Templates** - Recurring tasks
7. **Task Dependencies** - Tasks that depend on others
8. **Time Tracking** - Log time spent on tasks

---

## 📝 Usage Example

### **Frontend Code**:
```javascript
// Load all tasks
userDashboard.loadMyTasks('all');

// Load only pending tasks
userDashboard.loadMyTasks('pending');

// Load only completed tasks
userDashboard.loadMyTasks('completed');

// Start a task (redirect to submission)
userDashboard.startTask('campuspopulation', 1);

// View task details
userDashboard.viewTaskDetails(1);
```

### **API Call Example**:
```javascript
// Direct API call
fetch('api/user_tasks_list.php?action=get_tasks&filter=pending')
  .then(r => r.json())
  .then(data => {
    console.log('Tasks:', data.tasks);
    console.log('Stats:', data.stats);
  });
```

---

## ✅ **Status**: Fully Implemented and Working

The My Tasks backend is now complete with:
- ✅ Real database integration
- ✅ Dynamic task loading
- ✅ Priority and deadline management
- ✅ Status tracking
- ✅ Filter functionality
- ✅ Statistics calculation
- ✅ Proper error handling
- ✅ Security measures

**Refresh your dashboard and go to "My Tasks" to see it in action!** 🎉
