-- 启用 pgvector 扩展用于向量检索
create extension if not exists vector;

-- 为保险方案表增加条款链接和原始文本字段
alter table public.insurance_plans 
add column if not exists terms_url text,
add column if not exists raw_content text;

-- 创建产品知识分块表
create table if not exists public.product_knowledge (
  id uuid default gen_random_uuid() primary key,
  plan_id uuid references public.insurance_plans(id) on delete cascade,
  content text not null, -- 文本分块内容
  embedding vector(1536), -- 向量数据 (适配 OpenAI Embedding 维度)
  metadata jsonb default '{}'::jsonb, -- 存储页码、章节等额外信息
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 开启 RLS
alter table public.product_knowledge enable row level security;

-- RLS 策略：租户只能访问自己的产品知识
create policy "Tenant isolation for product knowledge" on public.product_knowledge
  for all using (
    exists (
      select 1 from public.insurance_plans
      where id = public.product_knowledge.plan_id
      and tenant_id = get_current_tenant_id()
    )
  );

-- 创建向量索引以加速检索 (使用 HNSW 索引)
create index on public.product_knowledge using hnsw (embedding vector_cosine_ops);
