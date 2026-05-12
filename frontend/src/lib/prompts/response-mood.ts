// ============================================================================
// RESPONSE MOOD — sortea o FORMATO da resposta antes da chamada do Gemini
// ----------------------------------------------------------------------------
// Por quê?
//   Sem isso, toda resposta sai como "1-2 frases bem trabalhadas" — vira
//   monotema. Pessoa real responde de jeitos MUITO diferentes:
//     - às vezes só "kkkk"
//     - às vezes só um emoji
//     - às vezes só curte e segue
//     - às vezes 5-10 palavras
//     - às vezes uma frase normal
//     - raramente algo elaborado
//
// O backend rola um dado por chamada e injeta a instruction no prompt.
// Quando sorteia "just_like" o backend pula a LLM e registra like direto.
//
// Pesos calibrados pra sentir natural — ajuste se ficar desbalanceado:
//   just_like  15%  → pula LLM, fica só o like (sem texto)
//   micro      25%  → 1-3 palavras ou 1 emoji
//   curto      30%  → 1 frase de 5-12 palavras
//   normal     25%  → 1-2 frases, 10-25 palavras
//   expansivo   5%  → 2 frases elaboradas, 25-40 palavras
// ============================================================================

export type ResponseMood = "just_like" | "micro" | "curto" | "normal" | "expansivo";

export type MoodChoice = {
  mood: ResponseMood;
  instruction: string;
};

type MoodEntry = {
  mood: ResponseMood;
  weight: number;
  instruction: string;
};

const MOODS: MoodEntry[] = [
  {
    mood: "just_like",
    weight: 15,
    // Não vai pro prompt — backend pula direto pro registro de like.
    instruction: "",
  },
  {
    mood: "micro",
    weight: 25,
    instruction: `FORMATO DA RESPOSTA: MICRO (sorteado pra essa interação).
- public_comment DEVE ter de 1 a 3 palavras OU ser apenas 1 emoji.
- Reação visceral, sem frase formada, sem vírgula.
- Pode ser uma onomatopeia, gíria solta, exclamação, ou pergunta seca de 1 palavra.
- Exemplos do formato (NÃO COPIE — só calibração):
  "kkkkkkk" / "queroooo" / "👀" / "manooo" / "vish" / "mds" / "?" / "🤡"
  / "AAAA" / "rezei" / "literal" / "tô fora" / "🔥🔥" / "que loucura" / "?????"
- NUNCA escreva frase completa neste mood.`,
  },
  {
    mood: "curto",
    weight: 30,
    instruction: `FORMATO DA RESPOSTA: CURTO (sorteado pra essa interação).
- public_comment DEVE ter UMA frase de 5 a 12 palavras.
- Pode terminar com no máximo 1 emoji.
- Direto ao ponto, sem rodeio, sem explicação.
- Exemplos do formato (NÃO COPIE — só calibração):
  "tipo CS então?" / "manda o link aí" / "tem na epic?" / "vou pesquisar isso"
  / "deita logo nessa cama" / "que isso amigo kkk" / "preciso testar urgente"
  / "concordo demais com isso" / "essa eu não sabia mano"
- NUNCA passe de 12 palavras neste mood.`,
  },
  {
    mood: "normal",
    weight: 25,
    instruction: `FORMATO DA RESPOSTA: NORMAL (sorteado pra essa interação).
- public_comment com 1 a 2 frases, totalizando 10 a 25 palavras.
- Tom padrão de comentário descontraído de rede social.
- Pode ter um ângulo, uma piada, uma observação — mas nada filosófico.`,
  },
  {
    mood: "expansivo",
    weight: 5,
    instruction: `FORMATO DA RESPOSTA: EXPANSIVO (sorteado pra essa interação — raro).
- public_comment com 2 frases mais elaboradas, totalizando 25 a 40 palavras.
- Use a chance pra trazer um ângulo único, ou uma observação que ninguém mais traria.
- NUNCA passe de 40 palavras, mesmo que pareça que cabe mais.`,
  },
];

/**
 * Sorteia um mood baseado nos pesos. Math.random() é suficiente pro caso de uso —
 * não precisa de RNG criptográfico. Seed determinística não faz sentido aqui
 * (queremos imprevisibilidade real entre chamadas).
 */
export function pickResponseMood(): MoodChoice {
  const totalWeight = MOODS.reduce((sum, m) => sum + m.weight, 0);
  const roll = Math.random() * totalWeight;
  let acc = 0;
  for (const m of MOODS) {
    acc += m.weight;
    if (roll <= acc) {
      return { mood: m.mood, instruction: m.instruction };
    }
  }
  // Fallback determinístico (não deveria ser alcançado se pesos somam > 0)
  return { mood: "normal", instruction: MOODS[3].instruction };
}
