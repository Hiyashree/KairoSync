# Graphura.in - Task Management System

A modern, role-based task management dashboard built with HTML, CSS, and JavaScript.

## Features

- **Role-Based Access Control**: Three user roles (Admin, Team Leader, Employee)
- **Task Management**: Create, assign, and track tasks with status updates
- **Project Management**: Organize tasks into projects with progress tracking
- **Team Collaboration**: Manage teams, assign members, and track team progress
- **Calendar Integration**: View tasks and deadlines in calendar format
- **Settings Management**: User preferences, dark mode, notifications
- **Billing & Reports**: Generate reports and track project analytics

## User Roles

### Admin
- Create and manage projects
- Assign tasks to team members
- Create teams and assign leaders
- View all projects, tasks, and teams
- Generate reports and analytics
- Full system access

### Team Leader
- View projects assigned to their teams
- Create and assign tasks to team members
- Approve/reject completed tasks
- View team performance metrics
- Manage team members

### Employee
- View assigned tasks and projects
- Update task status
- View team members and team progress
- Access calendar for deadlines
- View project details

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser localStorage
- **Libraries**: 
  - FullCalendar.js (for calendar functionality)
  - Chart.js (for analytics charts)

## Getting Started

1. Clone this repository:
```bash
git clone https://github.com/yourusername/taskmanagement.git
cd taskmanagement
```

2. Open `index.html` in a web browser, or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Navigate to `http://localhost:8000` in your browser

4. Sign up for a new account or use existing credentials

## Project Structure

```
teammanagement/
├── index.html              # Entry point (redirects to mainpage)
├── mainpage.html           # Landing page
├── login.html              # Login/Signup page
├── admin.html              # Admin dashboard
├── employee.html           # Employee dashboard
├── team-leader.html        # Team leader dashboard
├── tasksadmin.html         # Admin tasks page
├── taskemployee.html       # Employee tasks page
├── taskleader.html         # Leader tasks page
├── taskdetail.html         # Task details page
├── summaryadmin.html       # Admin project summary
├── summaryemployee.html    # Employee project summary
├── summaryleader.html      # Leader project summary
├── teamadmin.html          # Admin teams page
├── teamemployee.html       # Employee teams page
├── teamleader.html         # Leader teams page
├── calendaradmin.html      # Admin calendar
├── calendaremployee.html   # Employee calendar
├── calendarleader.html     # Leader calendar
├── settingsadmin.html      # Admin settings
├── settingsemployee.html   # Employee settings
├── settingsleader.html      # Leader settings
├── billing.html            # Billing & reports
└── img/                    # Image assets
    └── mainBg2.png
```

## Data Storage

This application uses **browser localStorage** for data persistence. All data is stored locally in the user's browser.

**Note**: Data will be lost if:
- Browser cache is cleared
- localStorage is cleared
- Using incognito/private browsing mode

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Author

Graphura.in

## Acknowledgments

- FullCalendar.js for calendar functionality
- Chart.js for data visualization

