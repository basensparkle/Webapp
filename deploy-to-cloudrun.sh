#!/bin/bash

################################################################################
# ICT Eerbeek - One-Click Google Cloud Run Deployment
# This script will deploy your application to Google Cloud Run with Cloud SQL
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ICT Eerbeek - Cloud Run Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Configuration
APP_NAME="ict-eerbeek"
REGION="europe-west1"  # Change to your preferred region
DB_INSTANCE_NAME="${APP_NAME}-db"
DB_NAME="icteerbeek"
DB_USER="icteerbeek"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK (gcloud) is not installed${NC}"
    echo -e "${YELLOW}Install it from: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Google Cloud SDK found${NC}"
echo ""

# Check if user is logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}⚠ Not logged in to Google Cloud${NC}"
    echo -e "${CYAN}Logging in...${NC}"
    gcloud auth login
fi

ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1)
echo -e "${GREEN}✓ Logged in as: ${ACCOUNT}${NC}"
echo ""

# Get or set project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}No project selected${NC}"
    echo -e "${CYAN}Available projects:${NC}"
    gcloud projects list
    echo ""
    read -p "Enter your Google Cloud Project ID: " PROJECT_ID
    gcloud config set project $PROJECT_ID
fi

echo -e "${GREEN}✓ Using project: ${PROJECT_ID}${NC}"
echo ""

# Enable required APIs
echo -e "${CYAN}📦 Enabling required Google Cloud APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    sqladmin.googleapis.com \
    sql-component.googleapis.com \
    cloudresourcemanager.googleapis.com \
    compute.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    --project=$PROJECT_ID

echo -e "${GREEN}✓ APIs enabled${NC}"
echo ""

# Generate secure passwords
echo -e "${CYAN}🔐 Generating secure credentials...${NC}"
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}✓ Credentials generated${NC}"
echo ""

# Create Cloud SQL instance
echo -e "${CYAN}🗄️  Creating Cloud SQL instance (this takes 5-10 minutes)...${NC}"
echo -e "${YELLOW}Please be patient, this is a one-time setup${NC}"

if gcloud sql instances describe $DB_INSTANCE_NAME --project=$PROJECT_ID &>/dev/null; then
    echo -e "${YELLOW}⚠ Cloud SQL instance already exists${NC}"
else
    gcloud sql instances create $DB_INSTANCE_NAME \
        --database-version=MYSQL_8_0 \
        --tier=db-f1-micro \
        --region=$REGION \
        --root-password="$DB_PASSWORD" \
        --storage-type=SSD \
        --storage-size=10GB \
        --backup \
        --backup-start-time=03:00 \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=4 \
        --project=$PROJECT_ID
    
    echo -e "${GREEN}✓ Cloud SQL instance created${NC}"
fi

# Wait for instance to be ready
echo -e "${CYAN}⏳ Waiting for Cloud SQL instance to be ready...${NC}"
gcloud sql instances patch $DB_INSTANCE_NAME --project=$PROJECT_ID --quiet 2>/dev/null || true
sleep 5

# Create database
echo -e "${CYAN}📊 Creating database...${NC}"
gcloud sql databases create $DB_NAME \
    --instance=$DB_INSTANCE_NAME \
    --project=$PROJECT_ID \
    --charset=utf8mb4 \
    --collation=utf8mb4_unicode_ci 2>/dev/null || echo -e "${YELLOW}Database may already exist${NC}"

# Create database user
echo -e "${CYAN}👤 Creating database user...${NC}"
gcloud sql users create $DB_USER \
    --instance=$DB_INSTANCE_NAME \
    --password="$DB_PASSWORD" \
    --project=$PROJECT_ID 2>/dev/null || echo -e "${YELLOW}User may already exist${NC}"

echo -e "${GREEN}✓ Database configured${NC}"
echo ""

# Get Cloud SQL connection name
CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE_NAME \
    --project=$PROJECT_ID \
    --format="value(connectionName)")

echo -e "${GREEN}✓ Cloud SQL connection: ${CONNECTION_NAME}${NC}"
echo ""

# Create secrets in Secret Manager
echo -e "${CYAN}🔒 Storing secrets in Secret Manager...${NC}"

# Database URL
echo -n "mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}?socket=/cloudsql/${CONNECTION_NAME}" | \
    gcloud secrets create database-url --data-file=- --project=$PROJECT_ID 2>/dev/null || \
    echo -n "mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}?socket=/cloudsql/${CONNECTION_NAME}" | \
    gcloud secrets versions add database-url --data-file=- --project=$PROJECT_ID

