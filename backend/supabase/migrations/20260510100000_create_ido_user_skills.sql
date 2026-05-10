-- Cria a nova tabela relacional para suportar infinitas skills (Fase 9)
CREATE TABLE public.ido_user_skills (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL,
    current_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, skill_id)
);

-- Habilitar RLS
ALTER TABLE public.ido_user_skills ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários podem ver as skills de qualquer um" 
    ON public.ido_user_skills FOR SELECT 
    USING (true);

CREATE POLICY "Usuários podem inserir e atualizar suas próprias skills" 
    ON public.ido_user_skills FOR ALL 
    USING (auth.uid() = user_id);

-- Opcional: Você pode rodar isso se quiser apagar a estrutura velha
-- DROP TABLE IF EXISTS public.ido_stats;
