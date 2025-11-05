# Project Structure

## Overview
This project is organized into three main directories: **Frontend**, **Backend**, and **Database**.

## Directory Structure

```
lost-and-found-hub/
├── frontend/              # React frontend application
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── integrations/ # Supabase client integration
│   ├── public/            # Static assets
│   ├── index.html         # HTML entry point
│   ├── vite.config.ts     # Vite configuration
│   ├── tailwind.config.ts # Tailwind CSS configuration
│   └── tsconfig.json      # TypeScript configuration
│
├── backend/               # Backend services and API
│   └── supabase/          # Supabase client configuration
│       ├── client.ts      # Supabase client initialization
│       └── types.ts       # TypeScript database types
│
├── database/              # Database schema and migrations
│   ├── migrations/        # SQL migration files
│   ├── complete_schema.sql # Complete database schema
│   └── config.toml        # Supabase configuration
│
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

## Frontend (`frontend/`)

Contains all React application code, UI components, pages, and frontend-specific configurations.

### Key Directories:
- **`src/components/`** - Reusable React components
  - `ui/` - shadcn-ui component library
  - `admin/` - Admin-specific components
- **`src/pages/`** - Page-level components (routes)
- **`src/hooks/`** - Custom React hooks
- **`src/integrations/`** - Third-party integrations (Supabase client)
- **`src/lib/`** - Utility functions and helpers
- **`public/`** - Static assets (images, favicon, etc.)

### Configuration Files:
- `vite.config.ts` - Vite build tool configuration
- `tailwind.config.ts` - Tailwind CSS theming
- `tsconfig.json` - TypeScript compiler options
- `postcss.config.js` - PostCSS configuration

## Backend (`backend/`)

Contains backend services and API integrations. Currently uses Supabase for backend services.

### Current Structure:
- **`supabase/`** - Supabase client configuration
  - `client.ts` - Supabase client initialization
  - `types.ts` - Generated TypeScript types from database schema

### Future Additions:
- Edge functions (if using Supabase Edge Functions)
- API routes (if adding custom API endpoints)
- Server-side utilities

## Database (`database/`)

Contains all database-related files including migrations, schema definitions, and configuration.

### Key Files:
- **`migrations/`** - Sequential SQL migration files
  - Files are named with timestamps for proper ordering
  - Each migration adds/modifies database structure
- **`complete_schema.sql`** - Complete database schema (for reference)
- **`config.toml`** - Supabase project configuration

### Migration Files:
1. Initial schema creation
2. User roles and authentication
3. Claims and items enhancements
4. Storage tracking
5. Audit logging
6. Schema finalization
7. Anonymous reporting
8. Sample data seeding

## Running the Project

### Development
```bash
npm run dev
```
Starts the Vite dev server from the `frontend/` directory.

### Building
```bash
npm run build
```
Builds the production-ready frontend bundle.

### Database Migrations
```bash
# Using Supabase CLI
cd database
supabase db reset  # Reset and apply all migrations
supabase migration up  # Apply pending migrations
```

## Import Paths

The frontend uses path aliases configured in `vite.config.ts`:
- `@/` resolves to `frontend/src/`
- Example: `import { supabase } from "@/integrations/supabase/client"`

## Notes

- The frontend is a standalone React application that can be deployed independently
- Backend services are handled by Supabase (PostgreSQL, Auth, Storage)
- Database migrations should be run in order using Supabase CLI
- All TypeScript types are generated from the database schema

