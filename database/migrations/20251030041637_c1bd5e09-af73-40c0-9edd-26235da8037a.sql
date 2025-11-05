-- Update claims table to support public submissions (no auth required)
ALTER TABLE public.claims
ALTER COLUMN claimant_id DROP NOT NULL;

-- Add email field for public claims
ALTER TABLE public.claims
ADD COLUMN IF NOT EXISTS email text;

-- Update RLS policies for claims to allow public inserts
DROP POLICY IF EXISTS "Users can create claims" ON public.claims;

CREATE POLICY "Anyone can create claims"
ON public.claims
FOR INSERT
WITH CHECK (true);

-- Staff can view all claims
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