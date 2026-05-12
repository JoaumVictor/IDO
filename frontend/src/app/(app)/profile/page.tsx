"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2, Zap, Trophy, Box } from "lucide-react";
import { IDOAvatar } from "@/components/IDOAvatar";
import { IDOCommentsList } from "@/components/IDOCommentsList";
import { DailyEventGate } from "@/components/DailyEventGate";
import { generateIdoStatus } from "@/lib/ido/status";

interface ProfileData {
  level: number;
  xp: number;
  energy: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userSkills, setUserSkills] = useState<Record<string, number>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setLoading(false);
      return;
    }
    setUserId(authData.user.id);

    const [profileRes, skillsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("level, xp, energy")
        .eq("id", authData.user.id)
        .single(),
      supabase
        .from("ido_user_skills")
        .select("skill_id, current_level")
        .eq("user_id", authData.user.id),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (skillsRes.data) {
      const map: Record<string, number> = {};
      skillsRes.data.forEach((s) => {
        map[s.skill_id] = s.current_level;
      });
      setUserSkills(map);
    }

    setLoading(false);
  }, []);

  // Carrega na montagem
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Recarrega quando o usuário volta para a aba/janela
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetchProfileData();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchProfileData]);

  const status = useMemo(
    () => generateIdoStatus(userSkills, profile?.level ?? 1),
    [userSkills, profile?.level],
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas min-h-full">
        <DailyEventGate />
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 flex-1 flex flex-col bg-canvas min-h-full pb-32">
      <DailyEventGate />
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-white tracking-tight">
          Meu IDO
        </h1>
        <p className="text-sm text-text-secondary font-medium mt-1">
          Status vital e progressão
        </p>
      </div>

      <div className="flex flex-col items-center mb-10">
        <div className="relative">
          <div className="neo-raised p-3 rounded-full">
            <IDOAvatar size={200} priority />
          </div>
          <span className="font-display absolute -bottom-3 left-1/2 -translate-x-1/2 bg-accent text-canvas text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full neo-glow-accent whitespace-nowrap">
            Nível {profile?.level ?? 1}
          </span>
        </div>

        <p className="mt-10 text-center text-[15px] text-text-secondary font-medium italic leading-relaxed max-w-xs whitespace-pre-line">
          {status}
        </p>

        <Link
          href="/ido-3d"
          className="neo-raised-xs mt-7 inline-flex items-center gap-2 px-6 py-3 text-accent font-display text-xs font-black tracking-widest uppercase rounded-full active:scale-[0.98] transition"
        >
          <Box className="w-4 h-4" strokeWidth={2.5} />
          Ver em 3D
        </Link>
      </div>

      <div className="neo-raised rounded-3xl p-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="neo-pressed-sm w-11 h-11 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-gold fill-gold" />
            </div>
            <span className="font-display font-black text-white text-xs tracking-widest uppercase">
              Energia
            </span>
          </div>
          <span className="font-display text-2xl font-black text-white">
            {profile?.energy ?? 3}
            <span className="text-text-muted text-sm font-bold"> / 3</span>
          </span>
        </div>

        <div className="neo-pressed-sm w-full rounded-full h-3 mb-9 overflow-hidden">
          <div
            className="bg-gold h-full rounded-full transition-all duration-1000 ease-out neo-glow-gold"
            style={{ width: `${((profile?.energy ?? 3) / 3) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="neo-pressed-sm w-11 h-11 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-accent" strokeWidth={2.5} />
            </div>
            <span className="font-display font-black text-white text-xs tracking-widest uppercase">
              Nível {profile?.level ?? 1}
            </span>
          </div>
          <span className="font-display text-sm font-black text-accent">
            {profile?.xp ?? 0} XP
          </span>
        </div>
        <div className="neo-pressed-sm w-full rounded-full h-3 overflow-hidden">
          <div
            className="bg-accent h-full rounded-full transition-all duration-1000 ease-out neo-glow-accent"
            style={{
              width: `${Math.min(
                (((profile?.xp ?? 0) % ((profile?.level ?? 1) * 10)) /
                  ((profile?.level ?? 1) * 10)) *
                  100,
                100,
              )}%`,
            }}
          />
        </div>
        <p className="text-[10px] text-text-muted text-right mt-3 font-display font-bold uppercase tracking-widest">
          Próximo nível: {(profile?.level ?? 1) * 10} XP
        </p>
      </div>

      {userId && (
        <IDOCommentsList
          userId={userId}
          title="Meus comentários"
          emptyMessage="Você ainda não interagiu com nenhum post. Cai no feed e solta seu IDO."
        />
      )}
    </div>
  );
}
