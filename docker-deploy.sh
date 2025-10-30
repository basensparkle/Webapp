#!/bin/bash

################################################################################
# ICT Eerbeek - Docker Deployment Script
# One-click deployment using Docker Compose
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
echo -e "${BLUE}ICT Eerbeek - Docker Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo -e "${YELLOW}Install Docker from: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo -e "${YELLOW}Install Docker Compose from: https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker Compose found${NC}"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo -e "${CYAN}Creating .env from .env.docker template...${NC}"
    cp .env.docker .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please review and update .env with your settings${NC}"
    echo ""
fi

# Stop existing containers
echo -e "${CYAN}🛑 Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

# Build images
echo -e "${CYAN}🔨 Building Docker images...${NC}"
echo -e "${YELLOW}This may take 5-10 minutes on first run...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}✓ Images built${NC}"
echo ""

# Start services
echo -e "${CYAN}🚀 Starting services...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Services started${NC}"
echo ""

# Wait for database to be ready
echo -e "${CYAN}⏳ Waiting for database to be ready...${NC}"
sleep 10

# Check if services are running
echo -e "${CYAN}📊 Checking service status...${NC}"
docker-compose ps
echo ""

# Run database migrations
echo -e "${CYAN}🗄️  Running database migrations...${NC}"
docker-compose exec -T app pnpm db:push || echo -e "${YELLOW}⚠ Migration may have already run${NC}"
echo -e "${GREEN}✓ Migrations complete${NC}"
echo ""

# Check if admin user exists
echo -e "${CYAN}👤 Checking for admin user...${NC}"
USER_COUNT=$(docker-compose exec -T db mysql -u icteerbeek -picteerbeek123 icteerbeek -sN -e "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
    echo -e "${YELLOW}⚠ No users found${NC}"
    echo -e "${CYAN}You can create an admin user with:${NC}"
    echo -e "${BLUE}docker-compose exec app pnpm init-admin${NC}"
else
    echo -e "${GREEN}✓ Users exist in database (count: $USER_COUNT)${NC}"
fi
echo ""

# Get container status
APP_STATUS=$(docker-compose ps app --format json 2>/dev/null | grep -o '"State":"[^"]*"' | cut -d'"' -f4 || echo "unknown")

if [ "$APP_STATUS" = "running" ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ Deployment Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${CYAN}🌐 Access your application:${NC}"
    echo -e "${BLUE}http://localhost:3000${NC}"
    echo ""
    echo -e "${CYAN}📋 Useful commands:${NC}"
    echo -e "  View logs:        ${BLUE}docker-compose logs -f app${NC}"
    echo -e "  Stop services:    ${BLUE}docker-compose down${NC}"
    echo -e "  Restart services: ${BLUE}docker-compose restart${NC}"
    echo -e "  Create admin:     ${BLUE}docker-compose exec app pnpm init-admin${NC}"
    echo -e "  Access database:  ${BLUE}docker-compose exec db mysql -u icteerbeek -p${NC}"
    echo ""
else
    echo -e "${RED}❌ Application failed to start${NC}"
    echo -e "${YELLOW}Check logs with: docker-compose logs app${NC}"
    exit 1
fi
