-- Migration to fix missing slugs for new tenants

-- 1. Update the handle_new_user function to generate a default slug
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  new_tenant_id uuid;
  generated_slug text;
begin
  -- Generate a slug from metadata or use a random one
  -- We prioritize the phone number if available, otherwise use a substring of the ID
  generated_slug := coalesce(
    new.phone, 
    'agent-' || substr(new.id::text, 1, 8)
  );

  -- 1. Create a new Tenant for the user with a slug
  insert into public.tenants (name, slug)
  values ('New Broker Team', generated_slug)
  on conflict (slug) do update set slug = generated_slug || '-' || substr(gen_random_uuid()::text, 1, 4)
  returning id into new_tenant_id;

  -- 2. Create a Profile linked to the new Tenant
  insert into public.profiles (id, tenant_id, full_name, role)
  values (
    new.id, 
    new_tenant_id, 
    coalesce(new.raw_user_meta_data->>'full_name', '新经纪人'), 
    'admin'
  );

  return new;
end;
$$;

-- 2. Backfill slugs for existing tenants that have null slugs
update public.tenants
set slug = 'agent-' || substr(id::text, 1, 8)
where slug is null;
