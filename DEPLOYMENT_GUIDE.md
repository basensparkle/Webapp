# ICT Eerbeek - Self-Hosted Deployment Guide

This guide will help you deploy the ICT Eerbeek application on your own Plesk Ubuntu VPS with **local authentication** (no Manus account required).

## 🎯 What's Fixed

This version includes the following improvements:

1. **✅ Local Authentication System**
   - No dependency on Manus OAuth
   - Email/password based login
   - Secure password hashing with PBKDF2
   - User management via admin panel

2. **✅ User Creation**
   - Create admin users via command line
   - Create additional users via admin panel
   - Role-based access control (admin, content_editor, user)

3. **✅ Page Creation**
   - Fully functional page creation and management
   - Bilingual content support (NL/EN)
   - Rich text editor support

4. **✅ Improved Deployment Script**
   - One-click installation
   - Comprehensive debug logging
   - Automatic error recovery
   - Environment variable support
   - Database auto-configuration

## 📋 Prerequisites

- Ubuntu 22.04 or 24.04 VPS with Plesk Obsidian
- Root access to the server
- MySQL/MariaDB installed (usually included with Plesk)
- Domain name pointing to your server (optional but recommended)

## 🚀 Quick Start Deployment

### Option 1: Upload and Deploy (Recommended)

1. **Upload the application files to your server:**

   ```bash
   # On your local machine
   scp ict-eerbeek-complete.tar.gz root@your-server-ip:/root/
   ```

2. **SSH into your server:**

   ```bash
   ssh root@your-server-ip
   ```

3. **Extract and deploy:**

   ```bash
   cd /root
   tar -xzf ict-eerbeek-complete.tar.gz
   cd ict-eerbeek
   bash deploy-plesk-improved.sh
   ```

4. **Follow the prompts:**
   - Enter MySQL root password (if required)
   - Enter database password for the application
   - Wait for installation to complete

5. **Create your admin user:**

   ```bash
   cd /root/ict-eerbeek
   pnpm init-admin
   ```

   Enter your admin details when prompted:
   - Admin Name: Your Name
   - Admin Email: admin@yourdomain.com
   - Admin Password: (min 8 characters)

### Option 2: Automated Deployment with Environment Variables

You can also deploy without interactive prompts by setting environment variables:

```bash
export DOMAIN="ict-eerbeek.nl"
export DB_NAME="icteerbeek"
export DB_USER="icteerbeek"
export DB_PASSWORD="your-secure-db-password"
export MYSQL_ROOT_PASSWORD="your-mysql-root-password"
export JWT_SECRET="your-random-jwt-secret"
export ADMIN_EMAIL="admin@yourdomain.com"
export ADMIN_PASSWORD="your-secure-admin-password"
export ADMIN_NAME="Admin User"

bash deploy-plesk-improved.sh
```

## 🔧 Configuration

### Environment Variables

The deployment script creates a `.env` file with the following configuration:

```env
# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/database

# JWT Configuration
JWT_SECRET=random-secret-key

# Authentication Mode
USE_LOCAL_AUTH=true

# Application Configuration
VITE_APP_TITLE=ICT Eerbeek
NODE_ENV=production
PORT=3000
```

### Database Configuration

The script automatically:
- Creates the MySQL database
- Creates the database user
- Sets up proper permissions
- Runs migrations
- Seeds initial data

## 👥 User Management

### Creating the First Admin User

After deployment, create your first admin user:

```bash
cd /root/ict-eerbeek
pnpm init-admin
```

### Creating Additional Users

1. Login to the admin panel at `http://your-domain.com`
2. Navigate to **Users** section
3. Click **Create User**
4. Fill in the details:
   - Name
   - Email
   - Password
   - Role (user, content_editor, or admin)

### User Roles

- **admin**: Full access to all features, can manage users
- **content_editor**: Can manage content (pages, services, menu items)
- **user**: Basic access (can be customized)

## 📄 Page Management

### Creating Pages

1. Login to the admin panel
2. Navigate to **Pages** section
3. Click **Create Page**
4. Fill in the page details:
   - Slug (URL path, e.g., "about-us")
   - Title (NL and EN)
   - Content (NL and EN) - supports rich text
   - Meta Description (for SEO)
   - Published status
   - Order (for sorting)

