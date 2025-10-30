#!/bin/bash

################################################################################
# Quick Fix for Invalid URL Error
# This script fixes environment configuration and rebuilds the application
################################################################################

set -e

APP_DIR="/root/ict-eerbeek"
cd "$APP_DIR"

echo "🔧 Fixing Invalid URL Error..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

echo "📝 Current .env configuration:"
cat .env | grep -v PASSWORD | grep -v SECRET
echo ""

# Check for empty or missing critical variables
echo "🔍 Checking for problematic environment variables..."

# Fix: Ensure JWT_SECRET exists
if ! grep -q "JWT_SECRET=" .env || [ -z "$(grep JWT_SECRET= .env | cut -d'=' -f2)" ]; then
    echo "⚠️  JWT_SECRET is missing or empty, generating new one..."
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
    echo "✅ JWT_SECRET generated"
fi

# Fix: Ensure VITE_APP_ID has a value (even if just "local-app")
if ! grep -q "VITE_APP_ID=" .env; then
    echo "⚠️  VITE_APP_ID is missing, adding default..."
    echo "VITE_APP_ID=local-app" >> .env
elif [ -z "$(grep VITE_APP_ID= .env | cut -d'=' -f2)" ]; then
    echo "⚠️  VITE_APP_ID is empty, setting default..."
    sed -i "s|^VITE_APP_ID=.*|VITE_APP_ID=local-app|" .env
fi

# Fix: Comment out or remove empty OAuth URLs that cause Invalid URL errors
echo "⚠️  Fixing OAuth configuration..."
sed -i 's|^OAUTH_SERVER_URL=$|# OAUTH_SERVER_URL=|' .env
sed -i 's|^VITE_OAUTH_PORTAL_URL=$|# VITE_OAUTH_PORTAL_URL=|' .env
sed -i 's|^BUILT_IN_FORGE_API_URL=$|# BUILT_IN_FORGE_API_URL=|' .env

# Ensure USE_LOCAL_AUTH is set to true
if ! grep -q "USE_LOCAL_AUTH=true" .env; then
    echo "⚠️  Setting USE_LOCAL_AUTH=true..."
    if grep -q "USE_LOCAL_AUTH=" .env; then
        sed -i "s|^USE_LOCAL_AUTH=.*|USE_LOCAL_AUTH=true|" .env
    else
        echo "USE_LOCAL_AUTH=true" >> .env
    fi
fi

echo "✅ Environment configuration fixed"
echo ""

echo "📝 Updated .env configuration:"
cat .env | grep -v PASSWORD | grep -v SECRET
echo ""

# Rebuild the application
echo "🔨 Rebuilding application..."
echo "This may take a few minutes..."
pnpm build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed!"
    exit 1
fi

# Restart PM2
echo ""
echo "🔄 Restarting application..."
pm2 restart ict-eerbeek

# Wait for app to start
sleep 3

# Check status
echo ""
echo "📊 Application status:"
pm2 status ict-eerbeek

echo ""
echo "🧪 Testing application..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Application is responding!"
else
    echo "⚠️  Application may not be responding yet"
    echo "Check logs with: pm2 logs ict-eerbeek"
fi

echo ""
echo "✅ Fix completed!"
echo ""
echo "Next steps:"
echo "1. Check if the site loads: http://ict-eerbeek.nl"
echo "2. If still having issues, check logs: pm2 logs ict-eerbeek"
echo "3. View deployment logs: cat deployment-logs/deploy-*.log"
