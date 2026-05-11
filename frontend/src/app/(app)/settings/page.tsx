"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, LogOut, Mail, Calendar, Settings as SettingsIcon, Sparkles } from "lucide-react";

interface AccountInfo {
  email: string;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [info, setInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.replace("/");
        return;
      }
      setInfo({
        email: authData.user.email ?? "—",
        createdAt: authData.user.created_at,
      });
      setLoading(false);
    };
    load();
  }, [router]);

  const handleLogout = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-full">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const created = info ? new Date(info.createdAt) : null;

  return (
    <div className="p-6 flex-1 flex flex-col bg-gray-50 min-h-full pb-24">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Configurações
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Sua conta de criador
          </p>
        </div>
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
          <SettingsIcon className="w-7 h-7 text-indigo-600" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Sparkles className="w-32 h-32" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">
          Conta
        </p>
        <p className="text-lg font-black tracking-tight break-all">
          {info?.email}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <InfoRow
          icon={<Mail className="w-4 h-4 text-indigo-500" />}
          label="E-mail"
          value={info?.email ?? "—"}
        />
        <div className="h-px bg-gray-100 mx-4" />
        <InfoRow
          icon={<Calendar className="w-4 h-4 text-indigo-500" />}
          label="Conta criada em"
          value={
            created
              ? created.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "—"
          }
        />
      </div>

      <button
        onClick={handleLogout}
        disabled={signingOut}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white text-red-600 text-sm font-black tracking-wider uppercase rounded-2xl border border-red-200 hover:bg-red-50 transition active:scale-[0.99] disabled:opacity-50 shadow-sm"
      >
        {signingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <LogOut className="w-4 h-4" />
            Fazer logout
          </>
        )}
      </button>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none">
          {label}
        </p>
        <p className="text-sm font-bold text-gray-800 mt-1 truncate">{value}</p>
      </div>
    </div>
  );
}
