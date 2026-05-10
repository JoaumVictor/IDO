# 🚀 Tarefa Atual: A Grande Árvore de Skills (Fase 9)

## 📝 Objetivo
Substituir o nosso modelo inicial de apenas 4 atributos por um sistema completo e escalável de 52 Skills (Tier 1 a 5). Vamos criar um motor de dicionário de dados (JSON), refatorar a estrutura do banco para escalar infinitamente, e adaptar a inteligência artificial para ler dinamicamente apenas as "Skills mais fortes" do usuário.

## ✅ Checklist de Implementação
- [ ] **O Dicionário de Skills (Configuração):** Criar o arquivo `frontend/src/config/skills_config.ts` (ou JSON) contendo o array com os 52 nós. Cada nó terá `id`, `name`, `tier`, `description`, e os arrays de `requirements` (ex: precisa do player_level 31 e da skill 'caotico' nvl 10).
- [ ] **Evolução do Banco de Dados:** Migrar de colunas fixas (`bobo`, `nerd`...) para um formato escalável. Vamos criar uma tabela relacional `ido_user_skills (user_id, skill_id, current_level)` ou adicionar uma coluna `JSONB` na tabela de stats para guardar os nós desbloqueados.
- [ ] **Refatoração da IA (Edge Function):** O script `generate-interaction` não deve mais ler "4 colunas". Ele deve fazer um fetch das skills do IDO, ordenar pelo nível mais alto e injetar dinamicamente as **Top 5 Skills** no Prompt ("O DNA do seu IDO é formado por: Absurdista Nvl 5, Troll Nvl 2...").
- [ ] **O Canvas da Skill Tree (UI):** Refatorar completamente a página `/skills/page.tsx` para não ser mais uma lista vertical, e sim ler a nossa nova configuração e renderizar nós interativos que bloqueiam/desbloqueiam baseados na matemática de pré-requisitos.

## 📁 Arquivos Afetados
- `/frontend/src/config/skills_config.ts` (novo)
- `/backend/supabase/migrations/...` (nova migration de banco)
- `/backend/supabase/functions/generate-interaction/index.ts`
- `/frontend/src/app/(app)/skills/page.tsx`
- `/CURRENT_TASK.md`
