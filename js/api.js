// API Utility for Task Management System
// This file replaces localStorage calls with API calls

const API_BASE_URL = 'http://localhost:3000/api';

// Get authentication token from localStorage
function getAuthToken() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.token || null;
}

// Make API request
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== AUTHENTICATION ====================
const AuthAPI = {
    async register(userData) {
        const result = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        // Store token and user info
        if (result.token) {
            localStorage.setItem('currentUser', JSON.stringify({
                ...result.user,
                token: result.token
            }));
        }
        
        return result;
    },

    async login(email, password) {
        const result = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Store token and user info
        if (result.token) {
            localStorage.setItem('currentUser', JSON.stringify({
                ...result.user,
                token: result.token
            }));
        }
        
        return result;
    },

    async getCurrentUser() {
        return await apiRequest('/auth/me');
    },

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
};

// ==================== USERS ====================
const UsersAPI = {
    async getAll() {
        return await apiRequest('/users');
    },

    async getById(id) {
        return await apiRequest(`/users/${id}`);
    },

    async update(id, userData) {
        return await apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }
};

// ==================== PROJECTS ====================
const ProjectsAPI = {
    async getAll() {
        return await apiRequest('/projects');
    },

    async getById(id) {
        return await apiRequest(`/projects/${id}`);
    },

    async create(projectData) {
        return await apiRequest('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    },

    async update(id, projectData) {
        return await apiRequest(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(projectData)
        });
    },

    async delete(id) {
        return await apiRequest(`/projects/${id}`, {
            method: 'DELETE'
        });
    }
};

// ==================== TASKS ====================
const TasksAPI = {
    async getAll(projectId = null) {
        const endpoint = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
        return await apiRequest(endpoint);
    },

    async getById(id) {
        return await apiRequest(`/tasks/${id}`);
    },

    async create(taskData) {
        return await apiRequest('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    },

    async update(id, taskData) {
        return await apiRequest(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
    },

    async delete(id) {
        return await apiRequest(`/tasks/${id}`, {
            method: 'DELETE'
        });
    }
};

// ==================== NOTIFICATIONS ====================
const NotificationsAPI = {
    async getAll() {
        return await apiRequest('/notifications');
    },

    async create(notificationData) {
        return await apiRequest('/notifications', {
            method: 'POST',
            body: JSON.stringify(notificationData)
        });
    },

    async markAsRead(id) {
        return await apiRequest(`/notifications/${id}/read`, {
            method: 'PUT'
        });
    },

    async clearAll() {
        return await apiRequest('/notifications', {
            method: 'DELETE'
        });
    }
};

// ==================== COMMENTS ====================
const CommentsAPI = {
    async getByTaskId(taskId) {
        return await apiRequest(`/tasks/${taskId}/comments`);
    },

    async add(taskId, comment) {
        return await apiRequest(`/tasks/${taskId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ comment })
        });
    }
};

// Export for use in HTML files
window.API = {
    Auth: AuthAPI,
    Users: UsersAPI,
    Projects: ProjectsAPI,
    Tasks: TasksAPI,
    Notifications: NotificationsAPI,
    Comments: CommentsAPI
};
