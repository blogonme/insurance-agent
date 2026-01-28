-- Add new columns to assessment_questions table
ALTER TABLE public.assessment_questions 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '其他',
ADD COLUMN IF NOT EXISTS input_type TEXT DEFAULT 'single_choice',
ADD COLUMN IF NOT EXISTS placeholder TEXT DEFAULT '';

-- Clear old questions for the demo tenant to avoid confusion with new schema
-- In a real scenario, we might want to keep them, but here we want to preset the specific 5 phases
DELETE FROM public.assessment_questions WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Phase 1: 家庭基础画像
INSERT INTO public.assessment_questions (tenant_id, category, question, input_type, options, "order")
VALUES 
('00000000-0000-0000-0000-000000000001', '家庭基础画像', '您的姓名', 'text', '[]'::jsonb, 1),
('00000000-0000-0000-0000-000000000001', '家庭基础画像', '您的性别', 'single_choice', '["男", "女"]'::jsonb, 2),
('00000000-0000-0000-0000-000000000001', '家庭基础画像', '您的出生年月', 'date', '[]'::jsonb, 3),
('00000000-0000-0000-0000-000000000001', '家庭基础画像', '您的职业/工种', 'text', '[]'::jsonb, 4),
('00000000-0000-0000-0000-000000000001', '家庭基础画像', '抽烟习惯', 'single_choice', '["从不", "已戒", "经常抽"]'::jsonb, 5),
('00000000-0000-0000-0000-000000000001', '家庭基础画像', '家庭结构（婚姻状况）', 'single_choice', '["未婚", "已婚", "离异/丧偶"]'::jsonb, 6);

-- Phase 2: 财务压力测试
INSERT INTO public.assessment_questions (tenant_id, category, question, input_type, options, "order")
VALUES 
('00000000-0000-0000-0000-000000000001', '财务压力测试', '家庭年收入 (万元)', 'number', '[]'::jsonb, 7),
('00000000-0000-0000-0000-000000000001', '财务压力测试', '家庭年支出 (万元)', 'number', '[]'::jsonb, 8),
('00000000-0000-0000-0000-000000000001', '财务压力测试', '房贷总额 (万元)', 'number', '[]'::jsonb, 9),
('00000000-0000-0000-0000-000000000001', '财务压力测试', '其他债务 (万元)', 'number', '[]'::jsonb, 10),
('00000000-0000-0000-0000-000000000001', '财务压力测试', '流动资产 (万元)', 'number', '[]'::jsonb, 11);

-- Phase 3: 健康状况确认
INSERT INTO public.assessment_questions (tenant_id, category, question, input_type, options, "order")
VALUES 
('00000000-0000-0000-0000-000000000001', '健康状况确认', '过去两年内是否住院、手术或长期服药？', 'single_choice', '["否", "是"]'::jsonb, 12),
('00000000-0000-0000-0000-000000000001', '健康状况确认', '近一年体检是否有异常项（如结节、三高、囊肿等）？', 'single_choice', '["否", "是"]'::jsonb, 13),
('00000000-0000-0000-0000-000000000001', '健康状况确认', '您的医保类型', 'single_choice', '["城镇职工医保", "城乡居民医保/新农合", "无"]'::jsonb, 14);

-- Phase 4: 现有保障盘点
INSERT INTO public.assessment_questions (tenant_id, category, question, input_type, options, "order")
VALUES 
('00000000-0000-0000-0000-000000000001', '现有保障盘点', '已购商业保险（多选）', 'multiple_choice', '["重疾险", "百万医疗险", "意外险", "定期寿险", "年金/分红险", "暂无"]'::jsonb, 15);

-- Phase 5: 核心诉求与预算
INSERT INTO public.assessment_questions (tenant_id, category, question, input_type, options, "order")
VALUES 
('00000000-0000-0000-0000-000000000001', '核心诉求与预算', '您目前最担忧的风险是（多选）', 'multiple_choice', '["突发重大疾病带来的高额医疗费", "长期患病导致无法工作，失去收入来源", "意外身故后，房贷及家人生活无人负担", "养老资金储备不足，生活质量下降", "孩子未来的教育规划"]'::jsonb, 16),
('00000000-0000-0000-0000-000000000001', '核心诉求与预算', '您预期的年保费投入 (元/年)', 'number', '[]'::jsonb, 17);
