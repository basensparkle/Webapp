#!/bin/bash

################################################################################
# ICT Eerbeek - One-Click Plesk VPS Deployment Script
# Ubuntu 22.04 with Plesk Obsidian
# Requires: Root access
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ict-eerbeek"
APP_DIR="/var/www/vhosts/${APP_NAME}"
DOMAIN="icteerbeek.nl"  # Change this to your actual domain
NODE_VERSION="22"
DB_NAME="ict_eerbeek"
DB_USER="ict_eerbeek_user"

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

print_header "ICT Eerbeek - Plesk VPS Deployment"

# Step 1: Check root access
print_header "Step 1: Checking Prerequisites"
check_root

# Step 2: Update system
print_header "Step 2: Updating System Packages"
apt-get update -y
apt-get upgrade -y
print_success "System updated"

# Step 3: Install Node.js
print_header "Step 3: Installing Node.js ${NODE_VERSION}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi

# Step 4: Install pnpm
print_header "Step 4: Installing pnpm"
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
    print_success "pnpm installed: $(pnpm --version)"
else
    print_success "pnpm already installed: $(pnpm --version)"
fi

# Step 5: Install PM2
print_header "Step 5: Installing PM2 Process Manager"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
    print_success "PM2 installed"
else
    print_success "PM2 already installed"
fi

# Step 6: Create application directory
print_header "Step 6: Creating Application Directory"
mkdir -p ${APP_DIR}
cd ${APP_DIR}
print_success "Application directory created: ${APP_DIR}"

# Step 7: Prompt for database password
print_header "Step 7: Database Configuration"
print_info "Please enter a secure password for the MySQL database user:"
read -s DB_PASSWORD
echo ""
print_info "Please confirm the password:"
read -s DB_PASSWORD_CONFIRM
echo ""

if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    print_error "Passwords do not match!"
    exit 1
fi

# Step 8: Create MySQL database and user
print_header "Step 8: Setting Up MySQL Database"
print_info "Please enter your MySQL root password:"
read -s MYSQL_ROOT_PASSWORD
echo ""

mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

print_success "Database created: ${DB_NAME}"
print_success "Database user created: ${DB_USER}"

# Step 9: Generate JWT secret
print_header "Step 9: Generating Security Keys"
JWT_SECRET=$(openssl rand -base64 32)
print_success "JWT secret generated"

# Step 10: Prompt for application source
print_header "Step 10: Application Source"
echo "How would you like to deploy the application?"
echo "1) Upload via SCP/SFTP (I'll wait for you to upload)"
echo "2) Clone from Git repository"
echo "3) Use existing files in current directory"
read -p "Enter choice (1-3): " DEPLOY_METHOD

