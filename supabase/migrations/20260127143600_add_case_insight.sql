-- Add expert_insight column to cases table
alter table public.cases add column if not exists expert_insight text;

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';
