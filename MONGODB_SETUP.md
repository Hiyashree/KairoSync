# MongoDB Setup Guide

This project can use **MongoDB** to store employees, leaders, admin, projects, tasks, and notifications.

## What's Included

### 1. **MongoDB config**
- `config/db.js` – Connects to MongoDB using the connection string from `.env`.

### 2. **Models (schemas)**
- **`models/User.js`** – Admin, leaders, and employees  
  - Fields: `name`, `email`, `password`, `role` (admin/leader/employee), `domain`, `profilePicture`  
  - Passwords are hashed with bcrypt before saving.
- **`models/Project.js`** – Projects  
- **`models/Task.js`** – Tasks  
- **`models/Notification.js`** – Notifications  
- **`models/TaskComment.js`** – Task comments  

### 3. **MongoDB server**
- **`server-mongo.js`** – Same API as the SQLite server, but uses MongoDB.

---

## Step 1: Install MongoDB

### Option A: Local MongoDB

**Windows**
1. Download: https://www.mongodb.com/try/download/community  
2. Run the installer and choose “Complete”.  
3. Install as a service (default).  
4. MongoDB runs at `mongodb://localhost:27017`.

**macOS**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu)**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### Option B: MongoDB Atlas (cloud)

1. Go to https://www.mongodb.com/cloud/atlas  
2. Create a free account and a cluster.  
3. Under **Database Access** → Add user (username + password).  
4. Under **Network Access** → Add IP (e.g. `0.0.0.0` for “allow from anywhere” in dev).  
5. Click **Connect** on the cluster → **Connect your application** → copy the connection string.  
6. Replace `<password>` with your user password.  
   Example:  
   `mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/taskmanagement?retryWrites=true&w=majority`

---

## Step 2: Install dependencies

```bash
npm install
```

This installs `mongoose` (and other dependencies).

---

## Step 3: Configure environment

1. Copy the example env file:
   ```bash
   copy .env.example .env
   ```
   (On macOS/Linux: `cp .env.example .env`)

2. Edit `.env` and set:

   **Local MongoDB:**
   ```
   MONGODB_URI=mongodb://localhost:27017/taskmanagement
   ```

   **MongoDB Atlas:**
   ```
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.xxxxx.mongodb.net/taskmanagement?retryWrites=true&w=majority
   ```

   Optionally set `JWT_SECRET` and `PORT`.

---

## Step 4: Run the MongoDB server

```bash
npm run start:mongo
```

Or with auto-restart during development:

```bash
npm run dev:mongo
```

You should see:
- `MongoDB Connected: ...`
- `Server running on http://localhost:3000`
- `Using MongoDB for database.`
- If no admin exists: `Default admin user created: admin@graphura.in / admin123`

---

## Default admin (MongoDB)

When you run `server-mongo.js` for the first time, it creates an admin user if none exists:

- **Email:** `admin@graphura.in`  
- **Password:** `admin123`  

Change this password in production.

## Seed demo users (optional)

To add demo admin, leader, and employee (matching your login.html demo accounts):

```bash
npm run seed:mongo
```

This creates (if they don't already exist):

| Role    | Email              | Password   | Domain   |
|---------|--------------------|------------|----------|
| Admin   | admin@graphura.in  | admin123   | -        |
| Leader  | leader@gmail.com   | leader123  | Frontend |
| Employee| employee@gmail.com | employee123| Frontend |

---

## API (same as SQLite server)

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`  
- **Users:** `GET /api/users`, `GET /api/users/:id`, `PUT /api/users/:id`  
- **Projects:** `GET/POST/PUT/DELETE /api/projects`  
- **Tasks:** `GET/POST/PUT/DELETE /api/tasks`  
- **Notifications:** `GET/POST /api/notifications`, etc.  
- **Comments:** `GET/POST /api/tasks/:taskId/comments`  

The frontend does not need changes: use the same base URL (e.g. `http://localhost:3000`) and the same API; only the server script changes (`server.js` vs `server-mongo.js`).

---

## User roles in the database

- **admin** – Full access; created by default.  
- **leader** – Team leader; can be created via signup or API.  
- **employee** – Employee; can be created via signup or API.  

All are stored in the **User** collection with `role`, `name`, `email`, `domain`, and hashed `password`.

---

## Switching between SQLite and MongoDB

- **SQLite (default):**  
  `npm start` or `npm run dev`  
  Uses `server.js` and `taskmanagement.db`.

- **MongoDB:**  
  `npm run start:mongo` or `npm run dev:mongo`  
  Uses `server-mongo.js` and MongoDB.

Use only one server at a time (same port). The frontend can stay the same; just run the server you want (SQLite or MongoDB).

---

## Troubleshooting

**“MongoDB connection error”**
- Check that MongoDB is running (local or Atlas).  
- Check `MONGODB_URI` in `.env` (no spaces, correct password for Atlas).  
- For Atlas: ensure your IP is allowed under Network Access.

**“Cannot find module './config/db'"**
- Run `npm install` from the project root.  
- Ensure `config/db.js` and `models/*.js` exist.

**Port already in use**
- Stop the other server (SQLite or MongoDB) or set a different `PORT` in `.env`.
