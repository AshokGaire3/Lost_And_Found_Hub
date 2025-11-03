# Database Setup Guide

## Quick Fix for "Could not find 'is_anonymous' column" Error

This error occurs when your Supabase database doesn't have the latest migrations applied. Follow these steps to fix it.

## 🚀 ULTRA QUICK FIX (30 seconds)

**Just want to fix the immediate error?** Run this in Supabase SQL Editor:

```sql
-- Quick fix: Add missing columns
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

ALTER TABLE public.items
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can create their own items" ON public.items;

CREATE POLICY "Authenticated users can create their own items"
ON public.items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can report lost items"
ON public.items
FOR INSERT
TO anon
WITH CHECK (
  status = 'lost' AND user_id IS NULL AND is_anonymous = true
);

CREATE POLICY "Staff can view anonymous reports"
ON public.items
FOR SELECT
TO authenticated
USING (
  is_anonymous = true AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'staff'::app_role
  )
);
```

✅ **This fixes the immediate error!** Then follow the complete setup below.

---

## ⚡ COMPLETE SETUP: Use Complete Schema File

**If you want to set up everything properly**, use the complete schema file:

1. Go to [supabase.com](https://supabase.com) → Your Project
2. Click **SQL Editor** → **New Query**
3. Open `supabase/complete_schema.sql` from this project
4. Copy the **ENTIRE** contents
5. Paste into SQL Editor
6. Click **Run**
7. Wait for success message

✅ **This file contains ALL migrations in one go!**

## Option 1: Apply Migrations via Supabase Dashboard (Recommended)

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### Step 2: Open SQL Editor
1. Click on "SQL Editor" in the left sidebar
2. Click "New Query"

### Step 3: Apply All Migrations in Order

Copy and paste each migration file content in this exact order:

#### 1. Initial Schema (20251028191335)
Copy contents from: `supabase/migrations/20251028191335_15f018df-397e-4d79-8a0f-a19704b09708.sql`

#### 2. User Roles (20251028234258)
Copy contents from: `supabase/migrations/20251028234258_b7c1407e-f151-4e75-a024-d1155191e7c0.sql`

#### 3. Enhanced Tracking (20251030040850)
Copy contents from: `supabase/migrations/20251030040850_628e2d69-6d83-4939-8165-4a88d7ecfd4e.sql`

#### 4. Public Claims (20251030041637)
Copy contents from: `supabase/migrations/20251030041637_c1bd5e09-af73-40c0-9edd-26235da8037a.sql`

#### 5. Audit & Matching (20251030043330)
Copy contents from: `supabase/migrations/20251030043330_5914884e-20f3-4b05-a6b1-ba115c670786.sql`

#### 6. Finalize Schema (20251102015619)
Copy contents from: `supabase/migrations/20251102015619_finalize_schema.sql`

#### 7. Safe Additions (20251102032608)
Copy contents from: `supabase/migrations/20251102032608_54560475-ecb6-4fec-86aa-c0ec49d05832.sql`

#### 8. Anonymous Reporting (20251102100000) ⚠️ **REQUIRED**
Copy contents from: `supabase/migrations/20251102100000_anonymous_reporting.sql`

This migration adds the `is_anonymous` column that's causing your error!

#### 9. Sample Data (20251103000000) - Optional
Copy contents from: `supabase/migrations/20251103000000_seed_sample_data.sql`

### Step 4: Execute Each Migration
For each migration:
1. Paste the SQL into the editor
2. Click "Run" or press Ctrl+Enter
3. Wait for "Success" message
4. Clear the editor and move to the next one

## Option 2: Using Supabase CLI (If You Have It Installed)

```bash
# If you haven't linked your project yet
supabase link --project-ref YOUR_PROJECT_REF

# Pull current remote schema
supabase db pull

# Apply all migrations
supabase db push

# Or reset everything and start fresh
supabase db reset
```

## Option 3: Quick Fix - Just Add Missing Column

If you just want to fix the immediate error, run this in Supabase SQL Editor:

```sql
-- Quick fix: Add missing is_anonymous column
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Allow user_id to be NULL
ALTER TABLE public.items
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can create their own items" ON public.items;

CREATE POLICY "Authenticated users can create their own items"
ON public.items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to report lost items
CREATE POLICY "Anonymous users can report lost items"
ON public.items
FOR INSERT
TO anon
WITH CHECK (
  status = 'lost' AND 
  user_id IS NULL AND 
  is_anonymous = true
);

-- Add comment
COMMENT ON COLUMN public.items.is_anonymous IS 'Flag to indicate if this is an anonymous report (no login required)';
```

## Verify Your Database Schema

After applying migrations, verify with this query:

```sql
-- Check if is_anonymous column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'items'
  AND column_name = 'is_anonymous';
```

You should see:
```
column_name    | data_type | is_nullable
---------------|-----------|-------------
is_anonymous   | boolean   | YES
```

## Storage Bucket Setup

Make sure you have a storage bucket for item images:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'item-images';

-- If it doesn't exist, create it
INSERT INTO storage.buckets (id, name, public) 
VALUES ('item-images', 'item-images', true);
```

## Common Issues

### Issue 1: "Column already exists"
**Solution:** Some migrations might have already been applied. Check which columns exist first:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'items' 
AND table_schema = 'public';
```

### Issue 2: "Permission denied"
**Solution:** Make sure you're running queries as a superuser in the SQL Editor

### Issue 3: "Type does not exist"
**Solution:** Make sure to run migrations in order. The enums are created in early migrations.

## Testing Your Setup

After applying migrations:

1. **Test Anonymous Reporting:**
   - Go to `/report` without logging in
   - Try to report a lost item
   - Should work without errors

2. **Test Staff Reporting:**
   - Log in as staff
   - Go to `/report`
   - Try to report a found item
   - Should work without errors

3. **Check Admin Dashboard:**
   - Log in as staff
   - Go to `/admin`
   - Should see all items and claims

## Need Help?

If you still have issues:
1. Check Supabase logs: Dashboard > Logs
2. Verify your `.env.local` has correct credentials
3. Make sure your Supabase project is properly linked
4. Check that storage bucket is public

## Quick Reference

| File | Purpose | Required |
|------|---------|----------|
| 20251028191335 | Initial schema | ✅ Yes |
| 20251028234258 | User roles | ✅ Yes |
| 20251030040850 | Enhanced tracking | ✅ Yes |
| 20251030041637 | Public claims | ✅ Yes |
| 20251030043330 | Audit & matching | ✅ Yes |
| 20251102015619 | Finalize schema | ✅ Yes |
| 20251102032608 | Safe additions | ✅ Yes |
| 20251102100000 | Anonymous reporting | ✅ **CRITICAL** |
| 20251103000000 | Sample data | ⭕ Optional |

