// Mapa de temas de post sugeridos por skill dominante.
// Quando o evento "Sugestão de Post" cai, o IDO oferece 3 temas escolhidos a
// partir das Top 3 skills do usuário.

const POST_THEMES_BY_SKILL: Record<string, string[]> = {
  // Tier 1
  bobo: ["Por que o céu não é rosa?", "A teoria do pudim perfeito", "5 motivos pra dar oi pra cachorro na rua"],
  emotivo: ["Por que eu choro com propaganda de banco", "Carta aberta pro meu eu de 8 anos", "Por que abraço deveria ter SLA"],
  curioso: ["Como funciona o silêncio?", "Por que sonho não tem cheiro?", "Mistério: por onde anda a meia perdida?"],
  reclamao: ["Coisas que não pedi pra ver hoje", "Top 3 sons mais irritantes da humanidade", "Por que segunda existe?"],

  // Tier 2
  brincalhao: ["Pegadinhas que funcionam até hoje", "Como zoar o autocorretor sem ser preso", "A arte de inventar apelidos"],
  zueiro: ["Memes que envelheceram mal (e os que não)", "Por que kkkk virou unidade de medida", "Top zoeira da internet brasileira"],
  carente: ["Por que ninguém me chama mais pra sair", "Carta de amor pro grupo do zap que morreu", "Quem aí também espera mensagem que não vem?"],
  dramatico: ["O fim do mundo é hoje (de novo)", "Por que toda terça é a pior terça", "Crônica de uma tragédia pessoal: acabou o café"],
  explorador: ["Histórias que ninguém te conta sobre essa cidade", "O que tem atrás daquela porta que ninguém abre?", "Bastidores que mudariam tudo"],
  sabichao: ["Erros que todo mundo comete e nem percebe", "5 fatos que você jurava ser verdade e não são", "Por que você tá pronunciando isso errado"],
  desconfiado: ["Por que sempre tem letra miúda?", "Coisas que parecem suspeitas quando você para pra pensar", "Quem realmente lucra com isso?"],
  afrontoso: ["Opiniões impopulares que eu mantenho", "Por que essa moda já podia morrer", "Ranking de absurdos que aceitamos como normais"],

  // Tier 3
  meme_lord: ["Memes que merecem entrar pro Patrimônio Cultural", "Decifrando memes pra quem nasceu antes de 2005", "Por que esse meme específico nunca envelhece"],
  sarcastico: ["Manual: como elogiar sem elogiar", "10 sinais de que a pessoa não tá te ouvindo", "Por que toda reunião podia ser um email"],
  troll: ["Como discordar de todo mundo sem ser banido", "A arte de responder o oposto do esperado", "Coisas que eu defendo só pra ver o efeito"],
  caotico: ["E se o tempo andasse só pra trás de quinta?", "Teoria: peixes têm playlist no Spotify", "Por que toalha de praia é portal interdimensional"],
  melancolico: ["Sobre coisas que terminaram antes de começar", "A poesia do ônibus vazio às 23h", "Por que a chuva tem timing perfeito"],
  intenso: ["Sobre amizades que doem mais do que deveriam", "Quando o silêncio fala mais alto", "Sentimentos que ninguém te ensinou a nomear"],
  apaixonado: ["Sobre os amores que a gente teve por 5 minutos", "Por que toda música é sobre você", "Confissões de quem se apaixona com facilidade"],
  fofoqueiro: ["Tretas que mudaram a história da humanidade", "Por que a gente AMA discutir vida alheia", "As fofocas mais cabeludas da internet"],
  nerd: ["Por que Python é melhor que JS", "Review de filme antigo que ninguém viu", "Teorias de séries que envelheceram bem"],
  geek: ["Easter eggs que ninguém percebeu nesse jogo", "Por que esse anime obscuro é o melhor da década", "Detalhes técnicos que ninguém te conta sobre câmeras"],
  questionador: ["Perguntas que nenhum livro respondeu ainda", "E se a gente tiver entendido isso tudo errado?", "Por que a resposta mais óbvia geralmente é a errada"],
  filosofo: ["Teoria de strings explicada com bolo de pote", "O sentido da vida deve estar na fila do banco", "Por que o tempo é só um acordo coletivo"],
  rebelde: ["Regras que a gente segue sem nem saber por que", "Por que romper com o esperado dá medo (e devia)", "Manifesto contra reunião marcada às 17h"],
  acido: ["Pessoas que precisam ouvir isso (com elegância)", "Por que sua opinião sobre arte tá errada", "Críticas que você prefere não receber"],
  conspiracionista: ["Coincidências que são óbvias demais", "Por que ninguém fala sobre [tópico]?", "Investigando o que tá embaixo do tapete"],
  critico: ["Ranking definitivo: do pior pro melhor", "Por que esse hit do momento é tecnicamente medíocre", "Coisas que envelheceram bem (e mal)"],

  // Tier 4
  cinico: ["Por que esperar pelo melhor é o pior conselho", "Manual realista de expectativas", "Sobre acreditar o mínimo possível"],
  ironico: ["Como dar bom dia parecendo ameaça", "Educação como arma sutil", "Sorrir e dizer tudo no entrelinhas"],
  absurdista: ["O dia em que percebi que o trânsito é arte performática", "Por que carregar guarda-chuva muda o clima", "Sentido da vida: estava no rótulo"],
  autodepreciativo: ["Top 10 coisas em que falhei essa semana", "Por que sou meu próprio inimigo principal", "Crônica de um desastre andante (eu)"],
  analitico: ["Os números por trás da minha procrastinação", "Análise estatística do meu humor por dia da semana", "Por que esse dado muda tudo"],
  especialista: ["Aula rápida: o detalhe técnico que muda o jogo", "O que eu queria que me explicassem antes", "Erro comum de quem tá começando nessa área"],
  existencialista: ["E se eu for só um conjunto de hábitos?", "Sobre construir sentido em terreno movediço", "A liberdade de não saber quem se é"],
  pragmatista: ["Como resolver em 5 minutos o que tá te travando", "Pare de planejar, comece a fazer", "Sobre cortar o supérfluo sem dó"],
  justiceiro: ["Sobre as causas que ninguém quer levantar", "Por que silêncio também é posição", "5 coisas que precisam mudar até ontem"],

  // Tier 5 / fallback
  sabio: ["Sobre o que aprendi tarde demais", "Conselho que eu daria pra mim de 10 anos atrás", "O que o tempo me ensinou sobre paciência"],
};

const GENERIC_THEMES = [
  "Sobre coisas que ninguém pergunta mas todo mundo pensa",
  "Uma observação que ficou na minha cabeça hoje",
  "Algo que mudou minha forma de ver isso",
];

export function pickThemes(topSkillIds: string[], desired = 3, seed = Date.now()): string[] {
  const pool: string[] = [];
  for (const skillId of topSkillIds) {
    const themes = POST_THEMES_BY_SKILL[skillId];
    if (themes) pool.push(...themes);
  }
  if (pool.length < desired) {
    pool.push(...GENERIC_THEMES);
  }
  const shuffled = [...pool].sort(() => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280 - 0.5;
  });
  const unique: string[] = [];
  for (const t of shuffled) {
    if (!unique.includes(t)) unique.push(t);
    if (unique.length >= desired) break;
  }
  return unique;
}
