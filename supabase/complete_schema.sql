-- ========================================
-- COMPLETE DATABASE SCHEMA FOR LOST & FOUND HUB
-- Run this file in Supabase SQL Editor to set up the entire database
-- ========================================

-- ========================================
-- MIGRATION 1: Initial Schema (20251028191335)
-- ========================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create item categories enum
DO $$ BEGIN
  CREATE TYPE public.item_status AS ENUM ('lost', 'found', 'claimed', 'returned');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.item_category AS ENUM ('electronics', 'clothing', 'accessories', 'books', 'keys', 'bags', 'documents', 'sports', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.item_status NOT NULL,
  category public.item_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date_lost_found DATE NOT NULL,
  image_url TEXT,
  contact_info TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active items" ON public.items;
DROP POLICY IF EXISTS "Users can create their own items" ON public.items;
DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete their own items" ON public.items;

CREATE POLICY "Anyone can view active items"
  ON public.items FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Users can create their own items"
  ON public.items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON public.items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON public.items FOR DELETE
  USING (auth.uid() = user_id);

-- Create claims table
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claimant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, claimant_id)
);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view claims on their items" ON public.claims;
DROP POLICY IF EXISTS "Users can create claims" ON public.claims;
DROP POLICY IF EXISTS "Item owners can update claims" ON public.claims;

CREATE POLICY "Users can view claims on their items"
  ON public.claims FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.items WHERE id = item_id
    ) OR auth.uid() = claimant_id
  );

CREATE POLICY "Users can create claims"
  ON public.claims FOR INSERT
  WITH CHECK (auth.uid() = claimant_id);

CREATE POLICY "Item owners can update claims"
  ON public.claims FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.items WHERE id = item_id
    )
  );

-- Create storage bucket for item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for item images
DROP POLICY IF EXISTS "Anyone can view item images" ON storage.objects;
CREATE POLICY "Anyone can view item images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

DROP POLICY IF EXISTS "Authenticated users can upload item images" ON storage.objects;
CREATE POLICY "Authenticated users can upload item images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'item-images' AND
    auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update their own item images" ON storage.objects;
CREATE POLICY "Users can update their own item images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'item-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own item images" ON storage.objects;
CREATE POLICY "Users can delete their own item images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'item-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_items_updated_at ON public.items;
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_claims_updated_at ON public.claims;
CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON public.claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- MIGRATION 2: User Roles (20251028234258)
-- ========================================

-- Create an enum for user roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('staff', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create a security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create a function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only authenticated users can insert their role on signup" ON public.user_roles;
CREATE POLICY "Only authenticated users can insert their role on signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ========================================
-- MIGRATION 3: Enhanced Tracking (20251030040850)
-- ========================================

-- Add new columns to items table for better tracking
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS color text,
ADD COLUMN IF NOT EXISTS venue text,
ADD COLUMN IF NOT EXISTS container text,
ADD COLUMN IF NOT EXISTS identifying_details text;

-- Update items table RLS policies to allow public viewing of found items
DROP POLICY IF EXISTS "Anyone can view active items" ON public.items;
DROP POLICY IF EXISTS "Public can view active found items" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can view their own items" ON public.items;

CREATE POLICY "Public can view active found items"
ON public.items
FOR SELECT
USING (is_active = true AND status = 'found');

CREATE POLICY "Authenticated users can view their own items"
ON public.items
FOR SELECT
USING (auth.uid() = user_id);

-- Update claims table to store more detailed information
ALTER TABLE public.claims
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS lost_date date,
ADD COLUMN IF NOT EXISTS lost_location text,
ADD COLUMN IF NOT EXISTS venue text,
ADD COLUMN IF NOT EXISTS reference_number text DEFAULT ('CLM-' || LPAD(floor(random() * 999999)::text, 6, '0'));

-- Update claims RLS to allow viewing with reference number
DROP POLICY IF EXISTS "Users can view claims by reference number" ON public.claims;
CREATE POLICY "Users can view claims by reference number"
ON public.claims
FOR SELECT
USING (true);

COMMENT ON COLUMN public.items.color IS 'Color of the item for easier identification';
COMMENT ON COLUMN public.items.venue IS 'Specific building or area where item was found (e.g., SU, Library, etc.)';
COMMENT ON COLUMN public.items.container IS 'Storage container or location where item is kept';
COMMENT ON COLUMN public.items.identifying_details IS 'Specific details that can help verify ownership';

-- ========================================
-- MIGRATION 4: Public Claims (20251030041637)
-- ========================================

-- Update claims table to support public submissions (no auth required)
ALTER TABLE public.claims
ALTER COLUMN claimant_id DROP NOT NULL;

-- Add email field for public claims
ALTER TABLE public.claims
ADD COLUMN IF NOT EXISTS email text;

-- Update RLS policies for claims to allow public inserts
DROP POLICY IF EXISTS "Users can create claims" ON public.claims;
DROP POLICY IF EXISTS "Anyone can create claims" ON public.claims;

CREATE POLICY "Anyone can create claims"
ON public.claims
FOR INSERT
WITH CHECK (true);

-- Staff can view all claims
DROP POLICY IF EXISTS "Users can view claims on their items" ON public.claims;
DROP POLICY IF EXISTS "Staff can view all claims" ON public.claims;

CREATE POLICY "Staff can view all claims"
ON public.claims
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'staff'
  )
  OR auth.uid() = claimant_id
);

