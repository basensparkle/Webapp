# ICT Eerbeek Web Application

A full-stack web application for ICT Eerbeek with content management system, built with React, Node.js, and MySQL.

## 🚀 Features

- ✅ **Local Authentication** - Email/password login (no external dependencies)
- ✅ **Content Management** - Create and manage pages, services, and menus
- ✅ **User Management** - Role-based access control (Admin, Content Editor, User)
- ✅ **Bilingual Support** - Dutch and English content
- ✅ **Contact Form** - With submission management
- ✅ **Media Library** - Upload and manage images
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **SEO Optimized** - Meta tags and structured data

## 📦 Tech Stack

### Frontend
- React 19 with TypeScript
- TanStack Query for data fetching
- Tailwind CSS for styling
- Vite for building

### Backend
- Node.js with Express
- tRPC for type-safe API
- Drizzle ORM for database
- JWT for authentication

### Database
- MySQL 8.0
- Drizzle migrations

## 🎯 Deployment Options

### Option 1: Google Cloud Run (Recommended)

**One-click deployment to Google Cloud Run with Cloud SQL:**

```bash
# Install Google Cloud SDK
sudo snap install google-cloud-cli --classic

# Deploy
bash deploy-to-cloudrun.sh
```

**Cost:** ~$10-15/month (after $300 free credit)

📖 **Full Guide:** [GOOGLE_CLOUD_RUN_GUIDE.md](./GOOGLE_CLOUD_RUN_GUIDE.md)

### Option 2: Plesk/Ubuntu VPS

**Deploy to your own Plesk server:**

```bash
# Upload files to server
scp ict-eerbeek.tar.gz root@your-server:/root/

# SSH and deploy
ssh root@your-server
tar -xzf ict-eerbeek.tar.gz
cd ict-eerbeek
bash deploy-plesk-improved.sh
```

📖 **Full Guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Option 3: Docker

```bash
# Build
docker build -f Dockerfile.cloudrun -t ict-eerbeek .

# Run
docker run -p 3000:8080 \
  -e DATABASE_URL="mysql://user:pass@host:3306/db" \
  -e JWT_SECRET="your-secret" \
  -e USE_LOCAL_AUTH=true \
  ict-eerbeek
```

## 🏃 Quick Start (Local Development)

### Prerequisites

- Node.js 22+
- pnpm
- MySQL 8.0

### Installation

```bash
# Clone repository
git clone https://github.com/basensparkle/Webapp.git
cd Webapp

# Install dependencies
pnpm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Create Admin User

```bash
pnpm init-admin
```

Access the application at: http://localhost:3000

## 📁 Project Structure

```
ict-eerbeek/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── _core/       # Core utilities
│   └── index.html
├── server/              # Node.js backend
│   ├── _core/           # Core server utilities
│   │   ├── localAuth.ts # Local authentication
│   │   ├── oauth.ts     # OAuth (optional)
│   │   └── index.ts     # Server entry
│   ├── routers.ts       # API routes
│   ├── db.ts            # Database operations
│   ├── seed.ts          # Database seeding
│   └── init-admin.ts    # Admin creation CLI
├── drizzle/             # Database schema
│   └── schema.ts        # Table definitions
├── deploy-to-cloudrun.sh        # Cloud Run deployment
├── deploy-plesk-improved.sh     # Plesk deployment
├── Dockerfile.cloudrun          # Docker configuration
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/icteerbeek

# Security
JWT_SECRET=your-random-secret-key-here

# Authentication
USE_LOCAL_AUTH=true

# Application
VITE_APP_ID=local-app
VITE_APP_TITLE=ICT Eerbeek
NODE_ENV=production
PORT=3000
```

## 🗄️ Database Schema

- **users** - User accounts with roles
- **pages** - CMS pages with bilingual content
- **services** - Service offerings
- **menuItems** - Navigation menus
- **media** - Uploaded files
- **contactSubmissions** - Contact form submissions
- **settings** - Application settings

## 🔐 Authentication

The application uses **local authentication** with:
- PBKDF2 password hashing (10,000 iterations)
- Unique salt per user
- JWT tokens for sessions
- Role-based access control

### User Roles

- **Admin** - Full access to all features
- **Content Editor** - Can manage content
- **User** - Basic access

## 📚 Documentation

- [Google Cloud Run Deployment](./GOOGLE_CLOUD_RUN_GUIDE.md)
- [Plesk Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Quick Start Guide](./QUICK_START.md)
- [Changes and Fixes](./CHANGES.md)
- [Fixes Summary](./FIXES_SUMMARY.md)

## 🛠️ Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Database migrations
pnpm db:push

# Create admin user
pnpm init-admin

# Lint code
pnpm lint

# Format code
pnpm format
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 🚀 Production Deployment

### Build

```bash
pnpm build
```

This creates:
- `dist/public/` - Frontend static files
- `dist/index.js` - Backend server

### Run

```bash
NODE_ENV=production node dist/index.js
```

## 📊 Monitoring

### Logs

```bash
# PM2 logs (if using PM2)
pm2 logs ict-eerbeek

# Cloud Run logs
gcloud run services logs read ict-eerbeek --region=europe-west1
```

## 🔄 Updates

### Update Application

```bash
git pull
pnpm install
pnpm db:push
pnpm build
pm2 restart ict-eerbeek  # or restart your process
```

### Update Dependencies

```bash
pnpm update
```

## 🐛 Troubleshooting

### Issue: "Invalid URL" Error

**Solution:** Ensure `.env` has proper values:
```env
JWT_SECRET=some-value-here
VITE_APP_ID=local-app
USE_LOCAL_AUTH=true
```

### Issue: Database Connection Failed

**Solution:** Check database credentials and ensure MySQL is running:
```bash
mysql -u icteerbeek -p -e "SELECT 1"
```

### Issue: Cannot Create Users

**Solution:** Run the init-admin script:
```bash
pnpm init-admin
```

## 💰 Hosting Costs

### Google Cloud Run
- **Free Tier:** $300 credit (90 days)
- **After:** ~$10-15/month

### VPS (Plesk)
- **Cost:** Depends on provider
- **Typical:** $5-20/month

### Self-Hosted
- **Cost:** Hardware + electricity
- **Control:** Full control

## 🔒 Security

- ✅ HTTPS/SSL (automatic on Cloud Run)
- ✅ Password hashing with salt
- ✅ JWT token authentication
- ✅ SQL injection protection (Drizzle ORM)
- ✅ XSS protection (React)
- ✅ CSRF protection
- ✅ Rate limiting (recommended to add)

## 📝 License

Proprietary - ICT Eerbeek

## 🤝 Support

For issues or questions:
1. Check the documentation in this repository
2. Review deployment logs
3. Contact the development team

## 🎉 Credits

Built with:
- React
- Node.js
- Drizzle ORM
- TanStack Query
- Tailwind CSS
- tRPC

---

## Quick Deploy Commands

### Google Cloud Run
```bash
bash deploy-to-cloudrun.sh
```

### Plesk/VPS
```bash
bash deploy-plesk-improved.sh
```

### Local Development
```bash
pnpm install && pnpm dev
```

---

**Ready to deploy?** Choose your deployment method above and follow the guide!
