-- Set default values for tenant_id based on get_current_tenant_id()
-- This ensures that even if the client misses the ID, the row will still be assigned to the correct tenant.

ALTER TABLE public.customers ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
ALTER TABLE public.customer_interactions ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
ALTER TABLE public.contracts ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
ALTER TABLE public.insurance_plans ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
ALTER TABLE public.cases ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
ALTER TABLE public.inquiries ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
ALTER TABLE public.testimonials ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
ALTER TABLE public.knowledge_items ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
ALTER TABLE public.assessment_questions ALTER COLUMN tenant_id SET DEFAULT get_current_tenant_id();
