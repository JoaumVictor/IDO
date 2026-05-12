import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import {
  buildInteractionPrompt,
  formatDNA,
  getAgePrompt,
  getIgnoreRule,
  LLM_CONFIG,
} from "../_shared/prompts/interaction.ts";
import { findRelevantSamples } from "../_shared/prompts/sample-finder.ts";
import { PERSONALITY_SAMPLES } from "../_shared/prompts/personality-samples.ts";
import {
  getDominantCategory,
  getSkillAttitude,
} from "../_shared/prompts/skill-meta.ts";
import { pickResponseMood } from "../_shared/prompts/response-mood.ts";
import {
  findMatchingTopics,
  TOPIC_BY_ID,
} from "../_shared/daily-events/topic-catalog.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      },
    );

    // Valida o JWT do usuário explicitamente
    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser(token);

    if (userError || !userData?.user) {
      console.error("Auth failure:", userError);
      return new Response(
        JSON.stringify({
          error: `Não autorizado: ${userError?.message ?? "usuário não encontrado pelo token"}`,
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
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

    const formattedSkills = formatDNA(skillsData);

    if (profile.energy <= 0) {
      return new Response(
        JSON.stringify({ error: "Sem energia suficiente." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 2. Buscar conteúdo do post
    const postRes = await supabaseClient
      .from("posts")
      .select("content")
      .eq("id", post_id)
      .single();

    if (postRes.error || !postRes.data) throw new Error("Post não encontrado");

    const postContent = postRes.data.content;

    // 3. Montar Prompt Inteligente: idade mental + atitude da skill + few-shot
    const agePrompt = getAgePrompt(profile.level);
    const ignoreRule = getIgnoreRule(profile.level);

    const dominantCategory = getDominantCategory(skillsData);
    const topSkillId = skillsData?.[0]?.skill_id;
    const skillAttitude = topSkillId ? getSkillAttitude(topSkillId) : null;

    // 3.1. Camada dinâmica: conhecimento adquirido + gostos/desgostos do IDO
    const [{ data: knowledgeRows }, { data: preferenceRows }] =
      await Promise.all([
        supabaseClient
          .from("ido_knowledge")
          .select("topic_id")
          .eq("user_id", user.id),
        supabaseClient
          .from("ido_preferences")
          .select("topic_id, stance")
          .eq("user_id", user.id),
      ]);

    const knownTopicIds = (knowledgeRows ?? []).map(
      (r: { topic_id: string }) => r.topic_id,
    );
    const preferenceMap = new Map<string, "like" | "dislike">(
      (preferenceRows ?? []).map(
        (r: { topic_id: string; stance: "like" | "dislike" }) => [
          r.topic_id,
          r.stance,
        ],
      ),
    );

    const matchedKnowledge = findMatchingTopics(postContent, knownTopicIds).map(
      (t) => t.label,
    );
    const matchedPreferences = findMatchingTopics(
      postContent,
      Array.from(preferenceMap.keys()),
    )
      .map((t) => {
        const stance = preferenceMap.get(t.id);
        return stance ? { topic: t.label, stance } : null;
      })
      .filter((x): x is { topic: string; stance: "like" | "dislike" } =>
        Boolean(x),
      );

    // Keeps TOPIC_BY_ID warm for any future direct lookup; silences lint on Deno.
    void TOPIC_BY_ID;

    // 4. Sortear formato da resposta (MICRO / CURTO / NORMAL / EXPANSIVO / JUST_LIKE)
    const moodChoice = pickResponseMood();

    let generatedResponse: {
      action: "comment" | "like" | "dislike" | "share" | "ignore";
      internal_thought: string;
      public_comment: string;
    };

    if (moodChoice.mood === "just_like") {
      // Pula LLM — IDO só curte e segue, igual scroll de feed real.
      generatedResponse = {
        action: "like",
        internal_thought: "scrollei, curti, segui em frente",
        public_comment: "",
      };
    } else if (moodChoice.mood === "just_dislike") {
      // Pula LLM — IDO discordou em silêncio.
      generatedResponse = {
        action: "dislike",
        internal_thought: "não rolou, segui o jogo",
        public_comment: "",
      };
    } else if (moodChoice.mood === "just_share") {
      // Pula LLM — IDO achou bom o suficiente pra repassar.
      generatedResponse = {
        action: "share",
        internal_thought: "achei tão bom que mereceu compartilhar",
        public_comment: "",
      };
    } else {
      // 5. Montar prompt completo: idade + skill attitude + DNA + samples + mood
      const samples = findRelevantSamples({
        postContent,
        idoLevel: profile.level,
        dominantCategory,
        idoSkillIds: skillsData?.map((s) => s.skill_id),
        samples: PERSONALITY_SAMPLES,
        limit: 3,
      });

      const prompt = buildInteractionPrompt({
        agePrompt,
        formattedSkills,
        postContent,
        ignoreRule,
        skillAttitude,
        samples,
        responseMoodInstruction: moodChoice.instruction,
        knowledgeBonus: matchedKnowledge,
        preferenceBonus: matchedPreferences,
      });

      // 6. Chamar LLM (Google Gemini)
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
            generationConfig: LLM_CONFIG,
          }),
        },
      );

      const geminiData = await geminiRes.json();

      if (!geminiRes.ok) {
        console.error("Gemini API Error:", JSON.stringify(geminiData));
        throw new Error(
          `Falha no Gemini (${geminiRes.status}): ${geminiData?.error?.message ?? "erro desconhecido"}`,
        );
      }

      const rawText =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!rawText) {
        console.error("Gemini retornou resposta vazia:", JSON.stringify(geminiData));
        throw new Error("Gemini retornou resposta vazia");
      }

      // Gemini às vezes envolve o JSON em ```json ... ``` — limpa antes de parsear.
      const cleanedText = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      try {
        generatedResponse = JSON.parse(cleanedText);
      } catch (_e) {
        console.error("JSON inválido do Gemini:", cleanedText);
        throw new Error("Gemini devolveu JSON inválido");
      }
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
          { onConflict: "post_id, ido_id" },
        );
      if (likeError) {
        throw likeError;
      }
    } else if (generatedResponse.action === "dislike") {
      const { error: dislikeError } = await supabaseClient
        .from("post_dislikes")
        .upsert(
          { post_id: post_id, ido_id: user.id },
          { onConflict: "post_id, ido_id" },
        );
      if (dislikeError) {
        throw dislikeError;
      }
    } else if (generatedResponse.action === "share") {
      const { error: shareError } = await supabaseClient
        .from("post_shares")
        .upsert(
          { post_id: post_id, ido_id: user.id },
          { onConflict: "post_id, ido_id" },
        );
      if (shareError) {
        throw shareError;
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
        points: newPoints,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Erro ao abater energia:", updateError);
    }

    // Retorno do Sucesso (Devolvemos o JSON cru para o Modal de UI)
    return new Response(
      JSON.stringify({
        success: true,
        ai_response: generatedResponse,
        interaction,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
