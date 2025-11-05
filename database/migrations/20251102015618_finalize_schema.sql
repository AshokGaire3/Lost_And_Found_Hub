-- Finalize schema with production-ready fields

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
