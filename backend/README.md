# Backend

This directory contains backend services and API integrations.

## Current Structure

- **`supabase/`** - Supabase client configuration
  - `client.ts` - Supabase client initialization
  - `types.ts` - Generated TypeScript database types

## Supabase Integration

The application uses Supabase for:
- Authentication (Auth)
- Database (PostgreSQL)
- Storage (File uploads)
- Real-time subscriptions

## Future Additions

This directory can be expanded with:
- Supabase Edge Functions
- Custom API endpoints
- Server-side utilities
- Webhook handlers
- Background jobs

## Notes

The Supabase client is imported in the frontend via:
```typescript
import { supabase } from "@/integrations/supabase/client"
```
