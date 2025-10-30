# ICT Eerbeek - Quick Start Guide

## 🚀 One-Click Deployment

### Step 1: Upload to Server

```bash
# Upload the tar.gz file to your server
scp ict-eerbeek-complete.tar.gz root@your-server-ip:/root/
```

### Step 2: Extract and Deploy

```bash
# SSH into your server
ssh root@your-server-ip

# Extract the files
cd /root
tar -xzf ict-eerbeek-complete.tar.gz
cd ict-eerbeek

# Run the deployment script
bash deploy-plesk-improved.sh
```

### Step 3: Create Admin User

```bash
# After deployment completes
pnpm init-admin
```

Enter your details:
- **Admin Name**: Your Name
- **Admin Email**: admin@yourdomain.com
- **Admin Password**: (minimum 8 characters)

### Step 4: Access Your Application

Open your browser and navigate to:
- **URL**: http://your-domain.com
- **Login**: Use the email and password you just created

## 🎯 What You Get

✅ **Self-hosted application** - No external dependencies  
✅ **Local authentication** - Email/password login  
✅ **User management** - Create and manage users  
✅ **Page creation** - Fully functional CMS  
✅ **Automatic setup** - Database, migrations, and seeding  
✅ **Debug logging** - Complete deployment logs  

## 📋 Requirements

- Ubuntu 22.04 or 24.04 with Plesk
- Root access
- MySQL/MariaDB (included with Plesk)

## 🔧 Key Features Fixed

1. ✅ User creation now works (no Manus account needed)
2. ✅ Page creation and management works
3. ✅ Local database with full control
4. ✅ One-click deployment script
5. ✅ Comprehensive debug logging

## 📞 Need Help?

Check the full documentation: `DEPLOYMENT_GUIDE.md`

View deployment logs:
```bash
cat deployment-logs/deploy-*.log
```

Check application status:
```bash
pm2 status
pm2 logs ict-eerbeek
```

---

**That's it!** Your application is now running with its own user database, completely self-hosted.
