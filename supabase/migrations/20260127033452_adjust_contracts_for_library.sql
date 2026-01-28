-- Adjust contracts table for library support
ALTER TABLE public.contracts 
ALTER COLUMN customer_id DROP NOT NULL;

ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS contract_name TEXT;

-- Update RLS for broader access in library
DROP POLICY IF EXISTS "CRM public access 20240130" ON public.contracts;
CREATE POLICY "CRM public access 20240130" ON public.contracts FOR ALL USING (true);
