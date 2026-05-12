-- Sistema de Eventos Diários e Personalidade Dinâmica
-- Cria as tabelas que dão "memória" ao IDO: o que ele aprendeu, o que gosta/detesta,
-- e o controle de "primeiro login do dia" pro Dice Roll.

-- ============================================================
-- 1. Controle de "primeiro login do dia" por usuário
-- ============================================================
CREATE TABLE public.ido_daily_events (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_rolled_at TIMESTAMP WITH TIME ZONE,
  last_event_type TEXT
);

ALTER TABLE public.ido_daily_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow user read own daily event"
  ON public.ido_daily_events FOR SELECT
  USING (auth.uid() = user_id);

-- Inserts/updates só via edge function (service role); RLS bloqueia client direto.


-- ============================================================
-- 2. Catálogo global de tópicos (knowledge / preferences)
-- ============================================================
CREATE TABLE public.topic_catalog (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}'
);

ALTER TABLE public.topic_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON public.topic_catalog FOR SELECT
  USING (true);

INSERT INTO public.topic_catalog (id, label, category, keywords) VALUES
  ('buracos_negros', 'buracos negros', 'astronomia', ARRAY['espaço', 'universo', 'buraco negro', 'astronomia', 'galáxia', 'gravidade', 'ciencia', 'ciência']),
  ('filmes_90s', 'filmes dos anos 90', 'cinema', ARRAY['filme', 'cinema', 'anos 90', '90s', 'tarantino', 'matrix', 'clássico']),
  ('memes_br', 'memes brasileiros clássicos', 'cultura', ARRAY['meme', 'kkkk', 'brasil', 'zoeira', 'tiktok', 'twitter', 'piada']),
  ('cafe', 'café especial', 'gastronomia', ARRAY['café', 'cafezinho', 'expresso', 'cafeteria', 'manhã', 'starbucks']),
  ('futebol', 'futebol brasileiro', 'esporte', ARRAY['futebol', 'gol', 'time', 'jogo', 'jogador', 'campeonato', 'flamengo', 'corinthians', 'palmeiras', 'são paulo']),
  ('filosofia', 'filosofia existencialista', 'filosofia', ARRAY['filosofia', 'sentido', 'vida', 'existência', 'sartre', 'camus', 'nietzsche']),
  ('musica_indie', 'música indie', 'música', ARRAY['música', 'musica', 'banda', 'show', 'indie', 'rock', 'spotify', 'playlist']),
  ('gatos', 'gatos e seus segredos', 'animais', ARRAY['gato', 'gata', 'pet', 'felino', 'miau', 'gatinho']),
  ('plantas', 'cuidar de plantas', 'natureza', ARRAY['planta', 'jardim', 'suculenta', 'verde', 'natureza', 'horta']),
  ('cripto', 'criptomoedas e blockchain', 'tecnologia', ARRAY['bitcoin', 'cripto', 'blockchain', 'nft', 'ethereum', 'investimento']),
  ('ia_generativa', 'IA generativa', 'tecnologia', ARRAY['ia', 'inteligência artificial', 'chatgpt', 'gpt', 'gemini', 'claude', 'llm', 'machine learning']),
  ('culinaria', 'culinária caseira', 'gastronomia', ARRAY['receita', 'comida', 'cozinhar', 'almoço', 'jantar', 'fogão', 'panela']),
  ('viagens', 'viagens improvisadas', 'lifestyle', ARRAY['viagem', 'viajar', 'mochilão', 'avião', 'praia', 'turismo']),
  ('games_retro', 'games retrô', 'games', ARRAY['game', 'jogo', 'nintendo', 'snes', 'playstation', 'retro', 'pixel', 'arcade']),
  ('moda_anos_2000', 'moda dos anos 2000', 'moda', ARRAY['moda', 'roupa', 'estilo', 'anos 2000', 'y2k', 'tendência']);


-- ============================================================
-- 3. Conhecimento adquirido pelo IDO (evento "Aprendi Coisa Nova")
-- ============================================================
CREATE TABLE public.ido_knowledge (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES public.topic_catalog(id) ON DELETE CASCADE,
  learned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

ALTER TABLE public.ido_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow user read own knowledge"
  ON public.ido_knowledge FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================================
-- 4. Gostos e desgostos do IDO (evento "Gosto / Detesto")
-- ============================================================
CREATE TABLE public.ido_preferences (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES public.topic_catalog(id) ON DELETE CASCADE,
  stance TEXT NOT NULL CHECK (stance IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

ALTER TABLE public.ido_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow user read own preferences"
  ON public.ido_preferences FOR SELECT
  USING (auth.uid() = user_id);
