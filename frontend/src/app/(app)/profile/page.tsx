"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Zap, Trophy, BrainCircuit } from "lucide-react";

interface ProfileData {
  level: number;
  xp: number;
  energy: number;
}

interface StatsData {
  bobo: number;
  nerd: number;
  afrontoso: number;
  melancolico: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setLoading(false);
        return;
      }

      const [profileRes, statsRes] = await Promise.all([
        supabase.from("profiles").select("level, xp, energy").eq("id", authData.user.id).single(),
        supabase.from("ido_stats").select("bobo, nerd, afrontoso, melancolico").eq("user_id", authData.user.id).single(),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (statsRes.data) setStats(statsRes.data);

      setLoading(false);
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-full">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 flex-1 flex flex-col bg-gray-50 min-h-full pb-24">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Meu IDO
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Status vital e progressão
          </p>
        </div>
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
          <BrainCircuit className="w-7 h-7 text-indigo-600" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Card Principal: Energia e Nível */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          {/* Energia */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-600 fill-yellow-600" />
              </div>
              <span className="font-bold text-gray-800 text-sm tracking-wide uppercase">Energia</span>
            </div>
            <span className="text-lg font-black text-gray-900">{profile?.energy ?? 3} <span className="text-gray-400 text-sm font-bold">/ 3</span></span>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-3 mb-8">
            <div 
              className="bg-yellow-400 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((profile?.energy ?? 3) / 3) * 100}%` }}
            ></div>
          </div>

          {/* XP e Level */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="font-bold text-gray-800 text-sm tracking-wide uppercase">Nível {profile?.level ?? 1}</span>
            </div>
            <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{profile?.xp ?? 0} XP</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((((profile?.xp ?? 0) % 100) / 100) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-gray-400 text-right mt-2 font-bold uppercase tracking-wider">Próximo Nível: 100 XP</p>
        </div>

        {/* Card Atributos */}
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2 pt-2">DNA da Personalidade</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Bobo" value={stats?.bobo ?? 0} color="bg-emerald-50 text-emerald-700 border-emerald-100" />
          <StatBox label="Nerd" value={stats?.nerd ?? 0} color="bg-blue-50 text-blue-700 border-blue-100" />
          <StatBox label="Afrontoso" value={stats?.afrontoso ?? 0} color="bg-red-50 text-red-700 border-red-100" />
          <StatBox label="Melancólico" value={stats?.melancolico ?? 0} color="bg-slate-100 text-slate-700 border-slate-200" />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className={`rounded-3xl p-5 border flex flex-col justify-center items-center gap-2 shadow-sm ${color}`}>
      <span className="text-4xl font-black tracking-tighter">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
    </div>
  );
}
