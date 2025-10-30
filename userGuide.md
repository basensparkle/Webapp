# ICT Eerbeek - User Guide

## Purpose

ICT Eerbeek is a professional full-stack web application for a local IT service provider in the Veluwe region. Users can browse services in Dutch or English, submit contact requests, and administrators can manage all website content through a comprehensive CMS.

## Access

- **Public Website**: Open to everyone
- **Admin Panel**: Login required (admin or content_editor roles)

## Powered by Manus

**Technology Stack:**
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 with custom dark theme and neon accent colors
- **Backend**: Node.js + Express + tRPC 11 for type-safe API communication
- **Database**: MySQL with Drizzle ORM for robust data management
- **Authentication**: Manus OAuth with role-based access control (RBAC)
- **File Storage**: Amazon S3 for scalable media management
- **Internationalization**: i18next for seamless bilingual support (Dutch/English)
- **Rich Text Editing**: Quill WYSIWYG editor for intuitive content creation
- **Deployment**: Auto-scaling infrastructure with global CDN

This cutting-edge stack ensures blazing-fast performance, enterprise-grade security, and effortless content management.

## Using Your Website

### Browsing the Public Website

**Switch Languages**: Click "NL" or "EN" in the top-right header to toggle between Dutch and English. Your preference is saved automatically.

**View Services**: Click "Services" in the navigation menu to see detailed descriptions of all four core services: computer assistance, networks and security, IoT solutions, and AI applications.

**Submit Contact Form**: Navigate to "Contact" → Fill in your name, email, subject, and message → Click "Send message". You'll see a success notification when your message is submitted.

**View Location**: Scroll to the "Contact" page to see the embedded Google Maps showing the Eerbeek office location at Odinkerf 18.

### Managing Your Website

**Access Admin Panel**: After logging in with admin or content_editor credentials, click "Admin Panel" in the header to enter the CMS.

**Manage Pages**: Go to "Pages" in the admin sidebar → Click "New Page" to create → Fill in titles and content in both Dutch and English using the rich text editor → Toggle "Published" to make it live → Click "Create". Edit existing pages by clicking "Edit" next to any page.

**Edit Services**: Navigate to "Services" in the admin sidebar → Click "Edit" on any service card → Update titles, descriptions, icons, and display order → Click "Update Service". Changes appear immediately on the public website.

**Manage Users** (Admin only): Go to "Users" in the admin sidebar → Click "Edit" next to any user → Change their role between User, Content Editor, or Admin → Click "Update User". Content Editors can manage pages and services but cannot access user management.

**View Dashboard**: The admin dashboard shows quick stats including total pages, services, unread contact messages, and total users. Click any stat card to jump directly to that section.

## Next Steps

Talk to Manus AI anytime to request changes or add features. You can ask to customize the design, add new pages, integrate additional services, or extend the CMS functionality. The application is built on a flexible architecture that makes it easy to evolve as your business grows.

Try creating your first custom page through the Pages management interface to see how easy it is to publish bilingual content with the WYSIWYG editor.
