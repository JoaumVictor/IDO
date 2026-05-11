"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, ShieldAlert, Zap, RefreshCw, Crown } from "lucide-react";

interface AdminProfile {
  id: string;
  email: string;
  level: number;
  xp: number;
  energy: number;
}

type AccessState = "checking" | "denied" | "granted";

export default function MasterControlPage() {
  const [access, setAccess] = useState<AccessState>("checking");
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setAccess("denied");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", authData.user.id)
        .single();

      if (!profile?.is_admin) {
        setAccess("denied");
        return;
      }

      setAccess("granted");
      await loadProfiles();
    };

    verifyAdmin();
  }, []);

  const loadProfiles = async () => {
    setLoadingList(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, email, level, xp, energy")
      .order("level", { ascending: false });

    if (data) setProfiles(data as AdminProfile[]);
    setLoadingList(false);
  };

  const handleGlobalReset = async () => {
    if (resetting) return;
    const confirmed = window.confirm("Tem certeza que quer RESETAR a energia de TODOS os perfis para 3?");
    if (!confirmed) return;

    setResetting(true);
    setFeedback(null);

    const { data, error } = await supabase.rpc("reset_global_energy");

    if (error) {
      setFeedback({ type: "error", msg: error.message || "Falha ao resetar energia." });
    } else {
      setFeedback({ type: "success", msg: `Energia resetada em ${data ?? 0} perfis.` });
      await loadProfiles();
    }
    setResetting(false);
  };

  if (access === "checking") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (access === "denied") {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-black text-gray-100 tracking-tight">Acesso negado</h1>
        <p className="text-sm text-gray-400 font-medium mt-2">
          Esta área é restrita ao mestre do jogo.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-10">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Crown className="w-6 h-6 text-gray-950" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">God Panel</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              IDO Master Control
            </p>
          </div>
        </div>
        <button
          onClick={loadProfiles}
          disabled={loadingList}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-xs font-bold uppercase tracking-wider hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin" : ""}`} />
          Recarregar
        </button>
      </header>

      <section className="bg-gradient-to-br from-red-900/40 to-red-950 border border-red-800/50 rounded-3xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-red-400 fill-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-red-100 tracking-tight">Resetar Energia Global</h2>
            <p className="text-sm text-red-200/70 font-medium mt-1">
              Restaura a energia de TODOS os IDOs para 3. Use entre rounds de teste.
            </p>
          </div>
        </div>
        <button
          onClick={handleGlobalReset}
          disabled={resetting}
          className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-500 text-white text-sm font-black tracking-wider uppercase rounded-2xl hover:bg-red-400 transition-all disabled:bg-red-900 disabled:cursor-not-allowed active:scale-[0.99] shadow-lg shadow-red-500/30"
        >
          {resetting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              Acionar Reset Global
            </>
          )}
        </button>
        {feedback && (
          <p
            className={`mt-3 text-xs font-bold ${
              feedback.type === "success" ? "text-emerald-400" : "text-red-300"
            }`}
          >
            {feedback.msg}
          </p>
        )}
      </section>

      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 px-1">
          Testadores Alfa
        </h2>
        <div className="bg-gray-900/60 border border-gray-800 rounded-3xl overflow-hidden">
          {loadingList ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
          ) : profiles.length === 0 ? (
            <p className="p-10 text-center text-sm text-gray-500 font-bold">
              Nenhum perfil encontrado.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-900 border-b border-gray-800">
                <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Nível</th>
                  <th className="px-5 py-3">XP</th>
                  <th className="px-5 py-3">Energia</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-gray-800/60 last:border-0 hover:bg-gray-900/80 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-200 truncate max-w-[260px]">{p.email}</td>
                    <td className="px-5 py-4">
                      <span className="font-black text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full text-xs">
                        {p.level}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-300">{p.xp}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 font-black text-yellow-300">
                        <Zap className="w-3.5 h-3.5 fill-yellow-300" />
                        {p.energy}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
