// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.user = null;
        this.tableStructures = {
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

        // Batch upload form events
        this.bindBatchUploadEvents();
        
        // Table form events
        this.bindTableFormEvents();
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
                if (this.user.role !== 'admin') {
                    // Redirect to user dashboard if not admin
                    window.location.href = 'user-dashboard.html';
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

        if (this.user) {
            userName.textContent = this.user.name;
            userRole.textContent = 'Administrator';
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
            dashboard: 'Admin Dashboard',
            analytics: 'System Analytics',
            users: 'User Management',
            data: 'Data Management',
            system: 'System Settings',
            security: 'Security Dashboard',
            reports: 'Reports & Analytics'
        };

        document.getElementById('pageTitle').textContent = titles[section] || 'Admin Dashboard';
    }

    loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'users':
                this.loadUsersData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'security':
                this.loadSecurityData();
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
        
        // Load admin-specific data
        this.loadAdminActivity();
    }

    updateDashboardWithData(data) {
        // Update statistics
        if (data.stats) {
            Object.keys(data.stats).forEach(statName => {
                const element = document.getElementById(statName);
                if (element && data.stats[statName].value) {
                    element.textContent = data.stats[statName].value;
                }
            });
        }
    }

    async loadUsersData() {
        try {
            const response = await fetch('api/dashboard.php?action=users', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.updateUsersTable(result.data.users);
                }
            }
        } catch (error) {
            console.error('Users data loading error:', error);
        }
    }

    updateUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                <td><span class="status-badge ${user.status}">${user.status}</span></td>
                <td>${user.last_login || 'Never'}</td>
                <td>
                    <button class="btn-icon" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    loadAdminActivity() {
        const activityList = document.getElementById('adminActivityList');
        if (!activityList) return;

        const activities = [
            {
                icon: 'fas fa-user-plus',
                text: 'New user registered',
                time: '2 minutes ago'
            },
            {
                icon: 'fas fa-database',
                text: 'System backup completed',
                time: '15 minutes ago'
            },
            {
                icon: 'fas fa-cog',
                text: 'System settings updated',
                time: '1 hour ago'
            },
            {
                icon: 'fas fa-shield-alt',
                text: 'Security scan completed',
                time: '2 hours ago'
            },
            {
                icon: 'fas fa-chart-line',
                text: 'Analytics report generated',
                time: '3 hours ago'
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

    loadAnalyticsData() {
        // Load analytics-specific data
        console.log('Loading analytics data...');
    }

    loadSecurityData() {
        // Load security-specific data
        console.log('Loading security data...');
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

    // Admin-specific functions
    addUser() {
        this.showNotification('Add User functionality would open here', 'info');
    }

    backupData() {
        this.showNotification('Starting data backup...', 'info');
        setTimeout(() => {
            this.showNotification('Data backup completed successfully!', 'success');
        }, 3000);
    }

    systemMaintenance() {
        this.showNotification('System maintenance mode would be activated', 'info');
    }

    generateReport() {
        this.showNotification('Generating report...', 'info');
        setTimeout(() => {
            this.showNotification('Report generated successfully!', 'success');
        }, 2000);
    }

    editUser(userId) {
        this.showNotification(`Edit user ${userId} functionality would open here`, 'info');
    }

    deleteUser(userId) {
        if (confirm(`Are you sure you want to delete user ${userId}?`)) {
            this.showNotification(`User ${userId} deleted successfully`, 'success');
        }
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

    // Batch Upload Methods
    bindBatchUploadEvents() {
        // Form submission
        const batchUploadForm = document.getElementById('batchUploadForm');
        if (batchUploadForm) {
            batchUploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBatchUpload();
            });
        }
    }

    // Table Form Methods
    bindTableFormEvents() {
        // Report table selection change
        const reportTableSelect = document.getElementById('reportTable');
        if (reportTableSelect) {
            reportTableSelect.addEventListener('change', (e) => {
                this.initializeTableForm(e.target.value);
            });
        }
    }

    initializeTableForm(tableName) {
        if (!tableName) {
            this.clearTablePreview();
            return;
        }

        const columns = this.tableStructures[tableName];
        if (!columns) {
            this.showNotification('Table structure not found', 'error');
            return;
        }

        this.createPreviewTable(columns);
    }

    createPreviewTable(columns) {
        const previewHeaders = document.getElementById('previewHeaders');
        const sampleRow = document.querySelector('.sample-row');
        const columnCountSpan = document.getElementById('columnCount');
        
        if (previewHeaders) {
            previewHeaders.innerHTML = `
                <tr>
                    ${columns.map(column => `<th>${column}</th>`).join('')}
                </tr>
            `;
        }
        
        if (sampleRow) {
            sampleRow.innerHTML = `
                ${columns.map(column => `<td class="sample-cell">Sample data</td>`).join('')}
            `;
        }
        
        if (columnCountSpan) {
            columnCountSpan.textContent = columns.length;
        }
    }

    clearTablePreview() {
        const previewHeaders = document.getElementById('previewHeaders');
        const sampleRow = document.querySelector('.sample-row');
        const columnCountSpan = document.getElementById('columnCount');
        
        if (previewHeaders) previewHeaders.innerHTML = '';
        if (sampleRow) sampleRow.innerHTML = '';
        if (columnCountSpan) columnCountSpan.textContent = '0';
    }

    previewTableStructure() {
        const reportTable = document.getElementById('reportTable');
        const tablePreview = document.getElementById('tablePreview');
        const tableStructure = document.getElementById('tableStructure');

        if (!reportTable || !tablePreview || !tableStructure) return;

        const selectedTable = reportTable.value;
        if (!selectedTable) {
            this.showNotification('Please select a report table first', 'error');
            return;
        }

        const columns = this.tableStructures[selectedTable];
        if (!columns) {
            this.showNotification('Table structure not found', 'error');
            return;
        }

        // Create table structure display
        tableStructure.innerHTML = `
            <div class="structure-info">
                <h5>Table: ${selectedTable.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h5>
                <p>Expected columns (${columns.length}):</p>
            </div>
            <div class="columns-list">
                ${columns.map((column, index) => `
                    <div class="column-item">
                        <span class="column-number">${index + 1}</span>
                        <span class="column-name">${column}</span>
                    </div>
                `).join('')}
            </div>
            <div class="structure-note">
                <i class="fas fa-info-circle"></i>
                <p>Your Excel/CSV file should have these exact column headers in the first row.</p>
            </div>
        `;

        tablePreview.style.display = 'block';
    }

    async handleBatchUpload() {
        const form = document.getElementById('batchUploadForm');
        
        // Get form data
        const reportTable = document.getElementById('reportTable').value;
        const assignedOffice = document.getElementById('assignedOffice').value;
        const description = document.getElementById('description').value;
        
        // Validate form
        if (!reportTable || !assignedOffice) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Assigning...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('api/assign_table.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reportTable: reportTable,
                    assignedOffice: assignedOffice,
                    description: description
                }),
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(`Table assigned successfully to ${assignedOffice}!`, 'success');
                form.reset();
                this.clearTablePreview();
                document.getElementById('tablePreview').style.display = 'none';
            } else {
                this.showNotification(result.message || 'Assignment failed', 'error');
            }
        } catch (error) {
            console.error('Assignment error:', error);
            this.showNotification('Assignment failed. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
    
    // Add logout button
    const headerRight = document.querySelector('.header-right');
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'logout-btn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.addEventListener('click', () => {
        window.adminDashboard.logout();
    });
    
    // Insert before the profile image
    headerRight.insertBefore(logoutBtn, headerRight.lastElementChild);
});

// Global functions for admin actions
function addUser() {
    window.adminDashboard.addUser();
}

function backupData() {
    window.adminDashboard.backupData();
}

function systemMaintenance() {
    window.adminDashboard.systemMaintenance();
}

function generateReport() {
    window.adminDashboard.generateReport();
}

function editUser(userId) {
    window.adminDashboard.editUser(userId);
}

function deleteUser(userId) {
    window.adminDashboard.deleteUser(userId);
}

// Global functions for batch upload
function previewTableStructure() {
    window.adminDashboard.previewTableStructure();
}