-- Staff can update claims (approve/reject)
DROP POLICY IF EXISTS "Item owners can update claims" ON public.claims;
DROP POLICY IF EXISTS "Staff can update claims" ON public.claims;

CREATE POLICY "Staff can update claims"
ON public.claims
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'staff'
  )
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items(user_id);

COMMENT ON COLUMN public.claims.email IS 'Email for public claim submissions without authentication';

-- ========================================
-- MIGRATION 5: Audit & Matching (20251030043330)
-- ========================================

-- Add storage tracking fields to items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS storage_location TEXT,
ADD COLUMN IF NOT EXISTS storage_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Create audit_log table for tracking changes
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Staff can view all audit logs
DROP POLICY IF EXISTS "Staff can view all audit logs" ON public.audit_log;
CREATE POLICY "Staff can view all audit logs"
ON public.audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'staff'::app_role
  )
);

-- Authenticated users can view audit logs for their items
DROP POLICY IF EXISTS "Users can view audit logs for their items" ON public.audit_log;
CREATE POLICY "Users can view audit logs for their items"
ON public.audit_log
FOR SELECT
USING (
  item_id IN (
    SELECT id FROM items WHERE user_id = auth.uid()
  )
);

-- Create matches table for tracking potential matches between lost and found items
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lost_item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  found_item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_match_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS on matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Staff can view all matches
DROP POLICY IF EXISTS "Staff can view all matches" ON public.matches;
CREATE POLICY "Staff can view all matches"
ON public.matches
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'staff'::app_role
  )
);

-- Staff can update matches
DROP POLICY IF EXISTS "Staff can update matches" ON public.matches;
CREATE POLICY "Staff can update matches"
ON public.matches
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'staff'::app_role
  )
);

-- Staff can insert matches
DROP POLICY IF EXISTS "Staff can insert matches" ON public.matches;
CREATE POLICY "Staff can insert matches"
ON public.matches
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'staff'::app_role
  )
);

-- Create trigger for matches updated_at
DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_log_item_id ON public.audit_log(item_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_lost_item ON public.matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_found_item ON public.matches(found_item_id);
CREATE INDEX IF NOT EXISTS idx_items_storage_location ON public.items(storage_location);
CREATE INDEX IF NOT EXISTS idx_items_expiry_date ON public.items(expiry_date);

-- ========================================
-- MIGRATION 6: Finalize Schema (20251102015619)
-- ========================================

-- Update claims table with additional tracking fields
ALTER TABLE public.claims
ADD COLUMN IF NOT EXISTS claim_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS staff_notes TEXT;

-- Add constraint for verification_status
ALTER TABLE public.claims
DROP CONSTRAINT IF EXISTS valid_verification_status;

ALTER TABLE public.claims
ADD CONSTRAINT valid_verification_status 
CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- Create index for verification_status
CREATE INDEX IF NOT EXISTS idx_claims_verification_status ON public.claims(verification_status);

COMMENT ON COLUMN public.claims.claim_date IS 'Date when claim was submitted';
COMMENT ON COLUMN public.claims.verification_status IS 'Verification status of the claim';
COMMENT ON COLUMN public.claims.staff_notes IS 'Internal notes by staff during verification';

-- Update matches table with algorithm tracking
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS match_algorithm TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS match_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraint for match_algorithm
ALTER TABLE public.matches
DROP CONSTRAINT IF EXISTS valid_match_algorithm;

ALTER TABLE public.matches
ADD CONSTRAINT valid_match_algorithm 
CHECK (match_algorithm IN ('manual', 'AI', 'keyword'));

-- Create index for match_algorithm
CREATE INDEX IF NOT EXISTS idx_matches_algorithm ON public.matches(match_algorithm);

COMMENT ON COLUMN public.matches.match_algorithm IS 'Method used to identify match (manual, AI, keyword)';
COMMENT ON COLUMN public.matches.match_date IS 'Date when match was created';

-- Update audit_log table with action_type and timestamp
ALTER TABLE public.audit_log
ADD COLUMN IF NOT EXISTS action_type TEXT NOT NULL DEFAULT 'update',
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

-- Add constraint for action_type
ALTER TABLE public.audit_log
DROP CONSTRAINT IF EXISTS valid_action_type;

ALTER TABLE public.audit_log
ADD CONSTRAINT valid_action_type 
CHECK (action_type IN ('create', 'update', 'delete', 'claim', 'match', 'status_change'));

-- Create index for action_type
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON public.audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log(timestamp DESC);

COMMENT ON COLUMN public.audit_log.action_type IS 'Type of action performed (create, update, delete, claim, match, status_change)';
COMMENT ON COLUMN public.audit_log.timestamp IS 'Timestamp of the action';

-- Create storage table for physical storage tracking
CREATE TABLE IF NOT EXISTS public.storage (
  storage_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  location VARCHAR(255) NOT NULL,
  stored_by UUID REFERENCES auth.users(id),
  storage_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on storage
ALTER TABLE public.storage ENABLE ROW LEVEL SECURITY;

-- Staff can view all storage records
DROP POLICY IF EXISTS "Staff can view all storage records" ON public.storage;
CREATE POLICY "Staff can view all storage records"
ON public.storage
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'staff'::app_role
  )
);

