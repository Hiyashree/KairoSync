# Backend Setup Guide

This guide will help you set up the backend server for the Task Management System.

## Prerequisites

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

## Step-by-Step Setup

### Step 1: Install Dependencies

Open your terminal/command prompt in the project directory and run:

```bash
npm install
```

This will install all required packages:
- Express (web server)
- SQLite3 (database)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- cors (cross-origin requests)
- body-parser (request parsing)

### Step 2: Start the Server

Run the server using one of these commands:

**For production:**
```bash
npm start
```

**For development (with auto-restart):**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Step 3: Verify Server is Running

You should see:
```
Connected to SQLite database
Server running on http://localhost:3000
API endpoints available at http://localhost:3000/api
Default admin user created: admin@graphura.in / admin123
```

### Step 4: Update Frontend Files

The frontend HTML files need to include the API utility script. Add this before the closing `</body>` tag in each HTML file:

```html
<script src="js/api.js"></script>
```

## Default Admin Credentials

After first run, you can login with:
- **Email:** admin@graphura.in
- **Password:** admin123

**⚠️ IMPORTANT:** Change this password in production!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks (optional: ?projectId=1)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications` - Clear all

### Comments
- `GET /api/tasks/:taskId/comments` - Get task comments
- `POST /api/tasks/:taskId/comments` - Add comment

## Database

The database file `taskmanagement.db` will be created automatically in the project root directory.

**Tables:**
- `users` - User accounts
- `projects` - Projects
- `tasks` - Tasks
- `notifications` - Notifications
- `taskComments` - Task comments

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, change it in `server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change to 3001 or any available port
```

Then update `API_BASE_URL` in `js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

### Database Errors
If you encounter database errors:
1. Delete `taskmanagement.db` file
2. Restart the server (it will recreate the database)

### CORS Errors
If you see CORS errors in the browser console, make sure:
1. The server is running
2. The API_BASE_URL in `js/api.js` matches your server URL

## Production Deployment

For production:
1. Set a strong `JWT_SECRET` environment variable
2. Use a production database (PostgreSQL, MySQL) instead of SQLite
3. Set up proper HTTPS
4. Configure environment variables
5. Use a process manager like PM2

## Next Steps

1. Update all HTML files to use the API instead of localStorage
2. Test all functionality
3. Deploy to a hosting service
