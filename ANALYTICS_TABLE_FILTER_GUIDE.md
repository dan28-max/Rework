# Analytics Table Filtering Guide

## 🎯 Filter Analytics by Report Type

You can now **filter analytics charts by specific report types** to see detailed statistics for each table!

---

## 📊 How to Use

### Filter by Report Type

1. **Go to Analytics** section
2. **Select a report type** from the first dropdown:
   - All Report Types (default)
   - Campus Population
   - Admission Data
   - Enrollment Data
   - Graduates Data
   - Employee Data
   - Leave Privilege
   - Disability Data
   - Waste Data
   - Vehicle Data
   - Fuel Data
   - Water Data
   - Electricity Data

3. **Charts update automatically** to show only that report type

### Filter by Time Range

Select from the second dropdown:
- Last 7 Days
- Last 30 Days (default)
- Last 90 Days
- All Time

### Combined Filters

You can combine both filters:
- **Example 1**: Campus Population + Last 7 Days
- **Example 2**: Admission Data + Last 30 Days
- **Example 3**: Employee Data + All Time

---

## 🎨 Visual Indicators

### Filter Banner

When filters are active, you'll see a **red banner** showing:
```
🔍 Active Filters: Report Type: Campus Population | Time: Last 30 Days | Campus: Lipa
```

**Features:**
- Shows all active filters
- Red gradient background
- Clear Filters button
- Animated slide-in effect

### Clear Filters Button

Click **"Clear Filters"** to:
- Reset report type to "All Report Types"
- Reset time range to "All Time"
- Reload charts with all data
- Hide the filter banner

---

## 📈 What Gets Filtered

### All 4 Charts Update:

1. **Submissions by Status**
   - Shows pending/approved/rejected for selected report only
   - Example: Only Campus Population submissions

2. **Submissions by Campus**
   - Shows campus distribution for selected report
   - Example: Which campuses submit Admission Data most

3. **Submissions by Report Type**
   - When "All Report Types" selected: Shows all reports
   - When specific type selected: Shows only that type (single bar)

4. **Submissions Over Time**
   - Shows timeline for selected report only
   - Example: Campus Population submissions over last 30 days

### Summary Cards Update:

1. **Total Submissions** - Count for selected report type
2. **Approval Rate** - Approval % for selected report type
3. **Active Campuses** - Campuses submitting selected report
4. **Avg. Processing Time** - Processing time for selected report

---

## 💡 Use Cases

### Use Case 1: Campus Population Analysis
**Goal:** See how Campus Population reports are performing

**Steps:**
1. Select "Campus Population" from dropdown
2. Select "Last 30 Days"
3. View charts showing only Campus Population data

**Insights:**
- How many Campus Population reports submitted
- Which campuses submit most
- Approval rate for Campus Population
- Submission trends

### Use Case 2: Admission Data Tracking
**Goal:** Monitor Admission Data submissions

**Steps:**
1. Select "Admission Data"
2. Select "Last 7 Days"
3. View recent Admission Data activity

**Insights:**
- Recent Admission Data submissions
- Status breakdown (pending/approved)
- Campus participation
- Processing efficiency

### Use Case 3: Employee Data Review
**Goal:** Check Employee Data compliance

**Steps:**
1. Select "Employee Data"
2. Select "All Time"
3. View complete Employee Data history

**Insights:**
- Total Employee Data submissions ever
- Historical trends
- Campus compliance
- Overall approval rate

---

## 🔄 How It Works

### Filtering Logic

```javascript
// 1. Fetch all submissions from database
let submissions = await fetchSubmissions();

// 2. Filter by campus (if campus admin)
if (!isSuperAdmin && userCampus) {
    submissions = submissions.filter(s => s.campus === userCampus);
}

// 3. Filter by table type (if selected)
if (tableFilter !== 'all') {
    submissions = submissions.filter(s => s.table_name === tableFilter);
}

// 4. Filter by time range (if selected)
if (timeRange !== 'all') {
    const cutoffDate = calculateCutoffDate(timeRange);
    submissions = submissions.filter(s => s.submitted_at >= cutoffDate);
}

// 5. Create charts with filtered data
createCharts(submissions);
```

### Time Range Calculation

```javascript
// Last 7 Days
const cutoffDate = new Date(now - (7 * 24 * 60 * 60 * 1000));

// Last 30 Days
const cutoffDate = new Date(now - (30 * 24 * 60 * 60 * 1000));

// Last 90 Days
const cutoffDate = new Date(now - (90 * 24 * 60 * 60 * 1000));
```

---

## 📊 Example Scenarios

### Scenario 1: All Data (No Filters)

