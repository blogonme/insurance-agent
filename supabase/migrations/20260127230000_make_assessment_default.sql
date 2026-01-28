-- Remove NOT NULL constraint from tenant_id in assessment_questions
ALTER TABLE public.assessment_questions ALTER COLUMN tenant_id DROP NOT NULL;

-- Update existing questions for the demo tenant to be global (NULL tenant_id)
UPDATE public.assessment_questions 
SET tenant_id = NULL 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
