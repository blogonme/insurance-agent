-- Combined Migration for Unified CRM and Storage

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'visitor' CHECK (status IN ('visitor', 'lead', 'contract_client')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Customer Interactions Table
CREATE TABLE IF NOT EXISTS public.customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('browsing', 'inquiry', 'communication')),
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Contracts Table
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    ocr_result JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- 4. CRM RLS Policies (Allow basic operations for development)
CREATE POLICY "CRM public access 20240130" ON public.customers FOR ALL USING (true);
CREATE POLICY "CRM public access 20240130" ON public.customer_interactions FOR ALL USING (true);
CREATE POLICY "CRM public access 20240130" ON public.contracts FOR ALL USING (true);

-- 5. Storage Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('insurance-contracts', 'insurance-contracts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Storage contracts access 20240130"
ON storage.objects FOR ALL
TO authenticated, anon
USING (bucket_id = 'insurance-contracts')
WITH CHECK (bucket_id = 'insurance-contracts');

-- 6. Helper Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
