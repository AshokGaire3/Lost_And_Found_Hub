-- Add new columns to items table for better tracking
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS color text,
ADD COLUMN IF NOT EXISTS venue text,
ADD COLUMN IF NOT EXISTS container text,
ADD COLUMN IF NOT EXISTS identifying_details text;

-- Update items table RLS policies to allow public viewing of found items
DROP POLICY IF EXISTS "Anyone can view active items" ON public.items;

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
CREATE POLICY "Users can view claims by reference number"
ON public.claims
FOR SELECT
USING (true);

COMMENT ON COLUMN public.items.color IS 'Color of the item for easier identification';
COMMENT ON COLUMN public.items.venue IS 'Specific building or area where item was found (e.g., SU, Library, etc.)';
COMMENT ON COLUMN public.items.container IS 'Storage container or location where item is kept';
COMMENT ON COLUMN public.items.identifying_details IS 'Specific details that can help verify ownership';