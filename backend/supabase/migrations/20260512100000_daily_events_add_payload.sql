-- Adiciona coluna payload à tabela de eventos diários
-- para que o payload gerado possa ser recuperado em chamadas posteriores
-- (ex: quando o admin força um evento antes do usuário abrir o app).

ALTER TABLE public.ido_daily_events
  ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT NULL;
