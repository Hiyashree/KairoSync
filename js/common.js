// Common utility functions for all pages
// This file provides shared functionality across all dashboard pages

// ============================================
// Authentication & User Management
// ============================================

function checkAuthentication() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!currentUser || !currentUser.role) {
        window.location.href = 'login.html';
        return null;
    }
    
    return currentUser;
}

function logout() {
    if (confirm('Do you want to logout?')) {
        if (window.API && window.API.Auth) {
            API.Auth.logout();
        } else {
            localStorage.removeItem('currentUser');
        }
        window.location.href = 'login.html';
    }
}

function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Update user display elements
    const userNameEls = document.querySelectorAll('.user-name');
    const userRoleEls = document.querySelectorAll('.user-role');
    const userAvatarEls = document.querySelectorAll('.user-avatar, .headerUserAvatar');
    
    userNameEls.forEach(el => {
        if (currentUser.name) el.textContent = currentUser.name;
    });
    
    userRoleEls.forEach(el => {
        if (currentUser.role) {
            const roleText = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
            el.textContent = roleText === 'Leader' ? 'Team Leader' : roleText;
        }
    });
    
    userAvatarEls.forEach(el => {
        if (currentUser.profilePicture) {
            el.style.backgroundImage = `url(${currentUser.profilePicture})`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
            el.textContent = '';
        } else if (currentUser.name) {
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            el.textContent = initials;
        }
    });
}

// ============================================
// Settings & Dark Mode
// ============================================

function loadSettings() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.role) return;
    
    const settingsKey = 'settings_' + currentUser.role;
    const settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
    
    // Apply dark mode
    if (settings.darkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function toggleDarkMode() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.role) return;
    
    const settingsKey = 'settings_' + currentUser.role;
    const settings = JSON.parse(localStorage.getItem(settingsKey) || '{}');
    settings.darkMode = !settings.darkMode;
    
    localStorage.setItem(settingsKey, JSON.stringify(settings));
    loadSettings();
}

// ============================================
// Mobile Menu Toggle
// ============================================

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menuToggle');
    if (window.innerWidth <= 768 && sidebar && menuToggle) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    }
});

// ============================================
// Search Functionality
// ============================================

function setupSearch(searchInputId, searchCallback) {
    const searchInput = document.getElementById(searchInputId);
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            if (searchCallback) {
                searchCallback(searchTerm);
            }
        });
    }
}

// ============================================
// Time Utilities
// ============================================

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// ============================================
// Data Loading Helpers (API with fallback)
// ============================================

async function loadDataWithFallback(apiCall, localStorageKey, transformFn = null) {
    try {
        if (window.API && apiCall) {
            const data = await apiCall();
            return transformFn ? transformFn(data) : data;
        } else {
            const data = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
            return transformFn ? transformFn(data) : data;
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
        const data = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
        return transformFn ? transformFn(data) : data;
    }
}

// ============================================
// Notification Helpers
// ============================================

async function loadNotifications() {
    try {
        let notifications = [];
        
        if (window.API) {
            notifications = await API.Notifications.getAll().catch(() => []);
        } else {
            notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        }
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Filter notifications based on user role
        let userNotifications = notifications;
        if (currentUser.role !== 'admin') {
            userNotifications = notifications.filter(n => 
                n.targetRole === currentUser.role || 
                n.targetRole === 'all' || 
                n.targetUser === currentUser.name
            );
        }
        
        userNotifications = userNotifications.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        return userNotifications;
    } catch (error) {
        console.error('Error loading notifications:', error);
        return [];
    }
}

// ============================================
// Initialize Page
// ============================================

function initializePage() {
    // Check authentication
    const currentUser = checkAuthentication();
    if (!currentUser) return;
    
    // Load user profile
    loadUserProfile();
    
    // Load settings
    loadSettings();
    
    // Setup logout button
    const logoutBtns = document.querySelectorAll('.nav-item.logout, .logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
    
    // Setup user info click to go to settings
    const userInfoEls = document.querySelectorAll('.user-info, .user-avatar');
    userInfoEls.forEach(el => {
        el.addEventListener('click', function() {
            const role = currentUser.role;
            const settingsPage = `settings${role}.html`;
            window.location.href = settingsPage;
        });
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

// Export for use in other scripts
window.CommonUtils = {
    checkAuthentication,
    logout,
    loadUserProfile,
    loadSettings,
    toggleDarkMode,
    toggleSidebar,
    setupSearch,
    getTimeAgo,
    formatDate,
    loadDataWithFallback,
    loadNotifications,
    initializePage
};
