-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- 1. Create Tenants Table
create table public.tenants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique,
  subscription_plan text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  tenant_id uuid references public.tenants on delete cascade,
  full_name text,
  avatar_url text,
  role text default 'admin', -- admin, agent, viewer
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Business Tables

-- Insurance Plans
create table public.insurance_plans (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  title text not null,
  company text,
  type text,
  highlight text,
  benefit text,
  description text,
  is_public boolean default true,
  is_latest boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cases
create table public.cases (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  title text not null,
  tag text,
  image text,
  description text,
  is_archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inquiries/Assessments
create table public.inquiries (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  customer_name text,
  phone text,
  subject text,
  status text default 'pending', -- pending, contacted, closed
  assessment_data jsonb, -- Stores the JSON result from assessment
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Testimonials
create table public.testimonials (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  name text not null,
  role text,
  content text not null,
  tag text,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Knowledge Items / Articles
create table public.knowledge_items (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  title text not null,
  category text,
  desc_content text, -- 'desc' is keyword? using desc_content
  icon_name text, -- Store icon name string (e.g. 'Zap')
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Assessment Questions
create table public.assessment_questions (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants on delete cascade not null,
  question text not null,
  type text not null, -- 'single' | 'multiple'
  options jsonb default '[]'::jsonb, -- Store options as JSON array
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.insurance_plans enable row level security;
alter table public.cases enable row level security;
alter table public.inquiries enable row level security;
alter table public.testimonials enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.assessment_questions enable row level security;

-- 5. RLS Policies

-- Helper function to get current user's tenant_id
create or replace function get_current_tenant_id()
returns uuid
language sql
security definer
stable
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

-- Tenants: Users can view their own tenant
create policy "Users can view their own tenant" on public.tenants
  for select using (id = get_current_tenant_id());

-- Profiles: Users can view profiles in their tenant
create policy "Users can view profiles in their tenant" on public.profiles
  for select using (tenant_id = get_current_tenant_id());

create policy "Users can update their own profile" on public.profiles
  for update using (id = auth.uid());

-- Plans: Users can view/edit plans in their tenant
create policy "Tenant isolation for plans" on public.insurance_plans
  for all using (tenant_id = get_current_tenant_id());

-- Cases: Users can view/edit cases in their tenant
create policy "Tenant isolation for cases" on public.cases
  for all using (tenant_id = get_current_tenant_id());

-- Inquiries: Users can view/edit inquiries in their tenant
create policy "Tenant isolation for inquiries" on public.inquiries
  for all using (tenant_id = get_current_tenant_id());

-- Testimonials: Users can view/edit testimonials in their tenant
create policy "Tenant isolation for testimonials" on public.testimonials
  for all using (tenant_id = get_current_tenant_id());

-- Knowledge Items: Users can view/edit knowledge items in their tenant
create policy "Tenant isolation for knowledge items" on public.knowledge_items
  for all using (tenant_id = get_current_tenant_id());

-- Assessment Questions: Users can view/edit assessment questions in their tenant
create policy "Tenant isolation for assessment questions" on public.assessment_questions
  for all using (tenant_id = get_current_tenant_id());


-- 6. Triggers for New User Signup
-- Automatically create a Tenant and Profile when a new user signs up via Supabase Auth

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  new_tenant_id uuid;
begin
  -- 1. Create a new Tenant for the user
  insert into public.tenants (name)
  values ('New Broker Team')
  returning id into new_tenant_id;

  -- 2. Create a Profile linked to the new Tenant
  insert into public.profiles (id, tenant_id, full_name, role)
  values (new.id, new_tenant_id, new.raw_user_meta_data->>'full_name', 'admin');

  return new;
end;
$$;

-- Trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Storage Bucket Setup (This usually needs API calls, but we can try SQL here for some parts or handle via UI/CLI)
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "Tenant isolation for storage objects" on storage.objects
for all using (
    bucket_id = 'images' 
    and (storage.foldername(name))[1] = get_current_tenant_id()::text
);
