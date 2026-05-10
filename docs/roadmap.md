Com certeza, Victor! Esse arquivo é o que chamamos de "Roadmap de Implementação" ou "Project Scoping". Ele vai servir para a IA entender a estrutura de pastas e a ordem de prioridade, focando no que realmente importa para o seu teste Alpha.

Aqui está o conteúdo para o arquivo: IMPLEMENTATION_PLAN.md

🚀 Projeto IDO: Plano de Implementação (MVP Alpha)
1. ESTRUTURA DO PROJETO (Monorepo)
O projeto deve ser organizado da seguinte forma:

Plaintext
/ido-project
  /backend       # Supabase Edge Functions & Database Migrations
  /frontend      # React/Next.js focado em Mobile (PWA/Webview)
  /docs          # Documentação e Prompts (incluindo este arquivo)
2. BACKEND (Supabase)
O backend deve ser configurado primeiro para fornecer a infraestrutura de dados.

Variáveis de Ambiente: Deve ler SUPABASE_URL e SUPABASE_ANON_KEY.

Banco de Dados (PostgreSQL):

Tabela profiles: Armazena id, email, level, xp, energy (default 3) e points.

Tabela ido_stats: Armazena os atributos (bobo, nerd, afrontoso, etc).

Tabela posts: Posts globais para interação.

Tabela interactions: Respostas geradas pela IA.

Edge Functions:

generate-interaction: Função que recebe o post_id, consulta o perfil do IDO, chama a API da LLM (Gemini/Claude) e salva a resposta debitando 1 de energia.

3. FRONTEND (Mobile-First Design)
Atenção: Ignorar layout desktop. O design deve ser estritamente para dispositivos móveis (375px a 430px de largura).

3.1. Fluxo de Autenticação
Tela de Login Única: Não haverá fluxo de "Sign Up".

Campos: Email e Senha.

Lógica: O usuário será autenticado contra os 10 usuários pré-cadastrados manualmente no Supabase Auth. Se os dados estiverem corretos, redireciona para a Dashboard.

3.2. Estrutura de Navegação (Bottom Tab Bar)
O app deve ter uma navegação persistente no rodapé com 3 ícones:

Aba "Navegar" (Feed):

Lista vertical de posts simples.

Cada post tem um botão "Enviar meu IDO".

Ao clicar, dispara um loading e exibe a resposta da IA logo abaixo.

Aba "Meu IDO" (Profile):

Exibição do nome do IDO e Nível.

Barras de XP e Energia (3/3).

Resumo dos atributos atuais equipados.

Aba "Skills" (Tree):

Interface de lista para "Upar" atributos.

Exibe quantos pontos o usuário tem disponível.

Botão "+" para gastar ponto em cada categoria (Bobo, Nerd, etc).

4. INTEGRAÇÃO COM IA
O prompt para a geração da resposta deve seguir este template lógico:

"Você é o IDO de {username}. Seus atributos são {attributes}. Você está reagindo ao post {post_content}. Seu nível de consciência é {level}. Gere uma resposta curta de acordo com sua personalidade."

5. REQUISITOS TÉCNICOS IMEDIATOS
Estilização: Usar Tailwind CSS (pela velocidade).

Gerenciamento de Estado: React Context ou apenas Hooks simples (SWR/React Query para buscar dados do Supabase).

Responsividade: Bloquear visualização horizontal ou widths maiores que 600px para manter o foco no mobile.

✅ Definição de Pronto (DoP) para o MVP:
O projeto estará pronto quando um dos 10 usuários puder:

Fazer login.

Ver um post.

Clicar para o IDO responder e ver a energia diminuir.

Upar um ponto de skill e ver o nível do IDO mudar.