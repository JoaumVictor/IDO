# frontend/src/lib/prompts/

Fonte única de verdade (SSOT) para **todos os textos de IA e templates de personalidade** do IDO Project.
Editar um arquivo aqui altera o comportamento tanto do backend (Edge Function) quanto do frontend.

> **Por que esses arquivos vivem dentro de `frontend/`?**
> Eles ficavam em `prompts/` na raiz, mas isso forçava o Turbopack a expandir o `root` pra raiz do monorepo (incluindo `.git/` e `backend/`), o que estourava o file-watcher no Windows. Mantendo dentro do `frontend/`, o Next/Turbopack opera no escopo padrão e o backend (Deno) importa via path relativo explícito.

> **Por que cada arquivo é uma "ilha" sem imports cruzados?**
> O backend (Deno) importa cada um separadamente. Se um arquivo importasse outro, o Deno exigiria `.ts` na extensão e o Next/TS reclamaria. Solução: zero imports internos entre os arquivos desta pasta. Tipos como `SkillCategory` e `ToneSample` são re-declarados em cada arquivo que precisa.

## Arquivos

### [interaction.ts](./interaction.ts) — Builder do prompt principal

Tudo que vai pro **Google Gemini** quando um IDO interage com um post.
Consumido por `backend/supabase/functions/generate-interaction/index.ts`.

| Export | O que controla |
|---|---|
| `AGE_PROMPTS` / `getAgePrompt(level)` | As 6 personas de idade mental (criança → sábio). |
| `IGNORE_RULES` / `getIgnoreRule(level)` | Regra que decide se o IDO pode ignorar um post. Abaixo de `IGNORE_LEVEL_THRESHOLD` (10) é obrigado a engajar. |
| `EMPTY_DNA_FALLBACK` / `formatDNA(skills)` | Texto da personalidade quando o IDO ainda não tem skills, e o formatador das top-5 skills. |
| `VOICE_GUIDELINES` | Bloco fixo, sempre injetado: "fuja do óbvio, opinião forte, vibe rede social, reaja não comente, curto, nunca explique a piada". |
| `POST_ANALYSIS_HINT` | Pede pro Gemini classificar o post (CLICHÊ / SOFISTICAÇÃO / LAMENTO / EXIBIÇÃO / VALIDAÇÃO / INFO) ANTES de responder. Atitude muda por classificação. |
| `LLM_FALLBACK_RESPONSE` | Resposta quando o Gemini devolve JSON inválido. |
| `LLM_CONFIG` | `temperature: 0.95`, `maxOutputTokens: 350`. Ajuste fino criatividade vs consistência. |
| `buildInteractionPrompt({...})` | **Monta o prompt completo.** Recebe age + skills + post + ignore rule + skill attitude + samples filtrados. |

### [personality-samples.ts](./personality-samples.ts) — Banco de samples de tom

Array `PERSONALITY_SAMPLES: ToneSample[]`. **Você alimenta isso aos poucos** — 1 linha por dia com um comentário real que curtiu.

```ts
{
  topics: ["segunda", "domingo a noite", "trabalho amanha"], // gatilhos
  category: "humor",                                          // vibe geral
  level_range: [21, 35],                                      // só serve a IDOs nessa faixa
  context: "post lamentando que segunda chegou",              // descrição do post original
  sample: "domingo de noite tem aquela energia de novela mexicana...", // o COMENTÁRIO em si
  skill_hint: "sarcastico"                                    // (opcional) skill que dá boost
}
```

Quando passar de ~500 entries, migra pra tabela Supabase com full-text search.

### [sample-finder.ts](./sample-finder.ts) — Seletor por palavra-chave

`findRelevantSamples({...})` recebe o post + nível + categoria dominante e devolve os top-3 samples mais relevantes.

Lógica simples:
1. Tokeniza o post (lowercase, sem acento, sem stopword PT-BR).
2. Score por overlap com `topics[]` de cada sample.
3. **+2** se a categoria do sample bate com a categoria dominante do IDO.
4. **+1** se o nível do IDO está dentro do `level_range`. **-1** se fora.
5. **+1.5** se `skill_hint` está nas skills do IDO.
6. Filtra `score > 0`, ordena, devolve top-N (default 3).