### Editing Pages

1. Navigate to **Pages** section
2. Click on the page you want to edit
3. Make your changes
4. Click **Save**

## 🔍 Troubleshooting

### Check Application Status

```bash
pm2 status
pm2 logs ict-eerbeek
```

### View Deployment Logs

```bash
cd /root/ict-eerbeek
ls -la deployment-logs/
cat deployment-logs/deploy-*.log
```

### Check Application Logs

```bash
cd /root/ict-eerbeek
tail -f logs/combined.log
tail -f logs/error.log
```

### Restart Application

```bash
pm2 restart ict-eerbeek
```

### Database Issues

If you encounter database connection issues:

1. Check database credentials in `.env`
2. Test database connection:
   ```bash
   mysql -u icteerbeek -p icteerbeek
   ```
3. Check database exists:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

### Application Not Starting

1. Check PM2 logs: `pm2 logs ict-eerbeek`
2. Check if port 3000 is available: `netstat -tulpn | grep 3000`
3. Rebuild application:
   ```bash
   cd /root/ict-eerbeek
   pnpm build
   pm2 restart ict-eerbeek
   ```

### Cannot Login

1. Verify admin user exists:
   ```bash
   mysql -u icteerbeek -p icteerbeek -e "SELECT id, email, name, role FROM users;"
   ```
2. Reset admin password by creating a new admin user
3. Check browser console for errors

## 🔒 Security Recommendations

1. **Change default database password** after deployment
2. **Use strong passwords** for admin accounts (min 12 characters)
3. **Enable HTTPS** via Plesk SSL/TLS settings
4. **Regular backups** of database and application files
5. **Keep Node.js and dependencies updated**
6. **Restrict database access** to localhost only
7. **Use firewall** to limit exposed ports

### Enable HTTPS

1. Login to Plesk
2. Go to your domain settings
3. Navigate to **SSL/TLS Certificates**
4. Install a Let's Encrypt certificate
5. Enable "Redirect from HTTP to HTTPS"
6. Update Nginx configuration to enable HTTPS redirect

## 📦 Backup and Restore

### Backup Database

```bash
mysqldump -u icteerbeek -p icteerbeek > backup-$(date +%Y%m%d).sql
```

### Restore Database

```bash
mysql -u icteerbeek -p icteerbeek < backup-20240101.sql
```

### Backup Application Files

```bash
cd /root
tar -czf ict-eerbeek-backup-$(date +%Y%m%d).tar.gz ict-eerbeek/
```

## 🔄 Updating the Application

1. **Backup current installation**
2. **Upload new version**
3. **Extract to temporary location**
4. **Copy `.env` file from old installation**
5. **Run migrations**: `pnpm db:push`
6. **Rebuild**: `pnpm build`
7. **Restart**: `pm2 restart ict-eerbeek`

## 📞 Support

For issues or questions:

1. Check the deployment logs in `deployment-logs/`
2. Check application logs in `logs/`
3. Review this documentation
4. Check PM2 status and logs

## 🎉 Success!

Once deployed, your application will be available at:
- **HTTP**: http://your-domain.com
- **HTTPS**: https://your-domain.com (after SSL configuration)

Default admin panel access:
- **URL**: http://your-domain.com/admin (or wherever you configured)
- **Email**: The email you set during `pnpm init-admin`
- **Password**: The password you set during `pnpm init-admin`

## 📝 Important Files

- **`.env`**: Environment configuration
- **`CREDENTIALS.txt`**: Deployment credentials (delete after saving)
- **`deployment-logs/`**: Deployment logs
- **`logs/`**: Application logs
- **`ecosystem.config.cjs`**: PM2 configuration

## 🛠️ Maintenance Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs ict-eerbeek

# Restart application
pm2 restart ict-eerbeek

# Stop application
pm2 stop ict-eerbeek

# Start application
pm2 start ict-eerbeek

# Create new admin user
pnpm init-admin

# Run database migrations
pnpm db:push

# Rebuild application
pnpm build
```

---

**Note**: This application is now completely self-hosted and does not require any Manus services. All authentication and data management is handled locally on your server.
