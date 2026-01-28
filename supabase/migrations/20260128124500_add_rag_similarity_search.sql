-- 创建用于 RAG 语义匹配的 RPC 函数
create or replace function match_product_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  plan_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    product_knowledge.id,
    product_knowledge.plan_id,
    product_knowledge.content,
    product_knowledge.metadata,
    1 - (product_knowledge.embedding <=> query_embedding) as similarity
  from product_knowledge
  where 1 - (product_knowledge.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
