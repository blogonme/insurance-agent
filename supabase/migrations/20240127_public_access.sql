-- Migration to enable public access for multi-tenant portal

-- 1. Allow anonymous users to discover tenant by slug
create policy "Allow public to discover tenant by slug" on public.tenants
  for select using (true);

-- 2. Allow anonymous users to view tenant profiles (for branding)
create policy "Allow public to view tenant profiles" on public.profiles
  for select using (true);

-- 3. Update RLS policies for business tables to allow public READ access
-- Insurance Plans
drop policy "Tenant isolation for plans" on public.insurance_plans;
create policy "Public read and tenant all access for plans" on public.insurance_plans
  for select using (is_public = true);
create policy "Tenant all access for plans" on public.insurance_plans
  for all using (tenant_id = get_current_tenant_id());

-- Cases
drop policy "Tenant isolation for cases" on public.cases;
create policy "Public read access for cases" on public.cases
  for select using (true);
create policy "Tenant all access for cases" on public.cases
  for all using (tenant_id = get_current_tenant_id());

-- Testimonials
drop policy "Tenant isolation for testimonials" on public.testimonials;
create policy "Public read access for testimonials" on public.testimonials
  for select using (is_public = true);
create policy "Tenant all access for testimonials" on public.testimonials
  for all using (tenant_id = get_current_tenant_id());

-- Knowledge Items
drop policy "Tenant isolation for knowledge items" on public.knowledge_items;
create policy "Public read access for knowledge items" on public.knowledge_items
  for select using (is_public = true);
create policy "Tenant all access for knowledge items" on public.knowledge_items
  for all using (tenant_id = get_current_tenant_id());

-- Assessment Questions
drop policy "Tenant isolation for assessment questions" on public.assessment_questions;
create policy "Public read access for assessment questions" on public.assessment_questions
  for select using (true);
create policy "Tenant all access for assessment questions" on public.assessment_questions
  for all using (tenant_id = get_current_tenant_id());

-- 4. Enable public write access for Inquiries (Customer submissions)
drop policy "Tenant isolation for inquiries" on public.inquiries;
create policy "Public can submit inquiries" on public.inquiries
  for insert with check (true);
create policy "Tenant all access for inquiries" on public.inquiries
  for all using (tenant_id = get_current_tenant_id());
