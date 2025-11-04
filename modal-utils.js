/**
 * Modern Modal Utilities
 * Provides showAlert and showConfirm functions for use across all pages
 */

window.ModalUtils = {
    /**
     * Show modern alert dialog
     */
    showAlert: function(message, title = 'Notice', type = 'info') {
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
                'success': '#48bb78',
                'error': '#f56565',
                'warning': '#ed8936',
                'info': '#4299e1'
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
                        <button class="custom-modal-btn custom-modal-btn-primary">
                            <i class="fas fa-check"></i> OK
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add click event to resolve promise
            modal.querySelector('.custom-modal-btn').addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                    resolve(true);
                }, 300);
            });
            
            // Animate in
            setTimeout(() => modal.classList.add('show'), 10);
        });
    },

    /**
     * Show modern confirm dialog
     */
    showConfirm: function(message, title = 'Confirm', options = {}) {
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
                'success': '#48bb78',
                'error': '#f56565',
                'warning': '#ed8936',
                'info': '#4299e1'
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
                    setTimeout(() => {
                        modal.remove();
                        resolve(action === 'confirm');
                    }, 300);
                });
            });
            
            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                    setTimeout(() => {
                        modal.remove();
                        resolve(false);
                    }, 300);
                }
            });
            
            // Animate in
            setTimeout(() => modal.classList.add('show'), 10);
        });
    },

    /**
     * Show status banner at top center
     */
    showStatusBanner: function(title, message, type = 'success', duration = 4000) {
        // Remove any existing banners
        const existingBanner = document.querySelector('.status-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        const banner = document.createElement('div');
        banner.className = `status-banner ${type}`;
        
        const iconMap = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        
        banner.innerHTML = `
            <div class="status-banner-icon">
                <i class="fas fa-${iconMap[type]}"></i>
            </div>
            <div class="status-banner-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Animate in
        setTimeout(() => banner.classList.add('show'), 10);
        
        // Auto dismiss
        setTimeout(() => {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 400);
        }, duration);
    }
};

// Create global shortcuts
window.showAlert = window.ModalUtils.showAlert;
window.showConfirm = window.ModalUtils.showConfirm;
window.showStatusBanner = window.ModalUtils.showStatusBanner;
