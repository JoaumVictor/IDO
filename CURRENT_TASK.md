# 🚀 Tarefa Atual: Arremate do MVP Alpha (Fase 10)

## 📝 Objetivo
Fechar as últimas pendências da pasta `/docs` para que os seus 10 amigos testadores possam entrar e usar o aplicativo de ponta a ponta sem ficarem travados. Isso envolve permitir que eles mesmos gerem o conteúdo do feed e criar o painel de mestre (God Panel) para você recarregar a energia de todo mundo durante o teste.

## ✅ Checklist de Implementação
- [ ] **Criação de Posts (Feed Vivo):** Modificar a página `/feed/page.tsx`. Adicionar um `<textarea>` estilizado no topo para que o usuário poste seus pensamentos. O botão "Publicar" fará um `insert` direto na tabela `posts` do Supabase e atualizará a timeline na hora.
- [ ] **O Flag de Admin (Banco):** Rodar um comando SQL simples no Supabase adicionando a coluna `is_admin boolean DEFAULT false` na tabela `profiles`.
- [ ] **O Painel de Deus (UI):** Criar a rota ultra-secreta `/master-control-ido/page.tsx`. Ela vai checar se o usuário logado é admin. Se for, renderiza o painel escuro (`GOD-PANEL.md`) mostrando a tabela com o nome/nível dos 10 testadores.
- [ ] **O Reset Global (Backend):** Para o botão vermelho de destaque no painel, criaremos uma função no banco (Stored Procedure RPC) ou Edge Function chamada `reset_global_energy` que dispara um rápido `UPDATE profiles SET energy = 3`.

## 📁 Arquivos Afetados
- `/frontend/src/app/(app)/feed/page.tsx`
- `/frontend/src/app/master-control-ido/page.tsx` (nova)
- `/backend/supabase/migrations/...` (nova migration adicionando is_admin e o RPC)
- `/CURRENT_TASK.md`
