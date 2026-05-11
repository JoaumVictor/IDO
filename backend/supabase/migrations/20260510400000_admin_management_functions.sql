-- Helpers e RPCs para o painel master-control-ido gerenciar contas.

CREATE OR REPLACE FUNCTION public.is_caller_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_caller_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_caller_admin() TO authenticated;

-- Atualiza level/xp/energy/points de qualquer perfil (apenas admin).
CREATE OR REPLACE FUNCTION public.admin_update_profile(
  target_user_id UUID,
  new_level INT DEFAULT NULL,
  new_xp INT DEFAULT NULL,
  new_energy INT DEFAULT NULL,
  new_points INT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_caller_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  UPDATE public.profiles
  SET
    level  = COALESCE(new_level,  level),
    xp     = COALESCE(new_xp,     xp),
    energy = COALESCE(new_energy, energy),
    points = COALESCE(new_points, points)
  WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_profile(UUID, INT, INT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_profile(UUID, INT, INT, INT, INT) TO authenticated;

-- Promove/rebaixa admin.
CREATE OR REPLACE FUNCTION public.admin_set_admin(
  target_user_id UUID,
  value BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_caller_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  UPDATE public.profiles SET is_admin = value WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_admin(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_admin(UUID, BOOLEAN) TO authenticated;

-- Zera todas as skills do usuário. Se refund_points=true devolve a soma como pontos.
CREATE OR REPLACE FUNCTION public.admin_reset_user_skills(
  target_user_id UUID,
  refund_points BOOLEAN DEFAULT true
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_levels INT;
BEGIN
  IF NOT public.is_caller_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  SELECT COALESCE(SUM(current_level), 0) INTO total_levels
  FROM public.ido_user_skills
  WHERE user_id = target_user_id;

  DELETE FROM public.ido_user_skills WHERE user_id = target_user_id;

  IF refund_points THEN
    UPDATE public.profiles
    SET points = points + total_levels
    WHERE id = target_user_id;
  END IF;

  RETURN total_levels;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_reset_user_skills(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_reset_user_skills(UUID, BOOLEAN) TO authenticated;

-- Apaga conta inteira (perfil + cascade nas demais tabelas; auth.users mantém-se).
CREATE OR REPLACE FUNCTION public.admin_delete_profile(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_caller_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_profile(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_profile(UUID) TO authenticated;
