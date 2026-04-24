const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Initialize Database
const db = new sqlite3.Database('./taskmanagement.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize Database Schema
function initializeDatabase() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'leader', 'employee')),
        profilePicture TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Projects table
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        domain TEXT,
        leader TEXT,
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tasks table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        assignedTo TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'completed')),
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
        dueDate TEXT,
        completedDate TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects(id)
    )`);

    // Notifications table
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        from TEXT,
        targetRole TEXT,
        targetUser TEXT,
        type TEXT DEFAULT 'general',
        taskId INTEGER,
        deadlineDate TEXT,
        read INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (taskId) REFERENCES tasks(id)
    )`);

    // Task Comments table
    db.run(`CREATE TABLE IF NOT EXISTS taskComments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId INTEGER NOT NULL,
        userId TEXT NOT NULL,
        user TEXT NOT NULL,
        comment TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (taskId) REFERENCES tasks(id)
    )`);

    // Create default admin user if doesn't exist
    db.get("SELECT * FROM users WHERE email = ?", ['admin@graphura.in'], (err, row) => {
        if (err) {
            console.error('Error checking admin user:', err);
        } else if (!row) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                ['Admin User', 'admin@graphura.in', hashedPassword, 'admin'],
                (err) => {
                    if (err) {
                        console.error('Error creating admin user:', err);
                    } else {
                        console.log('Default admin user created: admin@graphura.in / admin123');
                    }
                });
        }
    });
}

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

// ==================== AUTHENTICATION ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user exists
        db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (row) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user
            db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                [name, email, hashedPassword, role],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Error creating user' });
                    }

                    // Generate token
                    const token = jwt.sign(
                        { id: this.lastID, email, role, name },
                        JWT_SECRET,
                        { expiresIn: '7d' }
                    );

                    res.json({
                        token,
                        user: {
                            id: this.lastID,
                            name,
                            email,
                            role
                        }
                    });
                });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, row.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: row.id, email: row.email, role: row.role, name: row.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: row.id,
                name: row.name,
                email: row.email,
                role: row.role,
                profilePicture: row.profilePicture
            }
        });
    });
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get("SELECT id, name, email, role, profilePicture FROM users WHERE id = ?", [req.user.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(row);
    });
});

// ==================== USERS ROUTES ====================

// Get all users
app.get('/api/users', authenticateToken, (req, res) => {
    db.all("SELECT id, name, email, role, profilePicture, createdAt FROM users", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Get user by ID
app.get('/api/users/:id', authenticateToken, (req, res) => {
    db.get("SELECT id, name, email, role, profilePicture, createdAt FROM users WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(row);
    });
});

// Update user
app.put('/api/users/:id', authenticateToken, (req, res) => {
    const { name, email, profilePicture } = req.body;
    const userId = req.params.id;

    // Only allow users to update their own profile or admin to update any
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    db.run("UPDATE users SET name = ?, email = ?, profilePicture = ? WHERE id = ?",
        [name, email, profilePicture, userId],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'User updated successfully' });
        });
});

// ==================== PROJECTS ROUTES ====================

// Get all projects
app.get('/api/projects', authenticateToken, (req, res) => {
    db.all("SELECT * FROM projects ORDER BY createdAt DESC", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Get project by ID
app.get('/api/projects/:id', authenticateToken, (req, res) => {
    db.get("SELECT * FROM projects WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(row);
    });
});

// Create project
app.post('/api/projects', authenticateToken, (req, res) => {
    const { name, description, domain, leader, status } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
    }

    db.run("INSERT INTO projects (name, description, domain, leader, status) VALUES (?, ?, ?, ?, ?)",
        [name, description || '', domain || '', leader || '', status || 'active'],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            db.get("SELECT * FROM projects WHERE id = ?", [this.lastID], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.status(201).json(row);
            });
        });
});

// Update project
app.put('/api/projects/:id', authenticateToken, (req, res) => {
    const { name, description, domain, leader, status } = req.body;

    db.run("UPDATE projects SET name = ?, description = ?, domain = ?, leader = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [name, description, domain, leader, status, req.params.id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Project updated successfully' });
        });
});

