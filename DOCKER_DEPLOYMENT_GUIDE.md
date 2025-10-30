# ICT Eerbeek - Docker Deployment Guide

Complete guide for deploying the ICT Eerbeek application using Docker and Docker Compose on Ubuntu 22.04.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Manual Deployment](#manual-deployment)
4. [Configuration](#configuration)
5. [SSL Certificate Setup](#ssl-certificate-setup)
6. [Management Commands](#management-commands)
7. [Troubleshooting](#troubleshooting)
8. [Backup & Restore](#backup--restore)

---

## 🔧 Prerequisites

### System Requirements
- **OS**: Ubuntu 22.04 LTS (or compatible)
- **RAM**: Minimum 2GB (4GB recommended)
- **Disk**: Minimum 20GB free space
- **CPU**: 2 cores minimum
- **Access**: Root or sudo privileges

### Required Software
- Docker Engine 24.0+
- Docker Compose V2
- Git (optional, for cloning repository)

---

## 🚀 Quick Start

### Option 1: Automated Deployment Script

1. **Upload files to your server**:
```bash
# On your local machine
scp -r ict-eerbeek/ root@your-server-ip:/opt/
```

2. **Run the deployment script**:
```bash
ssh root@your-server-ip
cd /opt/ict-eerbeek
chmod +x deploy-docker.sh
./deploy-docker.sh
```

3. **Follow the prompts** to complete the installation

4. **Access your application**:
```
http://your-server-ip
```

---

## 📖 Manual Deployment

### Step 1: Install Docker

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Docker dependencies
apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### Step 2: Prepare Application Files

```bash
# Create deployment directory
mkdir -p /opt/ict-eerbeek
cd /opt/ict-eerbeek

# Upload your application files here
# OR clone from Git repository:
# git clone https://your-repo-url.git .
```

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.docker.example .env.docker

# Generate secure credentials
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Edit .env.docker with your values
nano .env.docker
```

**Required Environment Variables**:
```env
# Database
MYSQL_ROOT_PASSWORD=<generated_password>
DB_PASSWORD=<generated_password>

# Security
JWT_SECRET=<generated_secret>

# Manus OAuth (get from Manus dashboard)
VITE_APP_ID=your_app_id
OWNER_OPEN_ID=your_openid
BUILT_IN_FORGE_API_KEY=your_api_key
```

### Step 4: Create Required Directories

```bash
mkdir -p logs/nginx
mkdir -p docker/nginx/ssl
```

### Step 5: Build and Start Containers

```bash
# Build Docker images
docker compose --env-file .env.docker build

# Start containers
docker compose --env-file .env.docker up -d

# Check container status
docker compose --env-file .env.docker ps
```

### Step 6: Run Database Migrations

```bash
# Wait for database to be ready (about 30 seconds)
sleep 30

# Run migrations
docker compose --env-file .env.docker exec app sh -c "cd /app && pnpm db:push"

# Seed initial data (if seed script exists)
docker compose --env-file .env.docker exec app sh -c "cd /app && pnpm tsx server/seed.ts"
```

### Step 7: Verify Deployment

```bash
# Check logs
docker compose --env-file .env.docker logs -f

# Test application
curl http://localhost

# Check container health
docker compose --env-file .env.docker ps
```

---

## ⚙️ Configuration

### Docker Compose Services

The `docker-compose.yml` defines three services:

#### 1. Database (MySQL 8.0)
- **Container**: `ict-eerbeek-db`
- **Port**: 3306
- **Volume**: `db_data` (persistent storage)
- **Health Check**: MySQL ping every 10s

#### 2. Application (Node.js)
- **Container**: `ict-eerbeek-app`
- **Port**: 3000
- **Depends On**: Database
- **Health Check**: HTTP GET /api/health every 30s

#### 3. Nginx (Reverse Proxy)
- **Container**: `ict-eerbeek-nginx`
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Depends On**: Application
- **Config**: `docker/nginx/conf.d/`

### Environment Variables

All environment variables are defined in `.env.docker`:

| Variable | Description | Required |
|----------|-------------|----------|
| `MYSQL_ROOT_PASSWORD` | MySQL root password | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `VITE_APP_ID` | Manus OAuth App ID | Yes |
| `OWNER_OPEN_ID` | Owner's Manus OpenID | Yes |
| `BUILT_IN_FORGE_API_KEY` | Manus Forge API key | Yes |
| `VITE_APP_TITLE` | Application title | No |
| `VITE_APP_LOGO` | Logo URL | No |

### Network Configuration

All containers communicate through the `ict-eerbeek-network` bridge network:

```
Internet → Nginx (80/443) → App (3000) → Database (3306)
```

---

## 🔒 SSL Certificate Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
apt-get install -y certbot

# Stop Nginx temporarily
docker compose --env-file .env.docker stop nginx

# Obtain certificate
certbot certonly --standalone -d icteerbeek.nl -d www.icteerbeek.nl

# Copy certificates to Docker volume
cp /etc/letsencrypt/live/icteerbeek.nl/fullchain.pem docker/nginx/ssl/
cp /etc/letsencrypt/live/icteerbeek.nl/privkey.pem docker/nginx/ssl/

# Update Nginx configuration
nano docker/nginx/conf.d/ict-eerbeek.conf
# Uncomment the HTTPS server block

# Restart Nginx
docker compose --env-file .env.docker start nginx
```

### Option 2: Custom Certificate

```bash
# Copy your certificate files
cp your-fullchain.pem docker/nginx/ssl/fullchain.pem
cp your-privkey.pem docker/nginx/ssl/privkey.pem

# Set correct permissions
chmod 644 docker/nginx/ssl/fullchain.pem
chmod 600 docker/nginx/ssl/privkey.pem

# Update Nginx configuration
nano docker/nginx/conf.d/ict-eerbeek.conf
# Uncomment the HTTPS server block

# Restart Nginx
docker compose --env-file .env.docker restart nginx
```

### Auto-Renewal (Let's Encrypt)

```bash
# Create renewal script
cat > /opt/ict-eerbeek/renew-ssl.sh <<'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/icteerbeek.nl/fullchain.pem /opt/ict-eerbeek/docker/nginx/ssl/
cp /etc/letsencrypt/live/icteerbeek.nl/privkey.pem /opt/ict-eerbeek/docker/nginx/ssl/
docker compose --env-file /opt/ict-eerbeek/.env.docker restart nginx
EOF

chmod +x /opt/ict-eerbeek/renew-ssl.sh

# Add to crontab (runs daily at 2 AM)
echo "0 2 * * * /opt/ict-eerbeek/renew-ssl.sh" | crontab -
```

---

## 🛠️ Management Commands

### Container Management

```bash
# Start all containers
docker compose --env-file .env.docker up -d

# Stop all containers
docker compose --env-file .env.docker stop

# Restart all containers
docker compose --env-file .env.docker restart

# Restart specific service
docker compose --env-file .env.docker restart app

# Stop and remove containers
docker compose --env-file .env.docker down

# Stop and remove containers + volumes (⚠️ deletes database)
docker compose --env-file .env.docker down -v
```

### Logs

```bash
# View all logs
docker compose --env-file .env.docker logs

# Follow logs in real-time
docker compose --env-file .env.docker logs -f

# View specific service logs
docker compose --env-file .env.docker logs app
docker compose --env-file .env.docker logs db
docker compose --env-file .env.docker logs nginx

# Last 100 lines
docker compose --env-file .env.docker logs --tail=100 app
```

### Container Shell Access

```bash
# Access application container
docker compose --env-file .env.docker exec app sh

# Access database container
docker compose --env-file .env.docker exec db bash

# Run commands without entering shell
docker compose --env-file .env.docker exec app node --version
docker compose --env-file .env.docker exec db mysql -u root -p
```

### Database Management

```bash
# Access MySQL CLI
docker compose --env-file .env.docker exec db mysql -u root -p

# Export database
docker compose --env-file .env.docker exec db mysqldump -u root -p ict_eerbeek > backup.sql

# Import database
docker compose --env-file .env.docker exec -T db mysql -u root -p ict_eerbeek < backup.sql

# Run migrations
docker compose --env-file .env.docker exec app sh -c "cd /app && pnpm db:push"
```

### Updates and Rebuilds

```bash
# Pull latest code (if using Git)
git pull

# Rebuild images
docker compose --env-file .env.docker build --no-cache

# Restart with new images
docker compose --env-file .env.docker up -d --force-recreate
```

---

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check container status
docker compose --env-file .env.docker ps

# View detailed logs
docker compose --env-file .env.docker logs app

# Check container health
docker inspect ict-eerbeek-app | grep -A 10 Health
```

### Database Connection Issues

```bash
# Check database is running
docker compose --env-file .env.docker ps db

# Test database connection
docker compose --env-file .env.docker exec db mysqladmin ping -h localhost -u root -p

# Check database logs
docker compose --env-file .env.docker logs db

# Verify DATABASE_URL in .env.docker
cat .env.docker | grep DATABASE_URL
```

### Application Errors

```bash
# View application logs
docker compose --env-file .env.docker logs -f app

# Check environment variables
docker compose --env-file .env.docker exec app env

# Restart application
docker compose --env-file .env.docker restart app

# Rebuild application
docker compose --env-file .env.docker build app
docker compose --env-file .env.docker up -d --force-recreate app
```

### Nginx Issues

```bash
# Check Nginx logs
docker compose --env-file .env.docker logs nginx

# Test Nginx configuration
docker compose --env-file .env.docker exec nginx nginx -t

# Reload Nginx
docker compose --env-file .env.docker exec nginx nginx -s reload

# Check if application is accessible
curl -I http://localhost:3000
```

### Port Already in Use

```bash
# Find process using port 80
lsof -i :80

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
# ports:
#   - "8080:80"  # Use port 8080 instead
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Remove unused Docker resources
docker system prune -a

# Remove old images
docker image prune -a

# Remove unused volumes
docker volume prune
```

---

## 💾 Backup & Restore

### Backup

```bash
#!/bin/bash
# backup.sh - Complete backup script

BACKUP_DIR="/opt/backups/ict-eerbeek"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${DATE}"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Backup database
docker compose --env-file .env.docker exec -T db mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ict_eerbeek > ${BACKUP_FILE}_database.sql

# Backup environment file
cp .env.docker ${BACKUP_FILE}_env.docker

# Backup uploaded files (if any)
tar -czf ${BACKUP_FILE}_files.tar.gz logs/ docker/

echo "Backup completed: ${BACKUP_FILE}"

# Keep only last 7 days of backups
find ${BACKUP_DIR} -name "backup_*" -mtime +7 -delete
```

### Restore

```bash
#!/bin/bash
# restore.sh - Restore from backup

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <backup_file_prefix>"
    exit 1
fi

# Stop containers
docker compose --env-file .env.docker stop

# Restore database
docker compose --env-file .env.docker exec -T db mysql -u root -p${MYSQL_ROOT_PASSWORD} ict_eerbeek < ${BACKUP_FILE}_database.sql

# Restore environment file
cp ${BACKUP_FILE}_env.docker .env.docker

# Restore files
tar -xzf ${BACKUP_FILE}_files.tar.gz

# Start containers
docker compose --env-file .env.docker start

echo "Restore completed from: ${BACKUP_FILE}"
```

### Automated Backups

```bash
# Add to crontab (daily at 3 AM)
echo "0 3 * * * /opt/ict-eerbeek/backup.sh" | crontab -
```

---

## 📊 Monitoring

### Container Health

```bash
# Check all container health
docker compose --env-file .env.docker ps

# Detailed health status
docker inspect ict-eerbeek-app | jq '.[0].State.Health'
```

### Resource Usage

```bash
# Real-time resource usage
docker stats

# Specific container
docker stats ict-eerbeek-app
```

### Application Metrics

```bash
# Check application health endpoint
curl http://localhost/api/health

# Check response time
time curl -s http://localhost > /dev/null
```

---

## 🔄 Updates

### Application Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose --env-file .env.docker build
docker compose --env-file .env.docker up -d --force-recreate

# Run migrations if needed
docker compose --env-file .env.docker exec app sh -c "cd /app && pnpm db:push"
```

### Docker Updates

```bash
# Update Docker Engine
apt-get update
apt-get install docker-ce docker-ce-cli containerd.io

# Update Docker Compose
apt-get install docker-compose-plugin
```

---

## 🚨 Emergency Procedures

### Complete Reset

```bash
# ⚠️ WARNING: This will delete ALL data!

# Stop and remove everything
docker compose --env-file .env.docker down -v

# Remove images
docker rmi $(docker images -q ict-eerbeek*)

# Start fresh
docker compose --env-file .env.docker up -d
```

### Rollback

```bash
# Stop current version
docker compose --env-file .env.docker down

# Restore from backup
./restore.sh /opt/backups/ict-eerbeek/backup_20250101_030000

# Start containers
docker compose --env-file .env.docker up -d
```

---

## 📞 Support

For issues or questions:
- Check logs: `docker compose --env-file .env.docker logs -f`
- Review this guide's troubleshooting section
- Contact: info@icteerbeek.nl

---

**Last Updated**: 2025
**Version**: 1.0
