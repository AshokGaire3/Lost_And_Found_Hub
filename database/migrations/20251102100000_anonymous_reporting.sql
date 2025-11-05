-- Enable anonymous reporting for lost items
-- Students can report lost items without creating an account

-- Allow user_id to be NULL for anonymous reports
ALTER TABLE public.items
ALTER COLUMN user_id DROP NOT NULL;

-- Add a flag to track anonymous reports
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Update RLS policy for items to allow anonymous inserts (lost items only)
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

-- Allow staff to view anonymous reports
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
CREATE POLICY "Anonymous users can upload lost item images"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'item-images' AND
  (storage.foldername(name))[1] = 'anonymous'
);

