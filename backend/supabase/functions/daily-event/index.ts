import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import {
  pickDialogue,
  type LevelBucket,
} from "../_shared/daily-events/dialogues.ts";
import { pickThemes } from "../_shared/daily-events/post-themes.ts";
import type { DailyEventType } from "../_shared/daily-events/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ENERGY_CAP = 5;

interface EventRoll {
  type: DailyEventType;
  weight: number;
}

const EVENT_TABLE: EventRoll[] = [
  { type: "random_message", weight: 50 },
  { type: "post_suggestion", weight: 15 },
  { type: "stalk", weight: 10 },
  { type: "knowledge", weight: 8 },
  { type: "preference", weight: 10 },
  { type: "energy_bonus", weight: 4 },
  { type: "low_energy", weight: 3 },
];

function rollEvent(): DailyEventType {
  const total = EVENT_TABLE.reduce((acc, e) => acc + e.weight, 0);
  let roll = Math.random() * total;
  for (const e of EVENT_TABLE) {
    roll -= e.weight;
    if (roll <= 0) return e.type;
  }
  return "random_message";
}

function isSameSaoPauloDay(a: Date, b: Date): boolean {
  const offsetMinutes = -180; // GMT-3, sem horário de verão (BRT atual)
  const aLocal = new Date(a.getTime() + offsetMinutes * 60_000);
  const bLocal = new Date(b.getTime() + offsetMinutes * 60_000);
  return (
    aLocal.getUTCFullYear() === bLocal.getUTCFullYear() &&
    aLocal.getUTCMonth() === bLocal.getUTCMonth() &&
    aLocal.getUTCDate() === bLocal.getUTCDate()
  );
}

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? anonKey;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } =
      await userClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = userData.user;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Admin override: força evento para outro usuário
    let body: { force_user_id?: string } = {};
    try {
      const bodyText = await req.text();
      if (bodyText) body = JSON.parse(bodyText);
    } catch (_) {
      /* ignore */
    }

    let targetUserId = user.id;
    let isForced = false;

    if (body.force_user_id && body.force_user_id !== user.id) {
      const { data: callerProfile } = await adminClient
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (!callerProfile?.is_admin) {
        return new Response(
          JSON.stringify({ error: "Apenas admins podem forçar eventos." }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      targetUserId = body.force_user_id;
      isForced = true;
    }

    // 1. Verifica se já rolou hoje
    const { data: dailyRow } = await adminClient
      .from("ido_daily_events")
      .select("last_rolled_at, last_event_type")
      .eq("user_id", targetUserId)
      .maybeSingle();

    const now = new Date();
    if (
      !isForced &&
      dailyRow?.last_rolled_at &&
      isSameSaoPauloDay(new Date(dailyRow.last_rolled_at), now)
    ) {
      return new Response(
        JSON.stringify({
          already_rolled: true,
          event_type: dailyRow.last_event_type,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 2. Perfil + Top skills do usuário
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("level, energy")
      .eq("id", targetUserId)
      .single();
    if (profileError || !profile) throw new Error("Perfil não encontrado");

    const { data: skills } = await adminClient
      .from("ido_user_skills")
      .select("skill_id, current_level")
      .eq("user_id", targetUserId)
      .order("current_level", { ascending: false })
      .limit(5);
    const topSkillIds = (skills ?? []).map((s) => s.skill_id);

    // 3. Sorteio
    let eventType = rollEvent();
    let payload: Record<string, unknown> = {};
    const seed = Date.now() ^ Math.floor(Math.random() * 1_000_000);

    if (eventType === "stalk") {
      const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const { data: candidates } = await adminClient
        .from("posts")
        .select("author_id, profiles!inner(id, email, level)")
        .gte("created_at", since)
        .neq("author_id", targetUserId)
        .limit(50);

      if (candidates && candidates.length > 0) {
        const picked = candidates[
          Math.floor(Math.random() * candidates.length)
        ] as unknown as {
          author_id: string;
          profiles: { id: string; email: string; level: number };
        };
        payload = {
          target_user_id: picked.profiles.id,
          target_email: picked.profiles.email,
          target_level: picked.profiles.level,
          ido_line: pickDialogue("stalk", profile.level, seed),
        };
      } else {
        // Fallback: ninguém postou nas últimas 24h → vira random_message
        eventType = "random_message";
      }
    }

    if (eventType === "random_message") {
      payload = {
        ido_line: pickDialogue("random_message", profile.level, seed),
      };
    } else if (eventType === "post_suggestion") {
      payload = {
        themes: pickThemes(topSkillIds, 3, seed),
        ido_line: pickDialogue("post_suggestion", profile.level, seed),
      };
    } else if (eventType === "knowledge") {
      const { data: catalog } = await adminClient
        .from("topic_catalog")
        .select("id, label");
      const { data: known } = await adminClient
        .from("ido_knowledge")
        .select("topic_id")
        .eq("user_id", targetUserId);
      const knownIds = new Set((known ?? []).map((k) => k.topic_id));
      const pool = (catalog ?? []).filter((t) => !knownIds.has(t.id));
      const picked =
        pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
      if (picked) {
        await adminClient
          .from("ido_knowledge")
          .insert({ user_id: targetUserId, topic_id: picked.id });
        payload = {
          topic_id: picked.id,
          topic_label: picked.label,
          ido_line: pickDialogue("knowledge", profile.level, seed),
        };
      } else {
        eventType = "random_message";
        payload = {
          ido_line: pickDialogue("random_message", profile.level, seed),
        };
      }
    } else if (eventType === "preference") {
      const { data: catalog } = await adminClient
        .from("topic_catalog")
        .select("id, label");
      const { data: existing } = await adminClient
        .from("ido_preferences")
        .select("topic_id")
        .eq("user_id", targetUserId);
      const usedIds = new Set((existing ?? []).map((k) => k.topic_id));
      const pool = (catalog ?? []).filter((t) => !usedIds.has(t.id));
      const picked =
        pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
      if (picked) {
        const stance: "like" | "dislike" =
          Math.random() < 0.5 ? "like" : "dislike";
        await adminClient
          .from("ido_preferences")
          .insert({ user_id: targetUserId, topic_id: picked.id, stance });
        payload = {
          topic_id: picked.id,
          topic_label: picked.label,
          stance,
          ido_line: pickDialogue("preference", profile.level, seed),
        };
      } else {
        eventType = "random_message";
        payload = {
          ido_line: pickDialogue("random_message", profile.level, seed),
        };
      }
    } else if (eventType === "energy_bonus") {
      const delta = 2;
      const newEnergy = Math.min(profile.energy + delta, ENERGY_CAP);
      await adminClient
        .from("profiles")
        .update({ energy: newEnergy })
        .eq("id", targetUserId);
      payload = {
        delta: newEnergy - profile.energy,
        new_energy: newEnergy,
        ido_line: pickDialogue("energy_bonus", profile.level, seed),
      };
    } else if (eventType === "low_energy") {
      const newEnergy = Math.max(profile.energy - 1, 0);
      await adminClient
        .from("profiles")
        .update({ energy: newEnergy })
        .eq("id", targetUserId);
      payload = {
        delta: newEnergy - profile.energy,
        new_energy: newEnergy,
        ido_line: pickDialogue("low_energy", profile.level, seed),
      };
    }

    // 4. Persiste o registro do dia
    await adminClient.from("ido_daily_events").upsert(
      {
        user_id: targetUserId,
        last_rolled_at: now.toISOString(),
        last_event_type: eventType,
      },
      { onConflict: "user_id" },
    );

    return new Response(
      JSON.stringify({ already_rolled: false, event_type: eventType, payload }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("daily-event error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Avoid unused warning on LevelBucket re-export
export type { LevelBucket };
