# Spartan Data - Complete Dashboard System

A full-stack web application with PHP backend, MySQL database, and modern frontend for data management and user administration.

## 🚀 Features

- **🔐 Secure Authentication**: Role-based login system (Admin/User)
- **📊 Dynamic Dashboard**: Real-time statistics and analytics
- **👥 User Management**: Complete user administration (Admin only)
- **📈 Analytics**: Performance metrics and engagement data
- **🎨 Modern UI**: White and red theme with responsive design
- **🔒 Session Management**: Secure PHP sessions with database storage
- **📱 Mobile Responsive**: Works on all devices

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Server**: XAMPP (Apache)
- **Styling**: Custom CSS with Font Awesome icons

## 📋 Prerequisites

- XAMPP installed and running
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Modern web browser

## ⚡ Quick Setup

### 1. Start XAMPP
```bash
# Start Apache and MySQL services in XAMPP Control Panel
```

### 2. Database Setup
1. Open your browser and go to: `http://localhost/Rework/setup.php`
2. Follow the setup instructions
3. The script will create the database and insert default data

### 3. Access the Application
1. Go to: `http://localhost/Rework/login.html`
2. Use the default credentials:
   - **Admin**: `admin@spartandata.com` / `admin123`
   - **User**: `user@spartandata.com` / `user123`

## 📁 Project Structure

```
Rework/
├── api/                    # PHP API endpoints
│   ├── auth.php           # Authentication API
│   └── dashboard.php      # Dashboard data API
├── config/                # Configuration files
│   └── database.php       # Database configuration
├── database/              # Database files
│   └── schema.sql         # Database schema
├── includes/              # PHP helper functions
│   └── functions.php      # Utility functions
├── index.html             # Main dashboard
├── login.html             # Login page
├── setup.php              # Database setup script
├── styles.css             # Dashboard styling
├── login-styles.css       # Login page styling
├── script.js              # Dashboard JavaScript
├── login-script.js        # Login JavaScript
└── README.md              # This file
```

## 🔧 Configuration

### Database Configuration
Edit `config/database.php` if you need to change database settings:

```php
private $host = 'localhost';
private $db_name = 'spartan_data';
private $username = 'root';
private $password = '';
```

### Default Users
The system comes with two default users:
- **Admin User**: Full access to all features
- **Regular User**: Limited access to appropriate sections

## 🎯 API Endpoints

### Authentication API (`api/auth.php`)
- `POST ?action=login` - User login
- `POST ?action=logout` - User logout
- `GET ?action=check` - Check authentication status

### Dashboard API (`api/dashboard.php`)
- `GET ?action=overview` - Get dashboard overview data
- `GET ?action=analytics` - Get analytics data
- `GET ?action=users` - Get users list (Admin only)
- `POST ?action=update_stats` - Update dashboard statistics

## 🔒 Security Features

- **Password Hashing**: Bcrypt password encryption
- **Session Management**: Secure PHP sessions with database storage
- **CSRF Protection**: Cross-site request forgery prevention
- **Input Validation**: Server-side input sanitization
- **Role-based Access**: Different permissions for Admin/User
- **Activity Logging**: Track all user actions

## 📊 Database Schema

### Tables
- **users**: User accounts and profiles
- **user_sessions**: Active user sessions
- **system_settings**: Application configuration
- **activity_logs**: User activity tracking
- **dashboard_stats**: Dashboard statistics

## 🎨 Customization

### Theme Colors
The system uses a white and red theme. To customize:
1. Edit `styles.css` and `login-styles.css`
2. Update color variables in CSS
3. Modify the logo and branding

### Adding New Features
1. Create new API endpoints in `api/` folder
2. Add corresponding frontend JavaScript
3. Update database schema if needed
4. Add proper authentication checks

## 🐛 Troubleshooting

### Common Issues

1. **"Can't reach the site"**
   - Ensure XAMPP Apache is running
   - Check if you're accessing `http://localhost/Rework/`

2. **Database connection failed**
   - Verify MySQL is running in XAMPP
   - Check database credentials in `config/database.php`
   - Run `setup.php` to create the database

3. **Login not working**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Ensure database is properly set up

4. **Session issues**
   - Clear browser cookies and cache
   - Check PHP session configuration
   - Verify database connection

### Debug Mode
Enable error reporting in PHP by adding to the top of PHP files:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 📝 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@spartandata.com | admin123 |
| User | user@spartandata.com | user123 |

## 🔄 Updates and Maintenance

### Regular Maintenance
- Clean expired sessions: The system automatically cleans expired sessions
- Monitor activity logs: Check `activity_logs` table for user activities
- Update statistics: Dashboard stats are updated automatically

### Backup
- Database: Export MySQL database regularly
- Files: Backup the entire project folder
- Sessions: Sessions are stored in database and cleaned automatically

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check PHP error logs in XAMPP
4. Verify database connectivity

## 🎉 Success!

Once everything is set up, you'll have a fully functional dashboard system with:
- ✅ Secure authentication
- ✅ Role-based access control
- ✅ Real-time dashboard data
- ✅ User management
- ✅ Activity tracking
- ✅ Modern responsive UI

Enjoy your new Spartan Data dashboard system! 🚀




