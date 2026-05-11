"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2, Zap, Trophy, Box } from "lucide-react";
import { IDOAvatar } from "@/components/IDOAvatar";
import { generateIdoStatus } from "@/lib/ido/status";

interface ProfileData {
  level: number;
  xp: number;
  energy: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userSkills, setUserSkills] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setLoading(false);
        return;
      }

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
    };

    fetchProfileData();
  }, []);

  const status = useMemo(
    () => generateIdoStatus(userSkills, profile?.level ?? 1),
    [userSkills, profile?.level]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-full">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 flex-1 flex flex-col bg-gray-50 min-h-full pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Meu IDO
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Status vital e progressão
        </p>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <IDOAvatar
            size={220}
            priority
            className="ring-4 ring-white shadow-2xl"
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-md whitespace-nowrap">
            Nível {profile?.level ?? 1}
          </span>
        </div>

        <p className="mt-8 text-center text-[15px] text-gray-700 font-medium italic leading-relaxed max-w-xs whitespace-pre-line">
          {status}
        </p>

        <Link
          href="/ido-3d"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-black tracking-widest uppercase rounded-full shadow-lg hover:bg-zinc-800 active:scale-[0.98] transition"
        >
          <Box className="w-4 h-4" />
          Ver em 3D
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-yellow-600 fill-yellow-600" />
            </div>
            <span className="font-bold text-gray-800 text-sm tracking-wide uppercase">
              Energia
            </span>
          </div>
          <span className="text-lg font-black text-gray-900">
            {profile?.energy ?? 3}{" "}
            <span className="text-gray-400 text-sm font-bold">/ 3</span>
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 mb-8">
          <div
            className="bg-yellow-400 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((profile?.energy ?? 3) / 3) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="font-bold text-gray-800 text-sm tracking-wide uppercase">
              Nível {profile?.level ?? 1}
            </span>
          </div>
          <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {profile?.xp ?? 0} XP
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min(
                (((profile?.xp ?? 0) % ((profile?.level ?? 1) * 10)) /
                  ((profile?.level ?? 1) * 10)) *
                  100,
                100
              )}%`,
            }}
          />
        </div>
        <p className="text-[10px] text-gray-400 text-right mt-2 font-bold uppercase tracking-wider">
          Próximo nível: {(profile?.level ?? 1) * 10} XP
        </p>
      </div>
    </div>
  );
}
