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
            const response = await fetch('api/simple_auth.php?action=check', {
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

    // Remove a data entry row
    removeDataEntryRow(rowIndex) {
        const row = document.querySelector(`.data-entry-row[data-row-index="${rowIndex}"]`);
        if (row) {
            row.remove();
            this.updateDataEntryRowCount();
        }
    }

    // Clear all data entry fields
    clearAllDataEntry() {
        const container = document.getElementById('dataEntryBody');
        if (container) {
            container.innerHTML = '';
            this.updateDataEntryRowCount();
        }
    }

    // Submit the data entry form
    async submitDataEntry() {
        const submitBtn = document.querySelector('#dataEntryModal .submit-btn');
        const cancelBtn = document.querySelector('#dataEntryModal .cancel-btn');
        
        try {
            // Disable buttons during submission
            if (submitBtn) submitBtn.disabled = true;
            if (cancelBtn) cancelBtn.disabled = true;
            
            // Get all rows
            const rows = document.querySelectorAll('.data-entry-row');
            const data = [];
            
            // Collect data from each row
            rows.forEach(row => {
                const inputs = row.querySelectorAll('input, select, textarea');
                const rowData = {};
                
                inputs.forEach(input => {
                    rowData[input.name] = input.value;
                });
                
                data.push(rowData);
            });
            
            if (data.length === 0) {
                this.showNotification('No data to submit', 'warning');
                return;
            }
            
            // Show loading state
            this.showNotification('Submitting data...', 'info');
            
            // In a real implementation, you would send this data to your server
            // const response = await fetch('api/submit_data.php', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         table: this.currentTask.tableName,
            //         data: data
            //     })
            // });
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.showNotification('Data submitted successfully!', 'success');
            this.closeDataEntryModal();
            
        } catch (error) {
            console.error('Error submitting data:', error);
            this.showNotification('Failed to submit data', 'error');
        } finally {
            // Re-enable buttons
            if (submitBtn) submitBtn.disabled = false;
            if (cancelBtn) cancelBtn.disabled = false;
        }
    }
    
    // Update the row count display
    updateDataEntryRowCount() {
        const count = document.querySelectorAll('.data-entry-row').length;
        const countElement = document.getElementById('dataEntryRowCount');
        if (countElement) {
            countElement.textContent = count;
        }
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
            const response = await fetch('api/simple_auth.php?action=logout', {
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
                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const result = await response.json();
                    if (result.success && result.data.length > 0) {
                        this.displayAssignedReports(result.data);
                    } else {
                        this.showEmptyReportsState();
                    }
                } else {
                    console.error('Non-JSON response from user reports API');
                    this.showEmptyReportsState();
                }
            } else {
                this.showEmptyReportsState();
            }
        } catch (error) {
            console.error('Error loading reports:', error);
            if (loadingState) loadingState.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        }
    }
    
    displaySimpleReports(reports) {
        const listEl = document.getElementById('simpleReportsList');
        if (!listEl) return;
        
        listEl.innerHTML = '';
        
        reports.forEach(report => {
            const reportCard = document.createElement('div');
            reportCard.className = 'simple-report-card';
            
            const tableDisplayName = this.formatTableName(report.table_name);
            const uploadDate = new Date(report.upload_date).toLocaleDateString();
            
            reportCard.innerHTML = `
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
                        <span>${report.record_count || 0} records</span>
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
                </div>`;
                
            listEl.appendChild(reportCard);
        });

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
                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const result = await response.json();
                    if (result.success && result.data.length > 0) {
                        this.displayDataEntryTasks(result.data);
                    } else {
                        this.showEmptyDataTasksState();
                    }
                } else {
                    console.error('Non-JSON response from user tasks API');
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
                    Fill Data
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
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
        }
    }

    closeDataEntryModal() {
        const modal = document.getElementById('dataEntryModal');
        if (modal) {
            modal.style.display = 'none';
            this.currentTask = null;
            
            // Clear any existing data and reset the modal state
            const tableBody = document.getElementById('dataEntryTableBody');
            if (tableBody) {
                tableBody.innerHTML = '';
            }
            
            // Re-enable all buttons and inputs
            const submitBtn = document.querySelector('#dataEntryModal .submit-btn');
            const cancelBtn = document.querySelector('#dataEntryModal .cancel-btn');
            if (submitBtn) submitBtn.disabled = false;
            if (cancelBtn) cancelBtn.disabled = false;
            
            // Remove any loading states
            document.body.style.pointerEvents = 'auto';
            document.body.style.cursor = 'default';
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
            pwd: ["Campus", "Year", "No. of PWD Students", "No. of PWD Employees", "Type of Disability", "Sex"],
            waterconsumption: ["Campus", "Date", "Category", "Prev Reading", "Current Reading", "Quantity (m^3)", "Total Amount", "Price/m^3", "Month", "Year", "Remarks"],
            treatedwastewater: ["Campus", "Date", "Treated Volume", "Reused Volume", "Effluent Volume"],
            electricityconsumption: ["Campus", "Category", "Month", "Year", "Prev Reading", "Current Reading", "Actual Consumption", "Multiplier", "Total Consumption", "Total Amount", "Price/kWh", "Remarks"],
            solidwaste: ["Campus", "Month", "Year", "Waste Type", "Quantity", "Remarks"],
            campuspopulation: ["Campus", "Year", "Students", "IS Students", "Employees", "Canteen", "Construction", "Total"],
            foodwaste: ["Campus", "Date", "Quantity (kg)", "Remarks"],
            fuelconsumption: ["Campus", "Date", "Driver", "Vehicle", "Plate No", "Fuel Type", "Description", "Transaction No", "Odometer", "Qty", "Total Amount"],
            distancetraveled: ["Campus", "Travel Date", "Plate No", "Vehicle", "Fuel Type", "Start Mileage", "End Mileage", "Total KM"],
            budgetexpenditure: ["Campus", "Year", "Particulars", "Category", "Budget Allocation", "Actual Expenditure", "Utilization Rate"],
            flightaccommodation: ["Campus", "Office/Department", "Year", "Name of Traveller", "Event Name/Purpose of Travel", "Travel Date (mm/dd/yyyy)", "Domestic/International", "Origin Info or IATA code", "Destination Info or IATA code", "Class", "One Way/Round Trip", "kg CO2e", "tCO2e"]
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
            pwd: ["Campus", "Year", "No. of PWD Students", "No. of PWD Employees", "Type of Disability", "Sex"],
            waterconsumption: ["Campus", "Date", "Category", "Prev Reading", "Current Reading", "Quantity (m^3)", "Total Amount", "Price/m^3", "Month", "Year", "Remarks"],
            treatedwastewater: ["Campus", "Date", "Treated Volume", "Reused Volume", "Effluent Volume"],
            electricityconsumption: ["Campus", "Category", "Month", "Year", "Prev Reading", "Current Reading", "Actual Consumption", "Multiplier", "Total Consumption", "Total Amount", "Price/kWh", "Remarks"],
            solidwaste: ["Campus", "Month", "Year", "Waste Type", "Quantity", "Remarks"],
            campuspopulation: ["Campus", "Year", "Students", "IS Students", "Employees", "Canteen", "Construction", "Total"],
            foodwaste: ["Campus", "Date", "Quantity (kg)", "Remarks"],
            fuelconsumption: ["Campus", "Date", "Driver", "Vehicle", "Plate No", "Fuel Type", "Description", "Transaction No", "Odometer", "Qty", "Total Amount"],
            distancetraveled: ["Campus", "Travel Date", "Plate No", "Vehicle", "Fuel Type", "Start Mileage", "End Mileage", "Total KM"],
            budgetexpenditure: ["Campus", "Year", "Particulars", "Category", "Budget Allocation", "Actual Expenditure", "Utilization Rate"],
            flightaccommodation: ["Campus", "Office/Department", "Year", "Name of Traveller", "Event Name/Purpose of Travel", "Travel Date (mm/dd/yyyy)", "Domestic/International", "Origin Info or IATA code", "Destination Info or IATA code", "Class", "One Way/Round Trip", "kg CO2e", "tCO2e"]
        };

        const columns = tableStructures[this.currentTask.tableName];
        if (!columns) return;

        const body = document.getElementById('dataEntryBody');
        if (!body) return;

        const rowIndex = body.children.length;
        const row = document.createElement('tr');
        row.className = 'data-entry-row';
        row.dataset.rowIndex = rowIndex;

        // Create cells with dropdown functionality
        columns.forEach((column, colIndex) => {
            const cell = document.createElement('td');
            
            if (
              (this.currentTask.tableName === "admissiondata" || this.currentTask.tableName === "foodwaste" || this.currentTask.tableName === "campuspopulation" || this.currentTask.tableName === "libraryvisitor" ||
               this.currentTask.tableName === "enrollmentdata" || this.currentTask.tableName === "graduatesdata" || this.currentTask.tableName === "employee" ||
               this.currentTask.tableName === "leaveprivilege" || this.currentTask.tableName === "pwd" || this.currentTask.tableName === "waterconsumption" ||
               this.currentTask.tableName === "treatedwastewater" || this.currentTask.tableName === "electricityconsumption" || this.currentTask.tableName === "solidwaste" ||
               this.currentTask.tableName === "fuelconsumption" || this.currentTask.tableName === "distancetraveled" || this.currentTask.tableName === "budgetexpenditure" || 
               this.currentTask.tableName === "flightaccommodation") &&
              colIndex === 0
            ) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.setAttribute('data-column', column);
              select.innerHTML = `
                <option value="">Select Campus</option>
                <option value="Alangilan">Alangilan</option>
                <option value="Nasugbo">Nasugbo</option>
                <option value="Balayan">Balayan</option>
                <option value="Malvar">Malvar</option>
                <option value="Lemery">Lemery</option>
                <option value="Lipa">Lipa</option>
                <option value="Lobo">Lobo</option>
                <option value="Mabini">Mabini</option>
                <option value="Pablo Borbon">Pablo Borbon</option>
                <option value="Rosario">Rosario</option>
                <option value="San Juan">San Juan</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "admissiondata" && colIndex === 1) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.setAttribute('data-column', column);
              select.innerHTML = `
                <option value="">Select Semester</option>
                <option value="First Semester">First Semester</option>
                <option value="Midterm Semester">Midterm Semester</option>
                <option value="Second Semester">Second Semester</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "admissiondata" && colIndex === 3) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.setAttribute('data-column', column);
              select.innerHTML = `
                <option value="">Select Category</option>
                <option value="Regular">Regular</option>
                <option value="Transferee">Transferee</option>
                <option value="Shiftee">Shiftee</option>
                <option value="Second Courser">Second Courser</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "admissiondata" && (colIndex === 5 || colIndex === 6)) {
              // Male (colIndex 5) and Female (colIndex 6) - number only
              const input = document.createElement("input");
              input.type = "number";
              input.min = "0";
              input.step = "1";
              input.className = "form-control data-entry-input";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              input.setAttribute('data-column', column);
              input.placeholder = "Enter number";
              // Prevent negative numbers and non-numeric input
              input.addEventListener('keypress', function(e) {
                if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E' || e.key === '.') {
                  e.preventDefault();
                }
              });
              input.addEventListener('input', function(e) {
                // Remove any non-numeric characters
                this.value = this.value.replace(/[^0-9]/g, '');
              });
              cell.appendChild(input);
            }
            else if (this.currentTask.tableName === "enrollmentdata" && colIndex === 2) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Semester</option>
                <option value="First Semester">First Semester</option>
                <option value="Midterm Semester">Midterm Semester</option>
                <option value="Second Semester">Second Semester</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "enrollmentdata" && colIndex === 4) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Level</option>
                <option value="Graduate">Graduate</option>
                <option value="Undergraduate">Undergraduate</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "graduatesdata" && colIndex === 2) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Semester</option>
                <option value="First Semester">First Semester</option>
                <option value="Midterm Semester">Midterm Semester</option>
                <option value="Second Semester">Second Semester</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "graduatesdata" && colIndex === 3) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Degree Level</option>
                <option value="Undergraduate Program">Undergraduate Program</option>
                <option value="Graduate Program">Graduate Program</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "graduatesdata" && colIndex === 6) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Category</option>
                <option value="Total No. Applicants">Total No. Applicants</option>
                <option value="Total No. Graduates">Total No. Graduates</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "employee" && colIndex === 1) {
              const input = document.createElement("input");
              input.type = "date";
              input.className = "form-control data-entry-input";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              cell.appendChild(input);
            }
            else if (this.currentTask.tableName === "employee" && colIndex === 2) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Category</option>
                <option value="Teaching">Teaching</option>
                <option value="Non-Teaching">Non-Teaching</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "employee" && colIndex === 3) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Faculty Rank</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Instructor">Instructor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Administrative Staff">Administrative Staff</option>
                <option value="Support Staff">Support Staff</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "employee" && colIndex === 4) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "employee" && colIndex === 5) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Status</option>
                <option value="Regular">Regular</option>
                <option value="Contractual">Contractual</option>
                <option value="Part-time">Part-time</option>
                <option value="Probationary">Probationary</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "employee" && colIndex === 6) {
              const input = document.createElement("input");
              input.type = "date";
              input.className = "form-control data-entry-input";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              cell.appendChild(input);
            }
            else if (this.currentTask.tableName === "leaveprivilege" && colIndex === 1) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Leave Type</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
                <option value="Solo Parent Leave">Solo Parent Leave</option>
                <option value="10 Days VAWC Leave">10 Days VAWC Leave</option>
                <option value="Special Leave Benefits for Women">Special Leave Benefits for Women</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "libraryvisitor" && colIndex === 1) {
              const input = document.createElement("input");
              input.type = "date";
              input.className = "form-control data-entry-input";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              cell.appendChild(input);
            }
            else if (this.currentTask.tableName === "libraryvisitor" && colIndex === 2) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Category</option>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "libraryvisitor" && colIndex === 3) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "pwd" && colIndex === 4) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Disability Type</option>
                <option value="Visual Impairment">Visual Impairment</option>
                <option value="Hearing Impairment">Hearing Impairment</option>
                <option value="Physical Disability">Physical Disability</option>
                <option value="Intellectual Disability">Intellectual Disability</option>
                <option value="Learning Disability">Learning Disability</option>
                <option value="Multiple Disabilities">Multiple Disabilities</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "pwd" && colIndex === 5) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "waterconsumption" && colIndex === 1) {
              const input = document.createElement("input");
              input.type = "date";
              input.className = "form-control data-entry-input";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              cell.appendChild(input);
            }
            else if (this.currentTask.tableName === "waterconsumption" && colIndex === 2) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Category</option>
                <option value="Mains">Mains</option>
                <option value="Deepwell">Deepwell</option>
                <option value="Drinking Water">Drinking Water</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "treatedwastewater" && colIndex === 1) {
              const input = document.createElement("input");
              input.type = "date";
              input.className = "form-control data-entry-input";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              cell.appendChild(input);
            }
            else if (this.currentTask.tableName === "electricityconsumption" && colIndex === 1) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Category</option>
                <option value="Main">Main</option>
                <option value="Solar">Solar</option>
                <option value="Other">Other</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "electricityconsumption" && colIndex === 2) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "solidwaste" && colIndex === 1) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "solidwaste" && colIndex === 3) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Waste Type</option>
                <option value="Biodegradable">Biodegradable</option>
                <option value="Hazardous">Hazardous</option>
                <option value="Recyclable">Recyclable</option>
                <option value="Residual">Residual</option>
              `;
              cell.appendChild(select);
            }
            else if ((this.currentTask.tableName === "foodwaste" || this.currentTask.tableName === "campuspopulation") && colIndex === 1) {
              const input = document.createElement("input");
              input.type = "date";
              input.className = "form-control data-entry-input";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              cell.appendChild(input);
            }
            else if (this.currentTask.tableName === "fuelconsumption" && colIndex === 1) {
              const input = document.createElement("input");
              input.type = "date";
              input.className = "form-control data-entry-input";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              cell.appendChild(input);
            }
            else if (this.currentTask.tableName === "fuelconsumption" && colIndex === 3) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Vehicle</option>
                <option value="Foton Bus">Foton Bus</option>
                <option value="Honda Civic">Honda Civic</option>
                <option value="Hyundai Starex">Hyundai Starex</option>
                <option value="Isuzu Sportivo">Isuzu Sportivo</option>
                <option value="Isuzu Travis">Isuzu Travis</option>
                <option value="Mitshubishi Adventure">Mitshubishi Adventure</option>
                <option value="Mitshubishi L300">Mitshubishi L300</option>
                <option value="Nissan Urvan">Nissan Urvan</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "fuelconsumption" && colIndex === 4) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Plate No</option>
                <option value="SJD 280">SJD 280</option>
                <option value="BOU 837">BOU 837</option>
                <option value="SKT 626">SKT 626</option>
                <option value="S6C486">S6C486</option>
                <option value="SFN 552">SFN 552</option>
                <option value="SEU 721">SEU 721</option>
                <option value="S5W613">S5W613</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "fuelconsumption" && colIndex === 5) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Fuel Type</option>
                <option value="Diesel">Diesel</option>
                <option value="Gasoline">Gasoline</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "distancetraveled" && colIndex === 1) {
              const input = document.createElement("input");
              input.type = "date";
              input.className = "form-control data-entry-input";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              cell.appendChild(input);
            }
            else if (this.currentTask.tableName === "distancetraveled" && colIndex === 2) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Plate No</option>
                <option value="SJD 280">SJD 280</option>
                <option value="BOU 837">BOU 837</option>
                <option value="SKT 626">SKT 626</option>
                <option value="S6C486">S6C486</option>
                <option value="SFN 552">SFN 552</option>
                <option value="SEU 721">SEU 721</option>
                <option value="S5W613">S5W613</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "distancetraveled" && colIndex === 3) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Vehicle</option>
                <option value="Foton Bus">Foton Bus</option>
                <option value="Honda Civic">Honda Civic</option>
                <option value="Hyundai Starex">Hyundai Starex</option>
                <option value="Isuzu Sportivo">Isuzu Sportivo</option>
                <option value="Isuzu Travis">Isuzu Travis</option>
                <option value="Mitshubishi Adventure">Mitshubishi Adventure</option>
                <option value="Mitshubishi L300">Mitshubishi L300</option>
                <option value="Nissan Urvan">Nissan Urvan</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "distancetraveled" && colIndex === 4) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Fuel Type</option>
                <option value="Diesel">Diesel</option>
                <option value="Gasoline">Gasoline</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "distancetraveled" && colIndex === 5) {
              // Start Mileage - numeric input only
              const input = document.createElement("input");
              input.type = "number";
              input.step = "0.01";
              input.min = "0";
              input.className = "form-control data-entry-input start-mileage";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              input.placeholder = "Enter Start Mileage";
              input.setAttribute('data-column', column);
              input.setAttribute('data-row-index', rowIndex);
              // Add event listener for calculation
              input.addEventListener('input', () => this.calculateTotalKM(rowIndex));
              cell.appendChild(input);
            }
            else if (this.currentTask.tableName === "distancetraveled" && colIndex === 6) {
              // End Mileage - numeric input only
              const input = document.createElement("input");
              input.type = "number";
              input.step = "0.01";
              input.min = "0";
              input.className = "form-control data-entry-input end-mileage";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              input.placeholder = "Enter End Mileage";
              input.setAttribute('data-column', column);
              input.setAttribute('data-row-index', rowIndex);
              // Add event listener for calculation
              input.addEventListener('input', () => this.calculateTotalKM(rowIndex));
              cell.appendChild(input);
            }
            else if (this.currentTask.tableName === "distancetraveled" && colIndex === 7) {
              // Total KM - read-only, auto-calculated
              const input = document.createElement("input");
              input.type = "number";
              input.step = "0.01";
              input.readOnly = true;
              input.className = "form-control data-entry-input total-km";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              input.placeholder = "Auto-calculated";
              input.setAttribute('data-column', column);
              input.setAttribute('data-row-index', rowIndex);
              input.style.backgroundColor = "#f5f5f5";
              input.style.cursor = "not-allowed";
              cell.appendChild(input);
            }
            else if (this.currentTask.tableName === "budgetexpenditure" && colIndex === 3) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Category</option>
                <option value="Personnel Services">Personnel Services</option>
                <option value="Maintenance and Other Operating Expenses">Maintenance and Other Operating Expenses</option>
                <option value="Capital Outlay">Capital Outlay</option>
                <option value="Financial Expenses">Financial Expenses</option>
              `;
              cell.appendChild(select);
            }
            else if (this.currentTask.tableName === "flightaccommodation" && colIndex === 8) {
              const select = document.createElement("select");
              select.className = "form-control data-entry-input";
              select.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              select.innerHTML = `
                <option value="">Select Type</option>
                <option value="Domestic">Domestic</option>
                <option value="International">International</option>
              `;
              cell.appendChild(select);
            }
            else {
              const input = document.createElement("input");
              input.type = "text";
              input.className = "form-control data-entry-input";
              input.name = column.toLowerCase().replace(/[^a-z0-9]/g, '_');
              input.placeholder = `Enter ${column}`;
              input.setAttribute('data-column', column);
              cell.appendChild(input);
            }
            
            row.appendChild(cell);
        });

        // Add action column
        const actionCell = document.createElement('td');
        actionCell.className = 'action-column';
        actionCell.innerHTML = `
            <button type="button" class="btn btn-danger btn-sm" onclick="removeDataEntryRow(${rowIndex})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        row.appendChild(actionCell);

        body.appendChild(row);
        this.updateDataEntryRowCount();
    }

    calculateTotalKM(rowIndex) {
        const body = document.getElementById('dataEntryBody');
        if (!body) return;

        const row = body.querySelector(`tr[data-row-index="${rowIndex}"]`);
        if (!row) return;

        const startMileageInput = row.querySelector('.start-mileage');
        const endMileageInput = row.querySelector('.end-mileage');
        const totalKMInput = row.querySelector('.total-km');

        if (!startMileageInput || !endMileageInput || !totalKMInput) return;

        const startMileage = parseFloat(startMileageInput.value) || 0;
        const endMileage = parseFloat(endMileageInput.value) || 0;

        // Calculate: Total KM = Start Mileage - End Mileage
        const totalKM = startMileage - endMileage;

        // Only set value if both fields have valid numbers
        if (startMileage > 0 && endMileage > 0) {
            totalKMInput.value = totalKM.toFixed(2);
        } else {
            totalKMInput.value = '';
        }
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
        console.log('submitDataEntry called');
        if (!this.currentTask) {
            console.log('No current task');
            return;
        }

        const body = document.getElementById('dataEntryBody');
        if (!body) {
            console.log('No dataEntryBody found');
            return;
        }

        const rows = body.querySelectorAll('tr');
        console.log('Found rows:', rows.length);

        // Get expected columns for this table
        const tableStructures = {
            admissiondata: ["Campus", "Semester", "Academic Year", "Category", "Program", "Male", "Female"],
            enrollmentdata: ["Campus", "Academic Year", "Semester", "College", "Graduate/Undergrad", "Program/Course", "Male", "Female"],
            graduatesdata: ["Campus", "Academic Year", "Semester", "Degree Level", "Subject Area", "Course", "Category/Total No. of Applicants", "Male", "Female"],
            employee: ["Campus", "Date Generated", "Category", "Faculty Rank", "Sex", "Status", "Date Hired"],
            leaveprivilege: ["Campus", "Leave Type", "Employee Name", "Duration Days", "Equivalent Pay"],
            libraryvisitor: ["Campus", "Visit Date", "Category", "Sex", "Total Visitors"],
            pwd: ["Campus", "Year", "No. of PWD Students", "No. of PWD Employees", "Type of Disability", "Sex"],
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
        
        const expectedColumns = tableStructures[this.currentTask.tableName] || [];
        
        if (rows.length === 0) {
            this.showNotification('Please add at least one row of data before submitting', 'error');
            return;
        }

        // Validate each row - check for empty rows and empty columns
        const emptyRows = [];
        const rowsWithEmptyColumns = [];
        const data = [];

        rows.forEach((row, rowIndex) => {
            const rowData = {};
            const inputs = row.querySelectorAll('input, select');
            let hasAnyData = false;
            const emptyColumns = [];

            // Check each expected column
            expectedColumns.forEach((columnName, colIndex) => {
                // Find input for this column
                let input = null;
                inputs.forEach(inp => {
                    const inpColumn = inp.dataset.column || inp.name || '';
                    if (inpColumn === columnName || inpColumn.includes(columnName) || 
                        (inp.closest('td') && inp.closest('td').cellIndex === colIndex)) {
                        input = inp;
                    }
                });
                
                // If no input found by name, try by index
                if (!input && colIndex < inputs.length) {
                    input = inputs[colIndex];
                }

                if (input) {
                    let value = '';
                    if (input.tagName === 'SELECT') {
                        value = input.value ? input.value.trim() : '';
                        // Check if it's a placeholder/empty option
                        if (value === '' || value === 'Select' || input.selectedIndex === 0) {
                            emptyColumns.push(columnName);
                        }
                    } else {
                        value = input.value ? input.value.trim() : '';
                        if (value === '') {
                            emptyColumns.push(columnName);
                        }
                    }
                    
                    if (value && value !== '' && value !== 'Select') {
                        hasAnyData = true;
                        rowData[columnName] = value;
                    }
                } else {
                    // Input not found for this column
                    emptyColumns.push(columnName);
                }
            });

            // Check if row is completely empty
            if (!hasAnyData) {
                emptyRows.push(rowIndex + 1);
                // Highlight empty row
                row.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                row.style.outline = '2px solid #dc3545';
            } else if (emptyColumns.length > 0) {
                // Row has some data but missing columns
                rowsWithEmptyColumns.push({
                    row: rowIndex + 1,
                    columns: emptyColumns
                });
                // Highlight row with missing columns
                row.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
                row.style.outline = '2px solid #ffc107';
            } else {
                // Row is complete - add to data
                data.push(rowData);
                // Reset row styling
                row.style.backgroundColor = '';
                row.style.outline = '';
            }
        });

        // Validation errors
        if (emptyRows.length > 0) {
            this.showNotification(`Cannot submit: Row(s) ${emptyRows.join(', ')} are empty. Please fill all fields or remove empty rows.`, 'error');
            return;
        }

        if (rowsWithEmptyColumns.length > 0) {
            const errorMessages = rowsWithEmptyColumns.map(item => 
                `Row ${item.row}: Missing columns (${item.columns.join(', ')})`
            );
            this.showNotification(`Cannot submit: ${errorMessages.join('. ')}. Please fill all columns in each row.`, 'error');
            return;
        }

        if (data.length === 0) {
            this.showNotification('Please add at least one complete row of data before submitting', 'error');
            return;
        }

        // Show confirmation dialog
        console.log('Showing confirmation dialog');
        const confirmed = confirm(`Are you sure you want to submit this report with ${data.length} row(s) of data? It will be sent to the admin for review.`);
        console.log('User confirmed:', confirmed);
        if (!confirmed) {
            return;
        }

        try {
            const requestData = {
                tableName: this.currentTask.tableName,
                description: this.currentTask.description || '',
                data: data
            };
            console.log('Sending request data:', requestData);
            
            const response = await fetch('api/submit_report.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
                credentials: 'include'
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log('Submission successful, result:', result);
                this.showNotification(`Report submitted successfully! ${data.length} records submitted and sent to admin for review.`, 'success');
                this.closeDataEntryModal();
                
                // Refresh tasks asynchronously without blocking UI
                setTimeout(() => {
                    this.loadDataEntryTasks().catch(error => {
                        console.error('Error refreshing tasks after submission:', error);
                    });
                }, 100);
            } else {
                console.log('Submission failed, result:', result);
                this.showNotification(result.error || result.message || 'Submission failed', 'error');
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
    console.log('Global submitDataEntry function called');
    if (window.userDashboard) {
        window.userDashboard.submitDataEntry();
    } else {
        console.log('window.userDashboard not found');
    }
}