# JWT Secret
echo -n "$JWT_SECRET" | \
    gcloud secrets create jwt-secret --data-file=- --project=$PROJECT_ID 2>/dev/null || \
    echo -n "$JWT_SECRET" | \
    gcloud secrets versions add jwt-secret --data-file=- --project=$PROJECT_ID

echo -e "${GREEN}✓ Secrets stored${NC}"
echo ""

# Build and deploy to Cloud Run
echo -e "${CYAN}🔨 Building and deploying to Cloud Run...${NC}"
echo -e "${YELLOW}This may take 5-10 minutes...${NC}"

gcloud run deploy $APP_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars="USE_LOCAL_AUTH=true,VITE_APP_ID=local-app,VITE_APP_TITLE=ICT Eerbeek,NODE_ENV=production" \
    --set-secrets="DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest" \
    --add-cloudsql-instances=$CONNECTION_NAME \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --timeout=300 \
    --port=8080 \
    --project=$PROJECT_ID

echo -e "${GREEN}✓ Application deployed!${NC}"
echo ""

# Get the service URL
SERVICE_URL=$(gcloud run services describe $APP_NAME \
    --platform managed \
    --region $REGION \
    --project=$PROJECT_ID \
    --format="value(status.url)")

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}🌐 Your application is live at:${NC}"
echo -e "${BLUE}${SERVICE_URL}${NC}"
echo ""
echo -e "${CYAN}📋 Deployment Details:${NC}"
echo -e "  Project ID: ${PROJECT_ID}"
echo -e "  Region: ${REGION}"
echo -e "  Cloud SQL Instance: ${DB_INSTANCE_NAME}"
echo -e "  Database: ${DB_NAME}"
echo -e "  Connection: ${CONNECTION_NAME}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Next Steps${NC}"
echo -e "1. Run database migrations:"
echo -e "   ${CYAN}gcloud run jobs create ${APP_NAME}-migrate \\${NC}"
echo -e "   ${CYAN}  --image=gcr.io/${PROJECT_ID}/${APP_NAME} \\${NC}"
echo -e "   ${CYAN}  --region=${REGION} \\${NC}"
echo -e "   ${CYAN}  --set-secrets=DATABASE_URL=database-url:latest \\${NC}"
echo -e "   ${CYAN}  --add-cloudsql-instances=${CONNECTION_NAME} \\${NC}"
echo -e "   ${CYAN}  --command=pnpm --args=db:push${NC}"
echo ""
echo -e "2. Create admin user by visiting:"
echo -e "   ${BLUE}${SERVICE_URL}/api/auth/init-admin${NC}"
echo -e "   (POST request with JSON: {\"email\":\"admin@example.com\",\"password\":\"yourpassword\",\"name\":\"Admin\"})"
echo ""
echo -e "${CYAN}💰 Estimated Monthly Cost:${NC}"
echo -e "  Cloud SQL (f1-micro): ~\$7-10/month"
echo -e "  Cloud Run: ~\$0-5/month (depending on traffic)"
echo -e "  Total: ~\$10-15/month"
echo ""
echo -e "${CYAN}📝 Save these credentials:${NC}"
echo -e "  Database Password: ${DB_PASSWORD}"
echo -e "  JWT Secret: ${JWT_SECRET}"
echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"

# Save credentials to file
cat > CLOUDRUN_CREDENTIALS.txt <<EOF
ICT Eerbeek - Google Cloud Run Deployment
Generated: $(date)

Application URL: ${SERVICE_URL}

Google Cloud:
  Project ID: ${PROJECT_ID}
  Region: ${REGION}

Cloud SQL:
  Instance: ${DB_INSTANCE_NAME}
  Connection: ${CONNECTION_NAME}
  Database: ${DB_NAME}
  User: ${DB_USER}
  Password: ${DB_PASSWORD}

Security:
  JWT Secret: ${JWT_SECRET}

Next Steps:
1. Run migrations (see instructions above)
2. Create admin user
3. Configure custom domain (optional)

IMPORTANT: Keep this file secure and delete after saving credentials elsewhere!
EOF

echo -e "${GREEN}✓ Credentials saved to: CLOUDRUN_CREDENTIALS.txt${NC}"
