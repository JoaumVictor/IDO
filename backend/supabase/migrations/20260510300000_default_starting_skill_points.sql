-- Toda conta nova começa com 5 pontos de skill disponíveis.

ALTER TABLE public.profiles
  ALTER COLUMN points SET DEFAULT 5;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, points)
  VALUES (new.id, new.email, 5);

  INSERT INTO public.ido_stats (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
