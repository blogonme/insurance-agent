-- Fix customer_interactions type check constraint to include 'manual_log'

-- 1. Drop the existing constraint
ALTER TABLE public.customer_interactions DROP CONSTRAINT IF EXISTS customer_interactions_type_check;

-- 2. Add the updated constraint including 'manual_log'
ALTER TABLE public.customer_interactions ADD CONSTRAINT customer_interactions_type_check 
CHECK (type IN ('browsing', 'inquiry', 'communication', 'manual_log'));

-- 3. Also ensure customers status constraint is up to date (visitor, lead, prospect, contract_client)
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_status_check;
ALTER TABLE public.customers ADD CONSTRAINT customers_status_check 
CHECK (status IN ('visitor', 'lead', 'prospect', 'contract_client'));