**Filters:**
- Report Type: All Report Types
- Time Range: All Time

**Result:**
- Shows all submissions from all report types
- Complete historical data
- All campuses (or your campus if campus admin)

### Scenario 2: Specific Report, Recent Data

**Filters:**
- Report Type: Campus Population
- Time Range: Last 7 Days

**Result:**
- Only Campus Population submissions
- Only from last 7 days
- Focused, recent analysis

### Scenario 3: Specific Report, Complete History

**Filters:**
- Report Type: Admission Data
- Time Range: All Time

**Result:**
- Only Admission Data submissions
- Complete historical data
- Long-term trends

---

## 🎯 Benefits

### For Super Admins:
- ✅ Analyze each report type separately
- ✅ Compare performance across report types
- ✅ Identify problematic report types
- ✅ Track trends for specific reports

### For Campus Admins:
- ✅ Focus on specific reports for your campus
- ✅ Monitor compliance for each report type
- ✅ Track submission patterns
- ✅ Identify areas needing attention

### For Analysis:
- ✅ Detailed insights per report type
- ✅ Time-based trend analysis
- ✅ Campus-specific performance
- ✅ Data-driven decisions

---

## 🔍 Filter Combinations

### Popular Combinations:

1. **Recent Activity Check**
   - Report: All Report Types
   - Time: Last 7 Days
   - Use: See what's happening recently

2. **Specific Report Deep Dive**
   - Report: Campus Population
   - Time: All Time
   - Use: Complete analysis of one report

3. **Monthly Review**
   - Report: All Report Types
   - Time: Last 30 Days
   - Use: Monthly performance review

4. **Quarterly Analysis**
   - Report: Specific Type
   - Time: Last 90 Days
   - Use: Quarterly report analysis

---

## 📱 Responsive Design

### Desktop
- Both dropdowns side by side
- Filter banner full width
- All charts visible

### Mobile
- Dropdowns stack vertically
- Filter banner wraps text
- Charts stack vertically

---

## ✅ Features Summary

| Feature | Status |
|---------|--------|
| Report Type Filter | ✅ Working |
| Time Range Filter | ✅ Working |
| Combined Filters | ✅ Working |
| Filter Banner | ✅ Working |
| Clear Filters | ✅ Working |
| Campus Filtering | ✅ Working |
| Chart Updates | ✅ Working |
| Summary Updates | ✅ Working |

---

## 🚀 Quick Start

### Example 1: Check Campus Population

```
1. Click "Analytics" in sidebar
2. Select "Campus Population" from first dropdown
3. Select "Last 30 Days" from second dropdown
4. View filtered charts
5. Click "Clear Filters" to reset
```

### Example 2: Review All Recent Submissions

```
1. Click "Analytics"
2. Keep "All Report Types" selected
3. Select "Last 7 Days"
4. View recent activity across all reports
```

### Example 3: Analyze Specific Report History

```
1. Click "Analytics"
2. Select "Admission Data"
3. Select "All Time"
4. View complete Admission Data history
```

---

## 💡 Tips

### Tip 1: Start Broad, Then Narrow
- Begin with "All Report Types"
- Identify interesting patterns
- Then filter to specific report for details

### Tip 2: Use Time Filters for Trends
- "Last 7 Days" - Recent activity
- "Last 30 Days" - Monthly patterns
- "Last 90 Days" - Quarterly trends
- "All Time" - Historical analysis

### Tip 3: Combine with Campus Filter
- Campus admins automatically see only their campus
- Super admins see all campuses
- Filter by report type to see campus-specific patterns

### Tip 4: Export Filtered Charts
- Apply filters
- Click download button on charts
- Save filtered analysis as images

---

## 🔧 Technical Details

### Available Report Types:
```javascript
const reportTypes = [
    'campuspopulation',
    'admissiondata',
    'enrollmentdata',
    'graduatesdata',
    'employee',
    'leaveprivilege',
    'disabilitydata',
    'wastedata',
    'vehicledata',
    'fueldata',
    'waterdata',
    'electricitydata'
];
```

### Time Ranges:
```javascript
const timeRanges = {
    '7d': 7 days,
    '30d': 30 days,
    '90d': 90 days,
    'all': No limit
};
```

---

## ✅ Status

**FULLY FUNCTIONAL** - Table filtering is working with real-time chart updates!

**Files Modified:**
- `admin-dashboard.html` - Added filter dropdowns and banner
- `admin-dashboard-enhanced.css` - Added filter banner styles
- `admin-dashboard-clean.js` - Added filtering logic

---

**Filter your analytics by report type for detailed insights! 📊🔍**
