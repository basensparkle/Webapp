# ICT Eerbeek - Docker Deployment Guide

## 🐳 Docker Deployment Options

This guide covers deploying the ICT Eerbeek application using Docker.

## 📋 Prerequisites

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git** (to clone the repository)

### Install Docker

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Mac:**
```bash
brew install --cask docker
```

**Windows:**
Download from: https://docs.docker.com/desktop/install/windows-install/

## 🚀 Quick Start (One Command)

```bash
# Clone repository
git clone https://github.com/basensparkle/Webapp.git
cd Webapp

# Deploy with one command
bash docker-deploy.sh
```

That's it! The application will be running at http://localhost:3000

## 📝 Manual Deployment

### Step 1: Clone Repository

```bash
git clone https://github.com/basensparkle/Webapp.git
cd Webapp
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.docker .env

# Edit if needed (optional)
nano .env
```

### Step 3: Build and Start

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Wait for services to be ready
sleep 10

# Run database migrations
docker-compose exec app pnpm db:push
```

### Step 4: Create Admin User

```bash
docker-compose exec app pnpm init-admin
```

Enter your admin details when prompted.

### Step 5: Access Application

Open your browser: http://localhost:3000

## 🏗️ What Gets Deployed

The Docker setup includes:

1. **MySQL 8.0 Database**
   - Port: 3306
   - Database: icteerbeek
   - User: icteerbeek
   - Password: icteerbeek123 (change in production!)

2. **ICT Eerbeek Application**
   - Port: 3000 (mapped to container port 8080)
   - Node.js 22
   - Auto-restart enabled

3. **Nginx Reverse Proxy** (optional)
   - Port: 80/443
   - SSL support
   - Load balancing

## 📂 Docker Files

- `Dockerfile` - Application container configuration
- `docker-compose.yml` - Multi-container orchestration
- `.env.docker` - Environment variables template
- `docker-deploy.sh` - One-click deployment script

## 🔧 Common Commands

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f app

# Just the database
docker-compose logs -f db
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart just app
docker-compose restart app
```

### Access Containers

```bash
# Access app container
docker-compose exec app sh

# Access database
docker-compose exec db mysql -u icteerbeek -p
```

### Run Migrations

```bash
docker-compose exec app pnpm db:push
```

### Create Admin User

```bash
docker-compose exec app pnpm init-admin
```

### Rebuild After Code Changes

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔐 Production Configuration

### Update Environment Variables

Edit `.env` file:

```env
# Use strong passwords!
MYSQL_ROOT_PASSWORD=your-strong-root-password
DB_PASSWORD=your-strong-db-password

# Generate with: openssl rand -base64 32
JWT_SECRET=your-random-jwt-secret-here

# Your domain
VITE_APP_TITLE=Your Company Name
```

### Enable SSL (Nginx)

1. Place SSL certificates in `docker/nginx/ssl/`
2. Update `docker/nginx/conf.d/ict-eerbeek.conf`
3. Restart nginx: `docker-compose restart nginx`

### Backup Database

```bash
# Create backup
docker-compose exec db mysqldump -u icteerbeek -picteerbeek123 icteerbeek > backup.sql

# Restore backup
docker-compose exec -T db mysql -u icteerbeek -picteerbeek123 icteerbeek < backup.sql
```

## 🌐 Deploy to Production Server

### Option 1: Docker Compose on VPS

```bash
# On your server
git clone https://github.com/basensparkle/Webapp.git
cd Webapp

# Configure environment
cp .env.docker .env
nano .env  # Update passwords and secrets

# Deploy
bash docker-deploy.sh

# Access at http://your-server-ip:3000
```

### Option 2: Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml ict-eerbeek

# Check status
docker stack services ict-eerbeek
```

### Option 3: Kubernetes

Convert docker-compose.yml to Kubernetes:

```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.28.0/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv kompose /usr/local/bin/

# Convert
kompose convert

# Deploy
kubectl apply -f .
```

## 📊 Monitoring

### Check Container Status

```bash
docker-compose ps
```

### Check Resource Usage

```bash
docker stats
```

### Health Checks

```bash
# App health
curl http://localhost:3000

# Database health
docker-compose exec db mysqladmin ping
```

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check if port is in use
sudo lsof -i :3000

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

### Database Connection Failed

```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection
docker-compose exec db mysql -u icteerbeek -p
```

### Permission Errors

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

## 🔄 Updates

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker-compose exec app pnpm db:push
```

## 💾 Data Persistence

Data is stored in Docker volumes:

- `db_data` - MySQL database files
- `./logs` - Application logs
- `./storage` - Uploaded files

### Backup Volumes

```bash
# Backup database volume
docker run --rm -v ict-eerbeek_db_data:/data -v $(pwd):/backup ubuntu tar czf /backup/db_data_backup.tar.gz /data

# Restore database volume
docker run --rm -v ict-eerbeek_db_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/db_data_backup.tar.gz -C /
```

## 🚀 Performance Tuning

### Increase Memory Limit

Edit `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### Scale Application

```bash
# Run multiple app instances
docker-compose up -d --scale app=3
```

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MYSQL_ROOT_PASSWORD` | rootpassword123 | MySQL root password |
| `DB_NAME` | icteerbeek | Database name |
| `DB_USER` | icteerbeek | Database user |
| `DB_PASSWORD` | icteerbeek123 | Database password |
| `JWT_SECRET` | (required) | JWT secret key |
| `USE_LOCAL_AUTH` | true | Enable local authentication |
| `VITE_APP_ID` | local-app | Application ID |
| `VITE_APP_TITLE` | ICT Eerbeek | Application title |

## 🎯 Next Steps

After successful deployment:

1. ✅ Access http://localhost:3000
2. ✅ Create admin user
3. ✅ Login and explore
4. ✅ Create your first page
5. ✅ Configure custom domain (production)
6. ✅ Set up SSL certificates (production)
7. ✅ Configure backups

## 💰 Resource Requirements

**Minimum:**
- 1 CPU core
- 1 GB RAM
- 10 GB disk space

**Recommended:**
- 2 CPU cores
- 2 GB RAM
- 20 GB disk space

## 🔒 Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Generate strong JWT secret
- [ ] Enable firewall (allow only 80, 443, 22)
- [ ] Set up SSL certificates
- [ ] Regular security updates
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity

## 📞 Support

- **Documentation**: Check this guide
- **Logs**: `docker-compose logs -f`
- **GitHub Issues**: https://github.com/basensparkle/Webapp/issues

---

## Quick Reference

```bash
# Deploy
bash docker-deploy.sh

# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f app

# Create admin
docker-compose exec app pnpm init-admin

# Backup
docker-compose exec db mysqldump -u icteerbeek -p icteerbeek > backup.sql

# Update
git pull && docker-compose up -d --build
```

---

**Ready to deploy?** Run `bash docker-deploy.sh` and you're done!
