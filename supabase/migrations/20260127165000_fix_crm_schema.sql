-- Fix CRM Schema by adding tenant_id and adjusting status constraints

-- 1. Add tenant_id if not exists
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.customer_interactions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 2. Adjust status check constraint for customers
-- First drop existing constraint if it exists (we know it's there from previous migration)
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_status_check;
ALTER TABLE public.customers ADD CONSTRAINT customers_status_check CHECK (status IN ('visitor', 'lead', 'prospect', 'contract_client'));

-- 3. Update RLS Policies to use tenant_id for isolation (if get_current_tenant_id is available)
-- Drop existing public access policies and add tenant-isolated ones
DROP POLICY IF EXISTS "CRM public access 20240130" ON public.customers;
DROP POLICY IF EXISTS "CRM public access 20240130" ON public.customer_interactions;
DROP POLICY IF EXISTS "CRM public access 20240130" ON public.contracts;

CREATE POLICY "Tenant isolation for customers" ON public.customers FOR ALL USING (tenant_id = get_current_tenant_id());
CREATE POLICY "Tenant isolation for interactions" ON public.customer_interactions FOR ALL USING (tenant_id = get_current_tenant_id());
CREATE POLICY "Tenant isolation for contracts" ON public.contracts FOR ALL USING (tenant_id = get_current_tenant_id());

-- 4. Initial update: set tenant_id for existing records (optional, but good for local dev)
-- Assuming the first tenant is the default for orphan records
DO $$
DECLARE
    default_tenant_id UUID;
BEGIN
    SELECT id INTO default_tenant_id FROM public.tenants LIMIT 1;
    IF default_tenant_id IS NOT NULL THEN
        UPDATE public.customers SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
        UPDATE public.customer_interactions SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
        UPDATE public.contracts SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
    END IF;
END $$;
