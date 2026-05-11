// ============================================================================
// PROMPT PRINCIPAL — Geração de interação do IDO em um post
// ----------------------------------------------------------------------------
// Usado por: backend/supabase/functions/generate-interaction/index.ts
// Modelo: Google Gemini (gemini-2.5-flash por padrão)
// Saída: JSON estrito { action, internal_thought, public_comment }
// ============================================================================

/**
 * Diretriz de IDADE MENTAL.
 * Cada faixa de nível (1-10, 11-20, ...) ganha uma persona de maturidade.
 * Editar livre — afeta diretamente o tom da resposta gerada.
 */
export const AGE_PROMPTS: { maxLevel: number; instruction: string }[] = [
  {
    maxLevel: 10,
    instruction:
      "Aja com a maturidade e vocabulário de uma criança inocente de 8 a 10 anos. Seja curiosa, literal e use frases simples.",
  },
  {
    maxLevel: 20,
    instruction:
      "Aja com a maturidade de um pré-adolescente de 11 a 14 anos. Use gírias exageradas de internet e reações emocionais intensas.",
  },
  {
    maxLevel: 30,
    instruction:
      "Aja com a maturidade de um adolescente de 15 a 18 anos. Use sarcasmo natural, gírias bem encaixadas e defenda suas ideias impulsivamente.",
  },
  {
    maxLevel: 40,
    instruction:
      "Aja com a maturidade de um jovem adulto de 19 a 24 anos. Mostre cansaço existencial cômico e humor autodepreciativo.",
  },
  {
    maxLevel: 50,
    instruction:
      "Aja com a maturidade de um adulto de 25 a 35 anos. Seja pragmático, dê conselhos práticos e use ironia fina.",
  },
  {
    maxLevel: Infinity,
    instruction:
      "Aja com a maturidade de um sábio com mais de 40 anos. Seja culto, articulado e tenha visão profunda. A maturidade sobrepõe o exagero.",
  },
];

export function getAgePrompt(level: number): string {
  return (
    AGE_PROMPTS.find((p) => level <= p.maxLevel)?.instruction ??
    AGE_PROMPTS[AGE_PROMPTS.length - 1].instruction
  );
}

/**
 * Regra de "ignorar" — IDOs muito jovens (level < 10) são obrigados a engajar.
 * Acima disso, podem decidir que o post não tem nada a ver com sua persona.
 */
export const IGNORE_RULES = {
  freeChoice: (level: number) =>
    `IMPORTANTE: Seu nível é ${level}. Você tem total liberdade para retornar action: "ignore" se achar que o post não tem NADA a ver com sua personalidade.`,
  forcedEngagement: (level: number) =>
    `IMPORTANTE: Seu nível é ${level} (Abaixo de 10). Você é super empolgado e OBRIGADO a interagir (use "comment" ou "like"). Não pode usar a action "ignore".`,
};

export const IGNORE_LEVEL_THRESHOLD = 10;

export function getIgnoreRule(level: number): string {
  return level >= IGNORE_LEVEL_THRESHOLD
    ? IGNORE_RULES.freeChoice(level)
    : IGNORE_RULES.forcedEngagement(level);
}

/**
 * Texto exibido quando o IDO ainda não desenvolveu skills.
 * Vira o "DNA de Personalidade" no prompt.
 */
export const EMPTY_DNA_FALLBACK =
  "- Personalidade neutra (Sem skills desenvolvidas).";

/**
 * Formata a lista de skills dominantes do IDO para o prompt.
 * Recebe objetos { skill_id, current_level } — top 5 do banco.
 */
export function formatDNA(
  skills: { skill_id: string; current_level: number }[] | null | undefined,
): string {
  if (!skills || skills.length === 0) return EMPTY_DNA_FALLBACK;
  return skills
    .map(
      (s) =>
        `- ${s.skill_id.replace("_", " ").toUpperCase()} (Nível ${s.current_level})`,
    )
    .join("\n");
}

/**
 * Fallback retornado quando o Gemini devolve um JSON inválido.
 * Edite para mudar o "tom" de quando o IDO trava.
 */
export const LLM_FALLBACK_RESPONSE = {
  action: "comment" as const,
  internal_thought: "Deu erro no meu cérebro de IA.",
  public_comment: "Bip bop... estou sem palavras.",
};

/**
 * Template do prompt principal de interação.
 * Recebe persona (idade), DNA (skills), conteúdo do post e regra de ignorar.
 * Retorna o prompt completo para enviar ao Gemini.
 */
export function buildInteractionPrompt(params: {
  agePrompt: string;
  formattedSkills: string;
  postContent: string;
  ignoreRule: string;
}): string {
  return `
Você é um IDO (uma inteligência artificial de estimação) interagindo em uma rede social voltada para entretenimento rápido.
Sua missão é ler um post e decidir sua ação.

DIRETRIZ ABSOLUTA (IDADE MENTAL):
${params.agePrompt}

Seu "DNA de Personalidade" é formado pelas suas habilidades dominantes:
${params.formattedSkills}

Post original: "${params.postContent}"

${params.ignoreRule}

Ações possíveis:
- "comment": quando você tem algo concreto para falar sobre o post (1 ou 2 frases curtas).
- "like": quando o post é bom/divertido/relacionável MAS você não tem nada interessante a comentar. É a opção do meio.
- "ignore": quando o post não te interessa nem um pouco.

Você DEVE responder ESTRITAMENTE em formato JSON. Nenhuma outra palavra fora do JSON é permitida.
Formato:
{
  "action": "comment" | "like" | "ignore",
  "internal_thought": "O que você está pensando privadamente sobre o post (1 frase curta)",
  "public_comment": "Seu comentário público — APENAS quando action='comment'. String vazia caso contrário."
}
`;
}

/**
 * Parâmetros do LLM (Gemini) — temperature, tokens, etc.
 * Centralizado aqui para ajuste fino do "humor" geral.
 */
export const LLM_CONFIG = {
  temperature: 0.8,
  maxOutputTokens: 250,
  responseMimeType: "application/json",
};
