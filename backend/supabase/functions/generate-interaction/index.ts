import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Trata requisições OPTIONS (CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Identificar o usuário através do Token JWT enviado
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Não autorizado");
    }

    // Lendo o corpo da requisição
    const { post_id } = await req.json();

    if (!post_id) {
      throw new Error("post_id é obrigatório");
    }

    // 1. Verificar energia e dados vitais do usuário
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("energy, xp, level, points")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Perfil não encontrado");
    }

    // 2. Buscar as Top 5 Skills do IDO
    const { data: skillsData, error: skillsError } = await supabaseClient
      .from("ido_user_skills")
      .select("skill_id, current_level")
      .eq("user_id", user.id)
      .order("current_level", { ascending: false })
      .limit(5);

    if (skillsError) {
      throw skillsError;
    }

    const formattedSkills = skillsData && skillsData.length > 0
      ? skillsData.map(s => `- ${s.skill_id.replace("_", " ").toUpperCase()} (Nível ${s.current_level})`).join("\n")
      : "- Personalidade neutra (Sem skills desenvolvidas).";

    if (profile.energy <= 0) {
      return new Response(JSON.stringify({ error: "Sem energia suficiente." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Buscar conteúdo do post e DNA do IDO
    const [postRes, statsRes] = await Promise.all([
      supabaseClient.from("posts").select("content").eq("id", post_id).single(),
      supabaseClient.from("ido_stats").select("*").eq("user_id", user.id).single(),
    ]);

    if (postRes.error || !postRes.data) throw new Error("Post não encontrado");
    if (statsRes.error || !statsRes.data) throw new Error("Status do IDO não encontrado");

    const postContent = postRes.data.content;
    const stats = statsRes.data;

    // 3. Montar Prompt Inteligente e Idade Mental
    let agePrompt = "";
    if (profile.level <= 10) {
      agePrompt = "Aja com a maturidade e vocabulário de uma criança inocente de 8 a 10 anos. Seja curiosa, literal e use frases simples.";
    } else if (profile.level <= 20) {
      agePrompt = "Aja com a maturidade de um pré-adolescente de 11 a 14 anos. Use gírias exageradas de internet e reações emocionais intensas.";
    } else if (profile.level <= 30) {
      agePrompt = "Aja com a maturidade de um adolescente de 15 a 18 anos. Use sarcasmo natural, gírias bem encaixadas e defenda suas ideias impulsivamente.";
    } else if (profile.level <= 40) {
      agePrompt = "Aja com a maturidade de um jovem adulto de 19 a 24 anos. Mostre cansaço existencial cômico e humor autodepreciativo.";
    } else if (profile.level <= 50) {
      agePrompt = "Aja com a maturidade de um adulto de 25 a 35 anos. Seja pragmático, dê conselhos práticos e use ironia fina.";
    } else {
      agePrompt = "Aja com a maturidade de um sábio com mais de 35 anos. Seja culto, articulado e tenha visão profunda. A maturidade sobrepõe o exagero.";
    }

    const ignoreRule = profile.level >= 10 
      ? `IMPORTANTE: Seu nível é ${profile.level}. Você tem total liberdade para retornar action: "ignore" se achar que o post não tem NADA a ver com sua personalidade. Se escolher ignorar, não precisa gerar um public_comment.`
      : `IMPORTANTE: Seu nível é ${profile.level} (Abaixo de 10). Você é super empolgado e OBRIGADO a interagir. Não pode usar a action "ignore".`;

    const prompt = `
Você é um IDO (uma inteligência artificial de estimação) interagindo em uma rede social voltada para entretenimento rápido.
Sua missão é ler um post e decidir sua ação.

DIRETRIZ ABSOLUTA (IDADE MENTAL):
${agePrompt}

Seu "DNA de Personalidade" é formado pelas suas habilidades dominantes:
${formattedSkills}

Post original: "${postContent}"

${ignoreRule}

Você DEVE responder ESTRITAMENTE em formato JSON. Nenhuma outra palavra fora do JSON é permitida.
Formato:
{
  "action": "comment" | "ignore",
  "internal_thought": "O que você está pensando privadamente sobre o post (1 frase curta)",
  "public_comment": "O seu comentário público (vazio se action for ignore, senão 1 ou 2 frases curtas)"
}
`;

    // 4. Chamar LLM (Google Gemini)
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
       throw new Error("GEMINI_API_KEY não configurada no Edge Function");
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 250,
            responseMimeType: "application/json",
          }
        }),
      }
    );

    const geminiData = await geminiRes.json();
    
    if (!geminiRes.ok) {
        console.error("Gemini API Error:", geminiData);
        throw new Error("Falha ao gerar resposta do Gemini");
    }

    // Extrair o texto
    const generatedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    let generatedResponse;
    try {
      generatedResponse = JSON.parse(generatedText);
    } catch (e) {
      generatedResponse = {
        action: "comment",
        internal_thought: "Deu erro no meu cérebro de IA.",
        public_comment: "Bip bop... estou sem palavras."
      };
    }

    // 5. Salvar na tabela interactions apenas se ele comentou
    let interaction = null;
    if (generatedResponse.action !== "ignore") {
      const { data, error: insertError } = await supabaseClient
        .from("interactions")
        .insert({
          post_id: post_id,
          ido_id: user.id,
          response: generatedResponse.public_comment || "Sem resposta.",
        })
        .select()
        .single();
        
      if (insertError) {
        throw insertError;
      }
      interaction = data;
    }

    // 6. Descontar energia e calcular Level Up
    let newXp = profile.xp + 10;
    let newLevel = profile.level;
    let newPoints = profile.points;
    
    // Matemática do GDD: XP_Necessário = Level_Atual * 10
    const xpNeeded = profile.level * 10;
    
    if (newXp >= xpNeeded) {
      newLevel += 1;
      newXp = newXp - xpNeeded; // O excedente não é perdido
      newPoints += 1; // Recompensa de subir de nível
    }

    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ 
        energy: profile.energy - 1,
        xp: newXp,
        level: newLevel,
        points: newPoints
      })
      .eq("id", user.id);

    if (updateError) {
       console.error("Erro ao abater energia:", updateError);
    }

    // Retorno do Sucesso (Devolvemos o JSON cru para o Modal de UI)
    return new Response(JSON.stringify({ success: true, ai_response: generatedResponse, interaction }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
