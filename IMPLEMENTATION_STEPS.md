# Backend Implementation Steps

## ✅ What Has Been Done

1. **Backend Server Created** (`server.js`)
   - Express.js server with SQLite database
   - JWT authentication
   - Complete REST API endpoints
   - Database schema with all tables

2. **API Utility Created** (`js/api.js`)
   - Helper functions for all API calls
   - Authentication handling
   - Easy-to-use API interface

3. **Migration Helper** (`js/migration-helper.js`)
   - Examples showing how to convert localStorage to API calls
   - Helper functions for common operations

4. **Updated admin.html**
   - Added API script reference
   - Updated key functions (loadStatistics, loadNotifications, sendNotification, clearAllNotifications)
   - Functions now work with both API and localStorage (fallback)

5. **Documentation**
   - `BACKEND_SETUP.md` - Setup instructions
   - `package.json` - Dependencies

## 📋 Steps to Complete Implementation

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start the Backend Server

```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Step 3: Add API Script to All HTML Files

Add this line before the closing `</body>` tag in **ALL** HTML files:

```html
<script src="js/api.js"></script>
```

Files that need updating:
- login.html
- admin.html ✅ (already done)
- employee.html
- team-leader.html
- createadmin.html
- summaryadmin.html
- summaryemployee.html
- summaryleader.html
- taskemployee.html
- taskleader.html
- taskdetail.html
- teamadmin.html
- teamemployee.html
- teamleader.html
- calendaradmin.html
- calendaremployee.html
- calendarleader.html
- settingsadmin.html
- settingsemployee.html
- settingsleader.html
- billing.html

### Step 4: Update Login/Signup Functions

In `login.html`, update the login and signup functions to use the API:

**Login Function:**
```javascript
// OLD: localStorage-based login
// NEW: API-based login
async function handleLogin(email, password) {
    try {
        const result = await API.Auth.login(email, password);
        // Token and user info are automatically stored
        // Redirect based on role
        switch(result.user.role) {
            case 'admin':
                window.location.href = 'admin.html';
                break;
            case 'leader':
                window.location.href = 'team-leader.html';
                break;
            case 'employee':
                window.location.href = 'employee.html';
                break;
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}
```

**Signup Function:**
```javascript
// OLD: localStorage-based signup
// NEW: API-based signup
async function handleSignup(name, email, password, role) {
    try {
        const result = await API.Auth.register({ name, email, password, role });
        // Token and user info are automatically stored
        alert('Account created successfully!');
        // Redirect to appropriate dashboard
    } catch (error) {
        alert('Signup failed: ' + error.message);
    }
}
```

### Step 5: Update All Data Loading Functions

Replace all `localStorage.getItem()` calls with API calls:

**Pattern to Follow:**

```javascript
// OLD WAY:
const projects = JSON.parse(localStorage.getItem('projects')) || [];

// NEW WAY (with fallback):
async function loadProjects() {
    try {
        if (window.API) {
            return await API.Projects.getAll();
        } else {
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('projects')) || [];
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}
```

### Step 6: Update All Data Saving Functions

Replace all `localStorage.setItem()` calls with API calls:

**Pattern to Follow:**

```javascript
// OLD WAY:
localStorage.setItem('projects', JSON.stringify(projects));

// NEW WAY (with fallback):
async function saveProject(projectData) {
    try {
        if (window.API) {
            return await API.Projects.create(projectData);
        } else {
            // Fallback to localStorage
            const projects = JSON.parse(localStorage.getItem('projects')) || [];
            projects.push({ ...projectData, id: Date.now() });
            localStorage.setItem('projects', JSON.stringify(projects));
            return projects[projects.length - 1];
        }
    } catch (error) {
        console.error('Error saving project:', error);
        throw error;
    }
}
```

### Step 7: Update Functions in Each File

Here's a checklist of functions to update in each file:

#### login.html
- [ ] Login function → Use `API.Auth.login()`
- [ ] Signup function → Use `API.Auth.register()`

#### admin.html ✅ (Partially done)
- [x] loadStatistics() → Uses API
- [x] loadNotifications() → Uses API
- [x] sendNotification() → Uses API
- [x] clearAllNotifications() → Uses API
- [ ] loadRecentActivity() → Update to use API
- [ ] loadActiveProjects() → Update to use API
- [ ] loadLeadersOverview() → Update to use API

#### Other HTML files
- [ ] All data loading functions
- [ ] All data saving functions
- [ ] All update functions
- [ ] All delete functions

## 🔄 Migration Pattern

### Loading Data
```javascript
// Before
function loadData() {
    const data = JSON.parse(localStorage.getItem('data')) || [];
    // use data
}

// After
async function loadData() {
    try {
        const data = window.API 
            ? await API.Data.getAll() 
            : JSON.parse(localStorage.getItem('data')) || [];
        // use data
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### Saving Data
```javascript
// Before
function saveData(newItem) {
    const data = JSON.parse(localStorage.getItem('data')) || [];
    data.push(newItem);
    localStorage.setItem('data', JSON.stringify(data));
}

// After
async function saveData(newItem) {
    try {
        if (window.API) {
            await API.Data.create(newItem);
        } else {
            const data = JSON.parse(localStorage.getItem('data')) || [];
            data.push(newItem);
            localStorage.setItem('data', JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

## 🧪 Testing

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Test login:**
   - Go to `http://localhost:3000/login.html`
   - Use default admin: `admin@graphura.in` / `admin123`
   - Or create a new account

3. **Test API endpoints:**
   - Open browser console
   - Check for API errors
   - Verify data is loading from API

4. **Test fallback:**
   - Stop the server
   - App should still work with localStorage (fallback mode)

## 🐛 Troubleshooting

### API Not Working
- Check if server is running on port 3000
- Check browser console for CORS errors
- Verify `API_BASE_URL` in `js/api.js` matches server URL

### Authentication Issues
- Check if token is being stored in localStorage
- Verify JWT_SECRET in server.js
- Check token expiration (default: 7 days)

### Database Issues
- Delete `taskmanagement.db` and restart server
- Check database file permissions
- Verify SQLite3 is installed

## 📝 Notes

- The implementation includes **fallback support** - if API is unavailable, it falls back to localStorage
- All async functions need to be called with `await` or `.then()`
- Update DOM manipulation to wait for async data loading
- Consider adding loading indicators for better UX

## 🚀 Next Steps

1. Complete updating all HTML files
2. Test all functionality
3. Deploy backend to a hosting service
4. Update API_BASE_URL for production
5. Set up proper environment variables
6. Consider migrating to PostgreSQL/MySQL for production