case $DEPLOY_METHOD in
    1)
        print_info "Please upload your application files to: ${APP_DIR}"
        print_info "Use SCP/SFTP to transfer the files"
        print_warning "Press ENTER when upload is complete..."
        read
        ;;
    2)
        read -p "Enter Git repository URL: " GIT_REPO
        git clone ${GIT_REPO} ${APP_DIR}/temp
        mv ${APP_DIR}/temp/* ${APP_DIR}/
        mv ${APP_DIR}/temp/.* ${APP_DIR}/ 2>/dev/null || true
        rm -rf ${APP_DIR}/temp
        print_success "Repository cloned"
        ;;
    3)
        print_info "Using existing files in ${APP_DIR}"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Step 11: Create .env file
print_header "Step 11: Creating Environment Configuration"
cat > ${APP_DIR}/.env <<EOF
# Database Configuration
DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}

# Manus OAuth Configuration (Pre-configured)
VITE_APP_ID=your_app_id_here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your_owner_openid_here
OWNER_NAME=ICT Eerbeek

# Application Configuration
VITE_APP_TITLE=ICT Eerbeek
VITE_APP_LOGO=/logo.png
NODE_ENV=production
PORT=3000

# Manus Built-in Services (Pre-configured)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key_here

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
EOF

print_success "Environment file created"
print_warning "IMPORTANT: Edit ${APP_DIR}/.env and update the following:"
print_warning "  - VITE_APP_ID"
print_warning "  - OWNER_OPEN_ID"
print_warning "  - BUILT_IN_FORGE_API_KEY"

# Step 12: Install dependencies
print_header "Step 12: Installing Application Dependencies"
cd ${APP_DIR}
pnpm install --frozen-lockfile
print_success "Dependencies installed"

# Step 13: Run database migrations
print_header "Step 13: Running Database Migrations"
pnpm db:push
print_success "Database schema created"

# Step 14: Seed initial data
print_header "Step 14: Seeding Initial Data"
if [ -f "${APP_DIR}/server/seed.ts" ]; then
    pnpm tsx server/seed.ts
    print_success "Initial data seeded"
else
    print_warning "Seed file not found, skipping..."
fi

# Step 15: Build application
print_header "Step 15: Building Application"
pnpm build
print_success "Application built"

# Step 16: Configure PM2
print_header "Step 16: Configuring PM2 Process Manager"
cat > ${APP_DIR}/ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'server/index.js',
    cwd: '${APP_DIR}',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '${APP_DIR}/logs/error.log',
    out_file: '${APP_DIR}/logs/out.log',
    log_file: '${APP_DIR}/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
EOF

mkdir -p ${APP_DIR}/logs
print_success "PM2 configuration created"

# Step 17: Start application with PM2
print_header "Step 17: Starting Application"
cd ${APP_DIR}
pm2 delete ${APP_NAME} 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
print_success "Application started with PM2"

# Step 18: Configure Nginx (Plesk)
print_header "Step 18: Nginx Configuration"
print_info "Creating Nginx configuration for Plesk..."

NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}.conf"
cat > ${NGINX_CONF} <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Redirect to HTTPS (after SSL is configured)
    # return 301 https://\$server_name\$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Test and reload Nginx
nginx -t && systemctl reload nginx
print_success "Nginx configured and reloaded"

# Step 19: Configure firewall
print_header "Step 19: Configuring Firewall"
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp
    print_success "Firewall rules added"
else
    print_warning "UFW not installed, skipping firewall configuration"
fi

# Step 20: Set correct permissions
print_header "Step 20: Setting Permissions"
chown -R www-data:www-data ${APP_DIR}
chmod -R 755 ${APP_DIR}
chmod 600 ${APP_DIR}/.env
print_success "Permissions set"

################################################################################
# Installation Complete
################################################################################

print_header "Installation Complete! 🎉"
echo ""
print_success "Application deployed successfully!"
echo ""
print_info "Application Details:"
echo "  - Name: ${APP_NAME}"
echo "  - Directory: ${APP_DIR}"
echo "  - Domain: ${DOMAIN}"
echo "  - Port: 3000"
echo "  - Database: ${DB_NAME}"
echo ""
print_info "PM2 Commands:"
echo "  - View logs: pm2 logs ${APP_NAME}"
echo "  - Restart: pm2 restart ${APP_NAME}"
echo "  - Stop: pm2 stop ${APP_NAME}"
echo "  - Status: pm2 status"
echo ""
print_warning "Next Steps:"
echo "  1. Edit ${APP_DIR}/.env and update OAuth credentials"
echo "  2. Configure SSL certificate in Plesk for ${DOMAIN}"
echo "  3. Update DNS records to point to this server"
echo "  4. Test the application: http://${DOMAIN}"
echo ""
print_info "Access your application at: http://${DOMAIN}"
echo ""
print_warning "IMPORTANT: Save these credentials securely!"
echo "  - Database Name: ${DB_NAME}"
echo "  - Database User: ${DB_USER}"
echo "  - Database Password: ${DB_PASSWORD}"
echo "  - JWT Secret: ${JWT_SECRET}"
echo ""

# Save credentials to file
CREDS_FILE="${APP_DIR}/CREDENTIALS.txt"
cat > ${CREDS_FILE} <<EOF
ICT Eerbeek - Deployment Credentials
Generated: $(date)

Database Configuration:
  - Database Name: ${DB_NAME}
  - Database User: ${DB_USER}
  - Database Password: ${DB_PASSWORD}
  - Connection String: mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}

Security:
  - JWT Secret: ${JWT_SECRET}

Application:
  - Directory: ${APP_DIR}
  - Domain: ${DOMAIN}
  - Port: 3000

PM2 Process:
  - Name: ${APP_NAME}
  - Logs: ${APP_DIR}/logs/

IMPORTANT: Keep this file secure and delete after saving credentials elsewhere!
EOF

chmod 600 ${CREDS_FILE}
print_success "Credentials saved to: ${CREDS_FILE}"
echo ""
