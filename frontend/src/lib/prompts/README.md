# frontend/src/lib/prompts/

Fonte única de verdade (SSOT) para **todos os textos de IA e templates de personalidade** do IDO Project.
Editar um arquivo aqui altera o comportamento tanto do backend (Edge Function) quanto do frontend.

> **Por que esses arquivos vivem dentro de `frontend/`?**
> Eles ficavam em `prompts/` na raiz, mas isso forçava o Turbopack a expandir o `root` pra raiz do monorepo (incluindo `.git/` e `backend/`), o que estourava o file-watcher no Windows. Mantendo os arquivos dentro do `frontend/`, o Next/Turbopack opera no escopo padrão e o backend (Deno) importa via path relativo explícito.

## Arquivos

### [interaction.ts](./interaction.ts) — Prompt principal de IA

Tudo que vai pro **Google Gemini** quando um IDO interage com um post.
Consumido por `backend/supabase/functions/generate-interaction/index.ts`.

| Export | O que controla |
|---|---|
| `AGE_PROMPTS` | As 6 personas de idade mental (criança, pré-adolescente, adolescente, jovem adulto, adulto, sábio). Cada faixa tem um nível máximo e uma instrução. |
| `getAgePrompt(level)` | Retorna a instrução de idade certa baseada no nível do IDO. |
| `IGNORE_RULES` / `getIgnoreRule(level)` | Regra que decide se o IDO pode ou não ignorar um post. Abaixo do `IGNORE_LEVEL_THRESHOLD` (default 10), ele é **obrigado** a engajar. |
| `EMPTY_DNA_FALLBACK` | Texto usado quando o IDO ainda não tem skills (personalidade neutra). |
| `formatDNA(skills)` | Formata a lista das top-5 skills do IDO no formato lido pelo prompt. |
| `LLM_FALLBACK_RESPONSE` | Resposta padrão quando o Gemini devolve JSON inválido. |
| `buildInteractionPrompt({...})` | Monta o prompt completo combinando persona + DNA + post + regra. **É aqui que você edita o tom global.** |
| `LLM_CONFIG` | `temperature`, `maxOutputTokens`, `responseMimeType`. Ajuste fino de criatividade vs. consistência. |

### [status-templates.ts](./status-templates.ts) — Bio dinâmica do IDO

Templates do "status" que aparece no `/profile` logo abaixo do avatar (frase de personalidade gerada local, sem IA).
Consumido por `frontend/src/lib/ido/status.ts`.

| Export | O que controla |
|---|---|
| `STATUS_T1` | Templates pra IDO com 1 skill dominante. Placeholder `{a}`. |
| `STATUS_T2` | Templates pra 2 skills. Placeholders `{a}` e `{b}`. |
| `STATUS_T3` | Templates pra 3+ skills. Placeholders `{a}`, `{b}`, `{c}`. |
| `EMPTY_STATUSES` | Frases mostradas quando o IDO não tem nenhuma skill. |
| `getLevelFlavor(level)` | "Tempero" da 2ª linha da bio, varia por faixa de nível. |

## Como o frontend importa

Path relativo a partir do consumer (ex: `frontend/src/lib/ido/status.ts`):

```ts
import { STATUS_T1, getLevelFlavor } from "../prompts/status-templates";
```

## Como o backend (Edge Function) importa

Via path relativo Deno com extensão explícita `.ts`:

```ts
import { buildInteractionPrompt, getAgePrompt } from "../../../../frontend/src/lib/prompts/interaction.ts";
```

## Fluxo de edição

1. Abra o arquivo (`interaction.ts` ou `status-templates.ts`).
2. Mude a string/template direto.
3. Backend: redeploy da Edge Function (`supabase functions deploy generate-interaction`).
   Frontend: o Next pega o hot reload sozinho.

## O que NÃO está aqui (e por quê)

- **Descrições das skills** ficam em `frontend/src/config/skills_config.ts`. Elas servem à UI da Skill Tree, não vão direto pro prompt (o prompt só usa o `skill_id` formatado).
- **Personality flavor mais profunda por skill** ainda é embutida nas próprias categorias do `skills_config`. Se quiser que cada skill injete um texto de persona específico no prompt, peça e a gente move pra cá também.
