// Migration Helper: Convert localStorage calls to API calls
// This file shows how to replace localStorage with API calls

// ==================== OLD WAY (localStorage) ====================
/*
// Get projects
const projects = JSON.parse(localStorage.getItem('projects')) || [];

// Save projects
localStorage.setItem('projects', JSON.stringify(projects));

// Get tasks
const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Get users
const users = JSON.parse(localStorage.getItem('users')) || [];
*/

// ==================== NEW WAY (API) ====================

// Get projects (async)
async function loadProjects() {
    try {
        const projects = await API.Projects.getAll();
        return projects;
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}

// Get tasks (async)
async function loadTasks(projectId = null) {
    try {
        const tasks = await API.Tasks.getAll(projectId);
        return tasks;
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
}

// Get users (async)
async function loadUsers() {
    try {
        const users = await API.Users.getAll();
        return users;
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
}

// Get notifications (async)
async function loadNotifications() {
    try {
        const notifications = await API.Notifications.getAll();
        return notifications;
    } catch (error) {
        console.error('Error loading notifications:', error);
        return [];
    }
}

// Create project
async function createProject(projectData) {
    try {
        const project = await API.Projects.create(projectData);
        return project;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
}

// Update project
async function updateProject(id, projectData) {
    try {
        await API.Projects.update(id, projectData);
        return true;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
}

// Create task
async function createTask(taskData) {
    try {
        const task = await API.Tasks.create(taskData);
        return task;
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
}

// Update task
async function updateTask(id, taskData) {
    try {
        await API.Tasks.update(id, taskData);
        return true;
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
}

// Send notification
async function sendNotification(notificationData) {
    try {
        const notification = await API.Notifications.create(notificationData);
        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
}

// ==================== EXAMPLE: Updating loadStatistics() ====================
/*
// OLD VERSION:
function loadStatistics() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    // ... rest of code
}

// NEW VERSION:
async function loadStatistics() {
    try {
        const [projects, users, tasks] = await Promise.all([
            API.Projects.getAll(),
            API.Users.getAll(),
            API.Tasks.getAll()
        ]);
        
        const totalProjects = projects.length;
        // ... rest of code
        
        // Update UI
        if (totalEl) totalEl.textContent = totalProjects;
        // ...
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Call it:
loadStatistics();
*/

// ==================== EXAMPLE: Updating sendNotification() ====================
/*
// OLD VERSION:
function sendNotification() {
    const title = document.getElementById('notificationTitle').value.trim();
    const message = document.getElementById('notificationMessage').value.trim();
    const target = document.getElementById('notificationTarget').value;
    
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const newNotification = {
        id: Date.now(),
        title: title,
        message: message,
        // ...
    };
    notifications.push(newNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// NEW VERSION:
async function sendNotification() {
    const title = document.getElementById('notificationTitle').value.trim();
    const message = document.getElementById('notificationMessage').value.trim();
    const target = document.getElementById('notificationTarget').value;
    const targetUser = document.getElementById('notificationUser').value;
    
    try {
        await API.Notifications.create({
            title: title,
            message: message,
            targetRole: target === 'specific' ? null : target,
            targetUser: target === 'specific' ? targetUser : null
        });
        
        // Clear form
        document.getElementById('notificationTitle').value = '';
        document.getElementById('notificationMessage').value = '';
        alert('Notification sent successfully!');
        
        // Reload notifications
        loadNotifications();
    } catch (error) {
        alert('Error sending notification: ' + error.message);
    }
}
*/

// Export helper functions
window.MigrationHelper = {
    loadProjects,
    loadTasks,
    loadUsers,
    loadNotifications,
    createProject,
    updateProject,
    createTask,
    updateTask,
    sendNotification
};
