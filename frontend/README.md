# Frontend

This directory contains the React frontend application for the Lost & Found Hub.

## Structure

- **`src/`** - Source code
  - `components/` - React components (UI components, admin components)
  - `pages/` - Page components (routes)
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions
  - `integrations/` - Third-party integrations (Supabase client)
- **`public/`** - Static assets
- **`index.html`** - HTML entry point

## Configuration

- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS theming
- `tsconfig.json` - TypeScript configuration
- `postcss.config.js` - PostCSS configuration

## Running

```bash
# From project root
npm run dev

# Or from this directory
npm run dev
```

## Building

```bash
npm run build
```

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn-ui components
- React Router
- TanStack React Query
