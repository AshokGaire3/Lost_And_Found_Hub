-- Add storage tracking fields to items table (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='items' AND column_name='storage_location') THEN
    ALTER TABLE public.items ADD COLUMN storage_location TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='items' AND column_name='storage_date') THEN
    ALTER TABLE public.items ADD COLUMN storage_date TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='items' AND column_name='expiry_date') THEN
    ALTER TABLE public.items ADD COLUMN expiry_date DATE;
  END IF;
END $$;

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can view all audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Users can view audit logs for their items" ON public.audit_log;

-- Staff can view all audit logs
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can view all matches" ON public.matches;
DROP POLICY IF EXISTS "Staff can update matches" ON public.matches;
DROP POLICY IF EXISTS "Staff can insert matches" ON public.matches;

-- Staff can view all matches
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

-- Create trigger for matches updated_at if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_matches_updated_at') THEN
    CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_audit_log_item_id ON public.audit_log(item_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_lost_item ON public.matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_found_item ON public.matches(found_item_id);
CREATE INDEX IF NOT EXISTS idx_items_storage_location ON public.items(storage_location);
CREATE INDEX IF NOT EXISTS idx_items_expiry_date ON public.items(expiry_date);