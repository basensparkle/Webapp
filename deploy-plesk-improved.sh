#!/bin/bash

################################################################################
# ICT Eerbeek - One-Click Plesk VPS Deployment Script (Self-Hosted)
# Ubuntu 22.04/24.04 with Plesk Obsidian
# Requires: Root access
# Features: Local authentication, debug logging, automated setup
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ict-eerbeek"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${SCRIPT_DIR}"
DOMAIN="${DOMAIN:-ict-eerbeek.nl}"
NODE_VERSION="22"
DB_NAME="${DB_NAME:-icteerbeek}"
DB_USER="${DB_USER:-icteerbeek}"

# Logging
LOG_DIR="${APP_DIR}/deployment-logs"
LOG_FILE="${LOG_DIR}/deploy-$(date +%Y%m%d-%H%M%S).log"

################################################################################
# Helper Functions
################################################################################

setup_logging() {
    mkdir -p "${LOG_DIR}"
    exec 1> >(tee -a "${LOG_FILE}")
    exec 2>&1
    echo "📝 Logging to: ${LOG_FILE}"
}

log_debug() {
    echo -e "${CYAN}[DEBUG $(date +%H:%M:%S)]${NC} $1" | tee -a "${LOG_FILE}"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    log_debug "Starting phase: $1"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    log_debug "SUCCESS: $1"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    log_debug "ERROR: $1"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    log_debug "WARNING: $1"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
    log_debug "INFO: $1"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then 
        print_error "This script must be run as root"
        print_info "Run: sudo bash $0"
        exit 1
    fi
    print_success "Running as root"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        print_success "$1 is installed: $(command -v $1)"
        log_debug "$1 version: $($1 --version 2>&1 | head -n1)"
        return 0
    else
        print_warning "$1 is not installed"
        return 1
    fi
}

run_with_retry() {
    local max_attempts=3
    local attempt=1
    local command="$@"
    
    while [ $attempt -le $max_attempts ]; do
        log_debug "Attempt $attempt of $max_attempts: $command"
        if eval "$command"; then
            return 0
        else
            print_warning "Attempt $attempt failed, retrying..."
            attempt=$((attempt + 1))
            sleep 2
        fi
    done
    
    print_error "Command failed after $max_attempts attempts: $command"
    return 1
}

################################################################################
# Main Installation Steps
################################################################################

setup_logging

print_header "ICT Eerbeek - Self-Hosted Deployment"
echo "Deployment started at: $(date)"
echo "Script directory: ${SCRIPT_DIR}"
echo "Application directory: ${APP_DIR}"
echo ""

# Step 1: Check root access
print_header "Step 1: Checking Prerequisites"
check_root

# Check system info
log_debug "System: $(uname -a)"
log_debug "OS: $(cat /etc/os-release | grep PRETTY_NAME)"
log_debug "Memory: $(free -h | grep Mem)"
log_debug "Disk: $(df -h / | tail -1)"

# Step 2: Update system
print_header "Step 2: Updating System Packages"
log_debug "Running apt-get update..."
run_with_retry "apt-get update -y"
print_info "Upgrading packages (this may take a while)..."
log_debug "Running apt-get upgrade..."
apt-get upgrade -y >> "${LOG_FILE}" 2>&1
print_success "System updated"

# Step 3: Install Node.js
print_header "Step 3: Installing Node.js ${NODE_VERSION}"
if check_command node; then
    CURRENT_NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$CURRENT_NODE_VERSION" -ge "$NODE_VERSION" ]; then
        print_success "Node.js version is sufficient: $(node --version)"
    else
        print_warning "Node.js version is outdated, upgrading..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt-get install -y nodejs
    fi
else
    print_info "Installing Node.js ${NODE_VERSION}..."
    log_debug "Downloading Node.js setup script..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - >> "${LOG_FILE}" 2>&1
    log_debug "Installing Node.js..."
    apt-get install -y nodejs >> "${LOG_FILE}" 2>&1
    print_success "Node.js installed: $(node --version)"
fi

