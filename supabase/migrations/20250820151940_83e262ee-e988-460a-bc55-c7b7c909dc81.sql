-- Security Fix 1: Remove user_email column as it's not needed and exposes sensitive data
-- The user_id is sufficient for tracking user ownership
ALTER TABLE public.livestreams DROP COLUMN user_email;

-- Security Fix 2: Update function with proper search path to prevent function hijacking
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;