# Database

This directory contains all database-related files including migrations, schema definitions, and configuration.

## Structure

- **`migrations/`** - SQL migration files (ordered by timestamp)
- **`complete_schema.sql`** - Complete database schema reference
- **`config.toml`** - Supabase project configuration

## Migration Files

Migrations are applied in chronological order:

1. `20251028191335_*` - Initial schema (profiles, items, claims)
2. `20251028234258_*` - User roles system
3. `20251030040850_*` - Items enhancements (color, venue, container)
4. `20251030041637_*` - Public claims support
5. `20251030043330_*` - Storage tracking fields
6. `20251102015619_*` - Schema finalization (verification, match algorithm, audit log)
7. `20251102032608_*` - Storage table and audit log
8. `20251102100000_*` - Anonymous reporting
9. `20251103000000_*` - Sample data seeding

## Running Migrations

### Using Supabase CLI

```bash
# Reset database and apply all migrations
supabase db reset

# Apply pending migrations
supabase migration up

# Link to your Supabase project
supabase link --project-ref your-project-ref
```

### Manual Application

1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Copy migration file content
4. Execute SQL

## Schema Overview

### Main Tables
- `profiles` - User profiles
- `user_roles` - Staff/student roles
- `items` - Lost and found items
- `claims` - Item claims with verification
- `matches` - Potential item matches
- `storage` - Physical storage tracking
- `audit_log` - System activity log

### Enums
- `app_role` - Staff or student
- `item_category` - Item categories
- `item_status` - Lost, found, claimed, returned
