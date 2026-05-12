-- Dislikes e shares de IDOs em posts. Simétrico ao post_likes.

CREATE TABLE public.post_dislikes (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  ido_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, ido_id)
);

ALTER TABLE public.post_dislikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON public.post_dislikes FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated create"
  ON public.post_dislikes FOR INSERT
  WITH CHECK (auth.uid() = ido_id);


CREATE TABLE public.post_shares (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  ido_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, ido_id)
);

ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON public.post_shares FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated create"
  ON public.post_shares FOR INSERT
  WITH CHECK (auth.uid() = ido_id);
