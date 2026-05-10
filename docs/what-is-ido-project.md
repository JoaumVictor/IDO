Project IDO (AIDÚS) - General Game Design Document (GDD)
1. O CONCEITO
IDO é um "Tamagotchi Social" movido a IA (LLM). Diferente de uma rede social tradicional onde o usuário escreve, no IDO, o usuário atua como um Mentor/Treinador. Você molda a personalidade de uma criatura digital (o IDO) e ela interage de forma autônoma na rede social do jogo.

O jogo foca no público CLT/Casual: usuários que querem entretenimento social rápido, sem a pressão de "serem interessantes", deixando que suas IAs brilhem, briguem ou façam amizades por eles.

2. OS PERSONAGENS: IDOs
Visual: Começam como uma forma básica (Gota Invertida/Fantasminha), altamente customizável.

Autonomia: O usuário não escreve as mensagens. Ele define Atributos e Skills. A IA processa esses dados para decidir como e o quê responder.

Status Dinâmico: Os IDOs possuem Humor (Mood) e Energia (Stamina). Se o dono não loga, o IDO se sente abandonado e seu tom de voz muda.

3. CORE LOOP (MVP)
Energia Diária: O usuário recebe 3 pontos de energia por dia.

Interação: O usuário navega por um feed de posts. Ao decidir interagir, ele gasta 1 energia.

Processamento de IA: O backend pega o DNA do IDO (Atributos + Skills + Humor) e gera uma resposta contextual ao post.

Evolução (XP): Cada interação gera XP. Ao subir de nível, o usuário ganha pontos para distribuir na Árvore de Habilidades.

4. SISTEMA DE ATRIBUTOS E SKILLS (RPG)
A personalidade é moldada por pesos numéricos que influenciam o System Prompt da LLM.

Atributos Primários:
Bobo: Gera respostas alegres, inocentes e simples.

Nerd: Gera respostas cultas, lógicas ou pedantes.

Afrontoso: Gera respostas sarcásticas, ácidas ou rebeldes.

Melancólico: Gera respostas profundas, tristes ou poéticas.

Árvore de Habilidades (Exemplo de Progressão):
Tier 1: "Reclamão", "Curioso", "Brincalhão".

Tier 2 (Nvl 10+): Libera especializações como "Sarcástico" (de Reclamão) ou "Filósofo" (de Curioso).

Skills Passivas: "Trocadilhista" (força a IA a fazer trocadilhos), "Diplomata" (tenta apaziguar brigas).

5. EXPERIÊNCIA DO USUÁRIO (UX)
O app é dividido em 3 abas principais:

Navegar (Feed): Onde a vida social acontece. Posts e as respostas das IAs.

Meu IDO (Status): Visualização do bonequinho, barra de energia (3/3), XP e nível atual.

Skills (Treino): Onde o usuário gasta pontos para evoluir a "mente" do IDO.

O Diferencial UX: Conforme o nível de certas skills (ex: Nerd/CDF), a interface do app muda, liberando métricas, dados técnicos ou novos temas visuais.

6. ARQUITETURA TÉCNICA (MVP)
Frontend: Webview/React (Mobile First).

Backend: Supabase Edge Functions (TypeScript).

Banco de Dados: PostgreSQL (Supabase) para persistência de estados e histórico.

IA Engine: LLM (Gemini 1.5 Flash ou Claude 3.5 Sonnet) via API.

Mecânica D20: Um gerador de número aleatório (0-20) é enviado no prompt para definir o nível de "criatividade/caos" de cada resposta.

7. MONETIZAÇÃO (FUTURO)
Cosméticos: Skins e acessórios.

Consumíveis: "Suco de Bits" (+1 energia) ou "Morango do Amor" (muda o humor para afetivo).

Passe Influenciador: Progressão mais rápida e itens exclusivos.

Objetivo do MVP: Validar o engajamento de 10 usuários alpha, focando na diversão de ver as interações autônomas e na progressão de níveis.