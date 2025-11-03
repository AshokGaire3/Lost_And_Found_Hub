# Lost and Found Hub

A modern, responsive web application for managing lost and found items on campus. Built with React, TypeScript, Supabase, and shadcn-ui.

## Project Repository

**GitHub**: https://github.com/AshokGaire3/Lost_And_Found_Hub

## Features

- 📱 **Step-by-Step Reporting**: Intuitive survey-style form for reporting lost items
- 📍 **Geolocation Support**: Get your current location and find nearest lost & found locations
- 🔍 **Advanced Search**: Search by category, color, location, and date
- 👥 **Role-Based Access**: Separate interfaces for students and staff
- 🔐 **Anonymous Reporting**: Students can report lost items without logging in
- 📊 **Admin Dashboard**: Staff dashboard for managing items, claims, and matches
- 🗄️ **Storage Management**: Track physical storage locations and expiry dates
- 🎨 **Modern UI**: Beautiful, responsive design with shadcn-ui components

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd lost-and-found-hub

# Install dependencies
npm install

# Start Supabase locally (optional, if running locally)
supabase start

# Apply database migrations
supabase db reset

# Seed sample data (optional but recommended)
supabase migration up

# Start development server
npm run dev
```

### Database Setup

The project uses Supabase for authentication and database. To set up:

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```
4. Run migrations:
   ```sh
   # Using Supabase CLI
   supabase link --project-ref your-project-ref
   supabase db push
   
   # Or manually apply migrations from supabase/migrations/ in order
   ```

### Sample Data

A migration file is included with 20 sample found items across all categories:

```sh
# Apply all migrations including sample data
supabase migration up
```

This will populate your database with realistic test data for:
- Electronics (iPhones, laptops, AirPods)
- Clothing (jackets, hoodies, coats)
- Keys (car keys, house keys)
- Bags (backpacks, purses)
- Documents (IDs, licenses, cards)
- Books (textbooks, lab manuals)
- Accessories (watches, sunglasses)
- Sports (basketballs, yoga mats)
- Other items

## Technologies Used

This project is built with:

- **Vite** - Lightning-fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI framework
- **shadcn-ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend (PostgreSQL + Auth + Storage)
- **React Router** - Client-side routing
- **Zod** - Schema validation
- **React Hook Form** - Form management
- **Lucide React** - Icon library

## Project Structure

```
lost-and-found-hub/
├── src/
│   ├── pages/          # Main application pages
│   │   ├── Index.tsx   # Homepage
│   │   ├── Browse.tsx  # Browse found items
│   │   ├── ReportItem.tsx # Report lost/found items (survey flow)
│   │   ├── MyItems.tsx # User's lost/found items
│   │   ├── ItemDetail.tsx # Item details & claiming
│   │   ├── AdminDashboard.tsx # Staff dashboard
│   │   └── StorageManagement.tsx # Storage tracking
│   ├── components/     # Reusable components
│   ├── integrations/   # Supabase client & types
│   └── hooks/          # Custom React hooks
├── supabase/
│   └── migrations/     # Database migrations & sample data
└── public/             # Static assets
```

## Deployment

This application can be deployed to various platforms:

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag and drop the dist folder to Netlify
```

### Railway
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm run preview`

### Environment Variables
Make sure to set these in your deployment platform:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key
