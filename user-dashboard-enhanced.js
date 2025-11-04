// Enhanced User Dashboard with Admin-Style UI
class UserDashboard {
    constructor() {
        this.currentUser = null;
        this.assignedReports = [];
        this.submissions = [];
        this.calendarEvents = [];
        this.currentCalendarMonth = new Date().getMonth();
        this.currentCalendarYear = new Date().getFullYear();
        // Use demo data instead of hitting APIs to avoid 500s in dev
        this.useDemoAPIs = true;
        this.dateSortOrder = 'desc'; // 'asc' or 'desc'
        this.init();
    }

    async init() {
        console.log('Initializing enhanced user dashboard...');
        
        // Load user session
        await this.loadUserSession();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup message listener for iframe communication
        this.setupMessageListener();
        
        // Load dashboard data
        await this.loadDashboardData();
        
        // Load submissions for analytics
        await this.loadSubmissions();
        
        
        // Render analytics with submission data
        this.loadAnalytics();
        
        console.log('Dashboard initialized successfully');
    }
    
    setupMessageListener() {
        // Listen for messages from iframe (report submission)
        window.addEventListener('message', (event) => {
            console.log('Message received:', event.data);
            
            if (event.data && event.data.type === 'reportSubmitted' && event.data.success) {
                console.log('Report submitted successfully, closing modal and refreshing...');
                
                // Close the report modal
                this.closeReportModal();
                
                // Show success notification
                this.showNotification('Report submitted successfully!', 'success');
                
                // Refresh dashboard data
                console.log('Refreshing dashboard data...');
                this.loadDashboardData();
            }
        });
    }

    async loadUserSession() {
        try {
            // Check if user is authenticated via PHP session
            const response = await fetch('api/simple_auth.php?action=check');
            
            if (response.ok) {
                const result = await response.json();
                console.log('Auth check result:', result);
                
                if (result.success && result.data && result.data.authenticated) {
                    // User is authenticated - fetch full user details
                    this.currentUser = {
                        id: result.data.user_id,
                        username: result.data.username,
                        name: result.data.username, // Use username as name if not provided
                        role: result.data.role
                    };
                    this.useDemoAPIs = false; // Use real APIs
                    localStorage.setItem('userSession', JSON.stringify(this.currentUser));
                    this.updateUserInfo();
                    return;
                }
            }
        } catch (error) {
            console.log('Auth check failed:', error);
        }
        
        // Not authenticated - redirect to login
        console.log('User not authenticated, redirecting to login...');
        window.location.href = 'login.html';
    }

    updateUserInfo() {
        if (!this.currentUser) return;
        
        // Update user display - prefer username over name
        const displayName = this.currentUser.username || this.currentUser.name || 'User';
        document.getElementById('userName').textContent = displayName;
        document.getElementById('userRole').textContent = this.currentUser.role || 'User';
        
        // Update avatar
        const avatar = document.getElementById('userAvatar');
        if (displayName) {
            avatar.textContent = displayName.charAt(0).toUpperCase();
        }
    }

