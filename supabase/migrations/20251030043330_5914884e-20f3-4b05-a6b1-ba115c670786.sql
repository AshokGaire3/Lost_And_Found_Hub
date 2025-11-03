-- Add storage tracking fields to items table
ALTER TABLE public.items 
ADD COLUMN storage_location TEXT,
ADD COLUMN storage_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN expiry_date DATE;

-- Create audit_log table for tracking changes
CREATE TABLE public.audit_log (
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
CREATE TABLE public.matches (
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

-- Create trigger for matches updated_at
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_audit_log_item_id ON public.audit_log(item_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_lost_item ON public.matches(lost_item_id);
CREATE INDEX idx_matches_found_item ON public.matches(found_item_id);
CREATE INDEX idx_items_storage_location ON public.items(storage_location);
CREATE INDEX idx_items_expiry_date ON public.items(expiry_date);