# Step 4: Install pnpm
print_header "Step 4: Installing pnpm"
if check_command pnpm; then
    print_success "pnpm already installed: $(pnpm --version)"
else
    print_info "Installing pnpm..."
    log_debug "Running npm install -g pnpm..."
    npm install -g pnpm >> "${LOG_FILE}" 2>&1
    print_success "pnpm installed: $(pnpm --version)"
fi

# Step 5: Install PM2
print_header "Step 5: Installing PM2 Process Manager"
if check_command pm2; then
    print_success "PM2 already installed"
else
    print_info "Installing PM2..."
    log_debug "Running npm install -g pm2..."
    npm install -g pm2 >> "${LOG_FILE}" 2>&1
    log_debug "Setting up PM2 startup..."
    pm2 startup systemd -u root --hp /root >> "${LOG_FILE}" 2>&1
    print_success "PM2 installed"
fi

# Step 6: Verify application directory
print_header "Step 6: Verifying Application Files"
cd "${APP_DIR}"

if [ ! -f "package.json" ]; then
    print_error "package.json not found in ${APP_DIR}"
    print_error "Please ensure you've extracted the application files to this directory"
    exit 1
fi

print_success "Application files found in: ${APP_DIR}"
log_debug "Application files:"
log_debug "$(ls -la ${APP_DIR})"

# Step 7: Database Configuration
print_header "Step 7: Database Configuration"

# Check if database credentials are provided via environment
if [ -z "$DB_PASSWORD" ]; then
    print_info "Database password not set in environment"
    print_info "Please enter the MySQL password for user '${DB_USER}':"
    print_info "(If the user doesn't exist, it will be created)"
    read -s DB_PASSWORD
    echo ""
fi

# Test MySQL connection
print_info "Testing MySQL connection..."
if mysql -u root -e "SELECT 1;" &> /dev/null; then
    MYSQL_ROOT_PASSWORD=""
    print_success "MySQL root access available (no password)"
elif [ -n "$MYSQL_ROOT_PASSWORD" ]; then
    if mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "SELECT 1;" &> /dev/null; then
        print_success "MySQL root access verified"
    else
        print_error "Invalid MySQL root password"
        exit 1
    fi
else
    print_info "Please enter MySQL root password:"
    read -s MYSQL_ROOT_PASSWORD
    echo ""
    if ! mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "SELECT 1;" &> /dev/null; then
        print_error "Invalid MySQL root password"
        exit 1
    fi
fi

# Create database and user
print_info "Setting up database..."
log_debug "Creating database ${DB_NAME} and user ${DB_USER}..."

MYSQL_CMD="mysql -u root"
if [ -n "$MYSQL_ROOT_PASSWORD" ]; then
    MYSQL_CMD="mysql -u root -p${MYSQL_ROOT_PASSWORD}"
fi

$MYSQL_CMD <<EOF >> "${LOG_FILE}" 2>&1
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

print_success "Database created: ${DB_NAME}"
print_success "Database user created: ${DB_USER}"

# Test database connection
if mysql -u "${DB_USER}" -p"${DB_PASSWORD}" -e "USE ${DB_NAME};" 2>/dev/null; then
    print_success "Database connection successful"
else
    print_error "Failed to connect to database"
    exit 1
fi

# Step 8: Generate JWT secret
print_header "Step 8: Generating Security Keys"
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    log_debug "Generated new JWT secret"
fi
print_success "JWT secret configured"

# Step 9: Create .env file
print_header "Step 9: Creating Environment Configuration"

# Backup existing .env if it exists
if [ -f "${APP_DIR}/.env" ]; then
    BACKUP_ENV="${APP_DIR}/.env.backup.$(date +%Y%m%d-%H%M%S)"
    cp "${APP_DIR}/.env" "${BACKUP_ENV}"
    print_info "Backed up existing .env to: ${BACKUP_ENV}"
fi

cat > ${APP_DIR}/.env <<EOF
# Database Configuration
DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}

# Authentication Mode
USE_LOCAL_AUTH=true

