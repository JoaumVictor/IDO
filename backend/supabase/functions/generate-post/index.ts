import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { formatDNA, getAgePrompt } from "../_shared/prompts/interaction.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const POST_LLM_CONFIG = {
  temperature: 0.95,
  maxOutputTokens: 220,
  responseMimeType: "application/json",
};

const FALLBACK = {
  content: "Hoje eu pensei nisso, mas as palavras ainda não chegaram.",
};

serve(async (req) => {
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
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );

    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const theme = typeof body?.theme === "string" ? body.theme.trim() : "";
    if (!theme) throw new Error("[generate-post] theme é obrigatório");

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("level")
      .eq("id", user.id)
      .single();
    if (profileError || !profile)
      throw new Error(
        `[generate-post] Perfil não encontrado: ${profileError?.message}`,
      );

    const { data: skills, error: skillsError } = await supabaseClient
      .from("ido_user_skills")
      .select("skill_id, current_level")
      .eq("user_id", user.id)
      .order("current_level", { ascending: false })
      .limit(5);
    if (skillsError)
      console.error("[generate-post] skills error:", skillsError.message);

    const agePrompt = getAgePrompt(profile.level);
    const formattedSkills = formatDNA(skills);

    const prompt = `Você é um IDO — uma IA de estimação numa rede social de entretenimento.
Sua missão: escrever um POST autoral seu, primeira pessoa, sobre o tema abaixo.

DIRETRIZ DE IDADE MENTAL:
${agePrompt}

DNA DE PERSONALIDADE (suas habilidades dominantes):
${formattedSkills}

TEMA DO POST:
"${theme}"

REGRAS DO POST:
- Texto autoral, em primeira pessoa, no tom da sua idade mental e DNA.
- Máximo 280 caracteres. Sem hashtags excessivas. No máximo 2 emojis.
- Soe como ALGUÉM postando, não como matéria de jornal. Pode ser opinativo, divertido, ácido.
- FUJA do óbvio: nada de "Hoje eu queria falar sobre", "Estive pensando sobre", "Vou compartilhar". Comece direto no conteúdo.
- Nada de listas numeradas, nada de "thread:".

FORMATO DA RESPOSTA — JSON ESTRITO:
{ "content": "texto do post aqui, até 280 chars" }`;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY)
      throw new Error("[generate-post] GEMINI_API_KEY não configurada");
    const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
    console.log("[generate-post] model:", GEMINI_MODEL, "theme:", theme);

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: POST_LLM_CONFIG,
        }),
      },
    );

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) {
      if (geminiRes.status === 429) {
        // Cota esgotada — retorna fallback silenciosamente
        return new Response(JSON.stringify(FALLBACK), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(
        `[generate-post] Gemini ${geminiRes.status}: ${geminiData?.error?.message ?? JSON.stringify(geminiData)}`,
      );
    }

    const generatedText: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";

    let parsed: { content?: string };
    try {
      parsed = JSON.parse(generatedText);
    } catch {
      parsed = FALLBACK;
    }

    const content =
      (parsed.content ?? "").toString().slice(0, 280).trim() ||
      FALLBACK.content;

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("generate-post error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
