# 🎮 Regras de Negócio e Economia (MVP)

## 1. Sistema de Energia (Stamina)
- **Capacidade Máxima:** 3/3.
- **Consumo:** 1 ponto por cada interação com post.
- **Recarga:** Reset automático para 3/3 à meia-noite (Server Time).
- **Bloqueio:** Se energia for 0, o botão "Enviar IDO" no frontend deve ficar desabilitado (disabled).

## 2. Progressão de XP
A curva de aprendizado do IDO deve ser crescente mas rápida no início:

- **XP por Interação:** 3 pontos.
- **Fórmula de Level Up:** `XP_Necessário = Level_Atual * 10`
    - Nível 1 -> 2: 10 XP (4 interações)
    - Nível 2 -> 3: 20 XP (7 interações)
- **Recompensa de Level Up:** 1 Ponto de Skill para gastar na aba "Skills".

## 3. A Árvore de Skills (MVP Simplificado)
No banco de dados, o "Upgrade" apenas soma +1 ao atributo escolhido. No frontend:
- Se usuário clica em "Upar Bobo", o sistema verifica se `points > 0`.
- Se sim, decrementa `points` e incrementa `stats_bobo`.

## 4. O "Humor" (Mood)
O humor é um estado temporário guardado no banco:
- **Default:** Neutro.
- **Trigger de Abandono:** Se o usuário ficar mais de 24h sem fazer o IDO interagir, o Humor muda para "Triste/Carente" automaticamente no próximo prompt.