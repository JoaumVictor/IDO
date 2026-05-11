// ============================================================================
// TEMPLATES DE STATUS — bio / "monólogo de personalidade" do IDO
// ----------------------------------------------------------------------------
// Usado por: frontend/src/lib/ido/status.ts
// Aparece em: página /profile (logo abaixo do avatar)
// Lógica: pega top-3 skills do IDO + nível, e preenche os placeholders {a/b/c}
// ============================================================================

/**
 * T1 — IDO com apenas 1 skill dominante.
 * Placeholder: {a} = nome da skill #1 (em lowercase).
 */
export const STATUS_T1: string[] = [
  "Em modo {a} desde sempre ✨",
  "Mood: bem {a} hoje",
  "{a} de carteirinha 🎯",
  "Sou tipo... {a}, e ponto",
  "Vivendo o lado {a} da vida",
  "Tô na vibe {a} 🌙",
];

/**
 * T2 — IDO com 2 skills dominantes.
 * Placeholders: {a} = #1, {b} = #2.
 */
export const STATUS_T2: string[] = [
  "Sou mais {a}, mas com um toque de {b}",
  "{a} de dia, {b} de noite 🌗",
  "Mistura ambulante de {a} e {b}",
  "{a} no coração, {b} na ponta da língua",
  "Mood: {a} com pitadas de {b} ✨",
  "Hoje tô {a}, ontem fui {b}, amanhã sei lá",
];

/**
 * T3 — IDO com 3+ skills dominantes.
 * Placeholders: {a} = #1, {b} = #2, {c} = #3.
 */
export const STATUS_T3: string[] = [
  "Sou {a}, {b} e às vezes bem {c}",
  "Vibe: {a}, {b} e {c} no mesmo balaio ✨",
  "Tô tipo {a}, mas também {b}, e olha que sou {c}",
  "{a} + {b} + {c} = eu 🌀",
  "Mood diário: {a} no fundo, {b} na superfície, {c} nos picos",
  "Sou um caos lindo de {a}, {b} e {c}",
];

/**
 * Status mostrado quando o IDO ainda não desenvolveu nenhuma skill.
 */
export const EMPTY_STATUSES: string[] = [
  "Acabei de chegar, ainda descobrindo quem sou ✨",
  "Página em branco esperando virar gente 📝",
  "Sem personalidade definida ainda — me molde 🌱",
];

/**
 * "Tempero" final por faixa de nível, anexado depois do status principal.
 * Quebra a linha — vira a 2ª linha da bio.
 */
export function getLevelFlavor(level: number): string {
  if (level <= 10) return "🍼 ainda tô descobrindo o mundo";
  if (level <= 20) return "📱 vivendo cada drama";
  if (level <= 30) return "🎧 fase rebelde ativa";
  if (level <= 40) return "☕ cansadinho mas firme";
  if (level <= 50) return "🌿 começando a me entender";
  return "🪐 já vi de tudo nessa vida";
}
