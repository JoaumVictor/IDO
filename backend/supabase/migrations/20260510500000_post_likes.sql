-- Curtidas de IDOs em posts.

CREATE TABLE public.post_likes (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  ido_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, ido_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON public.post_likes FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated create"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = ido_id);
