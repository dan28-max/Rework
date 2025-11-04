// Admin Dashboard JavaScript

console.log('AdminDashboard script loaded');

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentStep = 1;
        this.submissions = [];
        this.filteredSubmissions = [];
        this.availableReports = [];
        this.selectedReports = [];
        this.availableOffices = [];
        this.selectedOffices = [];
        this.userCampus = null;
        this.userRole = null;
        this.isSuperAdmin = false;
        this.allActivities = [];
        this.filteredActivities = [];
    }

    // Get user session and campus info
    getUserSession() {
        const sessionData = localStorage.getItem('spartan_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                this.userCampus = session.campus;
                this.userRole = session.role;
                // Main Campus users are treated as super admins OR if role is super_admin
                this.isSuperAdmin = session.role === 'super_admin' || session.campus === 'Main Campus';
                
                console.log('User Session:', {
                    campus: this.userCampus,
                    role: this.userRole,
                    isSuperAdmin: this.isSuperAdmin
                });
                
                return session;
            } catch (e) {
                console.error('Error parsing session:', e);
                return null;
            }
        }
        return null;
    }

    /**
     * Get accessible campuses for the current admin
     * Returns array of campus names the admin can access
     */
    getAccessibleCampuses() {
        if (this.isSuperAdmin) {
            // Super Admin can access all campuses
            return [
                'Alangilan', 'Pablo Borbon', 'Rosario', 'San Juan', 'Lemery',
                'Lipa', 'Malvar', 'Nasugbu', 'Lobo', 'Balayan', 'Mabini'
            ];
        }

        if (!this.userCampus) {
            return [];
        }

        // Define campus groups
        const campus = this.userCampus.trim();
        
        // Pablo Borbon admin can access: Pablo Borbon, Rosario, San Juan, Lemery
        if (campus === 'Pablo Borbon') {
            return ['Pablo Borbon', 'Rosario', 'San Juan', 'Lemery'];
        }
        
        // Alangilan admin can access: Alangilan, Lobo, Balayan, Mabini
        if (campus === 'Alangilan') {
            return ['Alangilan', 'Lobo', 'Balayan', 'Mabini'];
        }
        
        // Solo campuses: Lipa, Malvar, Nasugbu - no dropdown, just their own campus
        if (['Lipa', 'Malvar', 'Nasugbu'].includes(campus)) {
            return [campus]; // Return single campus (no dropdown needed)
        }
        
        // Default: return own campus only
        return [campus];
    }

    /**
     * Check if admin should see campus dropdown (has multiple campuses)
     */
    shouldShowCampusDropdown() {
        const accessibleCampuses = this.getAccessibleCampuses();
        // Super admin always sees dropdown with all campuses
        // Other admins see dropdown only if they have multiple accessible campuses
        return this.isSuperAdmin || accessibleCampuses.length > 1;
    }

    // Authentication check - just verify user is logged in (no role restriction)
    async checkAuth() {
        try {
            // First get local session
            this.getUserSession();
            
            // Verify with server that user is logged in - get full user data
            const response = await fetch('api/simple_auth.php?action=get_user_data', {
                method: 'GET',
                credentials: 'include'
            });
            
            if (!response.ok) {
                console.error('Authentication check failed');
                window.location.href = 'login.html';
                return false;
            }
            
            const result = await response.json();
            
            if (!result.success || !result.data || !result.data.user) {
                console.error('Invalid user data');
                window.location.href = 'login.html';
                return false;
            }
            
            const user = result.data.user;
            const userRole = user.role?.toLowerCase() || '';
            
            // Update role from server response (for display purposes only)
            this.userRole = user.role;
            this.userCampus = user.campus || this.userCampus;
            this.isSuperAdmin = userRole === 'super_admin' || user.campus === 'Main Campus';
            
            // No role restriction - anyone logged in can access
            return true;
        } catch (error) {
            console.error('Auth check error:', error);
            window.location.href = 'login.html';
            return false;
        }
    }

    async init() {
        console.log('Initializing admin dashboard...');
        
        try {
            const isAuthenticated = await this.checkAuth();
            if (!isAuthenticated) {
                return;
            }
            // Fallback: if no session campus, infer from URL (?campus=Lipa)
            if (!this.userCampus) {
                const urlCampus = this.getQueryParam('campus');
                if (urlCampus) {
                    this.userCampus = decodeURIComponent(urlCampus);
                }
            }
            
            // Display campus restriction info
            this.displayCampusInfo();
            
            this.setupEventListeners();
            this.loadDashboardData();
            this.loadSystemSettings();
            await this.loadAvailableReports();
            await this.loadAvailableOffices();
            
            console.log('Admin dashboard initialized successfully');
        } catch (error) {
            console.error('Error initializing admin dashboard:', error);
        }
    }

    // Helper to read URL query params
    getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        const value = params.get(name);
        return value && value.trim() !== '' ? value : '';
    }

    displayCampusInfo() {
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        
        if (userName && this.userCampus) {
            if (this.isSuperAdmin) {
                userRole.textContent = 'Super Administrator - All Campuses';
            } else {
                userRole.textContent = `${this.userCampus} Campus Admin`;
                
                // Add campus filter notice to dashboard
                this.addCampusFilterNotice();
            }
        }
        
        // Update navigation visibility based on user role
        this.updateNavigationVisibility();
    }
    
    updateNavigationVisibility() {
        const systemSettingsNavItem = document.getElementById('systemSettingsNavItem');
        
        if (systemSettingsNavItem) {
            // Show System Settings only for super admins
            if (this.isSuperAdmin) {
                systemSettingsNavItem.style.display = 'flex';
            } else {
                systemSettingsNavItem.style.display = 'none';
                
                // If currently viewing system settings, switch to dashboard
                if (this.currentSection === 'system') {
                    this.showSection('dashboard');
                    // Update active nav item
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.classList.remove('active');
                        if (item.dataset.section === 'dashboard') {
                            item.classList.add('active');
                        }
                    });
                }
            }
        }
    }
    
    addCampusFilterNotice() {
        // Add a notice banner showing campus filtering is active
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) return;
        
        // Check if notice already exists
        if (document.getElementById('campusFilterNotice')) return;
        
        const notice = document.createElement('div');
        notice.id = 'campusFilterNotice';
        notice.style.cssText = `
            background: linear-gradient(135deg, #dc143c 0%, #a00000 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 4px 12px rgba(220, 20, 60, 0.3);
            animation: slideInDown 0.5s ease;
        `;
        
        notice.innerHTML = `
            <i class="fas fa-filter" style="font-size: 24px;"></i>
            <div style="flex: 1;">
                <strong style="font-size: 16px; display: block; margin-bottom: 3px;">Campus Filter Active</strong>
                <span style="font-size: 14px; opacity: 0.9;">Showing data only for <strong>${this.userCampus}</strong> campus</span>
            </div>
            <i class="fas fa-check-circle" style="font-size: 24px;"></i>
        `;
        
        // Add animation keyframe
        if (!document.getElementById('campusFilterAnimation')) {
            const style = document.createElement('style');
            style.id = 'campusFilterAnimation';
            style.textContent = `
                @keyframes slideInDown {
                    from {
                        transform: translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        contentArea.insertBefore(notice, contentArea.firstChild);
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation menu
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                if (section) {
                    this.showSection(section);
                }
            });
        });

        // Menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('collapsed');
            });
        }

        // Select all reports checkbox
        const selectAllReports = document.getElementById('selectAllReports');
        if (selectAllReports) {
            selectAllReports.addEventListener('change', (e) => {
                this.toggleSelectAllReports(e.target.checked);
            });
        }

        // Step navigation buttons
        const nextToStep2 = document.getElementById('nextToStep2');
        if (nextToStep2) {
            nextToStep2.addEventListener('click', () => this.goToStep(2));
        }

        const nextToStep3 = document.getElementById('nextToStep3');
        if (nextToStep3) {
            nextToStep3.addEventListener('click', () => this.goToStep(3));
        }

        const confirmAssignment = document.getElementById('confirmAssignment');
        if (confirmAssignment) {
            confirmAssignment.addEventListener('click', () => this.confirmAssignment());
        }

        // Filter submissions
        const campusFilter = document.getElementById('campusFilter');
        if (campusFilter) {
            campusFilter.addEventListener('change', () => this.filterSubmissions());
        }
    }

    showSection(sectionId) {
        console.log('Showing section:', sectionId);
        
        // Prevent non-super admins from accessing system settings
        if (sectionId === 'system' && !this.isSuperAdmin) {
            console.warn('Access denied: System Settings is only available for Super Admins');
            this.showNotification('Access denied: System Settings is only available for Super Admins', 'error');
            sectionId = 'dashboard'; // Redirect to dashboard
        }
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
            this.currentSection = sectionId;
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
        if (sectionId === 'submissions') {
            this.getUserSession(); // Ensure session is loaded
            // Wait a bit for DOM to be ready, then setup filter
            setTimeout(() => {
                this.setupSubmissionsCampusFilter();
            }, 100);
            this.loadSubmissions();
        } else if (sectionId === 'users') {
            this.getUserSession(); // Ensure session is loaded
            // Wait a bit for DOM to be ready, then setup filter
            setTimeout(() => {
                this.setupUsersCampusFilter();
            }, 100);
            this.loadUsers();
        // Analytics section removed - analytics are now in dashboard
        } else if (sectionId === 'userActivity') {
            this.loadUserActivity();
        }
    }

    async loadAvailableReports() {
        try {
            console.log('Fetching reports from api/get_reports.php...');
            const response = await fetch('api/get_reports.php');
            console.log('Reports response status:', response.status);
            
            const result = await response.json();
            console.log('Reports result:', result);
            
            if (result.success) {
                this.availableReports = result.reports;
                console.log('Loaded reports:', this.availableReports);
                this.renderReportsList();
            } else {
                console.error('Failed to load reports:', result.error);
            }
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    }

    renderReportsList() {
        const tbody = document.getElementById('reportsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.availableReports.forEach(report => {
            const row = document.createElement('tr');
            const isSelected = this.selectedReports.includes(report.table_name);
            
            row.innerHTML = `
                <td>
                    <input type="checkbox" 
                           value="${report.table_name}" 
                           ${isSelected ? 'checked' : ''}
                           onchange="adminDashboard.toggleReportSelection('${report.table_name}', this.checked)">
                </td>
                <td>${report.display_name}</td>
                <td>${report.description || 'No description'}</td>
            `;
            
            tbody.appendChild(row);
        });

        this.updateStepButtons();
    }

    toggleReportSelection(tableName, isSelected) {
        if (isSelected) {
            if (!this.selectedReports.includes(tableName)) {
                this.selectedReports.push(tableName);
            }
        } else {
            this.selectedReports = this.selectedReports.filter(r => r !== tableName);
        }
        
        this.updateStepButtons();
        console.log('Selected reports:', this.selectedReports);
    }

    toggleSelectAllReports(selectAll) {
        const checkboxes = document.querySelectorAll('#reportsTableBody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll;
            this.toggleReportSelection(checkbox.value, selectAll);
        });
    }

    async loadAvailableOffices() {
        try {
            console.log('Fetching offices from api/get_offices.php...');
            const response = await fetch('api/get_offices.php');
            console.log('Offices response status:', response.status);
            
            const result = await response.json();
            console.log('Offices result:', result);
            
            if (result.success) {
                // Filter offices by campus if not super admin
                if (this.isSuperAdmin) {
                    this.availableOffices = result.offices;
                    console.log('Super Admin - Loaded all offices:', this.availableOffices.length);
                } else {
                    this.availableOffices = result.offices.filter(office => 
                        office.campus === this.userCampus
                    );
                    console.log(`Campus Admin (${this.userCampus}) - Loaded ${this.availableOffices.length} offices`);
                }
                this.renderOfficesList();
                this.populateOfficeDropdown();
            } else {
                console.error('Failed to load offices:', result.error);
            }
        } catch (error) {
            console.error('Error loading offices:', error);
        }
    }

    populateOfficeDropdown() {
        const officeSelect = document.getElementById('userOffice');
        if (!officeSelect) return;
        // Preserve current value if any
        const current = officeSelect.value;
        officeSelect.innerHTML = '<option value="">Select office</option>';

        // Offices from API (scoped by campus unless super admin)
        const officesFromApi = this.availableOffices
            .filter(o => this.isSuperAdmin || o.campus === this.userCampus)
            .map(o => o.office_name);

        // Default offices list
        const defaultOffices = [
            'Office of the Chancellor',
            'Internal Audit',
            'Quality Assurance Management',
            'Sustainable Development',
            'Vice Chancellor for Development and External Affairs',
            'Planning and Development',
            'External Affairs',
            'Resource Generation',
            'ICT Services',
            'Vice Chancellor for Academic Affairs',
            'College of Arts and Sciences',
            'College of Accountancy, Business and Economics',
            'College of Informatics and Computing Sciences',
            'College of Engineering Technology',
            'College of Teacher Education',
            'College of Engineering',
            'Culture and Arts',
            'Testing and Admission',
            'Registration Services',
            'Scholarship and Financial Assistance',
            'Guidance and Counseling',
            'Library Services',
            'Student Organization and Activities',
            'Student Discipline',
            'Sports and Development',
            'OJT',
            'National Service Training Program',
            'Vice Chancellor for Administration and Finance',
            'Human Resource Management',
            'Records Management',
            'Procurement',
            'Budget',
            'Cashiering/Disbursing',
            'Accounting',
            'Project Facilities and Management',
            'Environment Management Unit',
            'Property and Supply Management',
            'General Services',
            'Vice Chancellor for Research, Development and Extension Services',
            'Extension',
            'Research',
            'HRMO',
            'TAO',
            'Registrar',
            'Library',
            'Health Services',
            'GSO',
            'RGO',
            'Budget office'
        ];

        // Merge, dedupe (case-insensitive), preserve order with API first
        const seen = new Set();
        const combined = [...officesFromApi, ...defaultOffices].filter(name => {
            const key = (name || '').trim();
            if (!key) return false;
            const k = key.toLowerCase();
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        });

        combined.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            officeSelect.appendChild(opt);
        });

        if (current) officeSelect.value = current;
    }

    renderOfficesList() {
        const container = document.querySelector('.campuses-container');
        if (!container) return;
        
        // Group offices by campus
        const officesByCampus = {};
        this.availableOffices.forEach(office => {
            if (!officesByCampus[office.campus]) {
                officesByCampus[office.campus] = [];
            }
            officesByCampus[office.campus].push(office);
        });
        
        // Show campus restriction message if not super admin
        let html = '';
        if (!this.isSuperAdmin && this.userCampus) {
            html += `
                <div class="campus-restriction-notice">
                    <i class="fas fa-info-circle"></i>
                    <span>You can only assign reports to offices in <strong>${this.userCampus}</strong> campus</span>
                </div>
            `;
        }
        
        Object.keys(officesByCampus).forEach(campus => {
            html += `
                <div class="campus-group">
                    <h4>${campus}</h4>
                    <div class="offices-list">
            `;
            
            officesByCampus[campus].forEach(office => {
                const isSelected = this.selectedOffices.includes(office.id);
                const officeIdStr = typeof office.id === 'string' ? `'${office.id}'` : office.id;
                html += `
                    <label class="office-checkbox">
                        <input type="checkbox" 
                               value="${office.id}" 
                               ${isSelected ? 'checked' : ''}
                               onchange="adminDashboard.toggleOfficeSelection(${officeIdStr}, this.checked)">
                        <span>${office.office_name}</span>
                    </label>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    toggleOfficeSelection(officeId, isSelected) {
        if (isSelected) {
            if (!this.selectedOffices.includes(officeId)) {
                this.selectedOffices.push(officeId);
            }
        } else {
            this.selectedOffices = this.selectedOffices.filter(o => o !== officeId);
        }
        
        this.updateStepButtons();
        console.log('Selected offices:', this.selectedOffices);
    }

    goToStep(stepNumber) {
        console.log('Going to step:', stepNumber);
        
        // Hide all steps
        document.querySelectorAll('.assignment-step-formal').forEach(step => {
            step.classList.remove('active');
            step.style.display = 'none';
        });
        
        // Show selected step
        const step = document.getElementById(`step${stepNumber}`);
        if (step) {
            step.classList.add('active');
            step.style.display = 'block';
        }
        
        // Update step indicators - handle both old and new classes
        const stepIndicators = document.querySelectorAll('.step-formal, .step');
        stepIndicators.forEach((stepEl, index) => {
            const stepNum = index + 1;
            if (stepNum < stepNumber) {
                stepEl.classList.add('completed');
                stepEl.classList.remove('active');
            } else if (stepNum === stepNumber) {
                stepEl.classList.add('active');
                stepEl.classList.remove('completed');
            } else {
                stepEl.classList.remove('active', 'completed');
            }
        });
        
        this.currentStep = stepNumber;
        
        // Update confirmation if on step 3
        if (stepNumber === 3) {
            this.updateConfirmation();
        }
    }

    updateStepButtons() {
        const nextToStep2 = document.getElementById('nextToStep2');
        const nextToStep3 = document.getElementById('nextToStep3');
        
        if (nextToStep2) {
            nextToStep2.disabled = this.selectedReports.length === 0;
        }
        
        if (nextToStep3) {
            nextToStep3.disabled = this.selectedOffices.length === 0;
        }
    }

    updateConfirmation() {
        const reportsList = document.getElementById('selectedReportsList');
        const officesList = document.getElementById('selectedOfficesList');
        
        if (reportsList) {
            reportsList.innerHTML = this.selectedReports.map(tableName => {
                const report = this.availableReports.find(r => r.table_name === tableName);
                return `<li>${report ? report.display_name : tableName}</li>`;
            }).join('');
        }
        
        if (officesList) {
            officesList.innerHTML = this.selectedOffices.map(officeId => {
                const office = this.availableOffices.find(o => o.id === officeId);
                return `<li>${office ? office.office_name : officeId}</li>`;
            }).join('');
        }
    }

    async confirmAssignment() {
        if (this.selectedReports.length === 0 || this.selectedOffices.length === 0) {
            alert('Please select at least one report and one office');
            return;
        }

        // Get deadline and priority settings
        const hasDeadline = document.getElementById('hasDeadlineCheck')?.checked || false;
        const deadline = document.getElementById('deadlineInput')?.value || null;
        const priority = document.querySelector('input[name="priorityLevel"]:checked')?.value || 'medium';
        const notes = document.getElementById('assignmentNotes')?.value || '';

        // Validate deadline if checkbox is checked
        if (hasDeadline && !deadline) {
            alert('Please select a deadline date');
            return;
        }

        // Show modern confirmation dialog
        if (window.showConfirmDialog) {
            const confirmed = await showConfirmDialog({
                title: 'Confirm Assignment',
                message: `Are you sure you want to assign ${this.selectedReports.length} report(s) to ${this.selectedOffices.length} office(s)?`,
                subtitle: 'This action cannot be undone',
                confirmText: 'Confirm Assignment',
                cancelText: 'Cancel',
                type: 'success',
                icon: 'check-circle'
            });

            if (!confirmed) {
                return; // User cancelled
            }
        } else {
            // Fallback to browser confirm
            if (!confirm(`Are you sure you want to assign ${this.selectedReports.length} report(s) to ${this.selectedOffices.length} office(s)?`)) {
                return;
            }
        }

        try {
            const payload = {
                reports: this.selectedReports,
                offices: this.selectedOffices,
                hasDeadline: hasDeadline,
                deadline: hasDeadline ? deadline : null,
                priority: priority,
                notes: notes
            };
            
            console.log('Sending assignment payload:', payload);
            
            const response = await fetch('api/assign_table.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            console.log('Assignment response status:', response.status);
            
            const responseText = await response.text();
            console.log('Assignment response text:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON:', responseText);
                alert('Server returned invalid response: ' + responseText.substring(0, 200));
                return;
            }

            console.log('Assignment result:', result);

            if (result.success) {
                this.showNotification('Reports assigned successfully!', 'success');
                this.selectedReports = [];
                this.selectedOffices = [];
                this.goToStep(1);
                this.renderReportsList();
                this.renderOfficesList();
            } else {
                this.showNotification('Failed to assign reports: ' + (result.error || result.message), 'error');
            }
        } catch (error) {
            console.error('Error assigning reports:', error);
            this.showNotification('Error assigning reports: ' + error.message, 'error');
        }
    }

    async loadSubmissions() {
        try {
            console.log('Loading submissions...');
            const response = await fetch('api/get_all_submissions.php', {
                credentials: 'include'
            });
            
            const result = await response.json();
            console.log('Submissions result:', result);
            
            if (result.success) {
                // Filter submissions by campus if not super admin
                if (this.isSuperAdmin) {
                    this.submissions = result.data || [];
                    console.log('Super Admin - Loaded all submissions:', this.submissions.length);
                } else {
                    // Filter by accessible campuses
                    const accessibleCampuses = this.getAccessibleCampuses();
                    this.submissions = (result.data || []).filter(sub => 
                        accessibleCampuses.includes(sub.campus)
                    );
                    console.log(`Campus Admin (${this.userCampus}) - Loaded ${this.submissions.length} submissions from accessible campuses:`, accessibleCampuses);
                }
                
                // Store all submissions before filtering
                console.log('Sample submission data:', this.submissions.length > 0 ? {
                    id: this.submissions[0].id,
                    campus: this.submissions[0].campus,
                    status: this.submissions[0].status,
                    table_name: this.submissions[0].table_name,
                    record_count: this.submissions[0].record_count
                } : 'No submissions');
                
                // Setup campus filter dropdown after loading
                setTimeout(() => {
                    this.setupSubmissionsCampusFilter();
                }, 100);
                
                // Initialize filtered submissions with all accessible submissions
                this.filteredSubmissions = [...this.submissions];
                this.updateSubmissionStats();
                // Apply default date sorting (newest first)
                this.sortSubmissionsByDate();
            } else {
                console.error('Failed to load submissions:', result.error);
                this.renderEmptySubmissions('Error loading submissions: ' + result.error);
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
            this.renderEmptySubmissions('Error loading submissions: ' + error.message);
        }
    }

    updateSubmissionStats() {
        const totalCountEl = document.getElementById('totalCount');
        if (totalCountEl) totalCountEl.textContent = this.submissions.length;
    }

    renderSubmissions() {
        const tbody = document.getElementById('submissionsTableBody');
        if (!tbody) return;

        if (this.filteredSubmissions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px;">
                        <i class="fas fa-inbox" style="font-size: 48px; color: #ccc; margin-bottom: 15px; display: block;"></i>
                        <p style="color: #666; margin: 0;">No submissions found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = '';

        this.filteredSubmissions.forEach(submission => {
            const row = document.createElement('tr');
            
            // Export button is available to everyone (no role restriction)
            row.innerHTML = `
                <td>${this.formatTableName(submission.table_name)}</td>
                <td>${submission.campus || '-'}</td>
                <td>${submission.office || '-'}</td>
                <td>${submission.user_name || '-'}</td>
                <td style="text-align: center;">${submission.record_count || 0}</td>
                <td>${new Date(submission.submitted_at).toLocaleString()}</td>
                <td>
                    <div class="submission-actions">
                        <button class="btn-sm btn-view" onclick="adminDashboard.viewSubmissionDetails('${submission.table_name}', '${submission.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-sm btn-download" onclick="adminDashboard.downloadSubmission(${submission.id})">
                            <i class="fas fa-download"></i> Export
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
                <td colspan="10" style="text-align: center; padding: 40px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #dc143c; margin-bottom: 15px; display: block;"></i>
                    <p style="color: #666; margin: 0;">${message}</p>
                </td>
            </tr>
        `;
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

    /**
     * Setup campus dropdown for submissions section
     */
    setupSubmissionsCampusFilter() {
        // Ensure session is loaded
        if (!this.userCampus && !this.isSuperAdmin) {
            this.getUserSession();
        }
        
        const campusFilter = document.getElementById('campusFilter');
        if (!campusFilter) {
            console.warn('campusFilter element not found');
            return;
        }
        
        const filterGroup = campusFilter.closest('.filter-group');
        if (!filterGroup) {
            console.warn('campusFilter filter-group not found');
            return;
        }
        
        const accessibleCampuses = this.getAccessibleCampuses();
        console.log('Setting up submissions campus filter. Accessible campuses:', accessibleCampuses, 'Should show dropdown:', this.shouldShowCampusDropdown());
        
        if (!this.shouldShowCampusDropdown()) {
            // Hide campus dropdown for solo campuses
            filterGroup.style.display = 'none';
            console.log('Hiding campus dropdown for solo campus');
            return;
        }
        
        // Show dropdown and populate with accessible campuses
        filterGroup.style.display = '';
        campusFilter.innerHTML = '<option value="">All Campus</option>';
        
        accessibleCampuses.forEach(campus => {
            const option = document.createElement('option');
            option.value = campus;
            option.textContent = campus;
            campusFilter.appendChild(option);
        });
        
        // Re-attach event listener after repopulating dropdown
        campusFilter.removeEventListener('change', this.filterSubmissions.bind(this));
        campusFilter.addEventListener('change', () => {
            console.log('Campus filter changed to:', campusFilter.value);
            this.filterSubmissions();
        });
        
        console.log('Populated campus dropdown with', accessibleCampuses.length, 'campuses');
    }

    sortSubmissionsByDate() {
        const sortOrder = document.getElementById('dateSortFilter')?.value || 'newest';
        
        // Sort the filtered submissions by date
        this.filteredSubmissions.sort((a, b) => {
            const dateA = new Date(a.submitted_at || a.submission_date || 0);
            const dateB = new Date(b.submitted_at || b.submission_date || 0);
            
            if (sortOrder === 'newest') {
                return dateB - dateA; // Newest first (descending)
            } else {
                return dateA - dateB; // Oldest first (ascending)
            }
        });
        
        this.renderSubmissions();
    }

    filterSubmissions() {
        const campusFilter = document.getElementById('campusFilter')?.value || '';
        const reportTypeFilter = document.getElementById('reportTypeFilter')?.value || '';
        
        console.log('=== Filtering Submissions ===');
        console.log('Filter values:', {
            campusFilter,
            reportTypeFilter,
            totalSubmissions: this.submissions.length
        });
        
        // Get accessible campuses for filtering
        const accessibleCampuses = this.getAccessibleCampuses();
        console.log('Accessible campuses:', accessibleCampuses);
        
        if (this.submissions.length > 0) {
            console.log('Sample submission campuses:', 
                [...new Set(this.submissions.slice(0, 10).map(s => s.campus || 'NULL'))]
            );
        }
        
        this.filteredSubmissions = this.submissions.filter(submission => {
            // Normalize campus comparison (trim and handle null/undefined)
            const subCampus = (submission.campus || '').toString().trim();
            const filterCampus = (campusFilter || '').toString().trim();
            const campusMatch = !campusFilter || subCampus.toLowerCase() === filterCampus.toLowerCase();
            
            const reportMatch = !reportTypeFilter || submission.table_name === reportTypeFilter;
            
            // Additional check: ensure submission campus is in accessible campuses (only if not super admin)
            let accessibleMatch = true;
            if (!this.isSuperAdmin && accessibleCampuses.length > 0) {
                accessibleMatch = accessibleCampuses.some(ac => 
                    ac.trim().toLowerCase() === subCampus.toLowerCase()
                );
            }
            
            const matches = campusMatch && reportMatch && accessibleMatch;
            
            if (campusFilter && matches) {
                console.log('✓ Match found:', {
                    submissionId: submission.id,
                    submissionCampus: subCampus,
                    filterCampus: filterCampus
                });
            }
            
            return matches;
        });
        
        console.log('=== Filter Results ===');
        console.log({
            filteredCount: this.filteredSubmissions.length,
            originalCount: this.submissions.length,
            filterActive: campusFilter ? `Filtering by campus: "${campusFilter}"` : 'No campus filter'
        });
        
        if (this.filteredSubmissions.length === 0 && this.submissions.length > 0 && campusFilter) {
            console.warn('⚠️ No submissions matched the filter!');
            console.warn('Available campuses in data:', [...new Set(this.submissions.map(s => (s.campus || 'NULL').toString().trim()))]);
            console.warn('Trying to filter by:', campusFilter);
        }
        
        // Apply date sorting after filtering
        this.sortSubmissionsByDate();
    }

    async viewSubmissionDetails(tableName, submissionId) {
        try {
            const response = await fetch(`api/get_submission_details.php?submission_id=${submissionId}`);
            const result = await response.json();
            
            if (result.success) {
                this.showSubmissionDetailsModal(result.data, tableName, submissionId, result.submission);
            } else {
                alert('Failed to load submission details: ' + result.error);
            }
        } catch (error) {
            console.error('Error loading submission details:', error);
            alert('Error loading submission details');
        }
    }

    showSubmissionDetailsModal(data, tableName, submissionId, submission) {
        let modal = document.getElementById('submissionDetailsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'submissionDetailsModal';
            modal.className = 'edit-modal';
            modal.innerHTML = `
                <div class="modal-content-formal">
                    <div class="modal-header-formal">
                        <h3><i class="fas fa-file-alt"></i> Submission Details</h3>
                        <button class="modal-close" onclick="document.getElementById('submissionDetailsModal').classList.remove('active')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body-formal" id="submissionDetailsBody"></div>
                    <div class="modal-footer-formal">
                        <button class="btn-formal btn-secondary" onclick="document.getElementById('submissionDetailsModal').classList.remove('active')">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const body = document.getElementById('submissionDetailsBody');
        let html = `
            <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
                <h4 style="margin-bottom: 10px;">${this.formatTableName(tableName)}</h4>
                <p style="margin: 5px 0;"><strong>Campus:</strong> ${submission?.campus || '-'}</p>
                <p style="margin: 5px 0;"><strong>Office:</strong> ${submission?.office || '-'}</p>
                <p style="margin: 5px 0;"><strong>Records:</strong> ${data.length}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span class="status-badge status-${submission?.status || 'pending'}">${submission?.status || 'pending'}</span></p>
            </div>
        `;

        if (data.length > 0) {
            const columns = Object.keys(data[0]);
            html += `
                <div style="overflow-x: auto;">
                    <table class="formal-table">
                        <thead>
                            <tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${data.map(row => `
                                <tr>${columns.map(col => `<td>${row[col] || '-'}</td>`).join('')}</tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            html += '<p style="text-align: center; color: #999; padding: 20px;">No data records found</p>';
        }

        body.innerHTML = html;
        modal.classList.add('active');
    }


    async downloadSubmission(submissionId) {
        try {
            // Fetch the CSV with credentials to ensure session is sent
            const exportUrl = `api/admin_submissions.php?action=export&submission_id=${submissionId}`;
            
            const response = await fetch(exportUrl, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'text/csv'
                }
            });
            
            // Check if response is ok
            if (!response.ok) {
                // Try to get error message from response
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                } else {
                    const errorText = await response.text();
                    throw new Error(errorText || `HTTP error! status: ${response.status}`);
                }
            }
            
            // Get the CSV blob
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            // Get filename from response headers or create default
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `submission_${submissionId}_${new Date().toISOString().split('T')[0]}.csv`;
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.href = url;
            link.download = filename;
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
            
            // Show success notification
            this.showNotification(`Exported submission #${submissionId} successfully`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification(`Error exporting submission: ${error.message}`, 'error');
        }
    }

    /**
     * Export submissions table to CSV
     */
    exportSubmissionsToCSV() {
        const table = document.querySelector('.submissions-table-container table');
        if (!table) {
            alert('No submissions table found');
            return;
        }

        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) {
            alert('No submissions to export');
            return;
        }

        let csvContent = [];
        
        // Get headers
        const headers = ['ID', 'Report Type', 'Campus', 'Office', 'Submitted By', 'Date', 'Status'];
        csvContent.push(headers.join(','));

        // Get data rows
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 7) {
                const rowData = [];
                
                // ID
                rowData.push(cells[0].textContent.trim());
                
                // Report Type
                rowData.push(this.escapeCSV(cells[1].textContent.trim()));
                
                // Campus
                rowData.push(this.escapeCSV(cells[2].textContent.trim()));
                
                // Office
                rowData.push(this.escapeCSV(cells[3].textContent.trim()));
                
                // Submitted By
                rowData.push(this.escapeCSV(cells[4].textContent.trim()));
                
                // Date
                rowData.push(cells[5].textContent.trim());
                
                // Status (extract from badge)
                const statusBadge = cells[6].querySelector('.status-badge');
                const status = statusBadge ? statusBadge.textContent.trim() : cells[6].textContent.trim();
                rowData.push(status);
                
                csvContent.push(rowData.join(','));
            }
        });

        // Create blob and download
        const csv = csvContent.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const fileName = `report_submissions_${new Date().toISOString().split('T')[0]}.csv`;
            
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success notification
            this.showNotification(`Exported ${rows.length} submissions to ${fileName}`, 'success');
        }
    }

    /**
     * Escape CSV special characters
     */
    escapeCSV(value) {
        if (typeof value !== 'string') return value;
        
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        value = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value}"`;
        }
        return value;
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
        modal.style.display = 'flex';
    }

    async loadDashboardData() {
        console.log('Loading dashboard data...');
        
        try {
            // Load dashboard statistics
            await Promise.all([
                this.loadDashboardStats(),
                this.loadRecentSubmissions(),
                this.loadModernDashboard(),
                // User Activity removed from dashboard, now in separate section
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }
    
    async loadModernDashboard() {
        // Load real system data
        await this.loadSystemStats();
        
        // Load KPI cards with mini charts
        await this.loadKPICards();
        
        // Load large report charts
        await this.loadSubmissionsGrowthChart();
        await this.loadSubmissionsMonthlyChart();
        
        // Load detailed reports
        await this.loadReportsByType();
        await this.loadTopActiveReports();
    }
    
    async loadSystemStats() {
        try {
            console.log('Fetching system statistics...');
            
            // Fetch users data
            const usersUrl = this.isSuperAdmin || !this.userCampus
                ? 'api/users.php?action=list'
                : `api/users.php?action=list&campus=${encodeURIComponent(this.userCampus)}`;
            
            console.log('Fetching users from:', usersUrl);
            const usersResponse = await fetch(usersUrl);
            
            if (!usersResponse.ok) {
                throw new Error(`Users API returned ${usersResponse.status}: ${usersResponse.statusText}`);
            }
            
            const usersResult = await usersResponse.json();
            console.log('Users API response:', usersResult);
            
            // Fetch submissions data
            console.log('Fetching submissions from: api/get_all_submissions.php');
            const submissionsResponse = await fetch('api/get_all_submissions.php');
            
            if (!submissionsResponse.ok) {
                throw new Error(`Submissions API returned ${submissionsResponse.status}: ${submissionsResponse.statusText}`);
            }
            
            const submissionsResult = await submissionsResponse.json();
            console.log('Submissions API response:', submissionsResult);
            
            // Handle API responses
            const users = usersResult.success ? (usersResult.users || []) : [];
            const submissions = submissionsResult.success ? (submissionsResult.data || []) : [];
            
            console.log(`Loaded ${users.length} users and ${submissions.length} submissions`);
            
            // Calculate statistics
            const totalUsers = users.length;
            const activeUsers = users.filter(u => u.status === 'active').length;
            const usersProgress = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
            
            console.log(`Users: ${totalUsers} total, ${activeUsers} active (${usersProgress}%)`);
            
            // Count unique report types (different table_name values)
            const reportTypeValues = submissions
                .map(s => (s.table_name || s.report_type || '').trim())
                .filter(Boolean);
            const uniqueReportTypes = new Set(reportTypeValues);
            const totalReports = uniqueReportTypes.size;
            
            const approvedReports = submissions.filter(s => 
                s.status && s.status.toLowerCase() === 'approved'
            ).length;
            const reportsProgress = submissions.length > 0 
                ? Math.round((approvedReports / submissions.length) * 100) 
                : 0;
            
            console.log(`Reports: ${totalReports} unique types, ${approvedReports} approved (${reportsProgress}%)`);
            
            const totalSubmissions = submissions.length;
            const completedSubmissions = submissions.filter(s => {
                const status = (s.status || '').toLowerCase();
                return status === 'approved' || status === 'rejected';
            }).length;
            const submissionsProgress = totalSubmissions > 0 
                ? Math.round((completedSubmissions / totalSubmissions) * 100) 
                : 0;
            
            console.log(`Submissions: ${totalSubmissions} total, ${completedSubmissions} completed (${submissionsProgress}%)`);
            
            // Update Users Card
            const usersValueEl = document.getElementById('totalUsersValue');
            const usersProgressBar = document.getElementById('usersProgressBar');
            const usersProgressValue = document.getElementById('usersProgressValue');
            
            if (usersValueEl) {
                usersValueEl.textContent = totalUsers > 0 ? totalUsers + '+' : '0';
            }
            if (usersProgressBar && usersProgressValue) {
                usersProgressBar.setAttribute('data-progress', usersProgress);
                this.animateProgressBar(usersProgressBar, usersProgress, usersProgressValue);
            }
            
            // Update Reports Card
            const reportsValueEl = document.getElementById('totalReportsValue');
            const reportsProgressBar = document.getElementById('reportsProgressBar');
            const reportsProgressValue = document.getElementById('reportsProgressValue');
            
            if (reportsValueEl) {
                reportsValueEl.textContent = totalReports > 0 ? totalReports + '+' : '0';
            }
            if (reportsProgressBar && reportsProgressValue) {
                reportsProgressBar.setAttribute('data-progress', reportsProgress);
                this.animateProgressBar(reportsProgressBar, reportsProgress, reportsProgressValue);
            }
            
            // Update Submissions Card
            const submissionsValueEl = document.getElementById('totalSubmissionsValue');
            const submissionsProgressBar = document.getElementById('submissionsProgressBar');
            const submissionsProgressValue = document.getElementById('submissionsProgressValue');
            
            if (submissionsValueEl) {
                submissionsValueEl.textContent = totalSubmissions > 0 ? totalSubmissions + '+' : '0';
            }
            if (submissionsProgressBar && submissionsProgressValue) {
                submissionsProgressBar.setAttribute('data-progress', submissionsProgress);
                this.animateProgressBar(submissionsProgressBar, submissionsProgress, submissionsProgressValue);
            }
            
            console.log('System stats updated successfully');
        } catch (error) {
            console.error('Error loading system stats:', error);
            // Show error message to user
            this.showNotification('Failed to load dashboard statistics. Please refresh the page.', 'error');
        }
    }
    
    animateProgressBar(progressBar, progress, progressValueEl) {
        const circumference = 2 * Math.PI * 45; // radius = 45
        const offset = circumference - (progress / 100) * circumference;
        
        setTimeout(() => {
            progressBar.style.strokeDashoffset = offset;
            if (progressValueEl) {
                let current = 0;
                const interval = setInterval(() => {
                    current += 2;
                    if (current >= progress) {
                        current = progress;
                        clearInterval(interval);
                    }
                    progressValueEl.textContent = current + '%';
                }, 20);
            }
        }, 100);
    }
    
    async loadSalesReportsChart() {
        try {
            console.log('Fetching submissions for line chart...');
            const response = await fetch('api/get_all_submissions.php');
            
            if (!response.ok) {
                throw new Error(`Submissions API returned ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Line chart data loaded:', result);
            
            if (result.success) {
                const submissions = result.data || [];
                console.log(`Creating line chart with ${submissions.length} submissions`);
                this.createSalesReportsLineChart(submissions);
            } else {
                console.error('API returned error:', result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error loading sales reports chart:', error);
            this.showNotification('Failed to load submissions chart', 'error');
        }
    }
    
    createSalesReportsLineChart(submissions) {
        const ctx = document.getElementById('salesReportsChart');
        if (!ctx) return;
        
        // Destroy existing chart if any
        if (this.salesReportsChart) {
            this.salesReportsChart.destroy();
        }
        
        // Group submissions by hour (simulate sales over time)
        const hourlyData = Array.from({length: 24}, (_, i) => {
            const hour = i;
            const filtered = submissions.filter(s => {
                const date = new Date(s.submitted_at);
                return date.getHours() === hour;
            });
            return filtered.length * 3.5; // Scale for demo
        });
        
        // Labels for 10am to 7am (next day)
        const labels = [];
        for (let i = 10; i < 24; i++) {
            labels.push((i > 12 ? i - 12 : i) + (i >= 12 ? 'pm' : 'am'));
        }
        for (let i = 0; i <= 7; i++) {
            labels.push((i === 0 ? 12 : i) + (i >= 12 ? 'pm' : 'am'));
        }
        
        const data = [...hourlyData.slice(10), ...hourlyData.slice(0, 8)];
        
        this.salesReportsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                    datasets: [{
                        label: 'Submissions',
                        data: data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
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
    
    async loadSalesReportsDonutChart() {
        try {
            console.log('Fetching submissions for donut chart...');
            const response = await fetch('api/get_all_submissions.php');
            
            if (!response.ok) {
                throw new Error(`Submissions API returned ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Donut chart data loaded:', result);
            
            if (result.success) {
                const submissions = result.data || [];
                console.log(`Creating donut chart with ${submissions.length} submissions`);
                this.createSalesReportsDonutChart(submissions);
            } else {
                console.error('API returned error:', result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error loading sales reports donut chart:', error);
            this.showNotification('Failed to load status chart', 'error');
        }
    }
    
    createSalesReportsDonutChart(submissions) {
        const ctx = document.getElementById('salesReportsDonutChart');
        if (!ctx) return;
        
        if (this.salesReportsDonutChart) {
            this.salesReportsDonutChart.destroy();
        }
        
        // Group by status
        const approved = submissions.filter(s => s.status === 'approved').length;
        const pending = submissions.filter(s => s.status === 'pending').length;
        const rejected = submissions.filter(s => s.status === 'rejected').length;
        
        const statusCounts = {
            'Approved': approved,
            'Pending': pending,
            'Rejected': rejected
        };
        
        const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
        const percentage = total > 0 ? Math.round((approved / total) * 100) : 0;
        
        this.salesReportsDonutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Approved', 'Pending', 'Rejected'],
                datasets: [{
                    data: [approved, pending, rejected],
                    backgroundColor: ['#3b82f6', '#10b981', '#ef4444'],
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
            },
            plugins: [{
                id: 'centerText',
                beforeDraw: function(chart) {
                    const ctx = chart.ctx;
                    ctx.save();
                    ctx.font = 'bold 24px Inter';
                    ctx.fillStyle = '#1f2937';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(percentage + '%', chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2,
                                 chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2);
                    ctx.restore();
                }
            }]
        });
        
        // Create legend
        const legend = document.getElementById('donutChartLegend');
        if (legend) {
            legend.innerHTML = `
                <div class="legend-item">
                    <div class="legend-dot" style="background: #3b82f6;"></div>
                    <span>Approved</span>
                </div>
                <div class="legend-item">
                    <div class="legend-dot" style="background: #10b981;"></div>
                    <span>Pending</span>
                </div>
                <div class="legend-item">
                    <div class="legend-dot" style="background: #ef4444;"></div>
                    <span>Rejected</span>
                </div>
            `;
        }
    }
    
    async loadAnalyticsBarChart() {
        try {
            console.log('Fetching submissions for bar chart...');
            const response = await fetch('api/get_all_submissions.php');
            
            if (!response.ok) {
                throw new Error(`Submissions API returned ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Bar chart data loaded:', result);
            
            if (result.success) {
                const submissions = result.data || [];
                console.log(`Creating bar chart with ${submissions.length} submissions`);
                this.createAnalyticsBarChart(submissions);
            } else {
                console.error('API returned error:', result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error loading analytics bar chart:', error);
            this.showNotification('Failed to load analytics chart', 'error');
        }
    }
    
    createAnalyticsBarChart(submissions) {
        const ctx = document.getElementById('analyticsBarChart');
        if (!ctx) return;
        
        if (this.analyticsBarChart) {
            this.analyticsBarChart.destroy();
        }
        
        // Group by day of week
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayData = days.map(day => {
            const dayIndex = days.indexOf(day);
            return submissions.filter(s => {
                const date = new Date(s.submitted_at);
                return date.getDay() === dayIndex;
            }).length * 15; // Scale for demo
        });
        
        this.analyticsBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Analytics',
                    data: dayData,
                    backgroundColor: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#1e3a8a', '#3b82f6'],
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
    
    async loadRecentOrdersTable() {
        try {
            console.log('Fetching recent submissions for table...');
            const response = await fetch('api/get_all_submissions.php');
            
            if (!response.ok) {
                throw new Error(`Submissions API returned ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Recent submissions data loaded:', result);
            
            if (result.success) {
                const submissions = result.data || [];
                // Sort by submitted_at or created_at descending to get most recent first
                const sortedSubmissions = submissions.sort((a, b) => {
                    const dateA = new Date(a.submitted_at || a.created_at || 0);
                    const dateB = new Date(b.submitted_at || b.created_at || 0);
                    return dateB - dateA;
                });
                
                console.log(`Populating table with ${Math.min(sortedSubmissions.length, 4)} recent submissions`);
                this.populateRecentOrdersTable(sortedSubmissions.slice(0, 4)); // Get first 4 most recent
            } else {
                console.error('API returned error:', result.error || 'Unknown error');
                const tbody = document.querySelector('#recentOrdersTable tbody');
                if (tbody) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="4" style="text-align: center; padding: 40px; color: #ef4444;">
                                Failed to load recent submissions
                            </td>
                        </tr>
                    `;
                }
            }
        } catch (error) {
            console.error('Error loading recent orders:', error);
            this.showNotification('Failed to load recent submissions', 'error');
            const tbody = document.querySelector('#recentOrdersTable tbody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 40px; color: #ef4444;">
                            Error loading data. Please refresh the page.
                        </td>
                    </tr>
                `;
            }
        }
    }
    
    populateRecentOrdersTable(submissions) {
        const tbody = document.querySelector('#recentOrdersTable tbody');
        if (!tbody) return;
        
        if (submissions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 40px; color: #9ca3af;">
                        No recent orders
                    </td>
                </tr>
            `;
            return;
        }
        
        const getProductIcon = (index) => {
            const icons = ['shoe', 'camera', 'backpack', 'phone'];
            return icons[index % icons.length];
        };
        
        const getProductName = (submission) => {
            // Extract a meaningful name from submission data
            return submission.report_type || `Report #${submission.id}`;
        };
        
        tbody.innerHTML = submissions.map((submission, index) => {
            const trackingId = `#${String(submission.id).padStart(7, '0')}`;
            const reportType = submission.table_name || submission.report_type || `Report #${submission.id}`;
            const status = submission.status || 'pending';
            const submittedDate = new Date(submission.submitted_at || submission.created_at);
            const formattedDate = submittedDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
            const reportTypeIcons = {
                'campuspopulation': 'building',
                'admissiondata': 'user-graduate',
                'enrollmentdata': 'user-plus',
                'graduatesdata': 'user-graduate',
                'employee': 'user-tie',
                'leaveprivilege': 'calendar-alt',
                'disabilitydata': 'wheelchair',
                'wastedata': 'trash',
                'vehicledata': 'car',
                'fueldata': 'gas-pump',
                'waterdata': 'tint',
                'electricitydata': 'bolt'
            };
            const iconName = reportTypeIcons[reportType.toLowerCase()] || 'file-alt';
            
            return `
                <tr>
                    <td>${trackingId}</td>
                    <td>
                        <span class="product-icon" style="background: #e0e7ff; color: #3b82f6;">
                            <i class="fas fa-${iconName}"></i>
                        </span>
                        ${reportType}
                    </td>
                    <td>
                        <span class="status-badge-modern ${status}">${status}</span>
                    </td>
                    <td class="price-value">${formattedDate}</td>
                </tr>
            `;
        }).join('');
    }
    
    // New Advanced Dashboard Functions
    async loadKPICards() {
        try {
            console.log('Loading KPI cards...');
            const [usersResponse, submissionsResponse] = await Promise.all([
                fetch(this.isSuperAdmin || !this.userCampus
                    ? 'api/users.php?action=list'
                    : `api/users.php?action=list&campus=${encodeURIComponent(this.userCampus)}`),
                fetch('api/get_all_submissions.php')
            ]);
            
            const usersResult = await usersResponse.json();
            const submissionsResult = await submissionsResponse.json();
            
            if (usersResult.success && submissionsResult.success) {
                const users = usersResult.users || [];
                const submissions = submissionsResult.data || [];
                
                // Calculate KPI values
                const totalSubmissions = submissions.length;
                const activeUsers = users.filter(u => u.status === 'active').length;
                const totalUsers = users.length;
                const uniqueReportTypes = new Set(submissions.map(s => (s.table_name || s.report_type || '').trim()).filter(Boolean));
                const totalReports = uniqueReportTypes.size;
                
                // Calculate percentage changes (simulate based on previous period)
                // In real scenario, you'd compare current vs previous period
                const submissionsChange = 12; // Mock percentage
                const activeUsersChange = 8;
                const totalUsersChange = 10;
                const reportsChange = 15;
                
                // Update KPI Cards
                this.updateKPICard('kpiTotalSubmissions', totalSubmissions, submissionsChange, 'kpiSubmissionsChart');
                this.updateKPICard('kpiActiveUsers', activeUsers, activeUsersChange, 'kpiActiveUsersChart');
                this.updateKPICard('kpiTotalUsers', totalUsers, totalUsersChange, 'kpiTotalUsersChart');
                this.updateKPICard('kpiTotalReports', totalReports, reportsChange, 'kpiReportsChart');
                
                // Update change indicators
                this.updateKPIChange('kpiSubmissionsChange', submissionsChange);
                this.updateKPIChange('kpiActiveUsersChange', activeUsersChange);
                this.updateKPIChange('kpiTotalUsersChange', totalUsersChange);
                this.updateKPIChange('kpiReportsChange', reportsChange);
                
                // Create mini charts
                this.createMiniCharts(submissions);
            }
        } catch (error) {
            console.error('Error loading KPI cards:', error);
        }
    }
    
    updateKPICard(valueId, value, change, chartId, isPercentage = false) {
        const valueEl = document.getElementById(valueId);
        if (valueEl) {
            if (isPercentage) {
                valueEl.textContent = value;
            } else {
                valueEl.textContent = typeof value === 'number' ? value.toLocaleString() : value;
            }
        }
    }
    
    updateKPIChange(changeId, change) {
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
    
    createMiniCharts(submissions) {
        // Create mini sparkline charts for KPI cards
        const chartIds = ['kpiSubmissionsChart', 'kpiActiveUsersChart', 'kpiTotalUsersChart', 'kpiReportsChart'];
        
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
                    const subDate = new Date(s.submitted_at || s.created_at);
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
            
            const colors = ['#3b82f6', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];
            container.innerHTML = `
                <svg width="${width}" height="${height}" style="width: 100%; height: 100%;">
                    <polyline points="${points}" fill="none" stroke="${colors[index]}" stroke-width="2"/>
                </svg>
            `;
        });
    }
    
    async loadSubmissionsGrowthChart() {
        try {
            const response = await fetch('api/get_all_submissions.php');
            const result = await response.json();
            
            if (result.success) {
                const submissions = result.data || [];
                this.createSubmissionsGrowthChart(submissions);
            }
        } catch (error) {
            console.error('Error loading growth chart:', error);
        }
    }
    
    createSubmissionsGrowthChart(submissions) {
        const ctx = document.getElementById('submissionsGrowthChart');
        if (!ctx) return;
        
        if (this.submissionsGrowthChart) {
            this.submissionsGrowthChart.destroy();
        }
        
        // Group by month for yearly view
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = months.map((month, index) => {
            return submissions.filter(s => {
                const date = new Date(s.submitted_at || s.created_at);
                return date.getMonth() === index;
            }).length;
        });
        
        // Use actual data values - no scaling
        const actualData = monthlyData;
        const maxValue = Math.max(...actualData, 1);
        
        // Calculate step size based on max value (round up to nice number)
        let maxY = Math.ceil(maxValue / 5) * 5; // Round to nearest 5
        if (maxValue === 0) maxY = 5; // Default to 5 if no data
        const stepSize = Math.max(1, Math.ceil(maxY / 5)); // Nice step size
        
        this.submissionsGrowthChart = new Chart(ctx, {
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
                            color: '#6b7280',
                            callback: function(value) {
                                return value;
                            }
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
    
    async loadSubmissionsMonthlyChart() {
        try {
            const response = await fetch('api/get_all_submissions.php');
            const result = await response.json();
            
            if (result.success) {
                const submissions = result.data || [];
                this.createSubmissionsMonthlyChart(submissions);
            }
        } catch (error) {
            console.error('Error loading monthly chart:', error);
        }
    }
    
    createSubmissionsMonthlyChart(submissions) {
        const ctx = document.getElementById('submissionsMonthlyChart');
        if (!ctx) return;
        
        if (this.submissionsMonthlyChart) {
            this.submissionsMonthlyChart.destroy();
        }
        
        // Group by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = months.map((month, index) => {
            return submissions.filter(s => {
                const date = new Date(s.submitted_at || s.created_at);
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
        const growthEl = document.getElementById('monthlyReportGrowth');
        if (growthEl) {
            growthEl.className = `report-growth-indicator ${growthRate >= 0 ? 'positive' : 'negative'}`;
            const span = growthEl.querySelector('span');
            if (span) {
                span.textContent = Math.abs(growthRate) + '%';
            }
        }
        
        // Update footer metrics
        const impressionsEl = document.getElementById('monthlyImpressions');
        const reachEl = document.getElementById('monthlyReach');
        const growthEl2 = document.getElementById('monthlyGrowth');
        
        if (impressionsEl) impressionsEl.textContent = currentCount.toLocaleString();
        if (reachEl) reachEl.textContent = submissions.filter(s => s.status === 'approved').length.toLocaleString();
        if (growthEl2) growthEl2.textContent = growthRate + '%';
        
        // Scale data for better visualization
        const maxData = Math.max(...monthlyData, 1);
        const scaledData = monthlyData.map(val => (val / maxData) * 100);
        
        this.submissionsMonthlyChart = new Chart(ctx, {
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
    
    async loadUserStatusList() {
        try {
            const usersUrl = this.isSuperAdmin || !this.userCampus
                ? 'api/users.php?action=list'
                : `api/users.php?action=list&campus=${encodeURIComponent(this.userCampus)}`;
            
            const response = await fetch(usersUrl);
            const result = await response.json();
            
            if (result.success) {
                const users = result.users || [];
                this.populateUserStatusList(users.slice(0, 5)); // Get top 5
            }
        } catch (error) {
            console.error('Error loading user status list:', error);
        }
    }
    
    populateUserStatusList(users) {
        const container = document.getElementById('userStatusList');
        if (!container) return;
        
        if (users.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 40px;">No users found</p>';
            return;
        }
        
        const avatarColors = ['blue', 'red', 'green', 'purple', 'orange'];
        const progressColors = ['#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b'];
        
        container.innerHTML = users.map((user, index) => {
            const avatarColor = avatarColors[index % avatarColors.length];
            const progressColor = progressColors[index % progressColors.length];
            const initials = (user.name || user.username || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            
            // Calculate user activity percentage (based on status or submissions)
            const activityPercentage = user.status === 'active' ? 
                (70 + Math.random() * 30) : // Active users: 70-100%
                (Math.random() * 40); // Inactive users: 0-40%
            
            return `
                <div class="user-status-item">
                    <div class="user-avatar ${avatarColor}">${initials}</div>
                    <div class="user-info">
                        <div class="user-name">${user.name || user.username || 'Unknown'}</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div class="user-progress-bar">
                                <div class="user-progress-fill" style="width: ${activityPercentage}%; background: ${progressColor};"></div>
                            </div>
                            <span class="user-progress-value">${Math.round(activityPercentage)}%</span>
                        </div>
                    </div>
                    <i class="fas fa-chevron-right user-action-arrow"></i>
                </div>
            `;
        }).join('');
    }
    
    async loadReportsByType() {
        try {
            const response = await fetch('api/get_all_submissions.php');
            const result = await response.json();
            
            if (result.success) {
                const submissions = result.data || [];
                this.createReportsByTypeChart(submissions);
            }
        } catch (error) {
            console.error('Error loading reports by type:', error);
        }
    }
    
    createReportsByTypeChart(submissions) {
        const ctx = document.getElementById('reportsByTypeChart');
        if (!ctx) return;
        
        if (this.reportsByTypeChart) {
            this.reportsByTypeChart.destroy();
        }
        
        // Group submissions by report type (table_name)
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
            .sort((a, b) => b[1] - a[1]);
        
        const total = Object.values(reportTypeCounts).reduce((a, b) => a + b, 0);
        const totalReportTypes = Object.keys(reportTypeCounts).length;
        
        // Update center text - show total report types
        const centerText = document.getElementById('reportTypeChartCenterText');
        if (centerText) {
            centerText.textContent = totalReportTypes;
            centerText.style.fontSize = '20px';
            centerText.style.fontWeight = '700';
            centerText.style.lineHeight = '1.2';
        }
        
        // Prepare data for chart - use all report types or top 5
        const topTypes = sortedTypes.slice(0, 5);
        const labels = topTypes.map(([type]) => this.formatReportTypeName(type));
        const data = topTypes.map(([, count]) => count);
        const colors = ['#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];
        
        this.reportsByTypeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, data.length),
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
                        borderRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Create legend
        const legend = document.getElementById('reportTypeChartLegend');
        if (legend) {
            legend.innerHTML = topTypes.map(([type, count], index) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                const color = colors[index % colors.length];
                const formattedName = this.formatReportTypeName(type);
                return `
                    <div class="donut-legend-item">
                        <div class="donut-legend-dot" style="background: ${color};"></div>
                        <span class="donut-legend-label">${formattedName}</span>
                        <span class="donut-legend-value">${percentage}%</span>
                    </div>
                `;
            }).join('');
        }
    }
    
    formatReportTypeName(type) {
        if (!type) return 'Unknown';
        
        // Format report type names for better display
        const nameMap = {
            'campuspopulation': 'Campus Population',
            'admissiondata': 'Admission Data',
            'enrollmentdata': 'Enrollment Data',
            'graduatesdata': 'Graduates Data',
            'employee': 'Employee',
            'pwd': 'PWD',
            'leaveprivilege': 'Leave Privilege',
            'disabilitydata': 'Disability Data',
            'wastedata': 'Waste Data',
            'vehicledata': 'Vehicle Data',
            'fueldata': 'Fuel Data',
            'waterdata': 'Water Data',
            'electricitydata': 'Electricity Data'
        };
        
        const lowerType = type.toLowerCase().trim();
        if (nameMap[lowerType]) {
            return nameMap[lowerType];
        }
        
        // Handle acronyms (like PWD) - check if all uppercase or all lowercase short words
        if (type.length <= 5 && (type === type.toUpperCase() || type === type.toLowerCase())) {
            // If it's a short acronym-like string, check common acronyms
            const acronymMap = {
                'pwd': 'PWD',
                'pwddata': 'PWD Data'
            };
            if (acronymMap[lowerType]) {
                return acronymMap[lowerType];
            }
            // If it's uppercase or looks like an acronym, return uppercase
            if (lowerType.length <= 4) {
                return type.toUpperCase();
            }
        }
        
        // Convert camelCase or snake_case to readable format
        let formatted = type
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
        
        // Split common compound words
        formatted = formatted.replace(/Data/g, ' Data');
        
        return formatted.trim();
    }
    
    async loadTopActiveReports() {
        try {
            const response = await fetch('api/get_all_submissions.php');
            const result = await response.json();
            
            if (result.success) {
                const submissions = result.data || [];
                this.populateTopActiveReports(submissions);
            }
        } catch (error) {
            console.error('Error loading top active reports:', error);
        }
    }
    
    populateTopActiveReports(submissions) {
        const tbody = document.querySelector('#topReportsTable tbody');
        if (!tbody) return;
        
        // Group by report type
        const reportTypeCounts = {};
        submissions.forEach(s => {
            const reportType = (s.table_name || s.report_type || 'Unknown').trim();
            if (!reportTypeCounts[reportType]) {
                reportTypeCounts[reportType] = { count: 0, approved: 0 };
            }
            reportTypeCounts[reportType].count++;
            if (s.status === 'approved') {
                reportTypeCounts[reportType].approved++;
            }
        });
        
        // Sort by count and get top 5
        const topReports = Object.entries(reportTypeCounts)
            .map(([type, data]) => ({
                type,
                count: data.count,
                approved: data.approved,
                rate: data.count > 0 ? Math.round((data.approved / data.count) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        if (topReports.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 40px; color: #9ca3af;">
                        No reports found
                    </td>
                </tr>
            `;
            return;
        }
        
        const reportTypeIcons = {
            'campuspopulation': 'building',
            'admissiondata': 'user-graduate',
            'enrollmentdata': 'user-plus',
            'graduatesdata': 'user-graduate',
            'employee': 'user-tie',
            'pwd': 'user-shield',
            'pwddata': 'user-shield',
            'leaveprivilege': 'calendar-alt',
            'disabilitydata': 'wheelchair',
            'wastedata': 'trash',
            'vehicledata': 'car',
            'fueldata': 'gas-pump',
            'waterdata': 'tint',
            'electricitydata': 'bolt'
        };
        
        tbody.innerHTML = topReports.map(report => {
            const iconName = reportTypeIcons[report.type.toLowerCase()] || 'file-alt';
            const formattedType = this.formatReportTypeName(report.type);
            
            return `
                <tr>
                    <td>
                        <div class="report-type-cell">
                            <div class="report-type-icon" style="background: #e0e7ff; color: #3b82f6;">
                                <i class="fas fa-${iconName}"></i>
                            </div>
                            <span>${formattedType}</span>
                        </div>
                    </td>
                    <td>${report.count}</td>
                    <td>${report.rate}%</td>
                </tr>
            `;
        }).join('');
    }
    
    async loadAnalytics() {
        console.log('Loading analytics...');
        
        try {
            const response = await fetch('api/get_all_submissions.php');
            const result = await response.json();
            
            if (result.success) {
                let submissions = result.data || [];
                
                // Filter by campus if not super admin
                if (!this.isSuperAdmin && this.userCampus) {
                    submissions = submissions.filter(s => s.campus === this.userCampus);
                    console.log(`Filtered by campus ${this.userCampus}: ${submissions.length} submissions`);
                }
                
                // Filter by table type if selected
                const tableFilter = document.getElementById('analyticsTableFilter');
                if (tableFilter && tableFilter.value !== 'all') {
                    submissions = submissions.filter(s => s.table_name === tableFilter.value);
                    console.log(`Filtered by table ${tableFilter.value}: ${submissions.length} submissions`);
                }
                
                // Filter by time range
                const timeRange = document.getElementById('analyticsTimeRange');
                if (timeRange && timeRange.value !== 'all') {
                    const now = new Date();
                    const days = parseInt(timeRange.value);
                    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
                    
                    submissions = submissions.filter(s => {
                        const submittedDate = new Date(s.submitted_at);
                        return submittedDate >= cutoffDate;
                    });
                    console.log(`Filtered by time range ${timeRange.value}: ${submissions.length} submissions`);
                }
                
                // Create charts
                this.createStatusChart(submissions);
                this.createCampusChart(submissions);
                this.createReportTypeChart(submissions);
                this.createTimelineChart(submissions);
                this.updateAnalyticsSummary(submissions);
                
                // Show active filters
                this.showActiveFilters();
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }
    
    showActiveFilters() {
        const tableFilter = document.getElementById('analyticsTableFilter');
        const timeRange = document.getElementById('analyticsTimeRange');
        const banner = document.getElementById('analyticsFilterBanner');
        const bannerText = document.getElementById('filterBannerText');
        
        let filters = [];
        
        if (tableFilter && tableFilter.value !== 'all') {
            const selectedOption = tableFilter.options[tableFilter.selectedIndex].text;
            filters.push(`Report Type: ${selectedOption}`);
        }
        
        if (timeRange && timeRange.value !== 'all') {
            const selectedOption = timeRange.options[timeRange.selectedIndex].text;
            filters.push(`Time: ${selectedOption}`);
        }
        
        if (!this.isSuperAdmin && this.userCampus) {
            filters.push(`Campus: ${this.userCampus}`);
        }
        
        // Show/hide banner based on filters
        if (banner && bannerText) {
            if (filters.length > 0) {
                bannerText.textContent = filters.join(' | ');
                banner.style.display = 'flex';
            } else {
                banner.style.display = 'none';
            }
        }
    }
    
    clearAnalyticsFilters() {
        const tableFilter = document.getElementById('analyticsTableFilter');
        const timeRange = document.getElementById('analyticsTimeRange');
        
        if (tableFilter) tableFilter.value = 'all';
        if (timeRange) timeRange.value = 'all';
        
        this.loadAnalytics();
        this.showNotification('Filters cleared', 'info');
    }
    
    // System Settings Methods
    saveSystemSettings() {
        const settings = {
            systemName: document.getElementById('settingSystemName')?.value,
            recordsPerPage: document.getElementById('settingRecordsPerPage')?.value,
            maintenanceMode: document.getElementById('settingMaintenanceMode')?.checked,
            maxFileSize: document.getElementById('settingMaxFileSize')?.value,
            exportFormat: document.getElementById('settingExportFormat')?.value
        };
        
        // Save to localStorage for now (in production, save to database)
        localStorage.setItem('systemSettings', JSON.stringify(settings));
        
        console.log('Settings saved:', settings);
        this.showNotification('System settings saved successfully!', 'success');
        
        // Apply maintenance mode if enabled
        if (settings.maintenanceMode) {
            this.showNotification('Maintenance mode enabled - Users will not be able to access the system', 'info');
        }
    }
    
    loadSystemSettings() {
        const savedSettings = localStorage.getItem('systemSettings');
        if (!savedSettings) return;
        
        try {
            const settings = JSON.parse(savedSettings);
            
            // Apply saved settings to form
            if (settings.systemName) document.getElementById('settingSystemName').value = settings.systemName;
            if (settings.recordsPerPage) document.getElementById('settingRecordsPerPage').value = settings.recordsPerPage;
            if (settings.maintenanceMode !== undefined) document.getElementById('settingMaintenanceMode').checked = settings.maintenanceMode;
            if (settings.maxFileSize) document.getElementById('settingMaxFileSize').value = settings.maxFileSize;
            if (settings.exportFormat) document.getElementById('settingExportFormat').value = settings.exportFormat;
            
            console.log('Settings loaded:', settings);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    createBackup() {
        this.showNotification('Creating database backup...', 'info');
        
        // Simulate backup creation
        setTimeout(() => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `spartan_data_backup_${timestamp}.sql`;
            
            this.showNotification(`Backup created: ${filename}`, 'success');
            console.log('Backup created:', filename);
            
            // In production, this would call an API to create actual backup
            // For now, just show success message
        }, 2000);
    }
    
    restoreBackup() {
        const confirmed = confirm('Are you sure you want to restore from backup? This will overwrite current data.');
        
        if (!confirmed) return;
        
        this.showNotification('Restore from backup functionality - Coming soon', 'info');
        console.log('Restore backup requested');
        
        // In production, this would show file picker and restore from selected backup
    }
    
    createStatusChart(submissions) {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;
        
        // Status chart removed - no longer showing status breakdown
        // Destroy existing chart if it exists
        if (this.statusChart) {
            this.statusChart.destroy();
            this.statusChart = null;
        }
        
        return;
        
        // Chart code removed - keeping structure for potential future use
        this.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 13,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }
    
    createCampusChart(submissions) {
        const ctx = document.getElementById('campusChart');
        if (!ctx) return;
        
        // Count submissions by campus
        const campusCounts = {};
        submissions.forEach(s => {
            const campus = s.campus || 'Unknown';
            campusCounts[campus] = (campusCounts[campus] || 0) + 1;
        });
        
        const campuses = Object.keys(campusCounts).sort();
        const counts = campuses.map(c => campusCounts[c]);
        
        // Destroy existing chart if it exists
        if (this.campusChart) {
            this.campusChart.destroy();
        }
        
        this.campusChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: campuses,
                datasets: [{
                    label: 'Submissions',
                    data: counts,
                    backgroundColor: '#dc143c',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    createReportTypeChart(submissions) {
        const ctx = document.getElementById('reportTypeChart');
        if (!ctx) return;
        
        // Count submissions by report type
        const typeCounts = {};
        submissions.forEach(s => {
            const type = this.formatTableName(s.table_name);
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        const types = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a]);
        const counts = types.map(t => typeCounts[t]);
        
        // Destroy existing chart if it exists
        if (this.reportTypeChart) {
            this.reportTypeChart.destroy();
        }
        
        this.reportTypeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: types,
                datasets: [{
                    label: 'Submissions',
                    data: counts,
                    backgroundColor: '#dc143c',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    createTimelineChart(submissions) {
        const ctx = document.getElementById('timelineChart');
        if (!ctx) return;
        
        // Group submissions by date
        const dateCounts = {};
        submissions.forEach(s => {
            const date = new Date(s.submitted_at).toLocaleDateString();
            dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
        
        const dates = Object.keys(dateCounts).sort((a, b) => new Date(a) - new Date(b));
        const counts = dates.map(d => dateCounts[d]);
        
        // Destroy existing chart if it exists
        if (this.timelineChart) {
            this.timelineChart.destroy();
        }
        
        this.timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Submissions',
                    data: counts,
                    borderColor: '#dc143c',
                    backgroundColor: 'rgba(220, 20, 60, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: '#dc143c',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    updateAnalyticsSummary(submissions) {
        const total = submissions.length;
        const approved = submissions.filter(s => s.status === 'approved').length;
        const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;
        
        const campuses = [...new Set(submissions.map(s => s.campus))].filter(c => c);
        const activeCampuses = campuses.length;
        
        // Update summary cards
        const totalEl = document.getElementById('analyticsTotalSubmissions');
        const approvalEl = document.getElementById('analyticsApprovalRate');
        const campusesEl = document.getElementById('analyticsActiveCampuses');
        
        if (totalEl) totalEl.textContent = total;
        if (approvalEl) approvalEl.textContent = approvalRate + '%';
        if (campusesEl) campusesEl.textContent = activeCampuses;
        
        // Calculate average processing time (if timestamps available)
        const processedSubmissions = submissions.filter(s => s.status !== 'pending' && s.updated_at);
        if (processedSubmissions.length > 0) {
            const avgTime = processedSubmissions.reduce((sum, s) => {
                const submitted = new Date(s.submitted_at);
                const updated = new Date(s.updated_at);
                const hours = (updated - submitted) / (1000 * 60 * 60);
                return sum + hours;
            }, 0) / processedSubmissions.length;
            
            const timeEl = document.getElementById('analyticsAvgTime');
            if (timeEl) {
                if (avgTime < 24) {
                    timeEl.textContent = avgTime.toFixed(1) + 'h';
                } else {
                    timeEl.textContent = (avgTime / 24).toFixed(1) + 'd';
                }
            }
        }
    }
    
    async loadDashboardStats() {
        try {
            // Load user statistics
            const usersUrl = this.isSuperAdmin || !this.userCampus
                ? 'api/users.php?action=list'
                : `api/users.php?action=list&campus=${encodeURIComponent(this.userCampus)}`;
            const usersResponse = await fetch(usersUrl);
            const usersResult = await usersResponse.json();
            
            if (usersResult.success) {
                let users = usersResult.users;
                
                // Filter by campus if not super admin
                if (!this.isSuperAdmin && this.userCampus) {
                    users = users.filter(u => 
                        u.campus === this.userCampus || 
                        u.role === 'super_admin' ||
                        u.campus === 'All Campuses'
                    );
                    console.log(`Filtered users for ${this.userCampus}: ${users.length} users`);
                }
                
                const totalUsers = users.length;
                const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
                const activeUsers = users.filter(u => u.status === 'active').length;
                const inactiveUsers = users.filter(u => u.status !== 'active').length;
                
                // Update dashboard stats
                const dashTotalUsers = document.getElementById('dashTotalUsers');
                const dashAdminUsers = document.getElementById('dashAdminUsers');
                const dashActiveUsers = document.getElementById('dashActiveUsers');
                const dashInactiveUsers = document.getElementById('dashInactiveUsers');
                
                if (dashTotalUsers) dashTotalUsers.textContent = totalUsers;
                if (dashAdminUsers) dashAdminUsers.textContent = adminUsers;
                if (dashActiveUsers) dashActiveUsers.textContent = activeUsers;
                if (dashInactiveUsers) dashInactiveUsers.textContent = inactiveUsers;
            }
            
            // Load submission statistics
            const submissionsResponse = await fetch('api/get_all_submissions.php');
            const submissionsResult = await submissionsResponse.json();
            
            if (submissionsResult.success) {
                let submissions = submissionsResult.data || [];
                
                // Filter by campus if not super admin
                if (!this.isSuperAdmin && this.userCampus) {
                    submissions = submissions.filter(s => s.campus === this.userCampus);
                    console.log(`Filtered submissions for ${this.userCampus}: ${submissions.length} submissions`);
                }
                
                const totalReports = submissions.length;
                // Update dashboard stats
                const dashTotalReports = document.getElementById('dashTotalReports');
                
                if (dashTotalReports) dashTotalReports.textContent = totalReports;
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }
    
    async loadRecentSubmissions() {
        try {
            const response = await fetch('api/get_all_submissions.php');
            const result = await response.json();
            
            if (result.success) {
                let submissions = result.data || [];
                
                // Filter by campus if not super admin
                if (!this.isSuperAdmin && this.userCampus) {
                    submissions = submissions.filter(s => s.campus === this.userCampus);
                    console.log(`Filtered recent submissions for ${this.userCampus}: ${submissions.length} submissions`);
                }
                
                const recent = submissions.slice(0, 5); // Get last 5 submissions
                
                const container = document.getElementById('recentSubmissionsList');
                if (!container) return;
                
                if (recent.length === 0) {
                    container.innerHTML = `
                        <div class="loading-state">
                            <i class="fas fa-inbox"></i>
                            <p>No recent submissions</p>
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = recent.map(sub => `
                    <div class="submission-item" style="padding: 15px; border-bottom: 1px solid #f0f0f0; cursor: pointer;" onclick="adminDashboard.viewSubmissionDetails('${sub.table_name}', '${sub.id}')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${this.formatTableName(sub.table_name)}</strong>
                                <p style="margin: 5px 0; color: #666; font-size: 13px;">${sub.campus || 'Unknown'} - ${sub.office || 'Unknown'}</p>
                            </div>
                            <span class="status-badge status-${sub.status}">${sub.status}</span>
                        </div>
                        <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">${new Date(sub.submitted_at).toLocaleString()}</p>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading recent submissions:', error);
        }
    }
    
    async loadUserActivity() {
        try {
            console.log('Loading user activities...');
            
            // Get filter values
            const campusFilter = document.getElementById('activityCampusFilter')?.value || '';
            const dateFrom = document.getElementById('activityDateFromFilter')?.value || '';
            const dateTo = document.getElementById('activityDateToFilter')?.value || '';
            
            // Build query string
            const params = new URLSearchParams();
            if (campusFilter) params.append('campus', campusFilter);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            
            const url = 'api/user_activities.php' + (params.toString() ? '?' + params.toString() : '');
            
            const response = await fetch(url, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                const activities = result.activities || [];
                this.allActivities = activities;
                
                // Setup campus filter dropdown if not already populated
                this.setupActivityCampusFilter(result.available_campuses || []);
                
                console.log(`Loaded ${activities.length} activities`);
                
                // Display activities
                this.displayActivities(activities);
            } else {
                console.error('Failed to load user activities:', result.error);
                const container = document.getElementById('userActivityList');
                if (container) {
                    container.innerHTML = `
                        <div class="loading-state" style="text-align: center; padding: 40px;">
                            <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #ef4444; margin-bottom: 15px; display: block;"></i>
                            <p style="color: #666;">Error loading activities: ${result.error}</p>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error loading user activities:', error);
            const container = document.getElementById('userActivityList');
            if (container) {
                container.innerHTML = `
                    <div class="loading-state" style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #ef4444; margin-bottom: 15px; display: block;"></i>
                        <p style="color: #666;">Error: ${error.message}</p>
                    </div>
                `;
            }
        }
    }
    
    setupActivityCampusFilter(availableCampuses) {
        const campusFilter = document.getElementById('activityCampusFilter');
        if (!campusFilter) return;
        
        // Only populate if dropdown is empty or has only default option
        if (campusFilter.options.length <= 1) {
            // Clear existing options except "All Campuses"
            campusFilter.innerHTML = '<option value="">All Campuses</option>';
            
            // Add available campuses
            availableCampuses.forEach(campus => {
                const option = document.createElement('option');
                option.value = campus;
                option.textContent = campus;
                campusFilter.appendChild(option);
            });
        }
    }
    
    displayActivities(activities) {
        const container = document.getElementById('userActivityList');
        if (!container) return;
        
        // Update count badge
        const countBadge = document.getElementById('activityCountBadge');
        if (countBadge) {
            countBadge.textContent = activities.length;
        }
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 16px; border: 2px dashed #e2e8f0;">
                    <div style="
                        width: 80px;
                        height: 80px;
                        margin: 0 auto 20px;
                        background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    ">
                        <i class="fas fa-user-clock" style="font-size: 36px; color: #94a3b8;"></i>
                    </div>
                    <h3 style="
                        font-size: 18px;
                        color: #1e293b;
                        font-weight: 700;
                        margin: 0 0 10px 0;
                        background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    ">No Activity Found</h3>
                    <p style="color: #64748b; font-size: 14px; margin: 0; font-weight: 500;">Try adjusting your filters to see more activities</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activities.map((activity, index) => {
            const timeAgo = this.getTimeAgo(new Date(activity.created_at));
            const dateTime = new Date(activity.created_at).toLocaleString();
            
            // Enhanced color gradients based on action type
            const gradientColors = {
                'login': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                'logout': 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                'report_submission': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                'data_submission': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                'report_approved': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                'report_rejected': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                'user_created': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                'user_updated': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                'user_deleted': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            };
            
            const bgGradient = gradientColors[activity.action] || `linear-gradient(135deg, ${activity.action_color} 0%, ${activity.action_color}dd 100%)`;
            const iconBg = `linear-gradient(135deg, ${activity.action_color}20, ${activity.action_color}35)`;
            
            return `
                <div class="activity-item-enhanced" style="
                    padding: 20px;
                    margin-bottom: 12px;
                    background: linear-gradient(to right, white 0%, #fafbfc 100%);
                    border-left: 4px solid ${activity.action_color};
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                " data-index="${index}">
                    <!-- Background Pattern -->
                    <div style="
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 120px;
                        height: 120px;
                        background: ${iconBg};
                        border-radius: 50%;
                        transform: translate(30px, -30px);
                        opacity: 0.3;
                        z-index: 0;
                    "></div>
                    
                    <div style="display: flex; align-items: flex-start; gap: 18px; position: relative; z-index: 1;">
                        <!-- Enhanced Icon Container -->
                        <div style="
                            width: 56px;
                            height: 56px;
                            border-radius: 16px;
                            background: ${bgGradient};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            flex-shrink: 0;
                            box-shadow: 0 4px 12px ${activity.action_color}40, 0 2px 4px rgba(0,0,0,0.1);
                            position: relative;
                            overflow: hidden;
                        ">
                            <div style="
                                position: absolute;
                                top: -50%;
                                left: -50%;
                                width: 200%;
                                height: 200%;
                                background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
                                animation: shimmer 3s infinite;
                            "></div>
                            <i class="fas ${activity.action_icon}" style="color: white; font-size: 24px; position: relative; z-index: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));"></i>
                        </div>
                        
                        <div style="flex: 1; min-width: 0;">
                            <!-- User Info with Enhanced Styling -->
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
                                <strong style="
                                    font-size: 16px;
                                    color: #1a202c;
                                    font-weight: 700;
                                    background: linear-gradient(135deg, #1a202c 0%, #4a5568 100%);
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    background-clip: text;
                                ">${activity.user_name || 'Unknown User'}</strong>
                                <span style="
                                    font-size: 12px;
                                    color: #718096;
                                    font-weight: 500;
                                    padding: 2px 8px;
                                    background: #f1f5f9;
                                    border-radius: 8px;
                                ">${activity.username || 'N/A'}</span>
                                <span style="
                                    font-size: 11px;
                                    color: white;
                                    font-weight: 600;
                                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                    padding: 4px 12px;
                                    border-radius: 20px;
                                    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                ">${activity.user_campus || 'Unknown'}</span>
                                ${activity.user_office ? `<span style="
                                    font-size: 11px;
                                    color: white;
                                    font-weight: 600;
                                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                                    padding: 4px 12px;
                                    border-radius: 20px;
                                    box-shadow: 0 2px 4px rgba(245, 87, 108, 0.3);
                                ">${activity.user_office}</span>` : ''}
                            </div>
                            
                            <!-- Action Badge with Enhanced Design -->
                            <div style="
                                display: inline-flex;
                                align-items: center;
                                gap: 8px;
                                margin-bottom: 8px;
                                padding: 6px 14px;
                                background: ${iconBg};
                                border-radius: 20px;
                                border: 1px solid ${activity.action_color}30;
                                box-shadow: 0 2px 4px ${activity.action_color}20;
                            ">
                                <i class="fas ${activity.action_icon}" style="color: ${activity.action_color}; font-size: 13px;"></i>
                                <span style="
                                    font-size: 13px;
                                    color: ${activity.action_color};
                                    font-weight: 700;
                                    letter-spacing: 0.3px;
                                ">${activity.action_label}</span>
                            </div>
                            
                            <!-- Description with Enhanced Typography -->
                            ${activity.description ? `<div style="
                                margin: 8px 0 0 0;
                                padding: 10px 14px;
                                background: linear-gradient(to right, #f8f9fa 0%, #ffffff 100%);
                                border-left: 3px solid ${activity.action_color};
                                border-radius: 8px;
                                color: #2d3748;
                                font-size: 13px;
                                line-height: 1.6;
                                font-weight: 500;
                                box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
                            ">${activity.description}</div>` : ''}
                            
                            <!-- Metadata Footer -->
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 16px;
                                margin-top: 12px;
                                padding-top: 12px;
                                border-top: 1px solid #e2e8f0;
                                flex-wrap: wrap;
                            ">
                                <span style="
                                    font-size: 12px;
                                    color: #64748b;
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    font-weight: 500;
                                    padding: 4px 10px;
                                    background: #f8f9fa;
                                    border-radius: 8px;
                                ">
                                    <i class="fas fa-clock" style="color: #64748b; font-size: 11px;"></i>
                                    <span>${dateTime}</span>
                                </span>
                                ${activity.ip_address ? `<span style="
                                    font-size: 12px;
                                    color: #64748b;
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    font-weight: 500;
                                    padding: 4px 10px;
                                    background: #f8f9fa;
                                    border-radius: 8px;
                                ">
                                    <i class="fas fa-network-wired" style="color: #64748b; font-size: 11px;"></i>
                                    <span>${activity.ip_address}</span>
                                </span>` : ''}
                            </div>
                        </div>
                        
                        <!-- Time Ago Badge -->
                        <div style="
                            text-align: right;
                            flex-shrink: 0;
                            padding: 6px 12px;
                            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
                            border-radius: 20px;
                            color: #475569;
                            font-size: 11px;
                            font-weight: 600;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                            white-space: nowrap;
                        ">
                            ${timeAgo}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add enhanced hover effects and animations
        const activityItems = container.querySelectorAll('.activity-item-enhanced');
        activityItems.forEach((item, index) => {
            // Add stagger animation on load
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 50);
            }, index * 50);
            
            item.addEventListener('mouseenter', function() {
                const borderColor = this.style.borderLeftColor || '#dc3545';
                this.style.background = `linear-gradient(to right, #ffffff 0%, #f8fafc 100%)`;
                this.style.boxShadow = `0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08), 0 0 0 1px ${borderColor}20`;
                this.style.transform = 'translateY(-4px) scale(1.01)';
                this.style.borderLeftWidth = '5px';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.background = 'linear-gradient(to right, white 0%, #fafbfc 100%)';
                this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)';
                this.style.transform = 'translateY(0) scale(1)';
                this.style.borderLeftWidth = '4px';
            });
        });
    }
    
    filterUserActivity() {
        // Reload activities with current filters
        this.loadUserActivity();
    }
    
    clearActivityFilters() {
        const campusFilter = document.getElementById('activityCampusFilter');
        const dateFrom = document.getElementById('activityDateFromFilter');
        const dateTo = document.getElementById('activityDateToFilter');
        
        if (campusFilter) campusFilter.value = '';
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        
        // Reload activities
        this.loadUserActivity();
    }

    getTimeAgo(date) {
        if (!date) return 'Unknown';
        
        const now = new Date();
        const time = new Date(date);
        const diff = now - time;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        
        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }

    // User Management Methods
    /**
     * Setup campus dropdown for user management section
     */
    setupUsersCampusFilter() {
        // Ensure session is loaded
        if (!this.userCampus && !this.isSuperAdmin) {
            this.getUserSession();
        }
        
        const campusFilter = document.getElementById('usersCampusFilter');
        const filterGroup = document.getElementById('usersCampusFilterGroup');
        
        if (!campusFilter || !filterGroup) {
            console.warn('User campus filter elements not found');
            return;
        }
        
        const accessibleCampuses = this.getAccessibleCampuses();
        console.log('Setting up users campus filter. Accessible campuses:', accessibleCampuses, 'Should show dropdown:', this.shouldShowCampusDropdown());
        
        if (!this.shouldShowCampusDropdown()) {
            // Hide campus dropdown for solo campuses
            filterGroup.style.display = 'none';
            console.log('Hiding users campus dropdown for solo campus');
            return;
        }
        
        // Show dropdown and populate with accessible campuses
        filterGroup.style.display = '';
        campusFilter.innerHTML = '<option value="">All Campus</option>';
        
        accessibleCampuses.forEach(campus => {
            const option = document.createElement('option');
            option.value = campus;
            option.textContent = campus;
            campusFilter.appendChild(option);
        });
        
        // Re-attach event listener after repopulating dropdown
        campusFilter.removeEventListener('change', this.filterUsers.bind(this));
        campusFilter.addEventListener('change', () => {
            console.log('Users campus filter changed to:', campusFilter.value);
            this.filterUsers();
        });
        
        console.log('Populated users campus dropdown with', accessibleCampuses.length, 'campuses');
    }

    filterUsers() {
        const campusFilter = document.getElementById('usersCampusFilter')?.value || '';
        const accessibleCampuses = this.getAccessibleCampuses();
        
        console.log('=== Filtering Users ===');
        console.log('Filter values:', {
            campusFilter,
            accessibleCampuses,
            totalUsers: this.allUsers ? this.allUsers.length : 0
        });
        
        if (!this.allUsers || this.allUsers.length === 0) {
            console.warn('No users data available for filtering');
            return;
        }
        
        if (this.allUsers.length > 0) {
            console.log('Sample user campuses:', 
                [...new Set(this.allUsers.slice(0, 10).map(u => (u.campus || 'NULL').toString().trim()))]
            );
        }
        
        // Filter users array
        const filteredUsers = this.allUsers.filter(user => {
            const userCampus = (user.campus || '').toString().trim();
            const filterCampus = (campusFilter || '').toString().trim();
            const campusMatch = !campusFilter || userCampus.toLowerCase() === filterCampus.toLowerCase();
            
            // Check if campus is accessible (only if not super admin)
            let accessibleMatch = true;
            if (!this.isSuperAdmin && accessibleCampuses.length > 0) {
                accessibleMatch = accessibleCampuses.some(ac => 
                    ac.trim().toLowerCase() === userCampus.toLowerCase()
                );
            }
            
            const matches = campusMatch && accessibleMatch;
            
            if (campusFilter && matches) {
                console.log('✓ User match found:', {
                    userId: user.id,
                    userName: user.name,
                    userCampus: userCampus,
                    filterCampus: filterCampus
                });
            }
            
            return matches;
        });
        
        console.log('=== User Filter Results ===');
        console.log({
            filteredCount: filteredUsers.length,
            originalCount: this.allUsers.length,
            filterActive: campusFilter ? `Filtering by campus: "${campusFilter}"` : 'No campus filter'
        });
        
        if (filteredUsers.length === 0 && this.allUsers.length > 0 && campusFilter) {
            console.warn('⚠️ No users matched the filter!');
            console.warn('Available campuses in data:', [...new Set(this.allUsers.map(u => (u.campus || 'NULL').toString().trim()))]);
            console.warn('Trying to filter by:', campusFilter);
        }
        
        // Re-render table with filtered users
        this.renderUsersTable(filteredUsers);
    }

    async loadUsers() {
        try {
            console.log('Loading users...');
            const accessibleCampuses = this.getAccessibleCampuses();
            
            // For super admin, load all users
            // For campus admins, we need to load users from all accessible campuses
            let usersUrl;
            if (this.isSuperAdmin) {
                usersUrl = 'api/users.php?action=list';
            } else {
                // Build URL with multiple campuses - backend will need to handle this
                // For now, we'll load all and filter on frontend
                usersUrl = 'api/users.php?action=list';
            }
            
            const response = await fetch(usersUrl);
            const result = await response.json();
            
            if (result.success) {
                let users = result.users || [];
                
                // Store all users for filtering (don't pre-filter, let dropdown handle it)
                this.allUsers = users;
                
                // For non-super admins, filter to only show accessible campuses initially
                if (!this.isSuperAdmin) {
                    users = users.filter(user => {
                        const userCampus = (user.campus || '').toString().trim();
                        return accessibleCampuses.some(ac => 
                            ac.trim().toLowerCase() === userCampus.toLowerCase()
                        );
                    });
                    console.log(`Campus Admin (${this.userCampus}) - Showing ${users.length} users from accessible campuses:`, accessibleCampuses);
                } else {
                    console.log(`Super Admin - Loaded all ${users.length} users`);
                }
                
                // Setup campus filter dropdown after loading
                setTimeout(() => {
                    this.setupUsersCampusFilter();
                }, 100);
                
                this.renderUsersTable(users);
            } else {
                console.error('Failed to load users:', result.error);
                this.showNotification('Failed to load users', 'error');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.showNotification('Error loading users', 'error');
        }
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;"><i class="fas fa-users" style="font-size: 48px; color: #ccc; margin-bottom: 10px;"></i><p style="color: #666;">No users found</p></td></tr>';
            return;
        }
        
        // Update statistics
        this.updateUserStats(users);
        
        tbody.innerHTML = '';
        
        users.forEach((user, index) => {
            const row = document.createElement('tr');
            const statusClass = user.status === 'active' ? 'status-approved' : 
                               user.status === 'inactive' ? 'status-pending' : 'status-rejected';
            
            let roleDisplay = user.role;
            let roleBadgeClass = 'role-user';
            if (user.role === 'super_admin') {
                roleDisplay = 'Super Admin';
                roleBadgeClass = 'role-super-admin';
            } else if (user.role === 'admin') {
                roleDisplay = 'Admin';
                roleBadgeClass = 'role-admin';
            } else {
                roleDisplay = 'User';
                roleBadgeClass = 'role-user';
            }
            
            const lastLogin = user.last_login ? new Date(user.last_login).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : '<span style="color: #999;">Never</span>';
            
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="user-avatar-small">
                            <i class="fas fa-user"></i>
                        </div>
                        <strong>${user.name || '-'}</strong>
                    </div>
                </td>
                <td>${user.username || '-'}</td>
                <td data-role="${user.role || 'user'}"><span class="role-badge ${roleBadgeClass}">${roleDisplay}</span></td>
                <td>${user.campus || '-'}</td>
                <td>${user.office || '-'}</td>
                <td data-status="${user.status || 'active'}"><span class="status-badge ${statusClass}">${user.status || 'active'}</span></td>
                <td>${lastLogin}</td>
                <td class="action-buttons" style="text-align: center;">
                    <button class="btn-sm btn-view" onclick="editUser(${user.id})" title="Edit User">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateUserStats(users) {
        const totalUsers = users.length;
        const admins = users.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
        const activeUsers = users.filter(u => u.status === 'active').length;
        const inactiveUsers = users.filter(u => u.status === 'inactive' || u.status === 'suspended').length;
        
        const totalEl = document.getElementById('totalUsersCount');
        const adminEl = document.getElementById('adminCount');
        const activeEl = document.getElementById('activeUsersCount');
        const inactiveEl = document.getElementById('inactiveUsersCount');
        
        if (totalEl) totalEl.textContent = totalUsers;
        if (adminEl) adminEl.textContent = admins;
        if (activeEl) activeEl.textContent = activeUsers;
        if (inactiveEl) inactiveEl.textContent = inactiveUsers;
    }

    showAddUserModal() {
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        const title = document.getElementById('userModalTitle');
        const subtitle = modal.querySelector('.modal-subtitle');
        const passwordLabel = document.getElementById('passwordLabel');
        const campusSelect = document.getElementById('userCampus');
        const passwordInput = document.getElementById('userPassword');
        
        // Update modal title and subtitle
        title.textContent = 'Add New User';
        if (subtitle) {
            subtitle.textContent = 'Create a new user account for the system';
        }
        
        // Update password label
        if (passwordLabel) {
            passwordLabel.textContent = '';
            passwordLabel.style.display = 'none';
        }
        
        // Reset form
        form.reset();
        document.getElementById('userId').value = '';
        
        // Make password required for new users
        if (passwordInput) {
            passwordInput.required = true;
            passwordInput.placeholder = 'Enter secure password';
        }
        
        // Populate role options based on current user's role
        const roleSelect = document.getElementById('userRoleSelect');
        if (roleSelect) {
            roleSelect.innerHTML = ''; // Clear existing options
            
            if (this.isSuperAdmin) {
                // Super admin can create all roles
                roleSelect.innerHTML = `
                    <option value="user" selected>User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                `;
                // Explicitly set default value
                roleSelect.value = 'user';
            } else {
                // Regular admin can only create users
                roleSelect.innerHTML = `
                    <option value="user" selected>User</option>
                `;
                roleSelect.value = 'user';
            }
        }
        
        // Reset status dropdown to default
        const statusSelect = document.getElementById('userStatusSelect');
        if (statusSelect) {
            statusSelect.value = 'active';
        }
        
        // Reset password strength indicator
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        if (strengthFill) strengthFill.className = 'strength-fill';
        if (strengthText) {
            strengthText.textContent = 'Minimum 8 characters required with uppercase, lowercase, number, and special character';
            strengthText.style.color = '#666';
        }
        
        // Reset password confirmation field
        const passwordConfirmInput = document.getElementById('userPasswordConfirm');
        const passwordMatchError = document.getElementById('passwordMatchError');
        if (passwordConfirmInput) {
            passwordConfirmInput.value = '';
            passwordConfirmInput.required = true;
        }
        if (passwordMatchError) {
            passwordMatchError.style.display = 'none';
        }
        
        // Add event listeners for password validation
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.checkPasswordStrength());
        }
        if (passwordConfirmInput) {
            passwordConfirmInput.addEventListener('input', () => this.checkPasswordMatch());
        }
        
        // Reset campus field - don't lock it yet, let handleRoleChange handle it
        if (campusSelect) {
            campusSelect.disabled = false;
            campusSelect.value = '';
            const campusGroup = campusSelect.closest('.form-group-modern');
            const notice = campusGroup?.querySelector('.campus-lock-notice');
            if (notice) notice.remove();
        }
        
        // Call handleRoleChange to set initial state based on default role
        setTimeout(() => {
            handleRoleChange();
        }, 50);
        
        // Show modal
        modal.style.display = 'flex';
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    async showEditUserModal(userId) {
        try {
            const response = await fetch(`api/users.php?action=get&id=${userId}`);
            const result = await response.json();
            
            if (result.success) {
                const user = result.user;
                console.log('User data received:', user); // Debug log
                
                // Normalize role value (handle case sensitivity and different formats)
                const userRole = (user.role || '').toLowerCase().trim();
                console.log('Normalized user role:', userRole); // Debug log
                
                const modal = document.getElementById('userModal');
                const title = document.getElementById('userModalTitle');
                const subtitle = modal.querySelector('.modal-subtitle');
                const passwordLabel = document.getElementById('passwordLabel');
                const passwordInput = document.getElementById('userPassword');
                
                // Update modal title and subtitle
                title.textContent = 'Edit User';
                if (subtitle) {
                    subtitle.textContent = `Update information for ${user.name}`;
                }
                
                // Update password label
                if (passwordLabel) {
                    passwordLabel.textContent = '(Leave blank to keep current)';
                    passwordLabel.style.display = 'inline';
                }
                
                // Populate role options based on current user's role for editing
                const roleSelect = document.getElementById('userRoleSelect');
                // Normalize role value to match option values
                let roleValue = 'user';
                if (userRole === 'admin') {
                    roleValue = 'admin';
                } else if (userRole === 'super_admin' || userRole === 'superadmin') {
                    roleValue = 'super_admin';
                }
                
                if (roleSelect) {
                    roleSelect.innerHTML = ''; // Clear existing options
                    
                    if (this.isSuperAdmin) {
                        // Super admin can edit to all roles
                        roleSelect.innerHTML = `
                            <option value="user" ${userRole === 'user' ? 'selected' : ''}>User</option>
                            <option value="admin" ${userRole === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="super_admin" ${userRole === 'super_admin' || userRole === 'superadmin' ? 'selected' : ''}>Super Admin</option>
                        `;
                        // Explicitly set the value to ensure it's selected
                        setTimeout(() => {
                            roleSelect.value = roleValue;
                            console.log('Set role select value to:', roleSelect.value, 'from original:', user.role, 'normalized:', userRole); // Debug log
                            
                            // Verify it was set correctly
                            if (roleSelect.value !== roleValue) {
                                console.warn('Role value mismatch! Setting again...');
                                roleSelect.value = roleValue;
                            }
                        }, 100);
                    } else {
                        // Regular admin can only assign user role
                        roleSelect.innerHTML = `
                            <option value="user" selected>User</option>
                        `;
                        roleSelect.value = 'user';
                    }
                }
                
                // Reset password confirmation field for edit
                const passwordConfirmInput = document.getElementById('userPasswordConfirm');
                const passwordMatchError = document.getElementById('passwordMatchError');
                if (passwordConfirmInput) {
                    passwordConfirmInput.value = '';
                    passwordConfirmInput.required = false; // Not required when editing
                    passwordConfirmInput.placeholder = 'Re-enter password to change (optional)';
                }
                if (passwordMatchError) {
                    passwordMatchError.style.display = 'none';
                }
                
                // Fill form with user data
                document.getElementById('userId').value = user.id;
                const nameEl = document.getElementById('userName');
                if (nameEl) nameEl.value = user.name || '';
                const usernameEl = document.getElementById('userUsername');
                if (usernameEl) usernameEl.value = user.username || '';
                
                // Double-check role value is set correctly after a delay
                setTimeout(() => {
                    const roleSelectCheck = document.getElementById('userRoleSelect');
                    if (roleSelectCheck && this.isSuperAdmin) {
                        const currentRole = roleSelectCheck.value;
                        console.log('Final verification - role select value:', currentRole, 'Expected:', roleValue);
                        if (currentRole !== roleValue) {
                            roleSelectCheck.value = roleValue;
                            console.log('Corrected role select value to:', roleSelectCheck.value);
                        }
                    }
                }, 300);
                
                const statusSelect = document.getElementById('userStatusSelect');
                if (statusSelect) {
                    statusSelect.value = user.status || 'active';
                }
                document.getElementById('userCampus').value = user.campus || '';
                document.getElementById('userOffice').value = user.office || '';
                
                // Password not required for edit
                if (passwordInput) {
                    passwordInput.value = '';
                    passwordInput.required = false;
                    passwordInput.placeholder = 'Leave blank to keep current password';
                }
                
                // Reset password strength indicator
                const strengthFill = document.getElementById('strengthFill');
                const strengthText = document.getElementById('strengthText');
                if (strengthFill) strengthFill.className = 'strength-fill';
                if (strengthText) {
                    strengthText.textContent = 'Leave blank to keep current password';
                    strengthText.style.color = '#666';
                }
                
                // Handle role-based field visibility
                handleRoleChange();
                
                // Show modal
                modal.style.display = 'flex';
                
                // Focus on first input
                setTimeout(() => {
                    const firstInput = modal.querySelector('input[type="text"]');
                    if (firstInput) firstInput.focus();
                }, 100);
            } else {
                this.showNotification('Failed to load user: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error loading user:', error);
            this.showNotification('Error loading user', 'error');
        }
    }

    checkPasswordStrength() {
        const password = document.getElementById('userPassword')?.value || '';
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!strengthFill || !strengthText) return;
        
        // Password requirements: minimum 8 characters, uppercase, lowercase, number, special character
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        const requirementsMet = minLength && hasUpper && hasLower && hasNumber && hasSpecial;
        const strength = [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
        
        // Update strength bar
        strengthFill.className = 'strength-fill';
        if (requirementsMet) {
            strengthFill.style.width = '100%';
            strengthFill.style.backgroundColor = '#10b981';
            strengthText.textContent = 'Strong password';
            strengthText.style.color = '#10b981';
        } else if (strength >= 3) {
            strengthFill.style.width = '60%';
            strengthFill.style.backgroundColor = '#f59e0b';
            strengthText.textContent = 'Medium strength - add more requirements';
            strengthText.style.color = '#f59e0b';
        } else if (strength >= 1) {
            strengthFill.style.width = '30%';
            strengthFill.style.backgroundColor = '#ef4444';
            strengthText.textContent = 'Weak password - needs more requirements';
            strengthText.style.color = '#ef4444';
        } else {
            strengthFill.style.width = '0%';
            strengthText.textContent = 'Minimum 8 characters required with uppercase, lowercase, number, and special character';
            strengthText.style.color = '#666';
        }
        
        return requirementsMet;
    }
    
    checkPasswordMatch() {
        const password = document.getElementById('userPassword')?.value || '';
        const passwordConfirm = document.getElementById('userPasswordConfirm')?.value || '';
        const passwordMatchError = document.getElementById('passwordMatchError');
        
        if (!passwordMatchError) return;
        
        if (passwordConfirm && password !== passwordConfirm) {
            passwordMatchError.style.display = 'block';
            return false;
        } else {
            passwordMatchError.style.display = 'none';
            return true;
        }
    }
    
    async saveUserFromModal(event) {
        event.preventDefault();
        
        const userId = document.getElementById('userId').value;
        const isEdit = userId !== '';
        
        const username = (document.getElementById('userUsername')?.value || '').trim();
        // Use username as name since there's no separate name field in the form
        const name = username;
        const password = document.getElementById('userPassword')?.value || '';
        const passwordConfirm = document.getElementById('userPasswordConfirm')?.value || '';
        const role = document.getElementById('userRoleSelect').value;
        const status = document.getElementById('userStatusSelect')?.value || 'active';
        const campus = document.getElementById('userCampus').value;
        const office = (document.getElementById('userOffice')?.value || '').trim();
        
        // Validation
        if (!username) {
            this.showNotification('Username is required', 'error');
            return;
        }
        
        // Password validation for new users
        if (!isEdit) {
            if (!password) {
                this.showNotification('Password is required for new users', 'error');
                return;
            }
            
            if (password.length < 8) {
                this.showNotification('Password must be at least 8 characters long', 'error');
                return;
            }
            
            // Check password strength
            const isStrong = this.checkPasswordStrength();
            if (!isStrong) {
                this.showNotification('Password is too weak. It must contain uppercase, lowercase, number, and special character', 'error');
                return;
            }
            
            // Check password match
            if (!passwordConfirm) {
                this.showNotification('Please confirm your password', 'error');
                return;
            }
            
            if (password !== passwordConfirm) {
                this.showNotification('Passwords do not match', 'error');
                this.checkPasswordMatch();
                return;
            }
        } else {
            // For editing, password is optional but if provided, must meet requirements
            if (password) {
                if (password.length < 8) {
                    this.showNotification('Password must be at least 8 characters long', 'error');
                    return;
                }
                
                const isStrong = this.checkPasswordStrength();
                if (!isStrong) {
                    this.showNotification('Password is too weak. It must contain uppercase, lowercase, number, and special character', 'error');
                    return;
                }
                
                if (passwordConfirm && password !== passwordConfirm) {
                    this.showNotification('Passwords do not match', 'error');
                    this.checkPasswordMatch();
                    return;
                }
            }
        }
        
        // Validate role permissions
        if (!this.isSuperAdmin && role !== 'user') {
            this.showNotification('You can only create user accounts', 'error');
            return;
        }
        
        const userData = {
            name,
            username,
            role,
            status,
            campus,
            office
        };
        
        if (isEdit) {
            userData.id = userId;
            if (password) {
                userData.password = password;
            }
        } else {
            userData.password = password;
        }
        
        // Debug logging
        console.log('Saving user with data:', userData);
        console.log('Role value:', role);
        console.log('Campus value:', campus);
        
        try {
            const action = isEdit ? 'update' : 'create';
            const response = await fetch(`api/users.php?action=${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(isEdit ? 'User updated successfully!' : 'User created successfully!', 'success');
                closeUserModal();
                this.loadUsers();
            } else {
                this.showNotification('Error: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            this.showNotification('Error saving user', 'error');
        }
    }

    showDeleteUserModal(userId) {
        // First, get user info
        fetch(`api/users.php?action=get&id=${userId}`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const user = result.user;
                    const modal = document.getElementById('deleteModal');
                    const userInfo = document.getElementById('deleteUserInfo');
                    
                    userInfo.innerHTML = `<strong>${user.name}</strong> (${user.email})`;
                    modal.dataset.userId = userId;
                    modal.style.display = 'flex';
                }
            })
            .catch(error => {
                console.error('Error loading user:', error);
                this.showNotification('Error loading user', 'error');
            });
    }

    async confirmDeleteUser() {
        const modal = document.getElementById('deleteModal');
        const userId = modal.dataset.userId;
        
        if (!userId) return;
        
        try {
            const response = await fetch('api/users.php?action=delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: userId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('User deleted successfully', 'success');
                closeDeleteModal();
                this.loadUsers();
            } else {
                this.showNotification('Error: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showNotification('Error deleting user', 'error');
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
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Data Tables Management
    async loadTableData() {
        const reportType = document.getElementById('reportTypeSelect').value;
        
        if (!reportType) {
            alert('Please select a report type');
            return;
        }

        const container = document.getElementById('dataTableContainer');
        const tableInfo = document.getElementById('tableInfo');
        
        container.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><h3>Loading data...</h3></div>';

        try {
            const response = await fetch(`api/get_table_data.php?table=${reportType}`);
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                this.renderDataTable(result.data, reportType);
                
                // Update table info
                document.getElementById('totalRecords').textContent = result.data.length;
                document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
                tableInfo.style.display = 'flex';
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h3>No Data Found</h3>
                        <p>There are no records for this report type</p>
                    </div>
                `;
                tableInfo.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading table data:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Data</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    renderDataTable(data, tableName) {
        const container = document.getElementById('dataTableContainer');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><h3>No data available</h3></div>';
            return;
        }

        const columns = Object.keys(data[0]);
        
        let tableHTML = `
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col}</th>`).join('')}
                            <th class="actions-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach((row, index) => {
            tableHTML += '<tr>';
            columns.forEach(col => {
                tableHTML += `<td>${row[col] || '-'}</td>`;
            });
            tableHTML += `
                <td class="actions-cell">
                    <button class="action-btn edit" onclick="adminDashboard.editRecord('${tableName}', ${row.id || index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn copy" onclick="adminDashboard.copyRecord(${index})">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="action-btn delete" onclick="adminDashboard.deleteRecord('${tableName}', ${row.id || index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>`;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;
        this.currentTableData = data;
    }

    editRecord(tableName, recordId) {
        alert(`Edit functionality for ${tableName} record ${recordId} - Coming soon`);
    }

    copyRecord(index) {
        if (this.currentTableData && this.currentTableData[index]) {
            const record = this.currentTableData[index];
            const text = JSON.stringify(record, null, 2);
            
            navigator.clipboard.writeText(text).then(() => {
                alert('Record copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        }
    }

    async deleteRecord(tableName, recordId) {
        if (!confirm('Are you sure you want to delete this record?')) {
            return;
        }

        try {
            const response = await fetch('api/delete_record.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    table: tableName,
                    id: recordId
                }),
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                alert('Record deleted successfully');
                this.loadTableData();
            } else {
                alert('Failed to delete record: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('Error deleting record');
        }
    }

    exportTableData() {
        const reportType = document.getElementById('reportTypeSelect').value;
        
        if (!reportType) {
            alert('Please select a report type first');
            return;
        }

        if (!this.currentTableData || this.currentTableData.length === 0) {
            alert('No data to export. Please load data first.');
            return;
        }

        // Convert to CSV
        const columns = Object.keys(this.currentTableData[0]);
        let csv = columns.join(',') + '\n';
        
        this.currentTableData.forEach(row => {
            const values = columns.map(col => {
                const value = row[col] || '';
                return `"${value}"`;
            });
            csv += values.join(',') + '\n';
        });

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // Selection management functions

}

// Global functions
function closeSubmissionModal() {
    const modal = document.getElementById('submissionModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// User Management Functions
function addUser() {
    window.adminDashboard.showAddUserModal();
}

function editUser(userId) {
    window.adminDashboard.showEditUserModal(userId);
}

function deleteUser(userId) {
    window.adminDashboard.showDeleteUserModal(userId);
}

function saveUser(event) {
    window.adminDashboard.saveUserFromModal(event);
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    modal.style.display = 'none';
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'none';
}

function confirmDeleteUser() {
    window.adminDashboard.confirmDeleteUser();
}

function handleRoleChange() {
    const roleSelect = document.getElementById('userRoleSelect');
    if (!roleSelect) return;
    
    const role = roleSelect.value;
    console.log('Role changed to:', role); // Debug log
    
    const officeGroup = document.getElementById('officeGroup');
    const campusSelect = document.getElementById('userCampus');
    const adminDashboard = window.adminDashboard;
    const campusGroup = campusSelect?.closest('.form-group-modern');
    
    // Remove any existing notice
    const existingNotice = campusGroup?.querySelector('.campus-lock-notice');
    if (existingNotice) existingNotice.remove();
    
    if (role === 'super_admin') {
        // Super admin: Main Campus, no office
        campusSelect.value = 'Main Campus';
        campusSelect.disabled = true;
        officeGroup.style.display = 'none';
    } else if (role === 'admin') {
        // Campus admin: specific campus, no office
        // Only super admins can select campus for admins
        if (adminDashboard && adminDashboard.isSuperAdmin) {
            campusSelect.disabled = false;
        } else {
            // Regular admin creating another admin - lock to their campus
            if (adminDashboard && adminDashboard.userCampus) {
                campusSelect.value = adminDashboard.userCampus;
                campusSelect.disabled = true;
                
                // Add lock notice
                if (campusGroup) {
                    const notice = document.createElement('small');
                    notice.className = 'campus-lock-notice form-help';
                    notice.style.color = '#dc143c';
                    notice.innerHTML = `<i class="fas fa-lock"></i> Locked to your campus: <strong>${adminDashboard.userCampus}</strong>`;
                    campusGroup.appendChild(notice);
                }
            }
        }
        officeGroup.style.display = 'none';
    } else {
        // Office user: specific campus and office
        // Lock campus for non-super admins
        if (adminDashboard && !adminDashboard.isSuperAdmin && adminDashboard.userCampus) {
            campusSelect.value = adminDashboard.userCampus;
            campusSelect.disabled = true;
            
            // Add lock notice
            if (campusGroup) {
                const notice = document.createElement('small');
                notice.className = 'campus-lock-notice form-help';
                notice.style.color = '#dc143c';
                notice.innerHTML = `<i class="fas fa-lock"></i> Locked to your campus: <strong>${adminDashboard.userCampus}</strong>`;
                campusGroup.appendChild(notice);
            }
        } else {
            campusSelect.disabled = false;
        }
        officeGroup.style.display = 'block';
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
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

function filterUsersTable() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const roleFilter = document.getElementById('userRoleFilter').value;
    const statusFilter = document.getElementById('userStatusFilter').value;
    
    const tbody = document.getElementById('usersTableBody');
    const rows = tbody.getElementsByTagName('tr');
    
    let visibleCount = 0;
    
    for (let row of rows) {
        if (row.cells.length < 2) continue; // Skip loading/empty rows
        if (row.classList.contains('no-results-row')) {
            row.style.display = 'none';
            continue;
        }
        
        const name = row.cells[0]?.textContent.toLowerCase() || '';
        const username = row.cells[1]?.textContent.toLowerCase() || '';
        
        // Get role from data attribute (more reliable)
        const roleCell = row.cells[2];
        const roleValue = roleCell?.getAttribute('data-role')?.toLowerCase() || '';
        
        // Get status from data attribute
        const statusCell = row.cells[5];
        const statusValue = statusCell?.getAttribute('data-status')?.toLowerCase() || '';
        
        const matchesSearch = !searchTerm || name.includes(searchTerm) || username.includes(searchTerm);
        const matchesRole = !roleFilter || roleValue === roleFilter.toLowerCase();
        const matchesStatus = !statusFilter || statusValue === statusFilter.toLowerCase();
        
        console.log('Filter check:', {
            name: name.substring(0, 20),
            role: roleValue,
            roleFilter: roleFilter,
            matchesRole: matchesRole,
            status: statusValue,
            statusFilter: statusFilter,
            matchesStatus: matchesStatus
        });
        
        if (matchesSearch && matchesRole && matchesStatus) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    }
    
    // Show "no results" message if needed
    if (visibleCount === 0 && rows.length > 0) {
        const noResultsRow = tbody.querySelector('.no-results-row');
        if (!noResultsRow) {
            const newRow = tbody.insertRow(0);
            newRow.className = 'no-results-row';
            newRow.innerHTML = '<td colspan="8" style="text-align: center; padding: 40px;"><i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 10px;"></i><p style="color: #666;">No users match your filters</p></td>';
        }
    } else {
        const noResultsRow = tbody.querySelector('.no-results-row');
        if (noResultsRow) noResultsRow.remove();
    }
}

function backupData() {
    alert('Backup Data functionality - Coming soon');
}

function systemMaintenance() {
    alert('System Maintenance functionality - Coming soon');
}

function generateReport() {
    alert('Generate Report functionality - Coming soon');
}

// Notification Functions
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    dropdown.classList.toggle('show');
    
    // Close when clicking outside
    if (dropdown.classList.contains('show')) {
        setTimeout(() => {
            document.addEventListener('click', closeNotificationsOutside);
        }, 100);
        
        // Load notifications
        loadNotifications();
    }
}

function closeNotificationsOutside(event) {
    const dropdown = document.getElementById('notificationsDropdown');
    const notifications = document.querySelector('.notifications');
    
    if (!dropdown.contains(event.target) && !notifications.contains(event.target)) {
        dropdown.classList.remove('show');
        document.removeEventListener('click', closeNotificationsOutside);
    }
}

async function loadNotifications() {
    const list = document.getElementById('notificationsList');
    const badge = document.getElementById('notificationCount');
    
    // Show loading state
    if (list) {
        list.innerHTML = `
            <div class="notification-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading notifications...</p>
            </div>
        `;
    }
    
    try {
        // Get base path dynamically
        const basePath = window.location.pathname.includes('/Rework/') ? '/Rework' : 
                        window.location.pathname.includes('/rework/') ? '/rework' : '';
        const apiUrl = basePath ? `${basePath}/api/user_notifications.php?action=get_notifications` : 
                       'api/user_notifications.php?action=get_notifications';
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            credentials: 'include'
        });

        let notifications = [];

        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data && Array.isArray(result.data)) {
                // Map API notification format to UI format
                notifications = result.data.map(notif => ({
                    id: notif.id || notif['id'],
                    type: notif.type || 'info',
                    icon: getIconForType(notif.type || 'info'),
                    title: notif.title || 'Notification',
                    message: notif.message || '',
                    time: notif.time || getRelativeTime(notif.created_at),
                    unread: !notif.read
                }));
            }
        } else {
            console.error('Failed to fetch notifications:', response.status);
        }

        renderNotifications(notifications);
    } catch (error) {
        console.error('Error loading notifications:', error);
        if (list) {
            list.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load notifications</p>
                </div>
            `;
        }
        if (badge) {
            badge.textContent = '0';
            badge.style.display = 'none';
        }
    }
}

/**
 * Get FontAwesome icon class based on notification type
 */
function getIconForType(type) {
    const iconMap = {
        'success': 'fa-check-circle',
        'warning': 'fa-exclamation-triangle',
        'error': 'fa-times-circle',
        'info': 'fa-info-circle'
    };
    return iconMap[type] || 'fa-bell';
}

/**
 * Get relative time string from date
 */
function getRelativeTime(dateString) {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

function renderNotifications(notifications) {
    const list = document.getElementById('notificationsList');
    const badge = document.getElementById('notificationCount');
    
    if (notifications.length === 0) {
        list.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No new notifications</p>
            </div>
        `;
        badge.textContent = '0';
        badge.style.display = 'none';
        return;
    }
    
    const unreadCount = notifications.filter(n => n.unread).length;
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    
    list.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.unread ? 'unread' : ''}" onclick="markAsRead(${notif.id})">
            <div class="notification-icon ${notif.type}">
                <i class="fas ${notif.icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notif.title}</div>
                <div class="notification-message">${notif.message}</div>
                <div class="notification-time">${notif.time}</div>
            </div>
        </div>
    `).join('');
}

async function markAsRead(notificationId) {
    try {
        // Extract the actual notification ID (remove prefixes like 'notif_', 'sub_approved_', etc.)
        let actualId = notificationId;
        if (typeof notificationId === 'string') {
            // Remove common prefixes
            actualId = notificationId.replace(/^(notif_|sub_approved_|sub_rejected_|sub_pending_|data_sub_approved_|data_sub_rejected_|data_sub_pending_|task_new_|task_deadline_|task_overdue_)/, '');
        }
        
        const basePath = window.location.pathname.includes('/Rework/') ? '/Rework' : 
                        window.location.pathname.includes('/rework/') ? '/rework' : '';
        const apiUrl = basePath ? `${basePath}/api/user_notifications.php?action=mark_read&id=${actualId}` : 
                       `api/user_notifications.php?action=mark_read&id=${actualId}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Reload notifications to update UI
            loadNotifications();
        } else {
            console.error('Failed to mark notification as read');
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

async function markAllAsRead(event) {
    event.stopPropagation();
    
    try {
        const basePath = window.location.pathname.includes('/Rework/') ? '/Rework' : 
                        window.location.pathname.includes('/rework/') ? '/rework' : '';
        const apiUrl = basePath ? `${basePath}/api/user_notifications.php?action=mark_all_read` : 
                       'api/user_notifications.php?action=mark_all_read';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            const badge = document.getElementById('notificationCount');
            if (badge) {
                badge.textContent = '0';
                badge.style.display = 'none';
            }
            // Reload notifications to update UI
            loadNotifications();
        } else {
            console.error('Failed to mark all notifications as read');
        }
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
    
    // Remove unread class from all items
    document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
    });
}

function viewAllNotifications(event) {
    event.preventDefault();
    console.log('Viewing all notifications');
    // Navigate to notifications page or show modal
}

// Password Strength Checker
function checkPasswordStrength() {
    const password = document.getElementById('userPassword').value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!password) {
        strengthFill.className = 'strength-fill';
        strengthText.textContent = 'Minimum 6 characters required';
        return;
    }
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) {
        strengthFill.className = 'strength-fill weak';
        strengthText.textContent = 'Weak password';
        strengthText.style.color = '#dc3545';
    } else if (strength <= 3) {
        strengthFill.className = 'strength-fill medium';
        strengthText.textContent = 'Medium password';
        strengthText.style.color = '#ffc107';
    } else {
        strengthFill.className = 'strength-fill strong';
        strengthText.textContent = 'Strong password';
        strengthText.style.color = '#28a745';
    }
}

// Add password strength checker on input
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('userPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
});

// Navigation and Dashboard Functions
function navigateToSection(sectionId) {
    if (window.adminDashboard) {
        window.adminDashboard.showSection(sectionId);
    }
}

function refreshDashboard() {
    if (window.adminDashboard) {
        window.adminDashboard.loadDashboardData();
        window.adminDashboard.showNotification('Dashboard refreshed', 'success');
    }
}

function updateDashboardStats() {
    if (window.adminDashboard) {
        window.adminDashboard.loadDashboardStats();
    }
}

function exportChart(chartId) {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
        alert('Chart not found');
        return;
    }
    
    // Convert canvas to image
    const url = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${chartId}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (window.adminDashboard) {
        window.adminDashboard.showNotification('Chart exported successfully', 'success');
    }
}

function exportReportStats() {
    alert('Export Report Stats - Coming soon');
}

function exportCampusStats() {
    alert('Export Campus Stats - Coming soon');
}

function exportUserActivity() {
    alert('Export User Activity - Coming soon');
}

function exportAllData() {
    alert('Export All Data - Coming soon');
}

function generateStatisticsReport() {
    alert('Generate Statistics Report - Coming soon');
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded - Initializing AdminDashboard');
    try {
        window.adminDashboard = new AdminDashboard();
        await window.adminDashboard.init();
        console.log('AdminDashboard initialized successfully');
    } catch (error) {
        console.error('Failed to initialize AdminDashboard:', error);
    }
});
