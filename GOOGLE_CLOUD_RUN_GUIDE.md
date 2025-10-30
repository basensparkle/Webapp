# ICT Eerbeek - Google Cloud Run Deployment Guide

## 🚀 One-Click Deployment

This guide will help you deploy the ICT Eerbeek application to Google Cloud Run with Cloud SQL MySQL database.

## 📋 Prerequisites

1. **Google Cloud Account**
   - Sign up at: https://cloud.google.com
   - Free tier includes $300 credit for 90 days
   - Credit card required (but won't be charged during free trial)

2. **Google Cloud SDK (gcloud)**
   - Install from: https://cloud.google.com/sdk/docs/install
   - Or use Google Cloud Shell (browser-based, pre-installed)

3. **Application Files**
   - The `ict-eerbeek` directory with all files

## 🎯 Quick Start (Recommended)

### Step 1: Install Google Cloud SDK

**On Windows:**
```powershell
# Download and run the installer
# https://cloud.google.com/sdk/docs/install#windows
```

**On Mac:**
```bash
brew install --cask google-cloud-sdk
```

**On Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Or use Google Cloud Shell** (no installation needed):
- Go to: https://console.cloud.google.com
- Click the terminal icon in the top right
- Upload your application files

### Step 2: Run the Deployment Script

```bash
# Navigate to your application directory
cd ict-eerbeek

# Run the one-click deployment script
bash deploy-to-cloudrun.sh
```

That's it! The script will:
- ✅ Check if you're logged in to Google Cloud
- ✅ Enable required APIs
- ✅ Create Cloud SQL MySQL database
- ✅ Generate secure passwords
- ✅ Store secrets securely
- ✅ Build and deploy your application
- ✅ Give you the live URL

## 📝 What the Script Does

### 1. Authentication
- Logs you into Google Cloud (if needed)
- Selects or prompts for project ID

### 2. Enable APIs
- Cloud Run
- Cloud SQL
- Secret Manager
- Cloud Build
- Artifact Registry

### 3. Create Cloud SQL Instance
- MySQL 8.0 database
- f1-micro tier (cheapest)
- 10GB storage
- Automatic backups
- Europe-west1 region (change in script if needed)

### 4. Configure Database
- Creates database: `icteerbeek`
- Creates user: `icteerbeek`
- Generates secure password
- Stores credentials in Secret Manager

### 5. Deploy Application
- Builds Docker container
- Deploys to Cloud Run
- Connects to Cloud SQL
- Sets environment variables
- Makes it publicly accessible

## 🔧 After Deployment

### 1. Run Database Migrations

The deployment script will show you the exact command. It looks like this:

```bash
# Connect to your Cloud Run service
gcloud run services proxy ict-eerbeek --region=europe-west1

# In another terminal, run migrations
# (The script will provide the exact command)
```

**Or manually via Cloud Console:**
1. Go to Cloud Run in Google Cloud Console
2. Click on your service
3. Click "Edit & Deploy New Revision"
4. Add a startup command: `pnpm db:push`
5. Deploy
6. Change it back to `node dist/index.js` after migration

### 2. Create Admin User

**Option A: Via API (Recommended)**

```bash
# Get your service URL from the deployment output
SERVICE_URL="https://ict-eerbeek-xxxxx.run.app"

# Create admin user
curl -X POST ${SERVICE_URL}/api/auth/init-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "YourSecurePassword123",
    "name": "Admin User"
  }'
```

**Option B: Via Cloud Shell**

```bash
gcloud run services proxy ict-eerbeek --region=europe-west1 &
sleep 5

curl -X POST http://localhost:8080/api/auth/init-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "YourSecurePassword123",
    "name": "Admin User"
  }'
```

### 3. Access Your Application

Your application will be live at:
```
https://ict-eerbeek-xxxxx-ew.a.run.app
```

(The exact URL will be shown after deployment)

## 💰 Pricing Estimate

### Free Tier (First 90 Days)
- $300 credit
- More than enough for testing

### After Free Tier

**Cloud SQL (f1-micro):**
- ~$7-10/month
- 0.6 GB RAM
- Shared CPU
- 10 GB storage

**Cloud Run:**
- First 2 million requests/month: FREE
- First 360,000 GB-seconds/month: FREE
- Typical cost: $0-5/month for low traffic

**Total: ~$10-15/month**

## 🔒 Security Features

1. **Secrets Management**
   - Database credentials stored in Secret Manager
   - JWT secrets encrypted
   - No secrets in code or environment

2. **Private Database Connection**
   - Cloud SQL uses private connection
   - Not exposed to internet
   - Accessed via Unix socket

3. **HTTPS by Default**
   - Automatic SSL certificate
   - Managed by Google

## 🌐 Custom Domain (Optional)

### 1. Verify Domain Ownership

```bash
gcloud domains verify yourdomain.com
```

### 2. Map Domain to Cloud Run

```bash
gcloud run domain-mappings create \
  --service=ict-eerbeek \
  --domain=ict-eerbeek.nl \
  --region=europe-west1
```

### 3. Update DNS Records

Add the DNS records shown by the command above to your domain registrar.

## 📊 Monitoring

### View Logs

```bash
gcloud run services logs read ict-eerbeek \
  --region=europe-west1 \
  --limit=50
```

### View Metrics

Go to: https://console.cloud.google.com/run

## 🔄 Updating Your Application

### 1. Make Changes to Your Code

### 2. Redeploy

```bash
cd ict-eerbeek
bash deploy-to-cloudrun.sh
```

The script is idempotent - it will update existing resources without recreating them.

## 🛠️ Troubleshooting

### Issue: "Permission denied"

**Solution:**
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Issue: "API not enabled"

**Solution:**
The script enables APIs automatically. If it fails, manually enable:
```bash
gcloud services enable run.googleapis.com sqladmin.googleapis.com
```

### Issue: "Cloud SQL instance creation failed"

**Solution:**
- Check if you have billing enabled
- Verify you have quota in the selected region
- Try a different region (edit the script)

### Issue: "Database connection failed"

**Solution:**
```bash
# Check Cloud SQL instance status
gcloud sql instances describe ict-eerbeek-db

# Check connection name is correct
gcloud sql instances describe ict-eerbeek-db --format="value(connectionName)"
```

### Issue: "Application not responding"

**Solution:**
```bash
# Check logs
gcloud run services logs read ict-eerbeek --region=europe-west1

# Check if migrations were run
# Run the migration command from deployment output
```

## 📞 Support

### Google Cloud Support
- Documentation: https://cloud.google.com/run/docs
- Community: https://stackoverflow.com/questions/tagged/google-cloud-run

### Application Issues
- Check deployment logs
- Verify environment variables
- Ensure database migrations ran successfully

## 🎉 Success Checklist

After deployment, verify:

- [ ] Application URL is accessible
- [ ] Can create admin user
- [ ] Can login with admin credentials
- [ ] Can create pages
- [ ] Can create users
- [ ] Database is connected
- [ ] No errors in logs

## 📝 Important Files

- `deploy-to-cloudrun.sh` - One-click deployment script
- `Dockerfile.cloudrun` - Docker configuration for Cloud Run
- `.dockerignore` - Files to exclude from Docker build
- `CLOUDRUN_CREDENTIALS.txt` - Generated credentials (keep secure!)

## 🔐 Security Best Practices

1. **Change Default Passwords**
   - Change admin password after first login
   - Rotate JWT secret periodically

2. **Enable Cloud Armor** (Optional, for DDoS protection)
   ```bash
   gcloud compute security-policies create ict-eerbeek-policy
   ```

3. **Set Up Monitoring**
   - Enable Cloud Monitoring
   - Set up alerts for errors

4. **Regular Backups**
   - Cloud SQL automatic backups are enabled
   - Export database periodically

## 💡 Tips

1. **Use Cloud Shell** if you don't want to install gcloud locally
2. **Start with f1-micro** database tier, upgrade if needed
3. **Monitor costs** in Google Cloud Console
4. **Set up budget alerts** to avoid surprises
5. **Use Secret Manager** for all sensitive data

---

## Quick Reference Commands

```bash
# View service details
gcloud run services describe ict-eerbeek --region=europe-west1

# View logs
gcloud run services logs read ict-eerbeek --region=europe-west1

# Update service
gcloud run deploy ict-eerbeek --source . --region=europe-west1

# Delete service (cleanup)
gcloud run services delete ict-eerbeek --region=europe-west1

# Delete Cloud SQL instance (cleanup)
gcloud sql instances delete ict-eerbeek-db

# View all Cloud Run services
gcloud run services list

# View all Cloud SQL instances
gcloud sql instances list
```

---

**Ready to deploy? Run:**
```bash
bash deploy-to-cloudrun.sh
```
