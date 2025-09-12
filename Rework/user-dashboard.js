// User Dashboard JavaScript
class UserDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.user = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.bindEvents();
        this.updateUserInfo();
        this.loadDashboardData();
    }

    bindEvents() {
        // Navigation menu clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Menu toggle for mobile
        document.querySelector('.menu-toggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                const menuToggle = document.querySelector('.menu-toggle');
                
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Report filter change
        const reportFilter = document.getElementById('reportFilter');
        if (reportFilter) {
            reportFilter.addEventListener('change', (e) => {
                this.filterReports(e.target.value);
            });
        }

        // Data filter change
        const dataFilter = document.getElementById('dataFilter');
        if (dataFilter) {
            dataFilter.addEventListener('change', (e) => {
                this.filterDataTasks(e.target.value);
            });
        }
    }

    async checkAuthentication() {
        try {
            const response = await fetch('api/auth.php?action=check', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                window.location.href = 'login.html';
                return;
            }

            const result = await response.json();
            
            if (result.success) {
                this.user = result.data.user;
                if (this.user.role !== 'user') {
                    // Redirect to admin dashboard if not user
                    window.location.href = 'admin-dashboard.html';
                }
            } else {
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Authentication check error:', error);
            window.location.href = 'login.html';
        }
    }

    updateUserInfo() {
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const userDisplayName = document.getElementById('userDisplayName');
        const profileName = document.getElementById('profileName');
        const fullName = document.getElementById('fullName');
        const emailAddress = document.getElementById('emailAddress');

        if (this.user) {
            userName.textContent = this.user.name;
            userRole.textContent = 'User';
            if (userDisplayName) userDisplayName.textContent = this.user.name;
            if (profileName) profileName.textContent = this.user.name;
            if (fullName) fullName.textContent = this.user.name;
            if (emailAddress) emailAddress.textContent = this.user.email;
        }
    }

    switchSection(section) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked nav item
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(section).classList.add('active');

        // Update page title
        this.updatePageTitle(section);

        // Update current section
        this.currentSection = section;

        // Load section-specific data
        this.loadSectionData(section);
    }

    updatePageTitle(section) {
        const titles = {
            dashboard: 'My Dashboard',
            profile: 'My Profile',
            data: 'My Data',
            reports: 'My Reports',
            settings: 'My Settings'
        };

        document.getElementById('pageTitle').textContent = titles[section] || 'My Dashboard';
    }

    loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'profile':
                this.loadProfileData();
                break;
            case 'data':
                this.loadDataEntryTasks();
                break;
            case 'reports':
                this.loadAssignedReports();
                break;
        }
    }

    async loadDashboardData() {
        try {
            const response = await fetch('api/dashboard.php?action=overview', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.updateDashboardWithData(result.data);
                }
            }
        } catch (error) {
            console.error('Dashboard data loading error:', error);
        }
        
        // Load user-specific data
        this.loadUserActivity();
    }

    updateDashboardWithData(data) {
        // Update user-specific statistics
        if (data.stats) {
            const myDataRecords = document.getElementById('myDataRecords');
            const dataGrowth = document.getElementById('dataGrowth');
            const lastActivity = document.getElementById('lastActivity');
            const securityStatus = document.getElementById('securityStatus');

            if (myDataRecords && data.stats.my_activity) {
                myDataRecords.textContent = data.stats.my_activity;
            }
            if (dataGrowth) {
                dataGrowth.textContent = '+12.5%';
            }
            if (lastActivity) {
                lastActivity.textContent = '2h ago';
            }
            if (securityStatus) {
                securityStatus.textContent = 'Secure';
            }
        }
    }

    loadUserActivity() {
        const activityList = document.getElementById('userActivityList');
        if (!activityList) return;

        const activities = [
            {
                icon: 'fas fa-upload',
                text: 'Uploaded sales_data.csv',
                time: '2 hours ago'
            },
            {
                icon: 'fas fa-download',
                text: 'Downloaded monthly report',
                time: '1 day ago'
            },
            {
                icon: 'fas fa-chart-bar',
                text: 'Generated data analysis',
                time: '2 days ago'
            },
            {
                icon: 'fas fa-user',
                text: 'Updated profile information',
                time: '3 days ago'
            },
            {
                icon: 'fas fa-cog',
                text: 'Changed notification settings',
                time: '1 week ago'
            }
        ];

        activityList.innerHTML = '';
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    }

    loadProfileData() {
        // Load profile-specific data
        console.log('Loading profile data...');
    }

    loadDataData() {
        // Load data-specific information
        console.log('Loading data information...');
    }

    loadReportsData() {
        // Load reports data
        console.log('Loading reports data...');
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('open');
    }

    handleResize() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');

        if (window.innerWidth > 768) {
            sidebar.classList.remove('open');
            mainContent.classList.remove('expanded');
        }
    }

    // User-specific functions
    uploadData() {
        this.showNotification('Upload data functionality would open here', 'info');
    }

    downloadData() {
        this.showNotification('Downloading your data...', 'info');
        setTimeout(() => {
            this.showNotification('Data download completed!', 'success');
        }, 2000);
    }

    generateReport() {
        this.showNotification('Generating your report...', 'info');
        setTimeout(() => {
            this.showNotification('Report generated successfully!', 'success');
        }, 3000);
    }

    viewProfile() {
        this.switchSection('profile');
    }

    editProfile() {
        this.showNotification('Edit profile functionality would open here', 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async logout() {
        try {
            const response = await fetch('api/auth.php?action=logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                this.showNotification('Logged out successfully', 'success');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }

    // Assigned Reports Methods
    async loadAssignedReports() {
        const loadingState = document.getElementById('reportsLoading');
        const emptyState = document.getElementById('reportsEmpty');
        const reportsGrid = document.getElementById('assignedReportsGrid');

        // Show loading state
        if (loadingState) loadingState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
        if (reportsGrid) reportsGrid.innerHTML = '';

        try {
            const response = await fetch('api/user_reports.php?action=get_assigned', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data.length > 0) {
                    this.displayAssignedReports(result.data);
                } else {
                    this.showEmptyReportsState();
                }
            } else {
                this.showEmptyReportsState();
            }
        } catch (error) {
            console.error('Error loading assigned reports:', error);
            this.showEmptyReportsState();
        } finally {
            if (loadingState) loadingState.style.display = 'none';
        }
    }

    displayAssignedReports(reports) {
        const reportsGrid = document.getElementById('assignedReportsGrid');
        if (!reportsGrid) return;

        reportsGrid.innerHTML = '';

        reports.forEach(report => {
            const reportCard = this.createReportCard(report);
            reportsGrid.appendChild(reportCard);
        });
    }

    createReportCard(report) {
        const card = document.createElement('div');
        card.className = 'assigned-report-card';
        
        const tableDisplayName = this.formatTableName(report.table_name);
        const uploadDate = new Date(report.upload_date).toLocaleDateString();
        
        card.innerHTML = `
            <div class="report-header">
                <div class="report-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <div class="report-info">
                    <h3>${tableDisplayName}</h3>
                    <p class="report-office">${this.formatOfficeName(report.assigned_office)}</p>
                </div>
                <div class="report-status">
                    <span class="status-badge active">Active</span>
                </div>
            </div>
            
            <div class="report-details">
                <div class="detail-item">
                    <i class="fas fa-database"></i>
                    <span>${report.record_count} records</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>Uploaded ${uploadDate}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-user"></i>
                    <span>By ${report.uploaded_by_name || 'Admin'}</span>
                </div>
            </div>
            
            ${report.description ? `
                <div class="report-description">
                    <p>${report.description}</p>
                </div>
            ` : ''}
            
            <div class="report-actions">
                <button class="btn btn-primary" onclick="viewReport('${report.table_name}', '${report.assigned_office}')">
                    <i class="fas fa-eye"></i>
                    View Data
                </button>
                <button class="btn btn-secondary" onclick="exportReport('${report.table_name}', '${report.assigned_office}')">
                    <i class="fas fa-download"></i>
                    Export
                </button>
            </div>
        `;

        return card;
    }

    formatTableName(tableName) {
        return tableName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    formatOfficeName(office) {
        const officeNames = {
            'lipa': 'Lipa Campus',
            'san_juan': 'San Juan Campus',
            'pablo_borbon': 'Pablo Borbon Campus',
            'central_office': 'Central Office',
            'registrar': 'Registrar Office',
            'emu': 'EMU Office'
        };
        return officeNames[office] || office;
    }

    showEmptyReportsState() {
        const emptyState = document.getElementById('reportsEmpty');
        const reportsGrid = document.getElementById('assignedReportsGrid');
        
        if (emptyState) emptyState.style.display = 'block';
        if (reportsGrid) reportsGrid.innerHTML = '';
    }

    filterReports(filter) {
        const reportCards = document.querySelectorAll('.assigned-report-card');
        
        reportCards.forEach(card => {
            let shouldShow = true;
            
            switch (filter) {
                case 'recent':
                    // Show only reports from last 30 days
                    const uploadDate = card.querySelector('.detail-item:nth-child(2) span');
                    if (uploadDate) {
                        const dateText = uploadDate.textContent;
                        // Simple check for recent dates
                        shouldShow = dateText.includes('2024') || dateText.includes('2025');
                    }
                    break;
                case 'campus':
                    // Show only campus-specific reports
                    const office = card.querySelector('.report-office');
                    shouldShow = office && !office.textContent.includes('Office');
                    break;
                case 'all':
                default:
                    shouldShow = true;
                    break;
            }
            
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    // Data Entry Task Methods
    async loadDataEntryTasks() {
        const loadingState = document.getElementById('dataLoading');
        const emptyState = document.getElementById('dataEmpty');
        const tasksGrid = document.getElementById('dataEntryTasksGrid');

        // Show loading state
        if (loadingState) loadingState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
        if (tasksGrid) tasksGrid.innerHTML = '';

        try {
            const response = await fetch('api/user_tasks.php?action=get_assigned', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data.length > 0) {
                    this.displayDataEntryTasks(result.data);
                } else {
                    this.showEmptyDataTasksState();
                }
            } else {
                this.showEmptyDataTasksState();
            }
        } catch (error) {
            console.error('Error loading data entry tasks:', error);
            this.showEmptyDataTasksState();
        } finally {
            if (loadingState) loadingState.style.display = 'none';
        }
    }

    displayDataEntryTasks(tasks) {
        const tasksGrid = document.getElementById('dataEntryTasksGrid');
        if (!tasksGrid) return;

        tasksGrid.innerHTML = '';

        tasks.forEach(task => {
            const taskCard = this.createDataEntryTaskCard(task);
            tasksGrid.appendChild(taskCard);
        });
    }

    createDataEntryTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'data-entry-task-card';
        
        const tableDisplayName = this.formatTableName(task.table_name);
        const assignedDate = new Date(task.assigned_date).toLocaleDateString();
        const statusClass = this.getTaskStatusClass(task.status);
        
        card.innerHTML = `
            <div class="task-header">
                <div class="task-icon">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <div class="task-info">
                    <h3>${tableDisplayName}</h3>
                    <p class="task-office">${this.formatOfficeName(task.assigned_office)}</p>
                </div>
                <div class="task-status">
                    <span class="status-badge ${statusClass}">${task.status}</span>
                </div>
            </div>
            
            <div class="task-details">
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>Assigned ${assignedDate}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-user"></i>
                    <span>By ${task.assigned_by_name || 'Admin'}</span>
                </div>
            </div>
            
            ${task.description ? `
                <div class="task-description">
                    <p>${task.description}</p>
                </div>
            ` : ''}
            
            <div class="task-actions">
                <button class="btn btn-primary" onclick="openDataEntryModal('${task.table_name}', '${task.assigned_office}', '${task.description || ''}')">
                    <i class="fas fa-edit"></i>
                    ${task.status === 'completed' ? 'View/Edit' : 'Fill Data'}
                </button>
            </div>
        `;

        return card;
    }

    getTaskStatusClass(status) {
        switch (status) {
            case 'pending': return 'pending';
            case 'in_progress': return 'in-progress';
            case 'completed': return 'completed';
            default: return 'pending';
        }
    }

    showEmptyDataTasksState() {
        const emptyState = document.getElementById('dataEmpty');
        const tasksGrid = document.getElementById('dataEntryTasksGrid');
        
        if (emptyState) emptyState.style.display = 'block';
        if (tasksGrid) tasksGrid.innerHTML = '';
    }

    filterDataTasks(filter) {
        const taskCards = document.querySelectorAll('.data-entry-task-card');
        
        taskCards.forEach(card => {
            let shouldShow = true;
            
            if (filter !== 'all') {
                const statusBadge = card.querySelector('.status-badge');
                if (statusBadge) {
                    const status = statusBadge.textContent.toLowerCase();
                    shouldShow = status === filter;
                }
            }
            
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    // Data Entry Modal Methods
    openDataEntryModal(tableName, office, description) {
        this.currentTask = { tableName, office, description };
        
        const modal = document.getElementById('dataEntryModal');
        const modalTitle = document.getElementById('modalTitle');
        const taskTableName = document.getElementById('taskTableName');
        const taskDescription = document.getElementById('taskDescription');
        
        if (modal && modalTitle && taskTableName && taskDescription) {
            modalTitle.textContent = 'Data Entry';
            taskTableName.textContent = this.formatTableName(tableName);
            taskDescription.textContent = description || 'No description provided';
            
            this.initializeDataEntryTable(tableName);
            modal.style.display = 'block';
        }
    }

    closeDataEntryModal() {
        const modal = document.getElementById('dataEntryModal');
        if (modal) {
            modal.style.display = 'none';
            this.currentTask = null;
        }
    }

    initializeDataEntryTable(tableName) {
        const tableStructures = {
            admissiondata: ["Campus", "Semester", "Academic Year", "Category", "Program", "Male", "Female"],
            enrollmentdata: ["Campus", "Academic Year", "Semester", "College", "Graduate/Undergrad", "Program/Course", "Male", "Female"],
            graduatesdata: ["Campus", "Academic Year", "Semester", "Degree Level", "Subject Area", "Course", "Category/Total No. of Applicants", "Male", "Female"],
            employee: ["Campus", "Date Generated", "Category", "Faculty Rank", "Sex", "Status", "Date Hired"],
            leaveprivilege: ["Campus", "Leave Type", "Employee Name", "Duration Days", "Equivalent Pay"],
            libraryvisitor: ["Campus", "Visit Date", "Category", "Sex", "Total Visitors"],
            pwd: ["Campus", "Year", "PWD Students", "PWD Employees", "Disability Type", "Sex"],
            waterconsumption: ["Campus", "Date", "Category", "Prev Reading", "Current Reading", "Quantity (m^3)", "Total Amount", "Price/m^3", "Month", "Year", "Remarks"],
            treatedwastewater: ["Campus", "Date", "Treated Volume", "Reused Volume", "Effluent Volume"],
            electricityconsumption: ["Campus", "Category", "Month", "Year", "Prev Reading", "Current Reading", "Actual Consumption", "Multiplier", "Total Consumption", "Total Amount", "Price/kWh", "Remarks"],
            solidwaste: ["Campus", "Month", "Year", "Waste Type", "Quantity", "Remarks"],
            campuspopulation: ["Campus", "Year", "Students", "IS Students", "Employees", "Canteen", "Construction", "Total"],
            foodwaste: ["Campus", "Date", "Quantity (kg)", "Remarks"],
            fuelconsumption: ["Campus", "Date", "Driver", "Vehicle", "Plate No", "Fuel Type", "Description", "Transaction No", "Odometer", "Qty", "Total Amount"],
            distancetraveled: ["Campus", "Travel Date", "Plate No", "Vehicle", "Fuel Type", "Start Mileage", "End Mileage", "Total KM"],
            budgetexpenditure: ["Campus", "Year", "Particulars", "Category", "Budget Allocation", "Actual Expenditure", "Utilization Rate"],
            flightaccommodation: ["Campus", "Department", "Year", "Traveler", "Purpose", "From", "To", "Country", "Type", "Rooms", "Nights"]
        };

        const columns = tableStructures[tableName];
        if (!columns) return;

        const headers = document.getElementById('dataEntryHeaders');
        const body = document.getElementById('dataEntryBody');
        
        if (headers) {
            headers.innerHTML = `
                <tr>
                    ${columns.map(column => `<th>${column}</th>`).join('')}
                    <th class="action-column">Actions</th>
                </tr>
            `;
        }
        
        if (body) {
            body.innerHTML = '';
        }
        
        this.updateDataEntryRowCount();
    }

    addDataEntryRow() {
        if (!this.currentTask) return;

        const tableStructures = {
            admissiondata: ["Campus", "Semester", "Academic Year", "Category", "Program", "Male", "Female"],
            enrollmentdata: ["Campus", "Academic Year", "Semester", "College", "Graduate/Undergrad", "Program/Course", "Male", "Female"],
            graduatesdata: ["Campus", "Academic Year", "Semester", "Degree Level", "Subject Area", "Course", "Category/Total No. of Applicants", "Male", "Female"],
            employee: ["Campus", "Date Generated", "Category", "Faculty Rank", "Sex", "Status", "Date Hired"],
            leaveprivilege: ["Campus", "Leave Type", "Employee Name", "Duration Days", "Equivalent Pay"],
            libraryvisitor: ["Campus", "Visit Date", "Category", "Sex", "Total Visitors"],
            pwd: ["Campus", "Year", "PWD Students", "PWD Employees", "Disability Type", "Sex"],
            waterconsumption: ["Campus", "Date", "Category", "Prev Reading", "Current Reading", "Quantity (m^3)", "Total Amount", "Price/m^3", "Month", "Year", "Remarks"],
            treatedwastewater: ["Campus", "Date", "Treated Volume", "Reused Volume", "Effluent Volume"],
            electricityconsumption: ["Campus", "Category", "Month", "Year", "Prev Reading", "Current Reading", "Actual Consumption", "Multiplier", "Total Consumption", "Total Amount", "Price/kWh", "Remarks"],
            solidwaste: ["Campus", "Month", "Year", "Waste Type", "Quantity", "Remarks"],
            campuspopulation: ["Campus", "Year", "Students", "IS Students", "Employees", "Canteen", "Construction", "Total"],
            foodwaste: ["Campus", "Date", "Quantity (kg)", "Remarks"],
            fuelconsumption: ["Campus", "Date", "Driver", "Vehicle", "Plate No", "Fuel Type", "Description", "Transaction No", "Odometer", "Qty", "Total Amount"],
            distancetraveled: ["Campus", "Travel Date", "Plate No", "Vehicle", "Fuel Type", "Start Mileage", "End Mileage", "Total KM"],
            budgetexpenditure: ["Campus", "Year", "Particulars", "Category", "Budget Allocation", "Actual Expenditure", "Utilization Rate"],
            flightaccommodation: ["Campus", "Department", "Year", "Traveler", "Purpose", "From", "To", "Country", "Type", "Rooms", "Nights"]
        };

        const columns = tableStructures[this.currentTask.tableName];
        if (!columns) return;

        const body = document.getElementById('dataEntryBody');
        if (!body) return;

        const rowIndex = body.children.length;
        const row = document.createElement('tr');
        row.className = 'data-entry-row';
        row.dataset.rowIndex = rowIndex;

        row.innerHTML = `
            ${columns.map((column, index) => `
                <td>
                    <input type="text" 
                           class="form-control data-entry-input" 
                           name="${column.toLowerCase().replace(/[^a-z0-9]/g, '_')}" 
                           placeholder="Enter ${column}"
                           data-column="${column}">
                </td>
            `).join('')}
            <td class="action-column">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeDataEntryRow(${rowIndex})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        body.appendChild(row);
        this.updateDataEntryRowCount();
    }

    removeDataEntryRow(rowIndex) {
        const body = document.getElementById('dataEntryBody');
        if (!body) return;

        const row = body.querySelector(`tr[data-row-index="${rowIndex}"]`);
        if (row) {
            row.remove();
            this.updateDataEntryRowCount();
        }
    }

    clearAllDataEntry() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            const body = document.getElementById('dataEntryBody');
            if (body) {
                body.innerHTML = '';
                this.updateDataEntryRowCount();
            }
        }
    }

    updateDataEntryRowCount() {
        const body = document.getElementById('dataEntryBody');
        const rowCountSpan = document.getElementById('dataEntryRowCount');
        
        if (body && rowCountSpan) {
            const count = body.children.length;
            rowCountSpan.textContent = count;
        }
    }

    async submitDataEntry() {
        if (!this.currentTask) return;

        const body = document.getElementById('dataEntryBody');
        if (!body) return;

        const data = [];
        const rows = body.querySelectorAll('.data-entry-row');

        rows.forEach(row => {
            const rowData = {};
            const inputs = row.querySelectorAll('.data-entry-input');
            
            inputs.forEach(input => {
                const column = input.dataset.column;
                const value = input.value.trim();
                if (column && value) {
                    rowData[column] = value;
                }
            });

            // Only add row if it has at least one non-empty field
            if (Object.keys(rowData).length > 0) {
                data.push(rowData);
            }
        });

        if (data.length === 0) {
            this.showNotification('Please add at least one row of data', 'error');
            return;
        }

        try {
            const response = await fetch('api/submit_data.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tableName: this.currentTask.tableName,
                    office: this.currentTask.office,
                    data: data
                }),
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(`Data submitted successfully! ${data.length} records submitted.`, 'success');
                this.closeDataEntryModal();
                this.loadDataEntryTasks(); // Refresh tasks
            } else {
                this.showNotification(result.message || 'Submission failed', 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            this.showNotification('Submission failed. Please try again.', 'error');
        }
    }
}

// Initialize user dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.userDashboard = new UserDashboard();
    
    // Add logout button
    const headerRight = document.querySelector('.header-right');
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'logout-btn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.addEventListener('click', () => {
        window.userDashboard.logout();
    });
    
    // Insert before the profile image
    headerRight.insertBefore(logoutBtn, headerRight.lastElementChild);
});

// Global functions for user actions
function uploadData() {
    window.userDashboard.uploadData();
}

function downloadData() {
    window.userDashboard.downloadData();
}

function generateReport() {
    window.userDashboard.generateReport();
}

function viewProfile() {
    window.userDashboard.viewProfile();
}

function editProfile() {
    window.userDashboard.editProfile();
}

// Global functions for report actions
function viewReport(tableName, office) {
    window.userDashboard.showNotification(`Opening ${tableName} data for ${office}`, 'info');
    // In a real implementation, this would open a data viewer modal or navigate to a data view page
}

function exportReport(tableName, office) {
    window.userDashboard.showNotification(`Exporting ${tableName} data for ${office}`, 'info');
    // In a real implementation, this would trigger a download
}

// Global functions for data entry modal
function openDataEntryModal(tableName, office, description) {
    window.userDashboard.openDataEntryModal(tableName, office, description);
}

function closeDataEntryModal() {
    window.userDashboard.closeDataEntryModal();
}

function addDataEntryRow() {
    window.userDashboard.addDataEntryRow();
}

function removeDataEntryRow(rowIndex) {
    window.userDashboard.removeDataEntryRow(rowIndex);
}

function clearAllDataEntry() {
    window.userDashboard.clearAllDataEntry();
}

function submitDataEntry() {
    window.userDashboard.submitDataEntry();
}

