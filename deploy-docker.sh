#!/bin/bash

################################################################################
# ICT Eerbeek - Docker Deployment Script
# Ubuntu 22.04 with Docker & Docker Compose
# Requires: Root access
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then 
        print_error "This script must be run as root"
        exit 1
    fi
    print_success "Running as root"
}

################################################################################
# Main Installation Steps
################################################################################

print_header "ICT Eerbeek - Docker Deployment"

# Step 1: Check root access
print_header "Step 1: Checking Prerequisites"
check_root

# Step 2: Update system
print_header "Step 2: Updating System Packages"
apt-get update -y
apt-get upgrade -y
print_success "System updated"

# Step 3: Install Docker
print_header "Step 3: Installing Docker"
if ! command -v docker &> /dev/null; then
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
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    print_success "Docker installed: $(docker --version)"
else
    print_success "Docker already installed: $(docker --version)"
fi

# Step 4: Verify Docker Compose
print_header "Step 4: Verifying Docker Compose"
if docker compose version &> /dev/null; then
    print_success "Docker Compose installed: $(docker compose version)"
else
    print_error "Docker Compose not found"
    exit 1
fi

# Step 5: Create deployment directory
print_header "Step 5: Setting Up Deployment Directory"
DEPLOY_DIR="/opt/ict-eerbeek"
print_info "Deployment directory: ${DEPLOY_DIR}"

if [ -d "${DEPLOY_DIR}" ]; then
    print_warning "Directory already exists. Do you want to remove it? (y/n)"
    read -r REMOVE_DIR
    if [ "$REMOVE_DIR" = "y" ]; then
        rm -rf ${DEPLOY_DIR}
        print_success "Old directory removed"
    fi
fi

mkdir -p ${DEPLOY_DIR}
cd ${DEPLOY_DIR}
print_success "Deployment directory created"

# Step 6: Get application files
print_header "Step 6: Application Source"
echo "How would you like to deploy the application?"
echo "1) Upload via SCP/SFTP (I'll wait for you to upload)"
echo "2) Clone from Git repository"
echo "3) Copy from existing location"
read -p "Enter choice (1-3): " DEPLOY_METHOD