# Application Configuration
VITE_APP_TITLE=ICT Eerbeek
VITE_APP_LOGO=/logo.png
NODE_ENV=production
PORT=3000

# Optional: Manus OAuth (leave empty for local auth only)
VITE_APP_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
OWNER_OPEN_ID=
OWNER_NAME=

# Optional: Manus Built-in Services
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
EOF

print_success "Environment file created"
log_debug "Environment configuration:"
log_debug "$(cat ${APP_DIR}/.env | grep -v PASSWORD | grep -v SECRET)"

# Step 10: Install dependencies
print_header "Step 10: Installing Application Dependencies"
cd ${APP_DIR}

print_info "Installing dependencies (this may take several minutes)..."
log_debug "Running pnpm install..."
pnpm install --frozen-lockfile >> "${LOG_FILE}" 2>&1
print_success "Dependencies installed"

# Step 11: Run database migrations
print_header "Step 11: Running Database Migrations"
print_info "Creating database schema..."
log_debug "Running pnpm db:push..."
pnpm db:push >> "${LOG_FILE}" 2>&1
print_success "Database schema created"

# Step 12: Seed initial data
print_header "Step 12: Seeding Initial Data"
if [ -f "${APP_DIR}/server/seed.ts" ]; then
    print_info "Seeding initial data..."
    log_debug "Running pnpm tsx server/seed.ts..."
    pnpm tsx server/seed.ts >> "${LOG_FILE}" 2>&1
    print_success "Initial data seeded"
else
    print_warning "Seed file not found, skipping..."
fi

# Step 13: Create admin user
print_header "Step 13: Creating Admin User"
print_info "You need to create an admin user to access the application"
print_warning "Note: You can also create this later by running: pnpm init-admin"
echo ""

