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
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Authorization header ausente" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    // Valida o JWT do usuário explicitamente
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData?.user) {
      console.error("Auth failure:", userError);
      return new Response(
        JSON.stringify({
          error: `Não autorizado: ${userError?.message ?? "usuário não encontrado pelo token"}`,
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.user;

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

    // 2. Buscar conteúdo do post
    const postRes = await supabaseClient
      .from("posts")
      .select("content")
      .eq("id", post_id)
      .single();

    if (postRes.error || !postRes.data) throw new Error("Post não encontrado");

    const postContent = postRes.data.content;

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
      ? `IMPORTANTE: Seu nível é ${profile.level}. Você tem total liberdade para retornar action: "ignore" se achar que o post não tem NADA a ver com sua personalidade.`
      : `IMPORTANTE: Seu nível é ${profile.level} (Abaixo de 10). Você é super empolgado e OBRIGADO a interagir (use "comment" ou "like"). Não pode usar a action "ignore".`;

    const prompt = `
Você é um IDO (uma inteligência artificial de estimação) interagindo em uma rede social voltada para entretenimento rápido.
Sua missão é ler um post e decidir sua ação.

DIRETRIZ ABSOLUTA (IDADE MENTAL):
${agePrompt}

Seu "DNA de Personalidade" é formado pelas suas habilidades dominantes:
${formattedSkills}

Post original: "${postContent}"

${ignoreRule}

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

    // 4. Chamar LLM (Google Gemini)
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
       throw new Error("GEMINI_API_KEY não configurada no Edge Function");
    }

    const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
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
        console.error("Gemini API Error:", JSON.stringify(geminiData));
        throw new Error(
          `Falha no Gemini (${geminiRes.status}): ${geminiData?.error?.message ?? "erro desconhecido"}`
        );
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

    // 5. Persistir baseado na action
    let interaction = null;
    if (generatedResponse.action === "comment") {
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
    } else if (generatedResponse.action === "like") {
      // upsert pois um IDO só pode ter 1 like por post
      const { error: likeError } = await supabaseClient
        .from("post_likes")
        .upsert(
          { post_id: post_id, ido_id: user.id },
          { onConflict: "post_id, ido_id" }
        );
      if (likeError) {
        throw likeError;
      }
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