Quando pegar >500 samples ou o recall ficar ruim, trocamos por embeddings.

### [skill-meta.ts](./skill-meta.ts) — Categoria + atitude de cada skill

`SKILL_META: Record<string, { category, attitude }>` mapeia cada `skill_id` (≈40 skills do `skills_config.ts`) pra:
- **categoria** (humor / emotion / logic / critic / wisdom)
- **atitude** — frase imperativa que vira instrução de tom no prompt (ex: "Você é Sarcástico. Ironia afiada, opinião forte, sem medo de cutucar quem postou.")

Funções:
- `getSkillAttitude(skillId)` — lookup da atitude pra injetar no prompt.
- `getDominantCategory(topSkills)` — devolve a categoria mais "pesada" das top-5 skills do IDO (peso = `current_level`).

> **⚠️ Quando criar skill nova no `skills_config.ts`, espelha aqui.** Não tem import automático.

### [status-templates.ts](./status-templates.ts) — Bio dinâmica do IDO

Templates do "status" exibido no `/profile` (frase de personalidade gerada localmente, sem IA).
Consumido por `frontend/src/lib/ido/status.ts`.

| Export | O que controla |
|---|---|
| `STATUS_T1` / `STATUS_T2` / `STATUS_T3` | Templates por número de skills dominantes (1, 2, 3+). |
| `EMPTY_STATUSES` | Frases pra IDO sem skills. |
| `getLevelFlavor(level)` | "Tempero" da 2ª linha, varia por faixa de nível. |

## Fluxo do prompt completo

```
[Edge Function] generate-interaction/index.ts
   ↓
   ├─ formatDNA(skills)              → DNA de personalidade
   ├─ getAgePrompt(level)            → idade mental
   ├─ getIgnoreRule(level)           → pode ignorar?
   ├─ getDominantCategory(skills)    → categoria pesada
   ├─ getSkillAttitude(topSkillId)   → atitude da skill #1
   ├─ findRelevantSamples({...})     → top 3 samples por palavra-chave
   ↓
   buildInteractionPrompt({...})     → prompt final pro Gemini
   ↓
   Gemini Flash devolve JSON estrito { action, internal_thought, public_comment }
```

## Como o backend (Edge Function) importa

Cada arquivo separado, com extensão `.ts` explícita (Deno exige):

```ts
import { buildInteractionPrompt, ... } from "../../../../frontend/src/lib/prompts/interaction.ts";
import { findRelevantSamples }         from "../../../../frontend/src/lib/prompts/sample-finder.ts";
import { PERSONALITY_SAMPLES }         from "../../../../frontend/src/lib/prompts/personality-samples.ts";
import { getDominantCategory, getSkillAttitude } from "../../../../frontend/src/lib/prompts/skill-meta.ts";
```

## Como o frontend importa

Path relativo a partir do consumer (ex: `frontend/src/lib/ido/status.ts`):

```ts
import { STATUS_T1, getLevelFlavor } from "../prompts/status-templates";
```

## Fluxo de edição

1. Quer mudar o **tom geral** → edita `interaction.ts` (`VOICE_GUIDELINES`, `POST_ANALYSIS_HINT`, ou `buildInteractionPrompt`).
2. Quer adicionar **um sample** → cola uma entrada nova em `personality-samples.ts`.
3. Quer mudar a **atitude de uma skill** → edita `skill-meta.ts`.
4. Quer mudar a **bio do IDO no perfil** → edita `status-templates.ts`.
5. Backend: `supabase functions deploy generate-interaction` pra subir.
   Frontend: hot reload pega sozinho.

## O que NÃO está aqui

- **Descrições das skills** ficam em `frontend/src/config/skills_config.ts`. Servem à UI da Skill Tree, não vão direto pro prompt.
- **Embeddings / vector search** — overkill enquanto o sample bank for pequeno. Migramos quando passar de ~500 samples ou o recall do keyword match ficar ruim.
