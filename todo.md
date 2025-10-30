# ICT Eerbeek - Project TODO

## Phase 1: Database Schema and Seed Data
- [x] Define database schema for users, pages, services, menu items, media, and settings
- [x] Create database migrations
- [x] Seed initial services data (4 core services)
- [x] Seed initial admin user
- [x] Seed initial settings (contact info, company details)

## Phase 2: Backend API with Authentication and RBAC
- [x] Extend user table with role field (ADMIN, CONTENT_EDITOR)
- [x] Create adminProcedure middleware for role-based access
- [x] Implement pages API (CRUD operations)
- [x] Implement services API (update operations)
- [x] Implement menu API (CRUD and reorder)
- [x] Implement media API (upload, list, delete)
- [x] Implement user management API (CRUD, admin only)
- [x] Implement settings API (get, update)

## Phase 3: Public Website Pages
- [x] Configure dark theme with neon green/yellow accents
- [x] Set up i18next for bilingual support (NL/EN)
- [x] Create language switcher component
- [x] Build Home page with hero and services overview
- [x] Build Services page with detailed service descriptions
- [x] Build About Us page with company info
- [x] Build Portfolio/Cases page with mock data
- [x] Build Contact page with form and Google Maps integration
- [x] Implement responsive navigation header
- [x] Implement footer with contact details
- [x] Ensure mobile-first responsive design

## Phase 4: CMS Admin Panel
- [x] Create admin dashboard layout with sidebar navigation
- [x] Build dashboard overview page
- [x] Build pages management interface (CRUD)
- [x] Build services management interface (edit 4 services)
- [ ] Build menu management interface (header/footer)
- [x] Build user management interface (admin only)
- [ ] Build settings management interface
- [x] Implement role-based UI rendering
- [x] Add side-by-side NL/EN editor for content

## Phase 5: Media Library and WYSIWYG Editor
- [x] Integrate file upload with S3 storage
- [ ] Build media library interface (grid view, upload, delete)
- [x] Integrate Quill WYSIWYG editor for page content
- [ ] Add image insertion from media library to editor
- [ ] Implement drag-and-drop file upload

## Phase 6: Testing and Deployment
- [x] Test all public pages (NL/EN)
- [x] Test admin panel functionality
- [x] Test RBAC (ADMIN vs CONTENT_EDITOR permissions)
- [x] Test contact form submission
- [ ] Test media upload and management
- [x] Verify responsive design on mobile/tablet/desktop
- [x] Create deployment checkpoint
- [x] Write deployment guide for Plesk VPS

## Phase 7: Final Delivery
- [x] Create comprehensive user guide
- [x] Document API endpoints
- [x] Prepare deployment instructions
- [x] Deliver final results to user


## Social Media Launch Package
- [x] Design reindeer/tech logo combining network elements with deer silhouette
- [x] Create Video 1: "Local Trust" Intro (15-20s, vertical & square formats)
- [x] Create Video 2: "Future Tech" Showcase (25-30s, vertical & square formats)
- [x] Design Banner A: Cyber Security Check-Up (1200x628)
- [x] Design Banner B: AI & IoT Partner (1080x1080)
- [x] Design Banner C: Tech Experts of Veluwe (1920x1080)
- [x] Write post copy for all content (Dutch & English)
- [x] Create hashtag strategy with local and industry tags
- [x] Package all assets for immediate deployment

## Deployment Scripts
- [x] Create one-click Plesk VPS deployment script (deploy-plesk.sh)
- [x] Create Docker deployment script (deploy-docker.sh)
- [x] Create Dockerfile for containerized deployment
- [x] Create docker-compose.yml for complete stack
- [x] Create Nginx configuration for Docker
- [x] Create comprehensive Docker deployment guide