// Delete project
app.delete('/api/projects/:id', authenticateToken, (req, res) => {
    // Only admin can delete projects
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    db.run("DELETE FROM projects WHERE id = ?", [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Project deleted successfully' });
    });
});

// ==================== TASKS ROUTES ====================

// Get all tasks
app.get('/api/tasks', authenticateToken, (req, res) => {
    const { projectId } = req.query;
    let query = "SELECT * FROM tasks";
    let params = [];

    if (projectId) {
        query += " WHERE projectId = ?";
        params.push(projectId);
    }

    query += " ORDER BY createdAt DESC";

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Get task by ID
app.get('/api/tasks/:id', authenticateToken, (req, res) => {
    db.get("SELECT * FROM tasks WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(row);
    });
});

// Create task
app.post('/api/tasks', authenticateToken, (req, res) => {
    const { projectId, title, description, assignedTo, status, priority, dueDate } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Task title is required' });
    }

    db.run("INSERT INTO tasks (projectId, title, description, assignedTo, status, priority, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [projectId || null, title, description || '', assignedTo || '', status || 'pending', priority || 'medium', dueDate || null],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.status(201).json(row);
            });
        });
});

// Update task
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
    const { title, description, assignedTo, status, priority, dueDate, completedDate } = req.body;

    db.run("UPDATE tasks SET title = ?, description = ?, assignedTo = ?, status = ?, priority = ?, dueDate = ?, completedDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
        [title, description, assignedTo, status, priority, dueDate, completedDate, req.params.id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Task updated successfully' });
        });
});

// Delete task
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
    db.run("DELETE FROM tasks WHERE id = ?", [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

// ==================== NOTIFICATIONS ROUTES ====================

// Get notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
    const user = req.user;
    let query = "SELECT * FROM notifications WHERE";
    let params = [];

    if (user.role === 'admin') {
        // Admin sees all notifications
        query = "SELECT * FROM notifications";
        params = [];
    } else {
        // Others see notifications targeted to them
        query += " (targetRole = ? OR targetRole = 'all' OR targetUser = ?)";
        params = [user.role, user.name];
    }

    query += " ORDER BY timestamp DESC";

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Create notification
app.post('/api/notifications', authenticateToken, (req, res) => {
    const { title, message, targetRole, targetUser, type, taskId, deadlineDate } = req.body;

    if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
    }

    db.run("INSERT INTO notifications (title, message, from, targetRole, targetUser, type, taskId, deadlineDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [title, message, req.user.name, targetRole || null, targetUser || null, type || 'general', taskId || null, deadlineDate || null],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            db.get("SELECT * FROM notifications WHERE id = ?", [this.lastID], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.status(201).json(row);
            });
        });
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
    db.run("UPDATE notifications SET read = 1 WHERE id = ?", [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Notification marked as read' });
    });
});

// Clear all notifications
app.delete('/api/notifications', authenticateToken, (req, res) => {
    const user = req.user;
    let query = "DELETE FROM notifications WHERE";
    let params = [];

    if (user.role === 'admin') {
        query = "DELETE FROM notifications";
        params = [];
    } else {
        query += " (targetRole = ? OR targetRole = 'all' OR targetUser = ?)";
        params = [user.role, user.name];
    }

    db.run(query, params, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Notifications cleared' });
    });
});

// ==================== COMMENTS ROUTES ====================

// Get comments for a task
app.get('/api/tasks/:taskId/comments', authenticateToken, (req, res) => {
    db.all("SELECT * FROM taskComments WHERE taskId = ? ORDER BY timestamp ASC", [req.params.taskId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Add comment
app.post('/api/tasks/:taskId/comments', authenticateToken, (req, res) => {
    const { comment } = req.body;

    if (!comment) {
        return res.status(400).json({ error: 'Comment is required' });
    }

    db.run("INSERT INTO taskComments (taskId, userId, user, comment) VALUES (?, ?, ?, ?)",
        [req.params.taskId, req.user.id, req.user.name, comment],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            db.get("SELECT * FROM taskComments WHERE id = ?", [this.lastID], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.status(201).json(row);
            });
        });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});
