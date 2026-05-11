-- Adiciona a flag de admin no perfil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- RPC: reset global de energia (apenas admins podem executar)
CREATE OR REPLACE FUNCTION public.reset_global_energy()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_admin BOOLEAN;
  affected INT;
BEGIN
  SELECT is_admin INTO caller_is_admin
  FROM public.profiles
  WHERE id = auth.uid();

  IF NOT COALESCE(caller_is_admin, false) THEN
    RAISE EXCEPTION 'forbidden: only admins can reset global energy';
  END IF;

  UPDATE public.profiles SET energy = 3;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_global_energy() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_global_energy() TO authenticated;
