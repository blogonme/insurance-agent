-- 1. Extend customers table with new profile fields
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS id_card TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS referrer TEXT;

-- 2. Create customer relationships table
CREATE TABLE IF NOT EXISTS public.customer_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID DEFAULT get_current_tenant_id(),
    from_customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    to_customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL, -- 'spouse', 'child', 'parent', 'sibling', 'other'
    relationship_label TEXT, -- '夫妻', '母女', '父子' 等显示文本
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(from_customer_id, to_customer_id)
);

-- 3. Enable RLS
ALTER TABLE public.customer_relationships ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy
CREATE POLICY "Relationships tenant isolation" ON public.customer_relationships
FOR ALL USING (tenant_id = get_current_tenant_id());