if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ] && [ -n "$ADMIN_NAME" ]; then
    print_info "Using admin credentials from environment..."
    log_debug "Creating admin user: ${ADMIN_EMAIL}"
    
    # Create admin user programmatically
    node -e "
    const { createLocalUser } = require('./server/db.ts');
    const { hashPassword } = require('./server/_core/localAuth.ts');
    const { nanoid } = require('nanoid');
    
    (async () => {
      const { hash, salt } = hashPassword('${ADMIN_PASSWORD}');
      const openId = \`local_\${nanoid(32)}\`;
      await createLocalUser({
        openId,
        email: '${ADMIN_EMAIL}',
        name: '${ADMIN_NAME}',
        passwordHash: hash,
        passwordSalt: salt,
        loginMethod: 'local',
        role: 'admin',
        lastSignedIn: new Date(),
      });
      console.log('Admin user created');
    })();
    " >> "${LOG_FILE}" 2>&1
    
    print_success "Admin user created: ${ADMIN_EMAIL}"
else
    print_warning "Admin credentials not provided in environment"
    print_info "You can create an admin user after deployment with:"
    print_info "  cd ${APP_DIR} && pnpm init-admin"
fi

# Step 14: Build application
print_header "Step 14: Building Application"
print_info "Building production bundle (this may take several minutes)..."
log_debug "Running pnpm build..."
pnpm build >> "${LOG_FILE}" 2>&1
print_success "Application built"

# Step 15: Configure PM2
print_header "Step 15: Configuring PM2 Process Manager"
cat > ${APP_DIR}/ecosystem.config.cjs <<EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'dist/index.js',
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
    watch: false,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

mkdir -p ${APP_DIR}/logs
print_success "PM2 configuration created"

# Step 16: Start application with PM2
print_header "Step 16: Starting Application"
cd ${APP_DIR}

# Stop existing instance if running
log_debug "Stopping existing PM2 instance..."
pm2 delete ${APP_NAME} 2>/dev/null || true

# Start new instance
log_debug "Starting PM2 instance..."
pm2 start ecosystem.config.cjs >> "${LOG_FILE}" 2>&1

# Save PM2 configuration
log_debug "Saving PM2 configuration..."
pm2 save >> "${LOG_FILE}" 2>&1

print_success "Application started with PM2"

# Wait for app to start
print_info "Waiting for application to start..."
sleep 5

# Check if app is running
if pm2 list | grep -q "${APP_NAME}.*online"; then
    print_success "Application is running"
else
    print_error "Application failed to start"
    print_info "Check logs with: pm2 logs ${APP_NAME}"
    exit 1
fi

# Step 17: Configure Nginx (Plesk)
print_header "Step 17: Nginx Configuration"
print_info "Creating Nginx configuration for Plesk..."

NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}.conf"
cat > ${NGINX_CONF} <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Redirect to HTTPS (uncomment after SSL is configured)
    # return 301 https://\$server_name\$request_uri;

    # Logging
    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;

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
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
EOF

# Test and reload Nginx
print_info "Testing Nginx configuration..."
log_debug "Running nginx -t..."
if nginx -t >> "${LOG_FILE}" 2>&1; then
    log_debug "Reloading Nginx..."
    systemctl reload nginx >> "${LOG_FILE}" 2>&1
    print_success "Nginx configured and reloaded"
else
    print_warning "Nginx configuration test failed, but continuing..."
    print_info "You may need to configure Nginx manually"
fi

# Step 18: Configure firewall
print_header "Step 18: Configuring Firewall"
if command -v ufw &> /dev/null; then
    log_debug "Configuring UFW firewall..."
    ufw allow 80/tcp >> "${LOG_FILE}" 2>&1 || true
    ufw allow 443/tcp >> "${LOG_FILE}" 2>&1 || true
    ufw allow 3000/tcp >> "${LOG_FILE}" 2>&1 || true
    print_success "Firewall rules added"
else
    print_warning "UFW not installed, skipping firewall configuration"
fi

# Step 19: Set correct permissions
print_header "Step 19: Setting Permissions"
log_debug "Setting ownership to www-data..."
chown -R www-data:www-data ${APP_DIR} >> "${LOG_FILE}" 2>&1
chmod -R 755 ${APP_DIR} >> "${LOG_FILE}" 2>&1
chmod 600 ${APP_DIR}/.env >> "${LOG_FILE}" 2>&1
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
print_info "Logs:"
echo "  - Deployment log: ${LOG_FILE}"
echo "  - Application logs: ${APP_DIR}/logs/"
echo "  - Nginx logs: /var/log/nginx/${APP_NAME}_*.log"
echo ""
print_warning "Next Steps:"
if [ -z "$ADMIN_EMAIL" ]; then
    echo "  1. Create admin user: cd ${APP_DIR} && pnpm init-admin"
    echo "  2. Configure SSL certificate in Plesk for ${DOMAIN}"
    echo "  3. Test the application: http://${DOMAIN}"
else
    echo "  1. Configure SSL certificate in Plesk for ${DOMAIN}"
    echo "  2. Login with: ${ADMIN_EMAIL}"
    echo "  3. Test the application: http://${DOMAIN}"
fi
echo ""
print_info "Access your application at: http://${DOMAIN}"
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
  - Authentication: Local (email/password)

Admin User:
  - Email: ${ADMIN_EMAIL:-"Not created - run 'pnpm init-admin'"}
  - Password: ${ADMIN_PASSWORD:-"Set during init-admin"}

PM2 Process:
  - Name: ${APP_NAME}
  - Logs: ${APP_DIR}/logs/

Deployment Log:
  - ${LOG_FILE}

IMPORTANT: Keep this file secure and delete after saving credentials elsewhere!
EOF

chmod 600 ${CREDS_FILE}
print_success "Credentials saved to: ${CREDS_FILE}"
echo ""

print_info "Checking application status..."
sleep 2
pm2 status
echo ""

# Test application endpoint
print_info "Testing application endpoint..."
if curl -s http://localhost:3000 > /dev/null; then
    print_success "Application is responding on http://localhost:3000"
else
    print_warning "Application may not be responding yet, check logs"
fi

echo ""
print_success "Deployment complete! Your application should now be running."
echo "Deployment finished at: $(date)"
