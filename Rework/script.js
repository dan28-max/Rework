// Dashboard JavaScript functionality
class Dashboard {
    constructor() {
        this.currentRole = 'admin';
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

        // Role switcher buttons (only for demo purposes)
        document.getElementById('adminBtn').addEventListener('click', () => {
            this.switchRole('admin');
        });

        document.getElementById('userBtn').addEventListener('click', () => {
            this.switchRole('user');
        });

        // Logout functionality
        this.addLogoutButton();

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

        // Add fade-in animation
        document.getElementById(section).classList.add('fade-in');
        setTimeout(() => {
            document.getElementById(section).classList.remove('fade-in');
        }, 500);
    }

    switchRole(role) {
        this.currentRole = role;
        
        // Update role buttons
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(role + 'Btn').classList.add('active');

        // Update user info
        this.updateUserInfo();

        // Update dashboard content based on role
        this.updateDashboardForRole();

        // Update navigation menu based on role
        this.updateNavigationForRole();
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
                this.currentRole = this.user.role;
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
            userRole.textContent = this.user.role === 'admin' ? 'Administrator' : 'User';
        } else {
            // Fallback for demo purposes
            if (this.currentRole === 'admin') {
                userName.textContent = 'Admin User';
                userRole.textContent = 'Administrator';
            } else {
                userName.textContent = 'Regular User';
                userRole.textContent = 'User';
            }
        }
    }

    updateDashboardForRole() {
        const stats = this.getStatsForRole();
        
        // Update stat numbers
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('dataRecords').textContent = stats.dataRecords;
        document.getElementById('growthRate').textContent = stats.growthRate;
        document.getElementById('securityScore').textContent = stats.securityScore;
    }

    getStatsForRole() {
        if (this.currentRole === 'admin') {
            return {
                totalUsers: '1,234',
                dataRecords: '45,678',
                growthRate: '+12.5%',
                securityScore: '98%'
            };
        } else {
            return {
                totalUsers: '234',
                dataRecords: '8,456',
                growthRate: '+8.2%',
                securityScore: '95%'
            };
        }
    }

    updateNavigationForRole() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const section = item.dataset.section;
            
            // Hide admin-only sections for regular users
            if (this.currentRole === 'user' && ['users', 'data', 'settings'].includes(section)) {
                item.style.display = 'none';
            } else {
                item.style.display = 'flex';
            }
        });

        // If current section is hidden for user role, switch to dashboard
        if (this.currentRole === 'user' && ['users', 'data', 'settings'].includes(this.currentSection)) {
            this.switchSection('dashboard');
        }
    }

    updatePageTitle(section) {
        const titles = {
            dashboard: 'Dashboard Overview',
            analytics: 'Analytics Dashboard',
            users: 'User Management',
            data: 'Data Management',
            settings: 'System Settings'
        };

        document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
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
        
        // Fallback to animation
        this.animateNumbers();
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

        // Update recent activity
        if (data.recent_activity) {
            this.updateRecentActivity(data.recent_activity);
        }
    }

    updateRecentActivity(activities) {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        activityList.innerHTML = '';
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const icon = this.getActivityIcon(activity.action);
            const time = this.formatTime(activity.created_at);
            
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.description || activity.action}</p>
                    <span class="activity-time">${time}</span>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
    }

    getActivityIcon(action) {
        const icons = {
            'login_success': 'fas fa-sign-in-alt',
            'logout': 'fas fa-sign-out-alt',
            'user_created': 'fas fa-user-plus',
            'data_export': 'fas fa-download',
            'data_import': 'fas fa-upload',
            'settings_updated': 'fas fa-cog',
            'backup_completed': 'fas fa-database'
        };
        return icons[action] || 'fas fa-info-circle';
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    animateNumbers() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const finalValue = stat.textContent;
            const isPercentage = finalValue.includes('%');
            const isGrowth = finalValue.includes('+');
            const numericValue = parseFloat(finalValue.replace(/[^\d.-]/g, ''));
            
            if (!isNaN(numericValue)) {
                this.animateValue(stat, 0, numericValue, 2000, isPercentage, isGrowth);
            }
        });
    }

    animateValue(element, start, end, duration, isPercentage = false, isGrowth = false) {
        const startTime = performance.now();
        const isDecimal = end % 1 !== 0;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;
            
            let displayValue;
            if (isDecimal) {
                displayValue = current.toFixed(1);
            } else {
                displayValue = Math.floor(current).toLocaleString();
            }
            
            if (isPercentage) {
                displayValue += '%';
            }
            if (isGrowth) {
                displayValue = '+' + displayValue;
            }
            
            element.textContent = displayValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    loadRecentActivity() {
        // This would typically load from an API
        const activities = [
            {
                icon: 'fas fa-user-plus',
                text: 'New user registered',
                time: '2 minutes ago'
            },
            {
                icon: 'fas fa-database',
                text: 'Data backup completed',
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
            }
        ];

        // Update activity list (this is just for demo)
        console.log('Recent activities loaded:', activities);
    }

    // Utility methods
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

    // Data management methods
    exportData() {
        this.showNotification('Data export started...', 'info');
        // Simulate export process
        setTimeout(() => {
            this.showNotification('Data exported successfully!', 'success');
        }, 2000);
    }

    importData() {
        this.showNotification('Please select a file to import', 'info');
        // File input would be triggered here
    }

    syncData() {
        this.showNotification('Data synchronization started...', 'info');
        // Simulate sync process
        setTimeout(() => {
            this.showNotification('Data synchronized successfully!', 'success');
        }, 3000);
    }

    addLogoutButton() {
        // Add logout button to the header
        const headerRight = document.querySelector('.header-right');
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.addEventListener('click', () => {
            this.logout();
        });
        
        // Insert before the profile image
        headerRight.insertBefore(logoutBtn, headerRight.lastElementChild);
    }

    async logout() {
        try {
            const response = await fetch('api/auth.php?action=logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.showNotification('Logged out successfully', 'success');
                }
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Clear local storage
        localStorage.removeItem('spartanDataUser');
        sessionStorage.removeItem('spartanDataUser');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    
    // Add some demo interactions
    setupDemoInteractions();
});

function setupDemoInteractions() {
    // Add click handlers for demo buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn[data-action="export"]')) {
            window.dashboard.exportData();
        }
        
        if (e.target.closest('.btn[data-action="import"]')) {
            window.dashboard.importData();
        }
        
        if (e.target.closest('.btn[data-action="sync"]')) {
            window.dashboard.syncData();
        }
    });

    // Add hover effects to stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click effects to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-left: 4px solid #dc3545;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 10000;
        max-width: 300px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left-color: #28a745;
    }
    
    .notification-error {
        border-left-color: #dc3545;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
    
    .notification-success i {
        color: #28a745;
    }
    
    .notification-error i {
        color: #dc3545;
    }
    
    .notification span {
        color: #333;
        font-weight: 500;
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