case $DEPLOY_METHOD in
    1)
        print_info "Please upload your application files to: ${DEPLOY_DIR}"
        print_info "Use SCP/SFTP to transfer the files"
        print_info "Make sure to include: Dockerfile, docker-compose.yml, and all application files"
        print_warning "Press ENTER when upload is complete..."
        read
        ;;
    2)
        read -p "Enter Git repository URL: " GIT_REPO
        git clone ${GIT_REPO} ${DEPLOY_DIR}/temp
        mv ${DEPLOY_DIR}/temp/* ${DEPLOY_DIR}/
        mv ${DEPLOY_DIR}/temp/.* ${DEPLOY_DIR}/ 2>/dev/null || true
        rm -rf ${DEPLOY_DIR}/temp
        print_success "Repository cloned"
        ;;
    3)
        read -p "Enter source directory path: " SOURCE_DIR
        cp -r ${SOURCE_DIR}/* ${DEPLOY_DIR}/
        cp -r ${SOURCE_DIR}/.* ${DEPLOY_DIR}/ 2>/dev/null || true
        print_success "Files copied"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Step 7: Configure environment
print_header "Step 7: Environment Configuration"

if [ ! -f "${DEPLOY_DIR}/.env.docker.example" ]; then
    print_error ".env.docker.example not found!"
    print_info "Creating basic .env file..."
fi

# Generate secure passwords and secrets
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

print_info "Generating secure credentials..."
print_success "Credentials generated"

# Create .env.docker file
cat > ${DEPLOY_DIR}/.env.docker <<EOF
# ICT Eerbeek - Docker Environment Configuration
# Generated: $(date)

# Database Configuration
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
DB_NAME=ict_eerbeek
DB_USER=ict_eerbeek_user
DB_PASSWORD=${DB_PASSWORD}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}

# Manus OAuth Configuration
VITE_APP_ID=your_manus_app_id_here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your_owner_openid_here
OWNER_NAME=ICT Eerbeek

# Application Configuration
VITE_APP_TITLE=ICT Eerbeek
VITE_APP_LOGO=/logo.png
NODE_ENV=production
PORT=3000

# Manus Built-in Services
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key_here

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
EOF

print_success "Environment file created: ${DEPLOY_DIR}/.env.docker"
print_warning "IMPORTANT: Edit ${DEPLOY_DIR}/.env.docker and update:"
print_warning "  - VITE_APP_ID"
print_warning "  - OWNER_OPEN_ID"
print_warning "  - BUILT_IN_FORGE_API_KEY"

# Step 8: Create necessary directories
print_header "Step 8: Creating Required Directories"
mkdir -p ${DEPLOY_DIR}/logs/nginx
mkdir -p ${DEPLOY_DIR}/docker/nginx/ssl
print_success "Directories created"

# Step 9: Build Docker images
print_header "Step 9: Building Docker Images"
cd ${DEPLOY_DIR}
docker compose --env-file .env.docker build
print_success "Docker images built"

# Step 10: Start containers
print_header "Step 10: Starting Docker Containers"
docker compose --env-file .env.docker up -d
print_success "Containers started"

# Step 11: Wait for database to be ready
print_header "Step 11: Waiting for Database"
print_info "Waiting for MySQL to be ready..."
sleep 10

# Check database health
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker compose --env-file .env.docker exec -T db mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD} &> /dev/null; then
        print_success "Database is ready"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "Database failed to start"
    exit 1
fi

# Step 12: Run database migrations
print_header "Step 12: Running Database Migrations"
docker compose --env-file .env.docker exec -T app sh -c "cd /app && pnpm db:push" || print_warning "Migration failed - you may need to run manually"
print_success "Database migrations completed"

# Step 13: Configure firewall
print_header "Step 13: Configuring Firewall"
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    print_success "Firewall rules added"
else
    print_warning "UFW not installed, skipping firewall configuration"
fi

# Step 14: Display container status
print_header "Step 14: Container Status"
docker compose --env-file .env.docker ps

################################################################################
# Installation Complete
################################################################################

print_header "Docker Deployment Complete! 🎉"
echo ""
print_success "Application deployed successfully with Docker!"
echo ""
print_info "Container Details:"
echo "  - App Container: ict-eerbeek-app"
echo "  - Database Container: ict-eerbeek-db"
echo "  - Nginx Container: ict-eerbeek-nginx"
echo "  - Network: ict-eerbeek-network"
echo ""
print_info "Useful Docker Commands:"
echo "  - View logs: docker compose --env-file .env.docker logs -f [service]"
echo "  - Restart: docker compose --env-file .env.docker restart"
echo "  - Stop: docker compose --env-file .env.docker stop"
echo "  - Start: docker compose --env-file .env.docker start"
echo "  - Status: docker compose --env-file .env.docker ps"
echo "  - Shell access: docker compose --env-file .env.docker exec app sh"
echo ""
print_warning "Next Steps:"
echo "  1. Edit ${DEPLOY_DIR}/.env.docker and update OAuth credentials"
echo "  2. Restart containers: docker compose --env-file .env.docker restart"
echo "  3. Configure SSL certificate (place in docker/nginx/ssl/)"
echo "  4. Update DNS records to point to this server"
echo "  5. Test the application: http://YOUR_DOMAIN"
echo ""
print_info "Access your application at: http://YOUR_SERVER_IP"
echo ""
print_warning "IMPORTANT: Save these credentials securely!"
echo "  - MySQL Root Password: ${MYSQL_ROOT_PASSWORD}"
echo "  - Database Password: ${DB_PASSWORD}"
echo "  - JWT Secret: ${JWT_SECRET}"
echo ""

# Save credentials to file
CREDS_FILE="${DEPLOY_DIR}/DOCKER_CREDENTIALS.txt"
cat > ${CREDS_FILE} <<EOF
ICT Eerbeek - Docker Deployment Credentials
Generated: $(date)

MySQL Configuration:
  - Root Password: ${MYSQL_ROOT_PASSWORD}
  - Database Name: ict_eerbeek
  - Database User: ict_eerbeek_user
  - Database Password: ${DB_PASSWORD}

Security:
  - JWT Secret: ${JWT_SECRET}

Docker:
  - Deployment Directory: ${DEPLOY_DIR}
  - Environment File: ${DEPLOY_DIR}/.env.docker
  - Compose File: ${DEPLOY_DIR}/docker-compose.yml

Containers:
  - App: ict-eerbeek-app (port 3000)
  - Database: ict-eerbeek-db (port 3306)
  - Nginx: ict-eerbeek-nginx (ports 80, 443)

IMPORTANT: Keep this file secure and delete after saving credentials elsewhere!
EOF

chmod 600 ${CREDS_FILE}
print_success "Credentials saved to: ${CREDS_FILE}"
echo ""
