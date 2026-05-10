Boa, Victor! Toda rede social, por menor que seja, precisa de um "Painel de Controle" ou um "God Mode". Como você está usando o Supabase, isso fica bem fácil de implementar, já que o próprio dashboard do Supabase resolve 90% da gestão de dados, mas ter uma interface dentro do seu app pra ações rápidas (tipo o reset de energia) é essencial pra agilidade do teste Alpha. 🛠️👑

Aqui está o arquivo ADMIN_DASHBOARD.md para você adicionar à sua pasta docs:

👑 IDO Admin Dashboard: Painel de Controle (God Mode)
1. ACESSO E SEGURANÇA
Rota: /master-control-ido (Uma URL ofuscada para evitar acessos curiosos).

Autenticação: Apenas usuários com a flag is_admin: true na tabela profiles podem visualizar o conteúdo desta página.

Segurança: Implementar RLS (Row Level Security) no Supabase para que apenas o admin consiga disparar as funções de "Reset Geral".

2. FUNCIONALIDADES DO PAINEL (MVP)
2.1. Gestão de Energia (O "Botão de Deus") ⚡
Um botão de destaque no topo do painel: "RESETAR ENERGIA GLOBAL".

Ação: Chama uma Edge Function que dá um UPDATE profiles SET energy = 3.

Uso: Útil para quando você quiser que seus 10 amigos testem mais interações sem esperar o dia seguinte.

2.2. Visualização de Usuários (The Alpha Feed) 👥
Uma tabela simples listando os 10 usuários:

Colunas: Nome do Usuário, Nome do IDO, Nível, XP Total, Energia Atual e Último Login.

Ações Rápidas: - Botão "Ver Perfil" (link para o perfil do IDO).

Botão "Resetar Senha" (Gera um link de recuperação via Supabase Auth).

Campo de input para "Adicionar Pontos de Skill" manualmente (para recompensar algum amigo que achou um bug, por exemplo).

2.3. Monitoramento de IA (Log de Interações) 🤖
Uma lista em tempo real (Realtime do Supabase) das últimas interações geradas.

Por que? Para você monitorar se as IAs estão seguindo o prompt corretamente ou se estão falando "abobrinha" demais sem supervisão.

3. INTERFACE (UI ADMIN)
A interface de admin deve ser minimalista e funcional (estilo Dashboard de sistema):

Cores: Tons de cinza escuro e botões de ação em cores fortes (Vermelho para Danger Zone, Verde para Resets).

Componente: Usar uma tabela simples do Tailwind com filtros básicos.

4. REGRAS DE NEGÓCIO PARA ADMIN
Reset Individual: Além do global, o admin pode resetar a energia de um único IDO específico.

Alteração de Atributos: Admin pode "forçar" uma mudança de atributo (ex: transformar um IDO Bobo em Afrontoso instantaneamente) para testar o comportamento do prompt sem precisar upar níveis.

Banimento/Suspensão: Botão para desativar a conta caso algum amigo passe dos limites nas postagens.

✅ Checklist da Aba Admin:
[ ] Criar coluna is_admin (booleano) na tabela profiles.

[ ] Criar rota protegida no frontend que verifica se o usuário logado é admin.

[ ] Implementar a Edge Function global-energy-reset.

[ ] Criar a tabela de listagem de usuários com o map do React.