    setupEventListeners() {
        // Navigation menu
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                if (section) {
                    this.showSection(section);
                }
            });
        });
    }

    showSection(sectionId) {
        // Update page title
        const titles = {
            'dashboard': { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your overview' },
            'my-reports': { title: 'My Reports', subtitle: 'All reports assigned to you' },
            'submissions': { title: 'Submissions History', subtitle: 'View all your submitted reports' },
            'analytics': { title: 'My Analytics', subtitle: 'View your performance and submission trends' },
            'calendar': { title: 'Calendar', subtitle: 'View your upcoming deadlines and events' },
            'profile': { title: 'My Profile', subtitle: 'View and update your profile information' },
            'help': { title: 'Help & Guide', subtitle: 'Learn how to use the system effectively' }
        };
        
        if (titles[sectionId]) {
            document.getElementById('pageTitle').textContent = titles[sectionId].title;
            document.getElementById('pageSubtitle').textContent = titles[sectionId].subtitle;
        }
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
        }
        
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Load section-specific data
        if (sectionId === 'dashboard') {
            // Analytics are now part of the dashboard section
            this.loadAnalytics();
        } else if (sectionId === 'submissions') {
            this.loadSubmissions();
        } else if (sectionId === 'profile') {
            this.loadProfile();
        } else if (sectionId === 'help') {
            this.loadHelp();
        } else if (sectionId === 'calendar') {
            this.loadCalendar();
        }
    }

    async loadDashboardData() {
        try {
            // Load assigned reports
            await this.loadAssignedReports();
            
            // Update statistics
            this.updateStatistics();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async loadAssignedReports() {
        // If using demo mode, skip API call
        if (this.useDemoAPIs) {
            this.assignedReports = this.getDemoReports();
            if (document.getElementById('assignedReportsContainer')) {
                this.renderAssignedReports();
            }
            return;
        }
        
        try {
            console.log('Fetching assigned tasks...');
            const response = await fetch('api/user_tasks.php?action=get_assigned', {
                method: 'GET',
                credentials: 'include',  // Important: include session cookies
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            console.log('Response status:', response.status);
            
            // Check if response is OK
            if (!response.ok) {
                if (response.status === 401) {
                    // Unauthorized - redirect to login
                    window.location.href = 'login.html';
                    return;
                }
                
                // Try to get error details
                try {
                    const errorData = await response.json();
                    console.error('API Error Details:', errorData);
                    console.error('Error Message:', errorData.message);
                    if (errorData.file) console.error('Error File:', errorData.file);
                    if (errorData.line) console.error('Error Line:', errorData.line);
                    if (errorData.trace) console.error('Stack Trace:', errorData.trace);
                } catch (e) {
                    console.error('Could not parse error response');
                }
                
                // API error, use demo data
                this.assignedReports = this.getDemoReports();
                this.renderAssignedReports();
                return;
            }
            
            const result = await response.json();
            console.log('API Response:', result);
            
            if (result.success) {
                this.assignedReports = result.data || result.tasks || [];
                console.log('Assigned reports loaded:', this.assignedReports.length);
                this.renderAssignedReports();
            } else {
                console.error('API returned success=false:', result);
                console.error('Error message:', result.message);
                // Use demo data
                this.assignedReports = this.getDemoReports();
                this.renderAssignedReports();
            }
        } catch (error) {
            console.error('Error loading assigned reports:', error);
            // Use demo data for testing
            this.assignedReports = this.getDemoReports();
            // Only render if container exists
            if (document.getElementById('assignedReportsContainer')) {
                this.renderAssignedReports();
            }
        }
    }
    
    getDemoReports() {
        // Demo data for testing when API is not available
        return [
            {
                id: 1,
                table_name: 'campuspopulation',
                description: 'Campus Population Report',
                office: 'Registrar Office',
                campus: 'Lipa Campus',
                assigned_at: new Date().toISOString()
            },
            {
                id: 2,
                table_name: 'admissiondata',
                description: 'Admission Data Report',
                office: 'Admissions Office',
                campus: 'Lipa Campus',
                assigned_at: new Date().toISOString()
            },
            {
                id: 3,
                table_name: 'enrollmentdata',
                description: 'Enrollment Data Report',
                office: 'Registrar Office',
                campus: 'Lipa Campus',
                assigned_at: new Date().toISOString()
            }
        ];
    }

    renderAssignedReports() {
        const container = document.getElementById('assignedReportsContainer');
        // If the dashboard no longer includes the assigned reports block, safely skip rendering
        if (!container) return;

        if (this.assignedReports.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-check"></i>
                    <h3>All Caught Up!</h3>
                    <p>You have no pending reports to submit</p>
                </div>
            `;
            return;
        }

        const reportsHTML = this.assignedReports.map(report => `
            <div class="report-card">
                <div class="report-card-header">
                    <h3>
                        <i class="fas fa-file-alt"></i>
                        ${this.formatReportName(report.table_name)}
                    </h3>
                    <p>${report.description || 'No description available'}</p>
                </div>
                <div class="report-card-body">
                    <div class="report-meta">
                        <div class="meta-item">
                            <i class="fas fa-building"></i>
                            <span><strong>Office:</strong> ${report.office || 'N/A'}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span><strong>Campus:</strong> ${report.campus || 'N/A'}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span><strong>Assigned:</strong> ${this.formatDate(report.assigned_at)}</span>
                        </div>
                    </div>
                </div>
                <div class="report-card-footer">
                    <span class="status-badge pending">Pending</span>
                    <button class="btn-submit-report" onclick="userDashboard.submitReport('${report.table_name}', ${report.id})">
                        <i class="fas fa-paper-plane"></i>
                        <span>Submit Report</span>
                    </button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = `<div class="reports-grid">${reportsHTML}</div>`;
    }

    async loadMyReports() {
        const container = document.getElementById('myReportsContainer');
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading reports...</p>
            </div>
        `;
        
        await this.loadAssignedReports();
        
        if (this.assignedReports.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No Reports</h3>
                    <p>You don't have any reports assigned yet</p>
                </div>
            `;
        } else {
            container.innerHTML = `<div class="reports-grid">${this.renderAllReports()}</div>`;
        }
    }

    renderAllReports() {
        return this.assignedReports.map(report => `
            <div class="report-card">
                <div class="report-card-header">
                    <h3>
                        <i class="fas fa-file-alt"></i>
                        ${this.formatReportName(report.table_name)}
                    </h3>
                    <p>${report.description || 'No description available'}</p>
                </div>
                <div class="report-card-body">
                    <div class="report-meta">
                        <div class="meta-item">
                            <i class="fas fa-building"></i>
                            <span><strong>Office:</strong> ${report.office || 'N/A'}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span><strong>Assigned:</strong> ${this.formatDate(report.assigned_at)}</span>
                        </div>
                    </div>
                </div>
                <div class="report-card-footer">
                    <span class="status-badge ${report.submitted ? 'completed' : 'pending'}">
                        ${report.submitted ? 'Completed' : 'Pending'}
                    </span>
                    ${!report.submitted ? `
                    <button class="btn-submit-report" onclick="userDashboard.submitReport('${report.table_name}', ${report.id})">
                        <i class="fas fa-paper-plane"></i>
                        <span>Submit</span>
                    </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    async loadSubmissions() {
        try {
            const response = await fetch('api/user_submissions.php', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = 'login.html';
                    return;
                }
                // Try to get error details
                const text = await response.text();
                console.error('API Error Response:', text);
                try {
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.message || 'Failed to load submissions');
                } catch (e) {
                    throw new Error('Failed to load submissions: ' + response.status);
                }
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.allSubmissions = result.submissions || [];
                
                // Sort by date (newest first) on initial load
                this.allSubmissions.sort((a, b) => {
                    const dateA = new Date(a.submission_date || a.submitted_at).getTime();
                    const dateB = new Date(b.submission_date || b.submitted_at).getTime();
                    return dateB - dateA; // Newest first
                });
                
                this.filteredSubmissions = [...this.allSubmissions];
                
                console.log('Loaded submissions:', this.allSubmissions);
                
                // Populate report type filter
                this.populateReportTypeFilter();
                
                // Render submissions table
                this.renderSubmissionsTable();
            } else {
                this.renderEmptySubmissions('Failed to load submissions');
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
            this.renderEmptySubmissions('Error loading submissions');
        }
    }
    
    populateReportTypeFilter() {
        const reportFilter = document.getElementById('submissionReportFilter');
        if (!reportFilter) return;
        
        // Get unique report types
        const reportTypes = [...new Set(this.allSubmissions.map(s => s.table_name))];
        
        // Clear existing options except first
        reportFilter.innerHTML = '<option value="">All Reports</option>';
        
        // Add report type options
        reportTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = this.formatReportName(type);
            reportFilter.appendChild(option);
        });
    }
    
    filterSubmissions() {
        const reportFilter = document.getElementById('submissionReportFilter')?.value || '';
        
        this.filteredSubmissions = this.allSubmissions.filter(submission => {
            const reportMatch = !reportFilter || submission.table_name === reportFilter;
            return reportMatch;
        });
        
        this.renderSubmissionsTable();
    }
    
    refreshSubmissions() {
        this.loadSubmissions();
    }
    
    sortByDate() {
        // Toggle sort order
        this.dateSortOrder = this.dateSortOrder === 'asc' ? 'desc' : 'asc';
        
        // Update icon
        const sortIcon = document.getElementById('dateSortIcon');
        if (sortIcon) {
            sortIcon.className = this.dateSortOrder === 'asc' 
                ? 'fas fa-sort-up' 
                : 'fas fa-sort-down';
        }
        
        // Sort submissions by date
        this.filteredSubmissions.sort((a, b) => {
            const dateA = new Date(a.submission_date || a.submitted_at).getTime();
            const dateB = new Date(b.submission_date || b.submitted_at).getTime();
            
            if (this.dateSortOrder === 'asc') {
                return dateA - dateB; // Oldest first
            } else {
                return dateB - dateA; // Newest first
            }
        });
        
        // Re-render table
        this.renderSubmissionsTable();
    }
    
    renderSubmissionsTable() {
        const tbody = document.getElementById('submissionsTableBody');
        if (!tbody) {
            console.error('submissionsTableBody not found!');
            return;
        }
        
        console.log('Rendering submissions table with', this.filteredSubmissions.length, 'submissions');
        
        if (this.filteredSubmissions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <i class="fas fa-inbox" style="font-size: 48px; color: #cbd5e0; margin-bottom: 15px; display: block;"></i>
                        <p style="color: #666; margin: 0;">No submissions found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        this.filteredSubmissions.forEach(submission => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${this.formatReportName(submission.table_name)}</td>
                <td>${submission.campus || '-'}</td>
                <td>${submission.office || '-'}</td>
                <td style="text-align: center;">${submission.record_count || 0}</td>
                <td>${new Date(submission.submission_date).toLocaleString()}</td>
                <td>
                    <div class="submission-actions" style="display: flex; gap: 8px;">
                        <button class="btn-sm btn-view" onclick="userDashboard.viewSubmission(${submission.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-sm btn-download" onclick="userDashboard.downloadSubmission(${submission.id})" title="Export CSV">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    renderEmptySubmissions(message = 'No submissions found') {
        const tbody = document.getElementById('submissionsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #dc143c; margin-bottom: 15px; display: block;"></i>
                    <p style="color: #666; margin: 0;">${message}</p>
                </td>
            </tr>
        `;
    }
    
    async viewSubmission(submissionId) {
        try {
            console.log('Fetching submission details for ID:', submissionId);
            const response = await fetch(`api/user_submissions.php?action=details&submission_id=${submissionId}`, {
                credentials: 'include'
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const text = await response.text();
                console.error('API Error:', text);
                throw new Error('Failed to fetch submission data');
            }
            
            const result = await response.json();
            console.log('View submission result:', result);
            
            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to fetch submission data');
            }
            
            const submission = result.data;
            const data = submission.data || [];
            
            // Create modal HTML
            const modalHTML = `
                <div class="custom-modal-overlay show" id="viewSubmissionModal" style="z-index: 10000;">
                    <div class="custom-modal-content" style="max-width: 90%; max-height: 90vh; overflow: auto; position: relative;">
                        <div class="custom-modal-header">
                            <h3><i class="fas fa-file-alt"></i> ${submission.report_name || 'Report Details'}</h3>
                            <button class="modal-close-btn" onclick="document.getElementById('viewSubmissionModal').remove()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="custom-modal-body">
                            <!-- Submission Info -->
                            <div class="submission-info-card">
                                <h4><i class="fas fa-info-circle"></i> Submission Information</h4>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">Campus:</span>
                                        <span class="info-value">${submission.campus || 'N/A'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Office:</span>
                                        <span class="info-value">${submission.office || 'N/A'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Submitted Date:</span>
                                        <span class="info-value">${this.formatSubmissionDate(submission)}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Records:</span>
                                        <span class="info-value">${data.length}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Data Table -->
                            <div class="submission-data-card">
                                <h4><i class="fas fa-table"></i> Submission Data</h4>
                                ${data.length > 0 ? `
                                    <div class="table-wrapper" style="max-height: 400px; overflow: auto;">
                                        <table class="formal-table">
                                            <thead>
                                                <tr>
                                                    ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${data.map(row => `
                                                    <tr>
                                                        ${Object.values(row).map(value => `<td>${value || '-'}</td>`).join('')}
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                ` : `
                                    <div style="text-align: center; padding: 40px; background: white; border-radius: 10px;">
                                        <i class="fas fa-inbox" style="font-size: 48px; color: #cbd5e0; margin-bottom: 15px; display: block;"></i>
                                        <h4 style="color: #2d3748; margin-bottom: 10px;">No Data Available</h4>
                                        <p style="color: #718096; margin: 0;">This submission was created before the data storage system was implemented.</p>
                                        <p style="color: #718096; margin-top: 5px;">New submissions will have viewable and exportable data.</p>
                                    </div>
                                `}
                            </div>
                        </div>
                        <div class="custom-modal-footer">
                            <button class="custom-modal-btn custom-modal-btn-primary" onclick="userDashboard.downloadSubmission(${submissionId})">
                                <i class="fas fa-download"></i> Export CSV
                            </button>
                            <button class="custom-modal-btn custom-modal-btn-secondary" onclick="document.getElementById('viewSubmissionModal').remove()">
                                <i class="fas fa-times"></i> Close
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to page
            console.log('Adding modal to page...');
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            console.log('Modal added successfully!');
            
        } catch (error) {
            console.error('View submission error:', error);
            this.showNotification('Error loading submission: ' + error.message, 'error');
        }
    }
    
    async downloadSubmission(submissionId) {
        try {
            const response = await fetch(`api/user_submissions.php?action=details&submission_id=${submissionId}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                const text = await response.text();
                console.error('API Error:', text);
                throw new Error('Failed to fetch submission data: ' + response.status);
            }
            
            const result = await response.json();
            console.log('Submission details:', result);
            
            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to fetch submission data');
            }
            
            const submission = result.data;
            const data = submission.data || [];
            
            if (data.length === 0) {
                alert('No data to export');
                return;
            }
            
            // Create CSV content
            let csvContent = [];
            
            // Add metadata
            csvContent.push(['Submission Information']);
            csvContent.push(['Submission ID', submission.id]);
            csvContent.push(['Report Type', this.formatReportName(submission.table_name)]);
            csvContent.push(['Campus', submission.campus || 'N/A']);
            csvContent.push(['Office', submission.office || 'N/A']);
            csvContent.push(['Submitted Date', new Date(submission.submission_date).toLocaleString()]);
            csvContent.push(['Status', submission.status ? submission.status.toUpperCase() : 'PENDING']);
            csvContent.push([]);
            csvContent.push(['Report Data']);
            csvContent.push([]);
            
            // Add headers and data
            if (data[0]) {
                const headers = Object.keys(data[0]);
                csvContent.push(headers);
                
                data.forEach(row => {
                    const rowData = headers.map(header => {
                        let value = row[header] || '';
                        value = String(value).replace(/"/g, '""');
                        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                            value = `"${value}"`;
                        }
                        return value;
                    });
                    csvContent.push(rowData);
                });
            }
            
            // Convert to CSV string
            const csv = csvContent.map(row => row.join(',')).join('\n');
            
            // Download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            const fileName = `${submission.table_name}_submission_${submissionId}_${new Date().toISOString().split('T')[0]}.csv`;
            
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification(`Exported submission #${submissionId} successfully`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error exporting submission: ' + error.message, 'error');
        }
    }
    
    getDemoSubmissions() {
        // Demo submissions for testing
        return [
            {
                id: 1,
                table_name: 'graduatesdata',
                submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'Approved'
            },
            {
                id: 2,
                table_name: 'employee',
                submitted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'Pending Review'
            }
        ];
    }

    renderSubmissions() {
        return this.submissions.map(submission => `
            <div class="report-card">
                <div class="report-card-header">
                    <h3>
                        <i class="fas fa-file-check"></i>
                        ${this.formatReportName(submission.table_name)}
                    </h3>
                </div>
                <div class="report-card-body">
                    <div class="report-meta">
                        <div class="meta-item">
                            <i class="fas fa-calendar-check"></i>
                            <span><strong>Submitted:</strong> ${this.formatDate(submission.submitted_at)}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-info-circle"></i>
                            <span><strong>Status:</strong> ${submission.status || 'Pending Review'}</span>
                        </div>
                    </div>
                </div>
                <div class="report-card-footer">
                    <span class="status-badge completed">Submitted</span>
                </div>
            </div>
        `).join('');
    }

    updateStatistics() {
        // Statistics cards removed - function kept for compatibility
        // but elements no longer exist in DOM
        return;
    }

    submitReport(tableName, taskId) {
        // Redirect to report submission page
        window.location.href = `report.html?table=${tableName}&task_id=${taskId}`;
    }

    formatReportName(tableName) {
        if (!tableName) return 'Unknown Report';
        
        // Map of table names to display names (handles both with and without underscores)
        const tableDisplayNames = {
            'admission': 'Admission Data',
            'enrollment': 'Enrollment Data',
            'enrollmentdata': 'Enrollment Data',
            'graduates': 'Graduates Data',
            'graduatesdata': 'Graduates Data',
            'employee': 'Employee Data',
            'leave_privilege': 'Leave Privilege',
            'leaveprivilege': 'Leave Privilege',
            'library_visitor': 'Library Visitor',
            'libraryvisitor': 'Library Visitor',
            'pwd': 'PWD',
            'water_consumption': 'Water Consumption',
            'waterconsumption': 'Water Consumption',
            'treated_waste_water': 'Treated Waste Water',
            'treated_wastewater': 'Treated Waste Water',
            'treatedwastewater': 'Treated Waste Water',
            'electricity_consumption': 'Electricity Consumption',
            'electricityconsumption': 'Electricity Consumption',
            'solid_waste': 'Solid Waste',
            'solidwaste': 'Solid Waste',
            'campus_population': 'Campus Population',
            'campuspopulation': 'Campus Population',
            'food_waste': 'Food Waste',
            'foodwaste': 'Food Waste',
            'fuel_consumption': 'Fuel Consumption',
            'fuelconsumption': 'Fuel Consumption',
            'distance_traveled': 'Distance Traveled',
            'distancetraveled': 'Distance Traveled',
            'budget_expenditure': 'Budget Expenditure',
            'budgetexpenditure': 'Budget Expenditure',
            'flight_accommodation': 'Flight Accommodation',
            'flightaccommodation': 'Flight Accommodation'
        };

        // Table configurations for form fields
        this.tableConfigs = {
            flightaccommodation: {
                columns: ['Campus', 'Office/Department', 'Year', 'Name of Traveller', 'Event Name/Purpose of Travel', 'Travel Date (mm/dd/yyyy)', 'Domestic/International', 'Origin Info or IATA code', 'Destination Info or IATA code', 'Class', 'One Way/Round Trip', 'kg CO2e', 'tCO2e'],
                columnConfigs: {
                    'Year': {
                        type: 'select',
                        options: (() => {
                            const currentYear = new Date().getFullYear();
                            const years = [];
                            for (let year = currentYear; year >= 2000; year--) {
                                years.push({ value: year.toString(), label: year.toString() });
                            }
                            return years;
                        })()
                    },
                    'Domestic/International': {
                        type: 'select',
                        options: [
                            { value: 'Domestic', label: 'Domestic' },
                            { value: 'International', label: 'International' }
                        ]
                    },
                    'Class': {
                        type: 'select',
                        options: [
                            { value: 'Economy', label: 'Economy' },
                            { value: 'Business Class', label: 'Business Class' }
                        ]
                    },
                    'One Way/Round Trip': {
                        type: 'select',
                        options: [
                            { value: 'One Way', label: 'One Way' },
                            { value: 'Round Trip', label: 'Round Trip' }
                        ]
                    }
                }
            }
        };
        
        // Convert to lowercase for matching
        const lowerTableName = tableName.toLowerCase();
        
        // Return mapped name if exists, otherwise format the name
        if (tableDisplayNames[lowerTableName]) {
            return tableDisplayNames[lowerTableName];
        }
        
        // Fallback formatting
        return tableName
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
            .trim();
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    }
    
    formatSubmissionDate(submission) {
        // Try different possible date field names
        const dateValue = submission.submission_date || 
                         submission.submitted_at || 
                         submission.created_at || 
                         submission.submitted_at_formatted ||
                         null;
        
        if (!dateValue) return 'N/A';
        
        // If it's already formatted, return as is
        if (typeof dateValue === 'string' && dateValue.includes(',')) {
            return dateValue;
        }
        
        // Try to parse the date
        try {
            const date = new Date(dateValue);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'N/A';
            }
            
            // Format the date
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            console.error('Error formatting date:', e, dateValue);
            return 'N/A';
        }
    }

    showEmptyState(containerId, message) {
        const container = document.getElementById(containerId);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>${message}</h3>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // New Section Functions

    loadNotifications() {
        const container = document.getElementById('notificationsContainer');
        
        const notifications = [
            {
                id: 1,
                type: 'deadline',
                title: 'Deadline Approaching',
                message: 'Campus Population Report is due in 3 days',
                time: '2 hours ago',
                read: false
            },
            {
                id: 2,
                type: 'success',
                title: 'Report Approved',
                message: 'Your Graduates Data report has been approved',
                time: '1 day ago',
                read: false
            },
            {
                id: 3,
                type: 'info',
                title: 'New Report Assigned',
                message: 'Enrollment Data report has been assigned to you',
                time: '2 days ago',
                read: true
            },
            {
                id: 4,
                type: 'warning',
                title: 'Submission Reminder',
                message: 'You have 2 pending reports to submit',
                time: '3 days ago',
                read: true
            }
        ];
        
        const notificationsHTML = `
            <div class="notifications-list">
                ${notifications.map(notif => `
                    <div class="notification-item ${notif.read ? 'read' : 'unread'} ${notif.type}">
                        <div class="notification-icon">
                            <i class="fas fa-${notif.type === 'deadline' ? 'clock' : notif.type === 'success' ? 'check-circle' : notif.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                        </div>
                        <div class="notification-content">
                            <h4>${notif.title}</h4>
                            <p>${notif.message}</p>
                            <span class="notification-time">${notif.time}</span>
                        </div>
                        ${!notif.read ? '<div class="unread-badge"></div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = notificationsHTML;
    }

    async loadAnalytics() {
        // Ensure submissions data is loaded
        if (!this.allSubmissions || this.allSubmissions.length === 0) {
            await this.loadSubmissions();
        }
        
        // Load analytics similar to admin dashboard
        await this.loadUserKPICards();
        await this.loadUserSubmissionsGrowthChart();
        await this.loadUserSubmissionsMonthlyChart();
        await this.loadUserReportsByType();
        await this.loadUserTopActiveReports();
    }
    
    async loadUserKPICards() {
        try {
            // Get user's submissions
            const submissions = this.allSubmissions || [];
            
            // Get assigned reports
            const assignedReports = this.assignedReports || [];
            
            // Calculate KPI values
            const totalSubmissions = submissions.length;
            const totalAssigned = assignedReports.length;
            const completed = submissions.length;
            const pending = Math.max(0, totalAssigned - completed);
            
            // Calculate percentage changes (mock - you can make this dynamic)
            const submissionsChange = totalSubmissions > 0 ? 12 : 0;
            const assignedChange = totalAssigned > 0 ? 8 : 0;
            const completedChange = completed > 0 ? 10 : 0;
            const pendingChange = pending > 0 ? 5 : 0;
            
            // Update KPI Cards
            this.updateUserKPICard('userKpiTotalSubmissions', totalSubmissions, submissionsChange, 'userKpiSubmissionsChart');
            this.updateUserKPICard('userKpiAssignedReports', totalAssigned, assignedChange, 'userKpiAssignedChart');
            this.updateUserKPICard('userKpiCompletedReports', completed, completedChange, 'userKpiCompletedChart');
            this.updateUserKPICard('userKpiPendingReports', pending, pendingChange, 'userKpiPendingChart');
            
            // Update change indicators
            this.updateUserKPIChange('userKpiSubmissionsChange', submissionsChange);
            this.updateUserKPIChange('userKpiAssignedChange', assignedChange);
            this.updateUserKPIChange('userKpiCompletedChange', completedChange);
            this.updateUserKPIChange('userKpiPendingChange', pendingChange);
            
            // Create mini charts
            this.createUserMiniCharts(submissions);
        } catch (error) {
            console.error('Error loading user KPI cards:', error);
        }
    }
    
    updateUserKPICard(valueId, value, change, chartId) {
        const valueEl = document.getElementById(valueId);
        if (valueEl) {
            valueEl.textContent = typeof value === 'number' ? value.toLocaleString() : value;
        }
    }
    
    updateUserKPIChange(changeId, change) {
        const changeEl = document.getElementById(changeId);
        if (changeEl) {
            changeEl.className = `kpi-change ${change >= 0 ? 'positive' : 'negative'}`;
            const span = changeEl.querySelector('span');
            if (span) {
                span.textContent = Math.abs(change) + '%';
            }
            const icon = changeEl.querySelector('i');
            if (icon) {
                icon.className = change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
            }
        }
    }
    
    createUserMiniCharts(submissions) {
        // Create mini sparkline charts for KPI cards
        const chartIds = ['userKpiSubmissionsChart', 'userKpiAssignedChart', 'userKpiCompletedChart', 'userKpiPendingChart'];
        
        chartIds.forEach((chartId, index) => {
            const container = document.getElementById(chartId);
            if (!container) return;
            
            // Get last 7 days of data for sparkline
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayStart = new Date(date);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(date);
                dayEnd.setHours(23, 59, 59, 999);
                
                const count = submissions.filter(s => {
                    const subDate = new Date(s.submission_date || s.submitted_at || s.created_at);
                    return subDate >= dayStart && subDate <= dayEnd;
                }).length;
                last7Days.push(count);
            }
            
            // Create simple SVG sparkline
            const max = Math.max(...last7Days, 1);
            const width = 100;
            const height = 40;
            const points = last7Days.map((val, i) => {
                const x = (i / (last7Days.length - 1)) * width;
                const y = height - (val / max) * height;
                return `${x},${y}`;
            }).join(' ');
            
            const colors = ['#3b82f6', '#ef4444', '#10b981', '#3b82f6'];
            container.innerHTML = `
                <svg width="${width}" height="${height}" style="width: 100%; height: 100%;">
                    <polyline points="${points}" fill="none" stroke="${colors[index]}" stroke-width="2"/>
                </svg>
            `;
        });
    }
    
    async loadUserSubmissionsGrowthChart() {
        try {
            const submissions = this.allSubmissions || [];
            this.createUserSubmissionsGrowthChart(submissions);
        } catch (error) {
            console.error('Error loading user growth chart:', error);
        }
    }
    
    createUserSubmissionsGrowthChart(submissions) {
        const ctx = document.getElementById('userSubmissionsGrowthChart');
        if (!ctx) return;
        
        if (this.userSubmissionsGrowthChart) {
            this.userSubmissionsGrowthChart.destroy();
        }
        
        // Group by month for yearly view
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = months.map((month, index) => {
            return submissions.filter(s => {
                const date = new Date(s.submission_date || s.submitted_at || s.created_at);
                return date.getMonth() === index;
            }).length;
        });
        
        // Use actual data values
        const actualData = monthlyData;
        const maxValue = Math.max(...actualData, 1);
        
        // Calculate step size based on max value
        let maxY = Math.ceil(maxValue / 5) * 5;
        if (maxValue === 0) maxY = 5;
        const stepSize = Math.max(1, Math.ceil(maxY / 5));
        
        this.userSubmissionsGrowthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Submissions',
                    data: actualData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        borderRadius: 8,
                        displayColors: false,
                        titleFont: {
                            size: 13,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 12
                        },
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                const value = context.parsed.y;
                                return `Submissions ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: maxY,
                        ticks: {
                            stepSize: stepSize,
                            font: {
                                size: 11
                            },
                            color: '#6b7280'
                        },
                        grid: {
                            color: '#f3f4f6',
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: '#6b7280'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    async loadUserSubmissionsMonthlyChart() {
        try {
            const submissions = this.allSubmissions || [];
            this.createUserSubmissionsMonthlyChart(submissions);
        } catch (error) {
            console.error('Error loading user monthly chart:', error);
        }
    }
    
    createUserSubmissionsMonthlyChart(submissions) {
        const ctx = document.getElementById('userSubmissionsMonthlyChart');
        if (!ctx) return;
        
        if (this.userSubmissionsMonthlyChart) {
            this.userSubmissionsMonthlyChart.destroy();
        }
        
        // Group by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = months.map((month, index) => {
            return submissions.filter(s => {
                const date = new Date(s.submission_date || s.submitted_at || s.created_at);
                return date.getMonth() === index;
            }).length;
        });
        
        // Calculate growth rate
        const currentMonth = new Date().getMonth();
        const previousMonth = currentMonth > 0 ? currentMonth - 1 : 11;
        const currentCount = monthlyData[currentMonth] || 0;
        const previousCount = monthlyData[previousMonth] || 0;
        const growthRate = previousCount > 0 
            ? Math.round(((currentCount - previousCount) / previousCount) * 100) 
            : 0;
        
        // Update growth indicator
        const growthEl = document.getElementById('userMonthlyReportGrowth');
        if (growthEl) {
            growthEl.className = `report-growth-indicator ${growthRate >= 0 ? 'positive' : 'negative'}`;
            const span = growthEl.querySelector('span');
            if (span) {
                span.textContent = Math.abs(growthRate) + '%';
            }
        }
        
        // Update footer metrics
        const impressionsEl = document.getElementById('userMonthlyImpressions');
        const growthEl2 = document.getElementById('userMonthlyGrowth');
        
        if (impressionsEl) impressionsEl.textContent = currentCount.toLocaleString();
        if (growthEl2) growthEl2.textContent = growthRate + '%';
        
        // Scale data for better visualization
        const maxData = Math.max(...monthlyData, 1);
        const scaledData = monthlyData.map(val => (val / maxData) * 100);
        
        this.userSubmissionsMonthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Submissions',
                    data: scaledData,
                    backgroundColor: monthlyData.map((val, i) => 
                        i === currentMonth ? '#3b82f6' : '#e5e7eb'
                    ),
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        borderRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        },
                        grid: {
                            color: '#f3f4f6'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    async loadUserReportsByType() {
        try {
            const submissions = this.allSubmissions || [];
            this.createUserReportsByTypeChart(submissions);
        } catch (error) {
            console.error('Error loading user reports by type:', error);
        }
    }
    
    createUserReportsByTypeChart(submissions) {
        const ctx = document.getElementById('userReportsByTypeChart');
        if (!ctx) return;
        
        if (this.userReportsByTypeChart) {
            this.userReportsByTypeChart.destroy();
        }
        
        // Group submissions by report type
        const reportTypeCounts = {};
        submissions.forEach(s => {
            const reportType = (s.table_name || s.report_type || 'Unknown').trim();
            if (!reportTypeCounts[reportType]) {
                reportTypeCounts[reportType] = 0;
            }
            reportTypeCounts[reportType]++;
        });
        
        // Get top report types
        const sortedTypes = Object.entries(reportTypeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6); // Top 6
        
        const totalReportTypes = Object.keys(reportTypeCounts).length;
        
        // Update center text
        const centerText = document.getElementById('userReportTypeChartCenterText');
        if (centerText) {
            centerText.textContent = totalReportTypes;
        }
        
        // Create donut chart
        const labels = sortedTypes.map(([type]) => this.formatReportTypeName(type));
        const data = sortedTypes.map(([type, count]) => count);
        const backgroundColors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'
        ];
        
        this.userReportsByTypeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        borderRadius: 8
                    }
                }
            }
        });
        
        // Create legend
        const legendEl = document.getElementById('userReportTypeChartLegend');
        if (legendEl) {
            legendEl.innerHTML = sortedTypes.map(([type, count], index) => {
                const percentage = ((count / submissions.length) * 100).toFixed(1);
                return `
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${backgroundColors[index]}"></div>
                        <span class="legend-label">${this.formatReportTypeName(type)}</span>
                        <span class="legend-value">${count} (${percentage}%)</span>
                    </div>
                `;
            }).join('');
        }
    }
    
    async loadUserTopActiveReports() {
        try {
            const submissions = this.allSubmissions || [];
            this.populateUserTopActiveReports(submissions);
        } catch (error) {
            console.error('Error loading user top active reports:', error);
        }
    }
    
    populateUserTopActiveReports(submissions) {
        const tbody = document.querySelector('#userTopReportsTable tbody');
        if (!tbody) return;
        
        // Group by report type
        const reportTypeCounts = {};
        submissions.forEach(s => {
            const reportType = (s.table_name || s.report_type || 'Unknown').trim();
            if (!reportTypeCounts[reportType]) {
                reportTypeCounts[reportType] = 0;
            }
            reportTypeCounts[reportType]++;
        });
        
        // Get top 5 report types
        const sortedTypes = Object.entries(reportTypeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (sortedTypes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="2" style="text-align: center; padding: 40px; color: #9ca3af;">
                        No reports found
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = sortedTypes.map(([type, count]) => {
            return `
                <tr>
                    <td>
                        <div class="report-type-cell">
                            <i class="fas fa-file-alt report-type-icon"></i>
                            <span>${this.formatReportTypeName(type)}</span>
                        </div>
                    </td>
                    <td style="text-align: center; font-weight: 600; color: #1f2937;">${count}</td>
                </tr>
            `;
        }).join('');
    }
    
    formatReportTypeName(type) {
        if (!type) return 'Unknown';
        
        const formatted = type
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
        
        // Handle specific mappings
        const mappings = {
            'pwd': 'PWD',
            'pwddata': 'PWD Data',
            'employee': 'Employee',
            'employees': 'Employee',
            'graduatesdata': 'Graduates Data',
            'admissiondata': 'Admission Data',
            'enrollmentdata': 'Enrollment Data',
            'campuspopulation': 'Campus Population'
        };
        
        const lowerType = type.toLowerCase();
        if (mappings[lowerType]) {
            return mappings[lowerType];
        }
        
        // Split camelCase or lowercase words
        if (formatted === type && /[a-z][A-Z]/.test(type)) {
            return type.replace(/([a-z])([A-Z])/g, '$1 $2');
        }
        
        return formatted;
    }
    
    createSubmissionTrendChart() {
        const ctx = document.getElementById('submissionTrendChart');
        if (!ctx) return;
        
        // Get last 7 days of submissions
        const last7Days = [];
        const submissionCounts = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            last7Days.push(dateStr);
            
            // Count submissions for this day
            const count = (this.allSubmissions || []).filter(sub => {
                const subDate = new Date(sub.submission_date);
                return subDate.toDateString() === date.toDateString();
            }).length;
            submissionCounts.push(count);
        }
        
        this.submissionTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Submissions',
                    data: submissionCounts,
                    borderColor: '#dc143c',
                    backgroundColor: 'rgba(220, 20, 60, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#dc143c',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#dc143c',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#718096'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#718096'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    createReportTypesChart() {
        const ctx = document.getElementById('reportTypesChart');
        if (!ctx) return;
        
        // Count submissions by report type
        const reportTypeCounts = {};
        (this.allSubmissions || []).forEach(sub => {
            const type = this.formatReportName(sub.table_name);
            reportTypeCounts[type] = (reportTypeCounts[type] || 0) + 1;
        });
        
        const labels = Object.keys(reportTypeCounts);
        const data = Object.values(reportTypeCounts);
        const colors = [
            '#dc143c', '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0',
            '#9966ff', '#ff9f40', '#ff6384', '#c9cbcf', '#4bc0c0'
        ];
        
        this.reportTypesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            },
                            color: '#2d3748'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                }
            }
        });
    }
    
    createStatusChart() {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;
        
        // Count submissions by status
        const statusCounts = {
            pending: 0,
            approved: 0,
            rejected: 0
        };
        
        (this.allSubmissions || []).forEach(sub => {
            const status = (sub.status || 'pending').toLowerCase();
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            }
        });
        
        // Create the chart instance and assign it to this.statusChart
        this.statusChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Pending', 'Approved', 'Rejected'],
                datasets: [{
                    label: 'Submissions',
                    data: [statusCounts.pending, statusCounts.approved, statusCounts.rejected],
                    backgroundColor: [
                        'rgba(237, 137, 54, 0.8)',
                        'rgba(72, 187, 120, 0.8)',
                        'rgba(245, 101, 101, 0.8)'
                    ],
                    borderColor: [
                        '#ed8936',
                        '#48bb78',
                        '#f56565'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#718096'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#718096'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * Load Profile section
     */
    async loadProfile() {
        const container = document.getElementById('profileContainer');
        if (!container) {
            console.warn('Profile container not found');
            return;
        }
        
        // Get current user data
        let user = this.currentUser || {
            username: document.getElementById('userName')?.textContent || 'User',
            name: document.getElementById('userName')?.textContent || 'User',
            role: document.getElementById('userRole')?.textContent || 'User',
            campus: '',
            office: ''
        };
        
        // Try to fetch full user data if not already loaded
        if (!user.campus || !user.office) {
            try {
                // Use simple_auth.php which uses the same session system
                const response = await fetch('api/simple_auth.php?action=get_user_data', {
                    credentials: 'include' // Include cookies for session
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data && result.data.user) {
                        user = { ...user, ...result.data.user };
                        this.currentUser = user;
                    }
                }
            } catch (error) {
                console.log('Could not fetch full user data:', error);
                // Continue with available data
            }
        }
        
        // Get username, fallback to name if username not available
        const username = user.username || user.name || 'User';
        
        const profileHTML = `
            <div class="profile-container-new">
                <!-- Profile Header Card -->
                <div class="profile-header-card">
                    <div class="profile-avatar-section">
                        <div class="profile-avatar-new" id="profileAvatar">
                            <span class="avatar-initial-new" id="avatarInitial">${username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div class="profile-status-dot"></div>
                    </div>
                    <div class="profile-info-section">
                        <h1 class="profile-name-new" id="profileName">${user.name || username}</h1>
                        <p class="profile-username-new" id="profileEmailText">@${username}</p>
                        <div class="profile-role-badge-new" id="profileRoleBadge">
                            <i class="fas fa-user-shield"></i>
                            <span id="profileRoleText">${user.role || 'User'}</span>
                        </div>
                    </div>
                </div>

                <!-- Profile Details Cards -->
                <div class="profile-details-grid-new">
                    <!-- Work Information Card -->
                    <div class="profile-detail-card-new">
                        <div class="detail-card-header">
                            <div class="detail-card-icon work-icon">
                                <i class="fas fa-briefcase"></i>
                            </div>
                            <h3 class="detail-card-title">Work Information</h3>
                        </div>
                        <div class="detail-card-content">
                            <div class="detail-row-new">
                                <div class="detail-label-new">
                                    <i class="fas fa-building"></i>
                                    <span>Campus</span>
                                </div>
                                <div class="detail-value-new" id="profileCampus">
                                    <span class="value-badge campus-badge">${user.campus || 'Not assigned'}</span>
                                </div>
                            </div>
                            <div class="detail-row-new">
                                <div class="detail-label-new">
                                    <i class="fas fa-door-open"></i>
                                    <span>Office</span>
                                </div>
                                <div class="detail-value-new" id="profileOffice">
                                    <span class="value-badge office-badge">${user.office || 'Not assigned'}</span>
                                </div>
                            </div>
                            <div class="detail-row-new">
                                <div class="detail-label-new">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Status</span>
                                </div>
                                <div class="detail-value-new">
                                    <span class="value-badge status-badge-active" id="statusBadge">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Account Information Card -->
                    <div class="profile-detail-card-new">
                        <div class="detail-card-header">
                            <div class="detail-card-icon account-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <h3 class="detail-card-title">Account Information</h3>
                        </div>
                        <div class="detail-card-content">
                            <div class="detail-row-new">
                                <div class="detail-label-new">
                                    <i class="fas fa-sign-in-alt"></i>
                                    <span>Last Login</span>
                                </div>
                                <div class="detail-value-new" id="lastLogin">
                                    <span class="value-text">${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</span>
                                </div>
                            </div>
                            <div class="detail-row-new">
                                <div class="detail-label-new">
                                    <i class="fas fa-calendar-plus"></i>
                                    <span>Account Created</span>
                                </div>
                                <div class="detail-value-new" id="accountCreated">
                                    <span class="value-text">${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Button -->
                <div class="profile-actions-new">
                    <button class="btn-change-password" onclick="userDashboard.openChangePasswordModal()">
                        <i class="fas fa-key"></i>
                        <span>Change Password</span>
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = profileHTML;
    }

    /**
     * Open Change Password Modal
     */
    openChangePasswordModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('changePasswordModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="password-modal-overlay" id="changePasswordModal">
                <div class="password-modal-content">
                    <div class="password-modal-header">
                        <h2>
                            <i class="fas fa-key"></i>
                            Change Password
                        </h2>
                        <button class="password-modal-close" onclick="userDashboard.closeChangePasswordModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="password-modal-body">
                        <form id="changePasswordForm" onsubmit="userDashboard.handlePasswordChange(event)">
                            <div class="password-form-group">
                                <label for="currentPassword">
                                    <i class="fas fa-lock"></i>
                                    Current Password
                                </label>
                                <div class="password-input-wrapper">
                                    <input 
                                        type="password" 
                                        id="currentPassword" 
                                        name="currentPassword" 
                                        required 
                                        placeholder="Enter your current password"
                                        autocomplete="current-password"
                                    >
                                    <button 
                                        type="button" 
                                        class="password-toggle" 
                                        onclick="userDashboard.togglePasswordVisibility('currentPassword')"
                                    >
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="password-form-group">
                                <label for="newPassword">
                                    <i class="fas fa-key"></i>
                                    New Password
                                </label>
                                <div class="password-input-wrapper">
                                    <input 
                                        type="password" 
                                        id="newPassword" 
                                        name="newPassword" 
                                        required 
                                        placeholder="Enter your new password"
                                        autocomplete="new-password"
                                        minlength="8"
                                        oninput="userDashboard.validatePassword()"
                                    >
                                    <button 
                                        type="button" 
                                        class="password-toggle" 
                                        onclick="userDashboard.togglePasswordVisibility('newPassword')"
                                    >
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div id="passwordStrength" class="password-strength"></div>
                                <div id="passwordRequirements" class="password-requirements">
                                    <div class="requirement-item" id="req-length">
                                        <i class="fas fa-times"></i>
                                        <span>At least 8 characters</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="password-form-group">
                                <label for="confirmPassword">
                                    <i class="fas fa-check-double"></i>
                                    Confirm New Password
                                </label>
                                <div class="password-input-wrapper">
                                    <input 
                                        type="password" 
                                        id="confirmPassword" 
                                        name="confirmPassword" 
                                        required 
                                        placeholder="Confirm your new password"
                                        autocomplete="new-password"
                                        oninput="userDashboard.validatePassword()"
                                    >
                                    <button 
                                        type="button" 
                                        class="password-toggle" 
                                        onclick="userDashboard.togglePasswordVisibility('confirmPassword')"
                                    >
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div id="passwordMatch" class="password-match"></div>
                            </div>
                            
                            <div class="password-form-actions">
                                <button 
                                    type="button" 
                                    class="btn-action-modern btn-secondary-modern" 
                                    onclick="userDashboard.closeChangePasswordModal()"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    class="btn-action-modern btn-primary-modern" 
                                    id="submitPasswordBtn"
                                    disabled
                                >
                                    <span id="submitPasswordText">Change Password</span>
                                    <span id="submitPasswordSpinner" style="display: none;">
                                        <i class="fas fa-spinner fa-spin"></i> Changing...
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Append modal directly to body with highest priority
        document.body.appendChild(document.createRange().createContextualFragment(modalHTML));
        
        // Force modal to front - set inline styles for maximum priority
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 9999999 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            `;
            
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeChangePasswordModal();
                }
            });
        }
        
        // Close modal on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeChangePasswordModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('currentPassword')?.focus();
        }, 100);
    }

    /**
     * Close Change Password Modal
     */
    closeChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    /**
     * Toggle Password Visibility
     */
    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const button = input?.nextElementSibling;
        const icon = button?.querySelector('i');

        if (input && button && icon) {
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    }

    /**
     * Validate Password
     */
    validatePassword() {
        const newPassword = document.getElementById('newPassword')?.value || '';
        const confirmPassword = document.getElementById('confirmPassword')?.value || '';
        const submitBtn = document.getElementById('submitPasswordBtn');
        const passwordMatch = document.getElementById('passwordMatch');
        const passwordStrength = document.getElementById('passwordStrength');
        const reqLength = document.getElementById('req-length');

        let isValid = true;

        // Check password length
        const hasMinLength = newPassword.length >= 8;
        if (reqLength) {
            const icon = reqLength.querySelector('i');
            if (icon) {
                icon.className = hasMinLength ? 'fas fa-check' : 'fas fa-times';
                icon.style.color = hasMinLength ? '#10b981' : '#ef4444';
            }
        }

        // Check password match
        if (confirmPassword) {
            if (confirmPassword === newPassword) {
                passwordMatch.innerHTML = '<i class="fas fa-check"></i> Passwords match';
                passwordMatch.className = 'password-match success';
                isValid = isValid && hasMinLength;
            } else {
                passwordMatch.innerHTML = '<i class="fas fa-times"></i> Passwords do not match';
                passwordMatch.className = 'password-match error';
                isValid = false;
            }
        } else {
            passwordMatch.innerHTML = '';
            passwordMatch.className = 'password-match';
            isValid = false;
        }

        // Update submit button
        if (submitBtn) {
            submitBtn.disabled = !isValid || !newPassword || !hasMinLength;
        }

        // Update password strength indicator
        if (passwordStrength && newPassword) {
            let strength = 0;
            if (newPassword.length >= 8) strength++;
            if (newPassword.length >= 12) strength++;
            if (/[A-Z]/.test(newPassword)) strength++;
            if (/[0-9]/.test(newPassword)) strength++;
            if (/[^A-Za-z0-9]/.test(newPassword)) strength++;

            passwordStrength.className = 'password-strength';
            if (strength <= 2) {
                passwordStrength.innerHTML = '<div class="strength-bar weak"></div><span>Weak</span>';
            } else if (strength <= 3) {
                passwordStrength.innerHTML = '<div class="strength-bar medium"></div><span>Medium</span>';
            } else {
                passwordStrength.innerHTML = '<div class="strength-bar strong"></div><span>Strong</span>';
            }
        }
    }

    /**
     * Handle Password Change
     */
    async handlePasswordChange(event) {
        event.preventDefault();

        const currentPassword = document.getElementById('currentPassword')?.value || '';
        const newPassword = document.getElementById('newPassword')?.value || '';
        const confirmPassword = document.getElementById('confirmPassword')?.value || '';
        const submitBtn = document.getElementById('submitPasswordBtn');
        const submitText = document.getElementById('submitPasswordText');
        const submitSpinner = document.getElementById('submitPasswordSpinner');

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showNotification('Password must be at least 8 characters long', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (currentPassword === newPassword) {
            this.showNotification('New password must be different from current password', 'error');
            return;
        }

        // Disable submit button
        if (submitBtn) submitBtn.disabled = true;
        if (submitText) submitText.style.display = 'none';
        if (submitSpinner) submitSpinner.style.display = 'inline-block';

        try {
            const response = await fetch('api/change_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Password changed successfully!', 'success');
                this.closeChangePasswordModal();
                
                // Reset form
                const form = document.getElementById('changePasswordForm');
                if (form) form.reset();
            } else {
                this.showNotification(result.message || 'Failed to change password', 'error');
            }
        } catch (error) {
            console.error('Password change error:', error);
            this.showNotification('An error occurred. Please try again.', 'error');
        } finally {
            // Re-enable submit button
            if (submitBtn) submitBtn.disabled = false;
            if (submitText) submitText.style.display = 'inline-block';
            if (submitSpinner) submitSpinner.style.display = 'none';
        }
    }

    loadHelp() {
        const container = document.getElementById('helpContainer');
        if (!container) {
            console.warn('Help container not found');
            return;
        }
        
        const helpHTML = `
            <div class="help-grid">
                <!-- Quick Start Guide -->
                <div class="help-card">
                    <div class="help-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <h3>Quick Start Guide</h3>
                    <p>Learn the basics of using the system</p>
                    <ul class="help-list">
                        <li><i class="fas fa-check"></i> View assigned reports</li>
                        <li><i class="fas fa-check"></i> Submit data entries</li>
                        <li><i class="fas fa-check"></i> Track deadlines</li>
                        <li><i class="fas fa-check"></i> View submission history</li>
                    </ul>
                </div>

                <!-- FAQs -->
                <div class="help-card">
                    <div class="help-icon">
                        <i class="fas fa-question-circle"></i>
                    </div>
                    <h3>Frequently Asked Questions</h3>
                    <div class="faq-list">
                        <div class="faq-item">
                            <h4>How do I submit a report?</h4>
                            <p>Click on "Submit Report" button on any assigned report card, fill in the required data, and click submit.</p>
                        </div>
                        <div class="faq-item">
                            <h4>Can I edit submitted reports?</h4>
                            <p>Once submitted, reports cannot be edited. Please contact your administrator if changes are needed.</p>
                        </div>
                        <div class="faq-item">
                            <h4>What happens after I submit?</h4>
                            <p>Your submission will be reviewed by an administrator. You'll receive a notification once it's approved.</p>
                        </div>
                    </div>
                </div>

                <!-- Contact Support -->
                <div class="help-card">
                    <div class="help-icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <h3>Contact Support</h3>
                    <p>Need additional help? Reach out to our support team</p>
                    <div class="contact-info">
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <span>support@spartandata.com</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <span>+63 123 456 7890</span>
                        </div>
                    </div>
                </div>

                <!-- Video Tutorials -->
                <div class="help-card">
                    <div class="help-icon">
                        <i class="fas fa-video"></i>
                    </div>
                    <h3>Video Tutorials</h3>
                    <p>Watch step-by-step video guides</p>
                    <button class="help-btn">
                        <i class="fas fa-play-circle"></i>
                        <span>Watch Tutorials</span>
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = helpHTML;
    }

    // ========== NEW FEATURES ==========

    /**
     * Load My Tasks section
     */
    async loadMyTasks(filter = 'all') {
        const container = document.getElementById('myTasksContainer');
        if (!container) return;

        // Show loading state
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading tasks...</p>
            </div>
        `;

        try {
            const response = await fetch(`api/user_tasks_list_v2.php?filter=${filter}`);
            
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = 'login.html';
                    return;
                }
                throw new Error('Failed to load tasks');
            }
            
            const result = await response.json();
            
            if (result.success && result.tasks) {
                this.renderTasks(result.tasks, result.stats);
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-tasks"></i>
                        <h3>No Tasks Found</h3>
                        <p>You don't have any tasks assigned yet</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Tasks</h3>
                    <p>Unable to load tasks. Please try again later.</p>
                </div>
            `;
        }
    }

    /**
     * Render tasks in the grid
     */
    renderTasks(tasks, stats) {
        const container = document.getElementById('myTasksContainer');
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>All Caught Up!</h3>
                    <p>You have no pending tasks</p>
                </div>
            `;
            return;
        }

        const tasksHTML = tasks.map(task => {
            const isCompleted = task.status === 'completed';
            const isOverdue = task.status === 'overdue';
            const isDueSoon = task.status === 'due_soon';
            
            const priorityClass = task.priority ? `priority-${task.priority}` : '';
            const statusClass = isCompleted ? 'completed' : '';
            
            const icon = isCompleted ? 'check-circle' : 
                        isOverdue ? 'exclamation-triangle' : 
                        isDueSoon ? 'clock' : 'file-alt';
            
            const statusBadge = isCompleted ? 
                `<span class="task-status completed">Completed</span>` :
                `<span class="task-priority ${task.priority}">${task.priority ? task.priority.toUpperCase() : 'MEDIUM'} Priority</span>`;
            
            const daysText = task.days_remaining !== null ? 
                (task.days_remaining < 0 ? 
                    `<span style="color: var(--error);"><i class="fas fa-exclamation-circle"></i> ${Math.abs(task.days_remaining)} days overdue</span>` :
                    `<span><i class="fas fa-clock"></i> ${task.days_remaining} days left</span>`) :
                '<span><i class="fas fa-calendar"></i> No deadline</span>';
            
            // Format title properly using formatReportName
            const formattedTitle = this.formatReportName(task.table_name) || task.title || 'Unknown Task';
            
            return `
                <div class="task-card ${priorityClass} ${statusClass}">
                    <div class="task-header">
                        <h3><i class="fas fa-${icon}"></i> ${formattedTitle}</h3>
                        ${statusBadge}
                    </div>
                    <div class="task-body">
                        <p>${task.description}</p>
                        <div class="task-meta">
                            <span><i class="fas fa-calendar"></i> Due: ${task.deadline_formatted || 'No deadline'}</span>
                            ${daysText}
                        </div>
                    </div>
                    <div class="task-footer">
                        ${!isCompleted ? `
                            <button class="btn-primary" onclick="userDashboard.startTask('${task.table_name}', ${task.id})">
                                <i class="fas fa-play"></i> Start Task
                            </button>
                            <button class="btn-secondary" onclick="userDashboard.viewTaskDetails(${task.id})">
                                <i class="fas fa-info-circle"></i> Details
                            </button>
                        ` : `
                            <button class="btn-secondary" onclick="userDashboard.viewSubmission(${task.submission_id})">
                                <i class="fas fa-eye"></i> View Submission
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `<div class="tasks-grid">${tasksHTML}</div>`;

        // Update badge with pending count
        if (stats && stats.pending) {
            document.getElementById('tasksBadge').textContent = stats.pending;
        }
    }

    /**
     * Load Notifications
     */
    async loadNotifications() {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;

        // Show loading state
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading notifications...</p>
            </div>
        `;

        try {
            // Get base path dynamically
            const basePath = window.location.pathname.includes('/Rework/') ? '/Rework' : 
                            window.location.pathname.includes('/rework/') ? '/rework' : '';
            const apiUrl = basePath ? `${basePath}/api/user_notifications.php?action=get_notifications` : 
                           'api/user_notifications.php?action=get_notifications';
            
            console.log('Fetching notifications from:', apiUrl);
            
            // Try to fetch from API first
            const response = await fetch(apiUrl, {
                method: 'GET',
                credentials: 'include'
            });

            let notifications = [];

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const result = await response.json();
                        console.log('Notifications API response:', result);
                        
                        if (result.success && result.data && Array.isArray(result.data)) {
                            notifications = result.data;
                            console.log(`Loaded ${notifications.length} real notifications`);
                        } else {
                            console.warn('API returned no data or invalid format:', result);
                            // Don't use demo data - show empty state instead
                            notifications = [];
                        }
                    } catch (jsonError) {
                        console.error('Error parsing JSON response:', jsonError);
                        const errorText = await response.text();
                        console.error('Response text:', errorText.substring(0, 200));
                        notifications = [];
                    }
                } else {
                    console.error('API returned non-JSON response. Content-Type:', contentType);
                    const errorText = await response.text();
                    console.error('Response text:', errorText.substring(0, 200));
                    notifications = [];
                }
            } else {
                console.error('API error:', response.status, response.statusText);
                try {
                    const errorText = await response.text();
                    console.error('Error response:', errorText.substring(0, 200));
                } catch (e) {
                    console.error('Could not read error response');
                }
                // Don't use demo data - show empty state instead
                notifications = [];
            }

            this.renderNotifications(notifications);
        } catch (error) {
            console.error('Error loading notifications:', error);
            // Show empty state on error instead of demo data
            this.renderNotifications([]);
        }
    }

    /**
     * Get demo notifications (fallback)
     */
    getDemoNotifications() {
        return [
            {
                id: 1,
                type: 'success',
                title: 'Report Approved',
                message: 'Your Graduates Data report has been approved by the admin.',
                time: '2 hours ago',
                read: false,
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                type: 'warning',
                title: 'Deadline Approaching',
                message: 'Campus Population Report is due in 6 days.',
                time: '5 hours ago',
                read: false,
                created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                type: 'info',
                title: 'New Task Assigned',
                message: 'Enrollment Data report has been assigned to you.',
                time: '1 day ago',
                read: true,
                created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 4,
                type: 'error',
                title: 'Submission Rejected',
                message: 'Employee Data report needs corrections. Please review the feedback.',
                time: '2 days ago',
                read: true,
                created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 5,
                type: 'info',
                title: 'Report Submitted',
                message: 'Your Distance Traveled report has been successfully submitted and is pending review.',
                time: '3 days ago',
                read: true,
                created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    /**
     * Render notifications
     */
    renderNotifications(notifications) {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;

        // Store notifications in instance for later use
        this.notifications = notifications;

        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                    <h3>No Notifications</h3>
                    <p>You're all caught up! No new notifications at this time.</p>
                </div>
            `;
            
            // Update badge
            const notifBadge = document.getElementById('notifBadge');
            const notificationDot = document.getElementById('notificationDot');
            if (notifBadge) {
                notifBadge.textContent = '0';
            }
            if (notificationDot) {
                notificationDot.style.display = 'none';
            }
            return;
        }

        const notifHTML = `
            <div class="notifications-header-actions">
                <div class="notification-filters">
                    <button class="filter-btn active" data-filter="all" onclick="userDashboard.filterNotifications('all')">
                        All
                    </button>
                    <button class="filter-btn" data-filter="unread" onclick="userDashboard.filterNotifications('unread')">
                        Unread
                    </button>
                    <button class="filter-btn" data-filter="read" onclick="userDashboard.filterNotifications('read')">
                        Read
                    </button>
                </div>
                <button class="btn-icon" onclick="userDashboard.refreshNotifications()" title="Refresh">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
            <div class="notifications-list" id="notificationsList">
                ${notifications.map(notif => `
                    <div class="notification-item ${notif.read ? 'read' : 'unread'} ${notif.type}" 
                         data-notification-id="${notif.id}" 
                         onclick="userDashboard.markNotificationRead(${notif.id})">
                        <div class="notification-icon ${notif.type}">
                            <i class="fas fa-${notif.type === 'success' ? 'check-circle' : notif.type === 'warning' ? 'exclamation-triangle' : notif.type === 'error' ? 'times-circle' : 'info-circle'}"></i>
                        </div>
                        <div class="notification-content">
                            <h4>${notif.title}</h4>
                            <p>${notif.message}</p>
                            <span class="notification-time">${notif.time}</span>
                        </div>
                        ${!notif.read ? '<div class="unread-indicator"></div>' : ''}
                        <button class="notification-close" onclick="event.stopPropagation(); userDashboard.dismissNotification(${notif.id})" title="Dismiss">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = notifHTML;

        // Update badge
        const unreadCount = notifications.filter(n => !n.read).length;
        const notifBadge = document.getElementById('notifBadge');
        const notificationDot = document.getElementById('notificationDot');
        
        if (notifBadge) {
            notifBadge.textContent = unreadCount;
        }
        if (notificationDot) {
            notificationDot.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    /**
     * Filter notifications
     */
    filterNotifications(filter) {
        if (!this.notifications) return;

        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        // Filter notifications
        let filteredNotifications = this.notifications;
        if (filter === 'unread') {
            filteredNotifications = this.notifications.filter(n => !n.read);
        } else if (filter === 'read') {
            filteredNotifications = this.notifications.filter(n => n.read);
        }

        // Re-render filtered list
        const list = document.getElementById('notificationsList');
        if (list) {
            if (filteredNotifications.length === 0) {
                list.innerHTML = `
                    <div class="empty-state" style="padding: 40px; text-align: center;">
                        <i class="fas fa-inbox" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                        <p>No ${filter === 'all' ? '' : filter} notifications found.</p>
                    </div>
                `;
            } else {
                list.innerHTML = filteredNotifications.map(notif => `
                    <div class="notification-item ${notif.read ? 'read' : 'unread'} ${notif.type}" 
                         data-notification-id="${notif.id}" 
                         onclick="userDashboard.markNotificationRead(${notif.id})">
                        <div class="notification-icon ${notif.type}">
                            <i class="fas fa-${notif.type === 'success' ? 'check-circle' : notif.type === 'warning' ? 'exclamation-triangle' : notif.type === 'error' ? 'times-circle' : 'info-circle'}"></i>
                        </div>
                        <div class="notification-content">
                            <h4>${notif.title}</h4>
                            <p>${notif.message}</p>
                            <span class="notification-time">${notif.time}</span>
                        </div>
                        ${!notif.read ? '<div class="unread-indicator"></div>' : ''}
                        <button class="notification-close" onclick="event.stopPropagation(); userDashboard.dismissNotification(${notif.id})" title="Dismiss">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
            }
        }
    }

    /**
     * Refresh notifications
     */
    async refreshNotifications() {
        this.showNotification('Refreshing notifications...', 'info');
        await this.loadNotifications();
        this.showNotification('Notifications updated', 'success');
    }

    /**
     * Update notification badge count without loading full list
     */
    async updateNotificationBadge() {
        try {
            // Get base path dynamically (same as loadNotifications)
            const basePath = window.location.pathname.includes('/Rework/') ? '/Rework' : 
                            window.location.pathname.includes('/rework/') ? '/rework' : '';
            const apiUrl = basePath ? `${basePath}/api/user_notifications.php?action=get_notifications` : 
                           'api/user_notifications.php?action=get_notifications';
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const result = await response.json();
                        if (result.success && result.data) {
                            const unreadCount = result.data.filter(n => !n.read).length;
                            const notifBadge = document.getElementById('notifBadge');
                            const notificationDot = document.getElementById('notificationDot');
                            
                            if (notifBadge) {
                                notifBadge.textContent = unreadCount;
                            }
                            if (notificationDot) {
                                notificationDot.style.display = unreadCount > 0 ? 'block' : 'none';
                            }
                        }
                    } catch (jsonError) {
                        console.error('Error parsing JSON in updateNotificationBadge:', jsonError);
                        // Silently fail - badge will remain unchanged
                    }
                } else {
                    console.warn('updateNotificationBadge: Non-JSON response received');
                }
            }
        } catch (error) {
            console.error('Error updating notification badge:', error);
            // On error, just hide the badge indicators
            const notifBadge = document.getElementById('notifBadge');
            const notificationDot = document.getElementById('notificationDot');
            if (notifBadge) notifBadge.textContent = '0';
            if (notificationDot) notificationDot.style.display = 'none';
        }
    }

    /**
     * Mark notification as read
     */
    async markNotificationRead(id) {
        const notificationItem = document.querySelector(`[data-notification-id="${id}"]`);
        if (!notificationItem) return;

        // Check if already read
        if (notificationItem.classList.contains('read')) {
            return; // Already read, don't do anything
        }

        // Mark as read visually
        notificationItem.classList.remove('unread');
        notificationItem.classList.add('read');
        const unreadIndicator = notificationItem.querySelector('.unread-indicator');
        if (unreadIndicator) {
            unreadIndicator.remove();
        }

        // Update notification in array
        if (this.notifications) {
            const notif = this.notifications.find(n => n.id === id);
            if (notif) {
                notif.read = true;
            }
        }

        // Update badge
        const unreadCount = this.notifications ? this.notifications.filter(n => !n.read).length : 0;
        const notifBadge = document.getElementById('notifBadge');
        const notificationDot = document.getElementById('notificationDot');
        
        if (notifBadge) {
            notifBadge.textContent = unreadCount;
        }
        if (notificationDot) {
            notificationDot.style.display = unreadCount > 0 ? 'block' : 'none';
        }

        // Try to update on server
        try {
            await fetch(`api/user_notifications.php?action=mark_read&id=${id}`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    /**
     * Load Calendar with real data
     */
    async loadCalendar() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;

        // Show loading state
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading calendar...</p>
            </div>
        `;

        try {
            // Load calendar events (deadlines, tasks)
            await this.loadCalendarEvents();
            this.renderCalendar();
        } catch (error) {
            console.error('Error loading calendar:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading calendar. Please refresh.</p>
                </div>
            `;
        }
    }

    /**
     * Load calendar events from API
     */
    async loadCalendarEvents() {
        try {
            const response = await fetch('api/user_calendar.php?action=get_events', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Calendar API response:', result);
                if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
                    this.calendarEvents = result.data;
                    console.log('Loaded calendar events:', this.calendarEvents.length);
                } else {
                    console.log('Calendar API returned empty data, trying tasks API fallback');
                    // Fallback: load from tasks API
                    await this.loadEventsFromTasks();
                }
            } else {
                console.log('Calendar API error, trying tasks API fallback');
                // Fallback: load from tasks API
                await this.loadEventsFromTasks();
            }
        } catch (error) {
            console.error('Error loading calendar events:', error);
            // Fallback: load from tasks API
            await this.loadEventsFromTasks();
        }
    }

    /**
     * Load events from tasks API as fallback
     */
    async loadEventsFromTasks() {
        try {
            const response = await fetch('api/user_tasks_list_v2.php', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Tasks API response:', result);
                if (result.success && result.tasks && Array.isArray(result.tasks)) {
                    // Convert tasks to calendar events
                    this.calendarEvents = result.tasks
                        .filter(task => task.deadline && task.status !== 'completed')
                        .map(task => {
                            const eventType = this.getEventType(task);
                            return {
                                id: task.id,
                                title: task.title || this.formatReportName(task.table_name),
                                date: task.deadline,
                                type: eventType,
                                priority: task.priority || 'medium',
                                table_name: task.table_name
                            };
                        });
                    console.log('Converted tasks to calendar events:', this.calendarEvents.length);
                } else {
                    this.calendarEvents = [];
                }
            } else {
                console.error('Tasks API error:', response.status);
                this.calendarEvents = [];
            }
        } catch (error) {
            console.error('Error loading events from tasks:', error);
            this.calendarEvents = [];
        }
    }

    /**
     * Get event type based on task status
     */
    getEventType(task) {
        if (!task.deadline) return 'upcoming';
        
        const deadline = new Date(task.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadline.setHours(0, 0, 0, 0);
        
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (task.status === 'completed' || task.submission_id) {
            return 'completed';
        } else if (diffDays < 0) {
            return 'overdue';
        } else if (diffDays <= 7) {
            return 'due-soon';
        } else {
            return 'upcoming';
        }
    }

    /**
     * Render calendar with events
     */
    renderCalendar() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;

        const currentMonth = new Date(this.currentCalendarYear, this.currentCalendarMonth, 1);
        const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
        const today = new Date();

        container.innerHTML = `
            <div class="calendar-wrapper">
                <div class="calendar-header">
                    <button class="btn-icon" onclick="userDashboard.previousMonth()" title="Previous month">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3>${monthName}</h3>
                    <button class="btn-icon" onclick="userDashboard.nextMonth()" title="Next month">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <button class="btn-icon" onclick="userDashboard.todayMonth()" title="Today">
                        <i class="fas fa-calendar-day"></i>
                    </button>
                </div>
                
                <div class="calendar-grid">
                    <div class="calendar-day-header">Sun</div>
                    <div class="calendar-day-header">Mon</div>
                    <div class="calendar-day-header">Tue</div>
                    <div class="calendar-day-header">Wed</div>
                    <div class="calendar-day-header">Thu</div>
                    <div class="calendar-day-header">Fri</div>
                    <div class="calendar-day-header">Sat</div>
                    
                    ${this.generateCalendarDays()}
                </div>

                <div class="calendar-legend">
                    <div class="legend-item">
                        <span class="legend-color overdue"></span>
                        <span>Overdue</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color due-soon"></span>
                        <span>Due Soon</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color completed"></span>
                        <span>Completed</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color upcoming"></span>
                        <span>Upcoming</span>
                    </div>
                </div>

                ${this.renderUpcomingDeadlines()}
            </div>
        `;
    }

    /**
     * Generate calendar days with events
     */
    generateCalendarDays() {
        const firstDay = new Date(this.currentCalendarYear, this.currentCalendarMonth, 1);
        const lastDay = new Date(this.currentCalendarYear, this.currentCalendarMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        const today = new Date();

        let daysHTML = '';

        // Empty cells before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            daysHTML += '<div class="calendar-day empty"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(this.currentCalendarYear, this.currentCalendarMonth, day);
            const isToday = currentDate.toDateString() === today.toDateString();
            
            // Find events for this day
            const dayEvents = this.getEventsForDay(currentDate);
            const hasEvent = dayEvents.length > 0;
            const eventTypes = dayEvents.map(e => e.type);
            const hasOverdue = eventTypes.includes('overdue');
            const hasDueSoon = eventTypes.includes('due-soon');
            
            let eventClass = '';
            if (hasOverdue) {
                eventClass = 'has-event overdue-event';
            } else if (hasDueSoon) {
                eventClass = 'has-event due-soon-event';
            } else if (hasEvent) {
                eventClass = 'has-event upcoming-event';
            }
            
            daysHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${eventClass}" 
                     onclick="userDashboard.showDayDetails(${day}, ${this.currentCalendarMonth}, ${this.currentCalendarYear})"
                     title="${hasEvent ? `${dayEvents.length} event(s)` : ''}">
                    <span class="day-number">${day}</span>
                    ${hasEvent ? `<div class="event-indicator" data-count="${dayEvents.length}"></div>` : ''}
                </div>
            `;
        }

        return daysHTML;
    }

    /**
     * Get events for a specific day
     */
    getEventsForDay(date) {
        if (!this.calendarEvents || this.calendarEvents.length === 0) return [];
        
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const dateStr = targetDate.toISOString().split('T')[0];
        
        return this.calendarEvents.filter(event => {
            if (!event.date) return false;
            try {
                const eventDate = new Date(event.date);
                eventDate.setHours(0, 0, 0, 0);
                const eventDateStr = eventDate.toISOString().split('T')[0];
                return eventDateStr === dateStr;
            } catch (e) {
                console.error('Error parsing event date:', event.date, e);
                return false;
            }
        });
    }

    /**
     * Render upcoming deadlines list
     */
    renderUpcomingDeadlines() {
        console.log('Rendering upcoming deadlines. Total events:', this.calendarEvents?.length || 0);
        
        if (!this.calendarEvents || this.calendarEvents.length === 0) {
            return `
                <div class="upcoming-deadlines">
                    <h4><i class="fas fa-clock"></i> Upcoming Deadlines</h4>
                    <div class="deadline-list">
                        <div class="empty-state" style="padding: 20px; text-align: center; color: #999;">
                            <i class="fas fa-calendar-check"></i>
                            <p>No upcoming deadlines</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // Filter and sort events by date - exclude completed events
        const sortedEvents = [...this.calendarEvents]
            .filter(event => {
                // Must have a date and not be completed
                if (!event.date) {
                    console.log('Event missing date:', event);
                    return false;
                }
                if (event.type === 'completed') {
                    return false;
                }
                // Also check if status is completed (for tasks API)
                if (event.status === 'completed') {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            })
            .slice(0, 10);
        
        console.log('Filtered upcoming events:', sortedEvents.length);

        if (sortedEvents.length === 0) {
            return `
                <div class="upcoming-deadlines">
                    <h4><i class="fas fa-clock"></i> Upcoming Deadlines</h4>
                    <div class="deadline-list">
                        <div class="empty-state" style="padding: 20px; text-align: center; color: #999;">
                            <i class="fas fa-calendar-check"></i>
                            <p>No upcoming deadlines</p>
                        </div>
                    </div>
                </div>
            `;
        }

        const deadlineItems = sortedEvents.map(event => {
            const deadlineDate = new Date(event.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            deadlineDate.setHours(0, 0, 0, 0);
            
            const diffTime = deadlineDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let badgeClass = 'upcoming';
            let badgeText = '';
            
            if (diffDays < 0) {
                badgeClass = 'overdue';
                badgeText = `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
            } else if (diffDays === 0) {
                badgeClass = 'due-soon';
                badgeText = 'Today';
            } else if (diffDays <= 7) {
                badgeClass = 'due-soon';
                badgeText = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
            } else {
                badgeClass = 'upcoming';
                badgeText = `${diffDays} days`;
            }
            
            const dateStr = deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return `
                <div class="deadline-item" onclick="userDashboard.viewTask('${event.table_name}')">
                    <span class="deadline-date">${dateStr}</span>
                    <span class="deadline-title">${event.title}</span>
                    <span class="deadline-badge ${badgeClass}">${badgeText}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="upcoming-deadlines">
                <h4><i class="fas fa-clock"></i> Upcoming Deadlines</h4>
                <div class="deadline-list">
                    ${deadlineItems}
                </div>
            </div>
        `;
    }

    /**
     * Export data functionality
     */
    exportData() {
        const options = `
            <div class="export-modal">
                <h3><i class="fas fa-download"></i> Export Data</h3>
                <p>Choose export format:</p>
                <div class="export-options">
                    <button class="export-btn" onclick="userDashboard.downloadCSV()">
                        <i class="fas fa-file-csv"></i>
                        <span>CSV</span>
                    </button>
                    <button class="export-btn" onclick="userDashboard.downloadExcel()">
                        <i class="fas fa-file-excel"></i>
                        <span>Excel</span>
                    </button>
                    <button class="export-btn" onclick="userDashboard.downloadPDF()">
                        <i class="fas fa-file-pdf"></i>
                        <span>PDF</span>
                    </button>
                </div>
            </div>
        `;
        
        this.showModal('Export Data', options);
    }

    downloadCSV() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `submissions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        this.showNotification('CSV file downloaded successfully!', 'success');
    }

    generateCSV() {
        const headers = ['ID', 'Report Name', 'Status', 'Submitted Date'];
        const rows = this.submissions.map(sub => [
            sub.id,
            sub.table_name,
            sub.status,
            sub.submitted_at
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    /**
     * Refresh dashboard
     */
    async refreshDashboard() {
        const refreshBtn = event.target.closest('button');
        const icon = refreshBtn.querySelector('i');
        
        icon.classList.add('fa-spin');
        refreshBtn.disabled = true;

        try {
            await this.loadDashboardData();
            await this.loadSubmissions();
            this.showNotification('Dashboard refreshed successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to refresh dashboard', 'error');
        } finally {
            icon.classList.remove('fa-spin');
            refreshBtn.disabled = false;
        }
    }

    /**
     * Toggle notifications panel
     */

    /**
     * Filter tasks
     */
    filterTasks(filter) {
        console.log('Filtering tasks by:', filter);
        this.loadMyTasks(filter);
        this.showNotification(`Showing ${filter} tasks`, 'info');
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
        if (!this.notifications || this.notifications.length === 0) {
            this.showNotification('No notifications to mark as read', 'info');
            return;
        }

        // Mark all as read visually
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
            item.classList.add('read');
            const unreadIndicator = item.querySelector('.unread-indicator');
            if (unreadIndicator) {
                unreadIndicator.remove();
            }
        });

        // Update notifications array
        this.notifications.forEach(notif => {
            notif.read = true;
        });

        // Update badge
        document.getElementById('notifBadge').textContent = '0';
        const notificationDot = document.getElementById('notificationDot');
        if (notificationDot) {
            notificationDot.style.display = 'none';
        }

        // Try to update on server
        try {
            await fetch('api/user_notifications.php?action=mark_all_read', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }

        this.showNotification('All notifications marked as read', 'success');
    }

    /**
     * Dismiss notification
     */
    async dismissNotification(id) {
        const notif = event.target.closest('.notification-item');
        if (!notif) return;

        // Animate removal
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(async () => {
            notif.remove();

            // Remove from array
            if (this.notifications) {
                this.notifications = this.notifications.filter(n => n.id !== id);
            }

            // Update badge
            const unreadCount = this.notifications ? this.notifications.filter(n => !n.read).length : 0;
            const notifBadge = document.getElementById('notifBadge');
            const notificationDot = document.getElementById('notificationDot');
            
            if (notifBadge) {
                notifBadge.textContent = unreadCount;
            }
            if (notificationDot) {
                notificationDot.style.display = unreadCount > 0 ? 'block' : 'none';
            }

            // Show empty state if no notifications left
            const list = document.getElementById('notificationsList');
            if (list && list.children.length === 0) {
                const container = document.getElementById('notificationsContainer');
                if (container) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-bell-slash" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                            <h3>No Notifications</h3>
                            <p>You're all caught up! No new notifications at this time.</p>
                        </div>
                    `;
                }
            }

            // Try to delete on server
            try {
                await fetch(`api/user_notifications.php?action=delete&id=${id}`, {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (error) {
                console.error('Error deleting notification:', error);
            }
        }, 300);
    }

    /**
     * Start task - Opens report modal
     */
    startTask(tableName, taskId) {
        console.log('Starting task:', tableName, taskId);
        this.showNotification('Opening report form...', 'info');
        
        // Ensure consistent table name (convert to lowercase)
        const normalizedTableName = tableName.toLowerCase();
        console.log('Normalized table name:', normalizedTableName);
        
        // Open the modal with the report form
        this.openReportModal(normalizedTableName, taskId);
    }

    /**
     * Open report submission modal
     */
    openReportModal(tableName, taskId) {
        console.log('Opening report modal for table:', tableName);
        const modal = document.getElementById('reportModal');
        const modalBody = document.getElementById('reportModalBody');
        
        if (!modal || !modalBody) {
            console.error('Required modal elements not found');
            return;
        }
        
        // Modal now shows "Spartan Data" with logo instead of "Submit Report: [Table Name]"
        // No need to update title anymore
        
        // Show loading state
        modalBody.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 300px;">
                <div style="text-align: center;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                    <p>Loading report form...</p>
                </div>
            </div>
        `;
        
        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Load report form via iframe after a short delay to allow modal to render
        setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const campus = urlParams.get('campus');
            const office = urlParams.get('office');
            
            let iframeUrl = `report.html?table=${encodeURIComponent(tableName)}`;
            if (campus) iframeUrl += `&campus=${encodeURIComponent(campus)}`;
            if (office) iframeUrl += `&office=${encodeURIComponent(office)}`;
            if (taskId) iframeUrl += `&task_id=${encodeURIComponent(taskId)}`;
            
            console.log('Loading iframe with URL:', iframeUrl);
            
            const iframe = document.createElement('iframe');
            iframe.src = iframeUrl;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.minHeight = '600px';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';
            iframe.onload = function() {
                console.log('Iframe loaded successfully');
            };
            iframe.onerror = function() {
                console.error('Error loading iframe');
                modalBody.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-exclamation-triangle" style="color: #e53e3e; font-size: 48px; margin-bottom: 20px;"></i>
                        <h3>Error Loading Report</h3>
                        <p>Could not load the report form. Please try again.</p>
                        <button onclick="userDashboard.openReportModal('${tableName}', ${taskId || 'null'})" class="btn-primary" style="margin-top: 20px;">
                            <i class="fas fa-sync-alt"></i> Retry
                        </button>
                    </div>
                `;
            };
            
            // Clear previous content and append new iframe
            modalBody.innerHTML = '';
            modalBody.appendChild(iframe);
        }, 100);
    }

    /**
     * Close report modal
     */
    closeReportModal() {
        const modal = document.getElementById('reportModal');
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
        
        // Reload tasks to reflect any changes
        this.loadMyTasks();
    }

    /**
     * Minimize modal (placeholder for future feature)
     */
    minimizeModal() {
        this.showNotification('Minimize feature coming soon!', 'info');
    }

    /**
     * View task details - show admin notes
     */
    async viewTaskDetails(taskId) {
        try {
            console.log('Fetching task details for ID:', taskId);
            
            const response = await fetch(`api/user_tasks_list.php?action=details&task_id=${taskId}`, {
                credentials: 'include'
            });
            
            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                const text = await response.text();
                console.error('Response text:', text);
                throw new Error(`Server returned invalid JSON. Status: ${response.status}`);
            }
            
            if (!response.ok) {
                const errorMsg = result?.message || `HTTP ${response.status}: ${response.statusText}`;
                console.error('API Error:', result);
                throw new Error(errorMsg);
            }
            
            if (!result.success) {
                const errorMsg = result?.message || 'Failed to fetch task details';
                console.error('API returned error:', result);
                throw new Error(errorMsg);
            }
            
            const task = result.task;
            const notes = task.notes || task.description || null;
            const taskName = this.formatReportName(task.table_name) || task.table_name || 'Task';
            
            // Create and show modal
            this.showTaskNotesModal(taskName, notes);
            
        } catch (error) {
            console.error('Error fetching task details:', error);
            const errorMessage = error.message || 'Failed to load task details';
            this.showNotification(errorMessage, 'error');
        }
    }
    
    /**
     * Show task notes modal
     */
    showTaskNotesModal(taskName, notes) {
        // Remove existing modal if any
        const existingModal = document.getElementById('taskNotesModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modalHTML = `
            <div class="custom-modal-overlay show" id="taskNotesModal" style="z-index: 10000;">
                <div class="custom-modal-content" style="max-width: 600px; position: relative;">
                    <div class="custom-modal-header">
                        <h3><i class="fas fa-sticky-note"></i> Task Notes - ${taskName}</h3>
                        <button class="modal-close-btn" onclick="document.getElementById('taskNotesModal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="custom-modal-body" style="padding: 24px;">
                        ${notes && notes.trim() ? `
                            <div class="task-notes-content" style="background: #f8f9fa; border-radius: 12px; padding: 20px; border-left: 4px solid #dc143c;">
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                                    <i class="fas fa-info-circle" style="color: #dc143c; font-size: 18px;"></i>
                                    <h4 style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">Admin Notes</h4>
                                </div>
                                <p style="margin: 0; color: #495057; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${notes}</p>
                            </div>
                        ` : `
                            <div class="task-notes-empty" style="text-align: center; padding: 40px;">
                                <i class="fas fa-sticky-note" style="font-size: 48px; color: #cbd5e0; margin-bottom: 16px; display: block;"></i>
                                <p style="color: #6c757d; font-size: 16px; font-weight: 500; margin: 0;">No Notes</p>
                                <p style="color: #9ca3af; font-size: 14px; margin: 8px 0 0 0;">The admin has not added any notes for this task.</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        // Insert modal into body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Close modal on overlay click
        const modal = document.getElementById('taskNotesModal');
        const overlay = modal.querySelector('.custom-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    modal.remove();
                }
            });
        }
        
        // Close modal on ESC key
        const closeModal = () => {
            modal.remove();
            document.removeEventListener('keydown', handleEsc);
        };
        
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        
        document.addEventListener('keydown', handleEsc);
    }


    /**
     * Calendar navigation
     */
    previousMonth() {
        this.currentCalendarMonth--;
        if (this.currentCalendarMonth < 0) {
            this.currentCalendarMonth = 11;
            this.currentCalendarYear--;
        }
        this.renderCalendar();
    }

    nextMonth() {
        this.currentCalendarMonth++;
        if (this.currentCalendarMonth > 11) {
            this.currentCalendarMonth = 0;
            this.currentCalendarYear++;
        }
        this.renderCalendar();
    }

    todayMonth() {
        const today = new Date();
        this.currentCalendarMonth = today.getMonth();
        this.currentCalendarYear = today.getFullYear();
        this.renderCalendar();
    }

    /**
     * Show day details modal
     */
    async showDayDetails(day, month, year) {
        const date = new Date(year, month, day);
        const events = this.getEventsForDay(date);
        
        if (events.length === 0) {
            this.showNotification(`No events on ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 'info');
            return;
        }

        const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        
        const eventsHTML = events.map(event => {
            const deadlineDate = new Date(event.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            deadlineDate.setHours(0, 0, 0, 0);
            
            const diffTime = deadlineDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let statusBadge = '';
            if (event.type === 'completed') {
                statusBadge = '<span class="badge badge-success">Completed</span>';
            } else if (event.type === 'overdue') {
                statusBadge = `<span class="badge badge-danger">${Math.abs(diffDays)} days overdue</span>`;
            } else if (event.type === 'due-soon') {
                statusBadge = `<span class="badge badge-warning">Due in ${diffDays} days</span>`;
            } else {
                statusBadge = `<span class="badge badge-info">Due in ${diffDays} days</span>`;
            }
            
            const priorityBadge = event.priority ? 
                `<span class="badge priority-${event.priority}">${event.priority}</span>` : '';
            
            return `
                <div class="day-event-item" onclick="userDashboard.viewTask('${event.table_name}')">
                    <div class="event-title">
                        <i class="fas fa-tasks"></i>
                        ${event.title}
                    </div>
                    <div class="event-meta">
                        ${statusBadge}
                        ${priorityBadge}
                    </div>
                    <div class="event-date">
                        <i class="fas fa-calendar"></i>
                        ${deadlineDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            `;
        }).join('');

        const modalContent = `
            <div class="day-details-modal">
                <h3><i class="fas fa-calendar-day"></i> ${dateStr}</h3>
                <div class="events-list">
                    ${eventsHTML}
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;

        this.showModal(`Events for ${dateStr}`, modalContent);
    }

    /**
     * View task from calendar
     */
    viewTask(tableName) {
        // Close modal if open
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
        
        // Navigate to tasks section and highlight the task
        this.showSection('my-tasks');
        this.showNotification(`Viewing task: ${this.formatReportName(tableName)}`, 'info');
        
        // Scroll to the task if possible
        setTimeout(() => {
            const taskCards = document.querySelectorAll('.task-card');
            taskCards.forEach(card => {
                const title = card.querySelector('.task-title');
                if (title && title.textContent.includes(this.formatReportName(tableName))) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.style.border = '2px solid #dc143c';
                    setTimeout(() => {
                        card.style.border = '';
                    }, 2000);
                }
            });
        }, 500);
    }

    /**
     * Show modal
     */
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Show modern alert dialog
     */
    showAlert(message, title = 'Notice', type = 'info') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'custom-modal-overlay';
            
            const iconMap = {
                'success': 'check-circle',
                'error': 'exclamation-circle',
                'warning': 'exclamation-triangle',
                'info': 'info-circle'
            };
            
            const colorMap = {
                'success': 'var(--success)',
                'error': 'var(--error)',
                'warning': 'var(--warning)',
                'info': 'var(--info)'
            };
            
            modal.innerHTML = `
                <div class="custom-modal-content custom-modal-alert">
                    <div class="custom-modal-icon" style="color: ${colorMap[type]}">
                        <i class="fas fa-${iconMap[type]}"></i>
                    </div>
                    <div class="custom-modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="custom-modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="custom-modal-footer">
                        <button class="custom-modal-btn custom-modal-btn-primary" onclick="this.closest('.custom-modal-overlay').remove()">
                            <i class="fas fa-check"></i> OK
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add click event to resolve promise
            modal.querySelector('.custom-modal-btn').addEventListener('click', () => {
                resolve(true);
            });
            
            // Animate in
            setTimeout(() => modal.classList.add('show'), 10);
        });
    }

    /**
     * Show modern confirm dialog
     */
    showConfirm(message, title = 'Confirm', options = {}) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'custom-modal-overlay';
            
            const confirmText = options.confirmText || 'Confirm';
            const cancelText = options.cancelText || 'Cancel';
            const type = options.type || 'warning';
            
            const iconMap = {
                'success': 'check-circle',
                'error': 'exclamation-circle',
                'warning': 'exclamation-triangle',
                'info': 'question-circle'
            };
            
            const colorMap = {
                'success': 'var(--success)',
                'error': 'var(--error)',
                'warning': 'var(--warning)',
                'info': 'var(--info)'
            };
            
            modal.innerHTML = `
                <div class="custom-modal-content custom-modal-confirm">
                    <div class="custom-modal-icon" style="color: ${colorMap[type]}">
                        <i class="fas fa-${iconMap[type]}"></i>
                    </div>
                    <div class="custom-modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="custom-modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="custom-modal-footer">
                        <button class="custom-modal-btn custom-modal-btn-secondary" data-action="cancel">
                            <i class="fas fa-times"></i> ${cancelText}
                        </button>
                        <button class="custom-modal-btn custom-modal-btn-primary" data-action="confirm">
                            <i class="fas fa-check"></i> ${confirmText}
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add click events
            modal.querySelectorAll('.custom-modal-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.currentTarget.dataset.action;
                    modal.classList.remove('show');
                    setTimeout(() => modal.remove(), 300);
                    resolve(action === 'confirm');
                });
            });
            
            // Animate in
            setTimeout(() => modal.classList.add('show'), 10);
        });
    }

    /**
     * Show notification toast
     */
    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Update section titles
     */
    showSection(sectionId) {
        // Update page title
        const titles = {
            'dashboard': { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your overview' },
            'my-tasks': { title: 'My Tasks', subtitle: 'Manage your assigned tasks and deadlines' },
            'submissions': { title: 'Submissions History', subtitle: 'View all your submitted reports' },
            'notifications': { title: 'Notifications', subtitle: 'Stay updated with important alerts' },
            'calendar': { title: 'Calendar', subtitle: 'Track deadlines and important dates' },
            'profile': { title: 'My Profile', subtitle: 'View and update your profile information' },
            'help': { title: 'Help & Support', subtitle: 'Get help with using the system' }
        };
        
        if (titles[sectionId]) {
            document.getElementById('pageTitle').textContent = titles[sectionId].title;
            document.getElementById('pageSubtitle').textContent = titles[sectionId].subtitle;
        }
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
        }
        
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Load section-specific data
        if (sectionId === 'my-tasks') {
            this.loadMyTasks();
        } else if (sectionId === 'submissions') {
            this.loadSubmissions();
        } else if (sectionId === 'calendar') {
            this.loadCalendar();
        } else if (sectionId === 'profile') {
            this.loadProfile();
        } else if (sectionId === 'help') {
            this.loadHelp();
        }
    }
}

// Logout function
async function logout() {
    const confirmed = await userDashboard.showConfirm(
        'Are you sure you want to logout?',
        'Confirm Logout',
        { confirmText: 'Logout', cancelText: 'Cancel', type: 'warning' }
    );
    
    if (confirmed) {
        localStorage.removeItem('userSession');
        fetch('api/simple_auth.php?action=logout')
            .then(() => {
                window.location.href = 'login.html';
            })
            .catch(() => {
                window.location.href = 'login.html';
            });
    }
}

// Initialize dashboard and make it globally accessible
window.userDashboard = new UserDashboard();
