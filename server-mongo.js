require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Notification = require('./models/Notification');
const TaskComment = require('./models/TaskComment');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Helper: ensure doc has id for API (Mongoose returns _id)
const toApi = (doc) => {
    if (!doc) return doc;
    const o = doc.toObject ? doc.toObject() : { ...doc };
    o.id = (o._id || o.id).toString();
    delete o._id;
    delete o.__v;
    if (o.projectId) o.projectId = o.projectId.toString();
    if (o.taskId) o.taskId = o.taskId.toString();
    return o;
};

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Create default admin and start server after DB connect
async function startServer() {
    await connectDB();

    // Create default admin if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@graphura.in' });
    if (!adminExists) {
        await User.create({
            name: 'Admin User',
            email: 'admin@graphura.in',
            password: 'admin123',
            role: 'admin'
        });
        console.log('Default admin user created: admin@graphura.in / admin123');
    }

    // ==================== AUTHENTICATION ROUTES ====================

    app.post('/api/auth/register', async (req, res) => {
        try {
            const { name, email, password, role, domain } = req.body;

            if (!name || !email || !password || !role) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            const existing = await User.findOne({ email: email.toLowerCase() });
            if (existing) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const user = await User.create({
                name,
                email: email.toLowerCase(),
                password,
                role,
                domain: domain || ''
            });

            const token = jwt.sign(
                { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            const userObj = user.toJSON ? user.toJSON() : toApi(user);
            res.json({
                token,
                user: userObj
            });
        } catch (error) {
            res.status(500).json({ error: error.message || 'Server error' });
        }
    });

    app.post('/api/auth/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }

            const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const valid = await user.comparePassword(password);
            if (!valid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user._id.toString(), email: user.email, role: user.role, name: user.name },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                token,
                user: toApi(user)
            });
        } catch (error) {
            res.status(500).json({ error: error.message || 'Server error' });
        }
    });

    app.get('/api/auth/me', authenticateToken, async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(toApi(user));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    // ==================== USERS ROUTES ====================

    app.get('/api/users', authenticateToken, async (req, res) => {
        try {
            const users = await User.find().sort({ createdAt: -1 });
            res.json(users.map(u => toApi(u)));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.get('/api/users/:id', authenticateToken, async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(toApi(user));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.put('/api/users/:id', authenticateToken, async (req, res) => {
        try {
            const { name, email, profilePicture, domain } = req.body;
            const userId = req.params.id;

            if (req.user.id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            const user = await User.findByIdAndUpdate(
                userId,
                { name, email, profilePicture, domain },
                { new: true, runValidators: true }
            );
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(toApi(user));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    // ==================== PROJECTS ROUTES ====================

    app.get('/api/projects', authenticateToken, async (req, res) => {
        try {
            const projects = await Project.find().sort({ createdAt: -1 });
            res.json(projects.map(p => toApi(p)));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.get('/api/projects/:id', authenticateToken, async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ error: 'Invalid project ID' });
            }
            const project = await Project.findById(req.params.id);
            if (!project) return res.status(404).json({ error: 'Project not found' });
            res.json(toApi(project));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.post('/api/projects', authenticateToken, async (req, res) => {
        try {
            const { name, description, domain, leader, status } = req.body;
            if (!name) return res.status(400).json({ error: 'Project name is required' });

            const project = await Project.create({
                name,
                description: description || '',
                domain: domain || '',
                leader: leader || '',
                status: status || 'active'
            });
            res.status(201).json(toApi(project));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.put('/api/projects/:id', authenticateToken, async (req, res) => {
        try {
            const { name, description, domain, leader, status } = req.body;
            const project = await Project.findByIdAndUpdate(
                req.params.id,
                { name, description, domain, leader, status },
                { new: true }
            );
            if (!project) return res.status(404).json({ error: 'Project not found' });
            res.json(toApi(project));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        try {
            const project = await Project.findByIdAndDelete(req.params.id);
            if (!project) return res.status(404).json({ error: 'Project not found' });
            res.json({ message: 'Project deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    // ==================== TASKS ROUTES ====================

    app.get('/api/tasks', authenticateToken, async (req, res) => {
        try {
            const filter = req.query.projectId ? { projectId: req.query.projectId } : {};
            const tasks = await Task.find(filter).sort({ createdAt: -1 });
            res.json(tasks.map(t => toApi(t)));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.get('/api/tasks/:id', authenticateToken, async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ error: 'Invalid task ID' });
            }
            const task = await Task.findById(req.params.id);
            if (!task) return res.status(404).json({ error: 'Task not found' });
            res.json(toApi(task));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.post('/api/tasks', authenticateToken, async (req, res) => {
        try {
            const { projectId, title, description, assignedTo, status, priority, dueDate } = req.body;
            if (!title) return res.status(400).json({ error: 'Task title is required' });

            const task = await Task.create({
                projectId: projectId || null,
                title,
                description: description || '',
                assignedTo: assignedTo || '',
                status: status || 'pending',
                priority: priority || 'medium',
                dueDate: dueDate || null
            });
            res.status(201).json(toApi(task));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
        try {
            const { title, description, assignedTo, status, priority, dueDate, completedDate } = req.body;
            const task = await Task.findByIdAndUpdate(
                req.params.id,
                { title, description, assignedTo, status, priority, dueDate, completedDate },
                { new: true }
            );
            if (!task) return res.status(404).json({ error: 'Task not found' });
            res.json(toApi(task));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
        try {
            const task = await Task.findByIdAndDelete(req.params.id);
            if (!task) return res.status(404).json({ error: 'Task not found' });
            res.json({ message: 'Task deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    // ==================== NOTIFICATIONS ROUTES ====================

    app.get('/api/notifications', authenticateToken, async (req, res) => {
        try {
            let filter = {};
            if (req.user.role !== 'admin') {
                filter = {
                    $or: [
                        { targetRole: req.user.role },
                        { targetRole: 'all' },
                        { targetUser: req.user.name }
                    ]
                };
            }
            const notifications = await Notification.find(filter).sort({ createdAt: -1 });
            res.json(notifications.map(n => toApi(n)));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.post('/api/notifications', authenticateToken, async (req, res) => {
        try {
            const { title, message, targetRole, targetUser, type, taskId, deadlineDate } = req.body;
            if (!title || !message) {
                return res.status(400).json({ error: 'Title and message are required' });
            }

            const notification = await Notification.create({
                title,
                message,
                from: req.user.name,
                targetRole: targetRole || null,
                targetUser: targetUser || null,
                type: type || 'general',
                taskId: taskId || null,
                deadlineDate: deadlineDate || null
            });
            res.status(201).json(toApi(notification));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
        try {
            const notification = await Notification.findByIdAndUpdate(
                req.params.id,
                { read: true },
                { new: true }
            );
            if (!notification) return res.status(404).json({ error: 'Notification not found' });
            res.json(toApi(notification));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.delete('/api/notifications', authenticateToken, async (req, res) => {
        try {
            let filter = {};
            if (req.user.role !== 'admin') {
                filter = {
                    $or: [
                        { targetRole: req.user.role },
                        { targetRole: 'all' },
                        { targetUser: req.user.name }
                    ]
                };
            }
            await Notification.deleteMany(filter);
            res.json({ message: 'Notifications cleared' });
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    // ==================== COMMENTS ROUTES ====================

    app.get('/api/tasks/:taskId/comments', authenticateToken, async (req, res) => {
        try {
            const comments = await TaskComment.find({ taskId: req.params.taskId }).sort({ createdAt: 1 });
            res.json(comments.map(c => toApi(c)));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    app.post('/api/tasks/:taskId/comments', authenticateToken, async (req, res) => {
        try {
            const { comment } = req.body;
            if (!comment) return res.status(400).json({ error: 'Comment is required' });

            const taskComment = await TaskComment.create({
                taskId: req.params.taskId,
                userId: req.user.id,
                user: req.user.name,
                comment
            });
            res.status(201).json(toApi(taskComment));
        } catch (error) {
            res.status(500).json({ error: error.message || 'Database error' });
        }
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`API endpoints available at http://localhost:${PORT}/api`);
        console.log('Using MongoDB for database.');
    });
}

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
});
