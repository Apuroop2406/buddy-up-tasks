-- Add proof_hash column to detect duplicate image uploads across accounts
ALTER TABLE public.tasks ADD COLUMN proof_hash text;

-- Create index for fast duplicate lookups
CREATE INDEX idx_tasks_proof_hash ON public.tasks (proof_hash) WHERE proof_hash IS NOT NULL;
