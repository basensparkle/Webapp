# ICT Eerbeek - Deployment Guide for Plesk VPS

## Prerequisites

- Plesk VPS with Node.js support
- PostgreSQL database
- Domain name configured in Plesk
- SSH access to the server

## Step 1: Database Setup

1. **Create PostgreSQL Database in Plesk**
   - Log into Plesk control panel
   - Go to "Databases" → "Add Database"
   - Database name: `ict_eerbeek`
   - Create a database user with full privileges
   - Note down the connection details

2. **Configure Database Connection**
   - Connection string format: `mysql://user:password@host:port/database`
   - Example: `mysql://icteerbeek:password@localhost:3306/ict_eerbeek`

## Step 2: File Upload

1. **Upload Application Files**
   - Use Plesk File Manager or FTP/SFTP
   - Upload all files to: `/var/www/vhosts/yourdomain.com/`
   - Recommended structure:
     ```
     /var/www/vhosts/yourdomain.com/
     ├── httpdocs/          (will contain frontend build)
     ├── backend/           (backend application files)
     └── node_modules/      (dependencies)
     ```

2. **Install Dependencies**
   ```bash
   cd /var/www/vhosts/yourdomain.com/backend
   npm install
   # or
   pnpm install
   ```

## Step 3: Environment Configuration

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/ict_eerbeek

# JWT Secrets
JWT_SECRET=your-secure-random-string-here
JWT_REFRESH_SECRET=another-secure-random-string-here

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com

# SMTP (for contact form emails)
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password

# S3 Storage (if using custom S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=eu-west-1
AWS_BUCKET_NAME=ict-eerbeek-media
```

## Step 4: Database Migration

Run database migrations:

```bash
cd /var/www/vhosts/yourdomain.com/backend
npm run db:push
npm run seed
```

## Step 5: Build Frontend

```bash
cd /var/www/vhosts/yourdomain.com
npm run build
```

This creates optimized production files in `dist/` directory.

## Step 6: Configure Node.js in Plesk

1. **Enable Node.js Application**
   - Go to Plesk → Websites & Domains → Node.js
   - Click "Enable Node.js"
   - Application mode: Production
   - Application root: `/var/www/vhosts/yourdomain.com/backend`
   - Application startup file: `server/_core/index.ts`
   - Node.js version: 18.x or higher

2. **Set Environment Variables**
   - Add all variables from `.env` file in Plesk Node.js settings

## Step 7: Configure Nginx (Reverse Proxy)

Add to Plesk → Apache & nginx Settings → Additional nginx directives:

```nginx
location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

## Step 8: SSL/TLS Certificate

1. **Install SSL Certificate**
   - Go to Plesk → SSL/TLS Certificates
   - Use "Let's Encrypt" for free SSL
   - Enable "Secure the domain" and "Redirect from HTTP to HTTPS"

## Step 9: Process Management with PM2

Install PM2 globally:

```bash
npm install -g pm2
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'ict-eerbeek',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/vhosts/yourdomain.com/backend',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

Start the application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 10: Create Admin User

After deployment, promote your user to admin:

```bash
# Connect to database
mysql -u icteerbeek -p ict_eerbeek

# Update user role
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

## Step 11: Verify Deployment

1. Visit `https://yourdomain.com` - should show the homepage
2. Test language switching (NL/EN)
3. Submit a test contact form
4. Log in and access admin panel at `/admin`
5. Test creating/editing pages and services

## Maintenance

### View Logs
```bash
pm2 logs ict-eerbeek
```

### Restart Application
```bash
pm2 restart ict-eerbeek
```

### Update Application
```bash
cd /var/www/vhosts/yourdomain.com
git pull  # if using git
npm install
npm run build
pm2 restart ict-eerbeek
```

### Database Backup
```bash
mysqldump -u icteerbeek -p ict_eerbeek > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### Application Won't Start
- Check PM2 logs: `pm2 logs`
- Verify database connection
- Check environment variables
- Ensure port 3001 is not in use

### 502 Bad Gateway
- Check if Node.js application is running: `pm2 status`
- Verify nginx configuration
- Check firewall rules

### Database Connection Errors
- Verify DATABASE_URL is correct
- Check database user permissions
- Ensure PostgreSQL is running

## Security Checklist

- ✅ SSL/TLS certificate installed
- ✅ Strong JWT secrets generated
- ✅ Database user has minimal required permissions
- ✅ Environment variables secured
- ✅ Regular backups configured
- ✅ Firewall rules configured
- ✅ Rate limiting enabled on API endpoints

## Support

For deployment assistance or issues, contact Manus support or refer to the project documentation.
