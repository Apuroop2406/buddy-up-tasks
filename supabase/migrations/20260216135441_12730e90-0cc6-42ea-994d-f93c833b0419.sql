
-- Create a function to check for duplicate proof hashes across all users (bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_duplicate_proof_hash(p_hash text, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tasks
    WHERE proof_hash = p_hash
      AND user_id != p_user_id
  );
END;
$$;
