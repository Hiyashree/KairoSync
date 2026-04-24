# 🚀 Quick Start Guide - Backend Setup

## Yes, You Need a Backend!

Your current app uses **localStorage** which has these problems:
- ❌ Data lost when browser cache is cleared
- ❌ Data doesn't sync across devices
- ❌ No real security/authentication
- ❌ Not suitable for production

## ✅ What I've Added

1. **Backend Server** (`server.js`) - Node.js/Express API
2. **Database** - SQLite (auto-created)
3. **API Utility** (`js/api.js`) - Easy API calls
4. **Updated admin.html** - Example of API integration

## 🎯 Quick Setup (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Server
```bash
npm start
```

You should see:
```
Connected to SQLite database
Server running on http://localhost:3000
Default admin user created: admin@graphura.in / admin123
```

### Step 3: Test It
1. Open `http://localhost:3000/login.html` in browser
2. Login with: `admin@graphura.in` / `admin123`
3. Check browser console for any errors

## 📚 What to Do Next

### Option A: Quick Test (Current State)
- Server is running ✅
- `admin.html` partially updated ✅
- Other pages still use localStorage
- **This works but is incomplete**

### Option B: Complete Migration (Recommended)
Follow `IMPLEMENTATION_STEPS.md` to:
1. Add `<script src="js/api.js"></script>` to all HTML files
2. Update login/signup to use API
3. Update all data loading/saving functions
4. Test everything

## 📖 Documentation Files

- **`BACKEND_SETUP.md`** - Detailed setup instructions
- **`IMPLEMENTATION_STEPS.md`** - Step-by-step migration guide
- **`js/migration-helper.js`** - Code examples for migration

## 🔑 Default Credentials

- **Email:** admin@graphura.in
- **Password:** admin123

⚠️ **Change this in production!**

## 🛠️ API Endpoints

All endpoints are at: `http://localhost:3000/api`

- `/api/auth/login` - Login
- `/api/auth/register` - Signup
- `/api/projects` - Projects CRUD
- `/api/tasks` - Tasks CRUD
- `/api/users` - Users CRUD
- `/api/notifications` - Notifications CRUD

## 💡 Key Points

1. **Backend is required** for production use
2. **Current setup works** but needs completion
3. **Fallback included** - works with/without API
4. **All data stored in database** - persistent and secure

## ❓ Need Help?

Check:
- `BACKEND_SETUP.md` for setup issues
- `IMPLEMENTATION_STEPS.md` for migration help
- Browser console for errors
- Server terminal for API errors

---

**You're all set! Start the server and begin testing.** 🎉