-- Staff can insert storage records
DROP POLICY IF EXISTS "Staff can insert storage records" ON public.storage;
CREATE POLICY "Staff can insert storage records"
ON public.storage
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'staff'::app_role
  )
);

-- Staff can update storage records
DROP POLICY IF EXISTS "Staff can update storage records" ON public.storage;
CREATE POLICY "Staff can update storage records"
ON public.storage
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'staff'::app_role
  )
);

-- Staff can delete storage records
DROP POLICY IF EXISTS "Staff can delete storage records" ON public.storage;
CREATE POLICY "Staff can delete storage records"
ON public.storage
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'staff'::app_role
  )
);

-- Create trigger for storage updated_at
DROP TRIGGER IF EXISTS update_storage_updated_at ON public.storage;
CREATE TRIGGER update_storage_updated_at
BEFORE UPDATE ON public.storage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for storage
CREATE INDEX IF NOT EXISTS idx_storage_item_id ON public.storage(item_id);
CREATE INDEX IF NOT EXISTS idx_storage_location ON public.storage(location);
CREATE INDEX IF NOT EXISTS idx_storage_date ON public.storage(storage_date DESC);
CREATE INDEX IF NOT EXISTS idx_storage_expiry ON public.storage(expiry_date);

COMMENT ON TABLE public.storage IS 'Physical storage tracking for lost and found items';
COMMENT ON COLUMN public.storage.item_id IS 'Linked item ID';
COMMENT ON COLUMN public.storage.location IS 'Physical location (bin/shelf/room)';
COMMENT ON COLUMN public.storage.stored_by IS 'Staff member who stored the item';
COMMENT ON COLUMN public.storage.storage_date IS 'Date item was stored';
COMMENT ON COLUMN public.storage.expiry_date IS 'Date item should be disposed if not claimed';
COMMENT ON COLUMN public.storage.notes IS 'Additional notes about storage';

-- ========================================
-- MIGRATION 8: Anonymous Reporting (20251102100000) - CRITICAL
-- ========================================

-- Allow user_id to be NULL for anonymous reports
ALTER TABLE public.items
ALTER COLUMN user_id DROP NOT NULL;

-- Add a flag to track anonymous reports
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Update RLS policy for items to allow anonymous inserts (lost items only)
DROP POLICY IF EXISTS "Users can create their own items" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can create their own items" ON public.items;
DROP POLICY IF EXISTS "Anonymous users can report lost items" ON public.items;

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

-- Allow staff to view anonymous reports
DROP POLICY IF EXISTS "Staff can view anonymous reports" ON public.items;
CREATE POLICY "Staff can view anonymous reports"
ON public.items
FOR SELECT
TO authenticated
USING (
  is_anonymous = true AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'staff'::app_role
  )
);

-- Add comment
COMMENT ON COLUMN public.items.is_anonymous IS 'Flag to indicate if this is an anonymous report (no login required)';
COMMENT ON COLUMN public.items.user_id IS 'User ID who reported the item. NULL for anonymous reports.';

-- Allow anonymous users to upload to storage for lost item reports
DROP POLICY IF EXISTS "Anonymous users can upload lost item images" ON storage.objects;
CREATE POLICY "Anonymous users can upload lost item images"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'item-images' AND
  (storage.foldername(name))[1] = 'anonymous'
);

-- ========================================
-- ADDITIONAL RLS POLICIES FOR STAFF
-- ========================================

-- Staff can view all found items
DROP POLICY IF EXISTS "Staff can view all found items" ON public.items;
CREATE POLICY "Staff can view all found items"
ON public.items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'staff'::app_role
  )
  AND is_active = true
);

-- Staff can update any item
DROP POLICY IF EXISTS "Staff can update any item" ON public.items;
CREATE POLICY "Staff can update any item"
ON public.items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'staff'::app_role
  )
);

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database schema setup complete! All migrations applied successfully.';
  RAISE NOTICE '✅ is_anonymous column added to items table';
  RAISE NOTICE '✅ Anonymous reporting enabled for lost items';
  RAISE NOTICE '✅ Staff policies configured';
  RAISE NOTICE '✅ All tables and indexes created';
END $$;

