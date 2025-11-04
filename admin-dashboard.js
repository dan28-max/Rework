// Admin Dashboard JavaScript

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.submissions = [];
        this.filteredSubmissions = [];
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    setupEventListeners() {
        // Navigation menu
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Load submissions when submissions section is accessed
        const submissionsNavItem = document.querySelector('[data-section="submissions"]');
        if (submissionsNavItem) {
            submissionsNavItem.addEventListener('click', () => {
                this.loadSubmissions();
            });
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Add active class to selected nav item
        const targetNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }

        this.currentSection = sectionName;
    }

    async loadSubmissions() {
        try {
            const response = await fetch('api/admin_submissions.php?action=list', {
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.submissions = result.data;
                this.filteredSubmissions = [...this.submissions];
                this.renderSubmissions();
            } else {
                console.error('Failed to load submissions:', result.error);
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
        }
    }

    renderSubmissions() {
        const tbody = document.getElementById('submissionsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.filteredSubmissions.forEach(submission => {
            const row = document.createElement('tr');
            
            const statusClass = submission.status === 'pending' ? 'status-pending' : 
                              submission.status === 'approved' ? 'status-approved' : 'status-rejected';
            
            row.innerHTML = `
                <td>${submission.id}</td>
                <td>${this.formatTableName(submission.table_name)}</td>
                <td>${submission.campus}</td>
                <td>${submission.office}</td>
                <td>${submission.user_name}<br><small>${submission.user_email}</small></td>
                <td>${submission.record_count}</td>
                <td>${new Date(submission.submission_date).toLocaleDateString()}</td>
                <td><span class="status-badge ${statusClass}">${submission.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewSubmission(${submission.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-success" onclick="exportSubmission(${submission.id})">
                        <i class="fas fa-download"></i> Export
                    </button>
                    ${submission.status === 'pending' ? `
                        <button class="btn btn-sm btn-success" onclick="confirmAction(${submission.id}, 'approve')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmAction(${submission.id}, 'reject')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    ` : ''}
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    formatTableName(tableName) {
        const tableNames = {
            'admissiondata': 'Admission Data',
            'enrollmentdata': 'Enrollment Data',
            'graduatesdata': 'Graduates Data',
            'employee': 'Employee Data',
            'leaveprivilege': 'Leave Privilege',
            'libraryvisitor': 'Library Visitor',
            'pwd': 'PWD',
            'waterconsumption': 'Water Consumption',
            'treatedwastewater': 'Treated Waste Water',
            'electricityconsumption': 'Electricity Consumption',
            'solidwaste': 'Solid Waste',
            'campuspopulation': 'Campus Population',
            'foodwaste': 'Food Waste',
            'fuelconsumption': 'Fuel Consumption',
            'distancetraveled': 'Distance Traveled',
            'budgetexpenditure': 'Budget Expenditure',
            'flightaccommodation': 'Flight Accommodation'
        };
        return tableNames[tableName] || tableName;
    }

    async viewSubmission(submissionId) {
        try {
            const response = await fetch(`api/admin_submissions.php?action=details&submission_id=${submissionId}`, {
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSubmissionModal(result.data);
            } else {
                alert('Failed to load submission details: ' + result.error);
            }
        } catch (error) {
            console.error('Error loading submission details:', error);
            alert('Error loading submission details');
        }
    }

    showSubmissionModal(submission) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('submissionModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'submissionModal';
            modal.className = 'modal-overlay';
            modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; align-items: center; justify-content: center;';
            
            modal.innerHTML = `
                <div class="modal-container" style="max-width: 90%; max-height: 90%; overflow-y: auto; background: white; border-radius: 8px; padding: 20px;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 id="submissionModalTitle">Submission Details</h3>
                        <button class="modal-close" onclick="closeSubmissionModal()" style="background: none; border: none; font-size: 24px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="submissionModalBody">
                        <!-- Content will be loaded here -->
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        }

        // Populate modal content
        const title = document.getElementById('submissionModalTitle');
        const body = document.getElementById('submissionModalBody');
        
        title.textContent = `${this.formatTableName(submission.table_name)} - ${submission.campus}`;
        
        let tableHtml = `
            <div class="submission-info">
                <p><strong>Submitted by:</strong> ${submission.user_name} (${submission.user_email})</p>
                <p><strong>Campus:</strong> ${submission.campus}</p>
                <p><strong>Office:</strong> ${submission.office}</p>
                <p><strong>Date:</strong> ${new Date(submission.submission_date).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${submission.status}">${submission.status}</span></p>
                <p><strong>Description:</strong> ${submission.description || 'No description provided'}</p>
            </div>
            <hr>
            <h4>Submitted Data (${submission.data.length} records)</h4>
        `;
        
        if (submission.data && submission.data.length > 0) {
            const allColumns = Object.keys(submission.data[0]);
            // Filter out Submission ID column if it exists
            const columns = allColumns.filter(col => 
                col.toLowerCase() !== 'submission_id' && 
                col.toLowerCase() !== 'submission id' &&
                col !== 'id'
            );
            
            tableHtml += `
                <div style="overflow-x: auto;">
                    <table class="table" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                ${columns.map(col => `<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">${col}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${submission.data.map(row => `
                                <tr>
                                    ${columns.map(col => `<td style="border: 1px solid #ddd; padding: 8px;">${row[col] || ''}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        body.innerHTML = tableHtml;
        
        // Show modal
        modal.style.display = 'flex';
    }

    async updateSubmissionStatus(submissionId, status) {
        if (!confirm(`Are you sure you want to ${status} this submission?`)) {
            return;
        }

        try {
            const response = await fetch('api/admin_submissions.php?action=update_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    submission_id: submissionId,
                    status: status
                }),
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`Submission ${status} successfully`);
                this.loadSubmissions(); // Refresh the list
            } else {
                alert('Failed to update status: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating submission status:', error);
            alert('Error updating submission status');
        }
    }

    exportSubmission(submissionId) {
        window.open(`api/admin_submissions.php?action=export&submission_id=${submissionId}`, '_blank');
    }

    filterSubmissions() {
        const statusFilter = document.getElementById('statusFilter').value;
        const campusFilter = document.getElementById('campusFilter').value;
        
        this.filteredSubmissions = this.submissions.filter(submission => {
            const statusMatch = !statusFilter || submission.status === statusFilter;
            const campusMatch = !campusFilter || submission.campus === campusFilter;
            return statusMatch && campusMatch;
        });
        
        this.renderSubmissions();
    }

    checkAuth() {
        // Check if user is authenticated and has admin role
        if (!localStorage.getItem('userSession')) {
            window.location.href = 'login.html';
            return;
        }
        
        const userSession = JSON.parse(localStorage.getItem('userSession'));
        if (userSession.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'login.html';
            return;
        }
    }

    loadDashboardData() {
        // Load dashboard overview data
        console.log('Loading dashboard data...');
    }
}

        // Add active class to selected nav item
        const targetNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }

        this.currentSection = sectionName;
    }

    async loadSubmissions() {
        try {
            const response = await fetch('api/admin_submissions.php?action=list', {
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.submissions = result.data;
                this.filteredSubmissions = [...this.submissions];
                this.renderSubmissions();
            } else {
                console.error('Failed to load submissions:', result.error);
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
        }
    }

    renderSubmissions() {
        const tbody = document.getElementById('submissionsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.filteredSubmissions.forEach(submission => {
            const row = document.createElement('tr');
            
            const statusClass = submission.status === 'pending' ? 'status-pending' : 
                              submission.status === 'approved' ? 'status-approved' : 'status-rejected';
            
            row.innerHTML = `
                <td>${submission.id}</td>
                <td>${this.formatTableName(submission.table_name)}</td>
                <td>${submission.campus}</td>
                <td>${submission.office}</td>
                <td>${submission.user_name}<br><small>${submission.user_email}</small></td>
                <td>${submission.record_count}</td>
                <td>${new Date(submission.submission_date).toLocaleDateString()}</td>
                <td><span class="status-badge ${statusClass}">${submission.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewSubmission(${submission.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-success" onclick="exportSubmission(${submission.id})">
                        <i class="fas fa-download"></i> Export
                    </button>
                    ${submission.status === 'pending' ? `
                        <button class="btn btn-sm btn-success" onclick="confirmAction(${submission.id}, 'approve')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmAction(${submission.id}, 'reject')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    ` : ''}
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    formatTableName(tableName) {
        const tableNames = {
            'admissiondata': 'Admission Data',
            'enrollmentdata': 'Enrollment Data',
            'graduatesdata': 'Graduates Data',
            'employee': 'Employee Data',
            'leaveprivilege': 'Leave Privilege',
            'libraryvisitor': 'Library Visitor',
            'pwd': 'PWD',
            'waterconsumption': 'Water Consumption',
            'treatedwastewater': 'Treated Waste Water',
            'electricityconsumption': 'Electricity Consumption',
            'solidwaste': 'Solid Waste',
            'campuspopulation': 'Campus Population',
            'foodwaste': 'Food Waste',
            'fuelconsumption': 'Fuel Consumption',
            'distancetraveled': 'Distance Traveled',
            'budgetexpenditure': 'Budget Expenditure',
            'flightaccommodation': 'Flight Accommodation'
        };
        return tableNames[tableName] || tableName;
    }

    async viewSubmission(submissionId) {
        try {
            const response = await fetch(`api/admin_submissions.php?action=details&submission_id=${submissionId}`, {
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSubmissionModal(result.data);
            } else {
                alert('Failed to load submission details: ' + result.error);
            }
        } catch (error) {
            console.error('Error loading submission details:', error);
            alert('Error loading submission details');
        }
    }

    showSubmissionModal(submission) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('submissionModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'submissionModal';
            modal.className = 'modal-overlay';
            modal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; align-items: center; justify-content: center;';
            
            modal.innerHTML = `
                <div class="modal-container" style="max-width: 90%; max-height: 90%; overflow-y: auto; background: white; border-radius: 8px; padding: 20px;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 id="submissionModalTitle">Submission Details</h3>
                        <button class="modal-close" onclick="closeSubmissionModal()" style="background: none; border: none; font-size: 24px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="submissionModalBody">
                        <!-- Content will be loaded here -->
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        }

        // Populate modal content
        const title = document.getElementById('submissionModalTitle');
        const body = document.getElementById('submissionModalBody');
        
        title.textContent = `${this.formatTableName(submission.table_name)} - ${submission.campus}`;
        
        let tableHtml = `
            <div class="submission-info">
                <p><strong>Submitted by:</strong> ${submission.user_name} (${submission.user_email})</p>
                <p><strong>Campus:</strong> ${submission.campus}</p>
                <p><strong>Office:</strong> ${submission.office}</p>
                <p><strong>Date:</strong> ${new Date(submission.submission_date).toLocaleString()}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${submission.status}">${submission.status}</span></p>
                <p><strong>Description:</strong> ${submission.description || 'No description provided'}</p>
            </div>
            <hr>
            <h4>Submitted Data (${submission.data.length} records)</h4>
        `;
        
        if (submission.data && submission.data.length > 0) {
            const allColumns = Object.keys(submission.data[0]);
            // Filter out Submission ID column if it exists
            const columns = allColumns.filter(col => 
                col.toLowerCase() !== 'submission_id' && 
                col.toLowerCase() !== 'submission id' &&
                col !== 'id'
            );
            
            tableHtml += `
                <div style="overflow-x: auto;">
                    <table class="table" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                ${columns.map(col => `<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">${col}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${submission.data.map(row => `
                                <tr>
                                    ${columns.map(col => `<td style="border: 1px solid #ddd; padding: 8px;">${row[col] || ''}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        body.innerHTML = tableHtml;
        
        // Show modal
        modal.style.display = 'flex';
    }

    async updateSubmissionStatus(submissionId, status) {
        if (!confirm(`Are you sure you want to ${status} this submission?`)) {
            return;
        }

        try {
            const response = await fetch('api/admin_submissions.php?action=update_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    submission_id: submissionId,
                    status: status
                }),
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`Submission ${status} successfully`);
                this.loadSubmissions(); // Refresh the list
            } else {
                alert('Failed to update status: ' + result.error);
            }
        } catch (error) {
            console.error('Error updating submission status:', error);
            alert('Error updating submission status');
        }
    }

    exportSubmission(submissionId) {
        window.open(`api/admin_submissions.php?action=export&submission_id=${submissionId}`, '_blank');
    }

    filterSubmissions() {
        const statusFilter = document.getElementById('statusFilter').value;
        const campusFilter = document.getElementById('campusFilter').value;
        
        this.filteredSubmissions = this.submissions.filter(submission => {
            const statusMatch = !statusFilter || submission.status === statusFilter;
            const campusMatch = !campusFilter || submission.campus === campusFilter;
            return statusMatch && campusMatch;
        });
        
        this.renderSubmissions();
    }

    checkAuth() {
        // Check if user is authenticated and has admin role
        if (!localStorage.getItem('userSession')) {
            window.location.href = 'login.html';
            return;
        }
        
        const userSession = JSON.parse(localStorage.getItem('userSession'));
        if (userSession.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'login.html';
            return;
        }
    }

    loadDashboardData() {
        // Load dashboard overview data
        console.log('Loading dashboard data...');
    }
}

// Global functions for HTML onclick handlers
function viewSubmission(submissionId) {
    window.adminDashboard.viewSubmission(submissionId);
}

function exportSubmission(submissionId) {
    window.adminDashboard.exportSubmission(submissionId);
}

function updateSubmissionStatus(submissionId, status) {
    window.adminDashboard.updateSubmissionStatus(submissionId, status);
}

function filterSubmissions() {
    window.adminDashboard.filterSubmissions();
}

function closeSubmissionModal() {
    const modal = document.getElementById('submissionModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
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
                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const result = await response.json();
                    if (result.success) {
                        this.updateDashboardWithData(result.data);
                    }
                } else {
                    console.error('Non-JSON response from dashboard API');
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
                // Check if response is JSON
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const result = await response.json();
                    if (result.success) {
                        this.updateUsersTable(result.data.users);
                    }
                } else {
                    console.error('Non-JSON response from users API');
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

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned non-JSON response');
            }

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

// Logout function
window.logout = function(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    try {
        // Clear all authentication data
        sessionStorage.clear();
        localStorage.removeItem('userSession');
        
        // Show loading state
        const logoutBtn = document.getElementById('logoutButton');
        if (logoutBtn) {
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
            logoutBtn.disabled = true;
        }
        
        // Redirect to login page with a small delay for better UX
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'login.html';
    }
    return false; // Prevent default anchor behavior
};

// Add click event listener to logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

/**
 * Dropdown Management
 */
const dropdownManager = {
    // Current open dropdown reference
    currentDropdown: null,
    
    // Initialize dropdown functionality
    init() {
        this.setupProfileButton();
        this.setupLogoutButton();
        this.loadUserInfo();
    },
    
    // Set up profile button click handler
    setupProfileButton() {
        const profileButton = document.getElementById('profileButton');
        if (!profileButton) return;
        
        // Remove any existing handlers to prevent duplicates
        profileButton.removeEventListener('click', this.handleProfileClick);
        
        // Add new click handler with proper binding
        profileButton.addEventListener('click', this.handleProfileClick.bind(this));
        profileButton.style.cursor = 'pointer';
    },
    
    // Handle profile button click
    handleProfileClick(event) {
        event.stopPropagation();
        event.preventDefault();
        
        const dropdown = document.getElementById('userDropdown');
        if (!dropdown) return;
        
        // Toggle dropdown
        if (dropdown.classList.contains('active')) {
            this.closeDropdown(dropdown);
        } else {
            this.openDropdown(dropdown, event.currentTarget);
        }
    },
    
    // Open dropdown with proper event handling
    openDropdown(dropdown, button) {
        // Close any other open dropdowns
        this.closeAllDropdowns();
        
        // Set current dropdown reference
        this.currentDropdown = dropdown;
        
        // Add active class
        dropdown.classList.add('active');
        
        // Add click outside handler
        this.documentClickHandler = (e) => {
            if (!dropdown.contains(e.target) && e.target !== button && !button.contains(e.target)) {
                this.closeDropdown(dropdown);
            }
        };
        
        // Add slight delay to prevent immediate close
        setTimeout(() => {
            document.addEventListener('click', this.documentClickHandler);
        }, 10);
    },
    
    // Close a specific dropdown
    closeDropdown(dropdown) {
        if (!dropdown) return;
        
        dropdown.classList.remove('active');
        
        // Clean up event listener
        if (this.documentClickHandler) {
            document.removeEventListener('click', this.documentClickHandler);
            this.documentClickHandler = null;
        }
        
        if (this.currentDropdown === dropdown) {
            this.currentDropdown = null;
        }
    },
    
    // Close all dropdowns
    closeAllDropdowns() {
        document.querySelectorAll('.user-dropdown.active').forEach(dropdown => {
            this.closeDropdown(dropdown);
        });
    },
    
    // Set up logout button
    setupLogoutButton() {
        const logoutButton = document.getElementById('logoutButton');
        if (!logoutButton) return;
        
        // Clone and replace to remove existing event listeners
        const newLogoutButton = logoutButton.cloneNode(true);
        logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
        
        // Add new click handler
        newLogoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Close dropdown
            this.closeAllDropdowns();
            
            // Handle logout
            if (typeof window.logout === 'function') {
                window.logout();
            } else {
                window.location.href = 'logout.php';
            }
        });
    },
    
    // Load and display user info
    loadUserInfo() {
        try {
            const userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
            if (userSession && userSession.user) {
                const nameEl = document.getElementById('adminName');
                const emailEl = document.getElementById('adminEmail');
                if (nameEl) nameEl.textContent = userSession.user.name || 'Admin User';
                if (emailEl) emailEl.textContent = userSession.user.email || 'admin@example.com';
            }
        } catch (e) {
            console.error('Error loading user info:', e);
        }
    }
};

// Initialize dropdown manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize admin dashboard if available
    if (typeof AdminDashboard === 'function' && !window.adminDashboard) {
        window.adminDashboard = new AdminDashboard();
    }
    
    // Initialize dropdown manager
    dropdownManager.init();
});
});

// Global variables for action handling
let pendingAction = {
    submissionId: null,
    action: null,
    callback: null
};

// Show confirmation modal for approve/reject actions
function confirmAction(submissionId, action) {
    pendingAction.submissionId = submissionId;
    pendingAction.action = action;
    
    const modal = document.getElementById('confirmActionModal');
    const title = document.getElementById('confirmActionTitle');
    const message = document.getElementById('confirmActionMessage');
    const confirmBtn = document.getElementById('confirmActionButton');
    
    if (action === 'approve') {
        title.textContent = 'Approve Submission';
        message.textContent = 'Are you sure you want to approve this submission? This action cannot be undone.';
        confirmBtn.style.backgroundColor = '#2ecc71';
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Approve';
    } else {
        title.textContent = 'Reject Submission';
        message.textContent = 'Are you sure you want to reject this submission? This action cannot be undone.';
        confirmBtn.style.backgroundColor = '#e74c3c';
        confirmBtn.innerHTML = '<i class="fas fa-times"></i> Reject';
    }
    
    modal.style.display = 'block';
}

// Close the confirmation modal
function closeConfirmModal() {
    const modal = document.getElementById('confirmActionModal');
    modal.style.display = 'none';
    
    // Reset pending action
    pendingAction = {
        submissionId: null,
        action: null,
        callback: null
    };
}

// Process the confirmed action
async function processConfirmedAction() {
    if (!pendingAction.submissionId || !pendingAction.action) return;
    
    const submissionId = pendingAction.submissionId;
    const action = pendingAction.action;
    
    // Close the modal
    closeConfirmModal();
    
    // Show loading state
    const actionBtn = document.querySelector(`button[onclick*="${action}(${submissionId})"]`);
    const originalText = actionBtn ? actionBtn.innerHTML : '';
    
    if (actionBtn) {
        actionBtn.disabled = true;
        actionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    try {
        // Call the original update function
        await updateSubmissionStatus(submissionId, action === 'approve' ? 'approved' : 'rejected');
        
        // Show success message
        showSuccessMessage(
            action === 'approve' 
                ? 'Submission approved successfully!' 
                : 'Submission rejected successfully!'
        );
        
        // Refresh the submissions list
        if (window.adminDashboard) {
            window.adminDashboard.loadSubmissions();
        }
    } catch (error) {
        console.error('Error processing action:', error);
        alert('An error occurred while processing your request. Please try again.');
    } finally {
        // Reset button state
        if (actionBtn) {
            actionBtn.disabled = false;
            actionBtn.innerHTML = originalText;
        }
    }
}

// Show success message toast
function showSuccessMessage(message) {
    const toast = document.getElementById('successToast');
    const messageEl = document.getElementById('successMessage');
    
    if (!toast || !messageEl) return;
    
    messageEl.textContent = message;
    toast.style.display = 'flex';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

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

