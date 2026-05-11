"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Loader2,
  LogOut,
  Mail,
  Calendar,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react";

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
      <div className="flex-1 flex items-center justify-center bg-canvas min-h-full">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const created = info ? new Date(info.createdAt) : null;

  return (
    <div className="p-6 flex-1 flex flex-col bg-canvas min-h-full pb-32">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight">
            Configurações
          </h1>
          <p className="text-sm text-text-secondary font-medium mt-1">
            Sua conta de criador
          </p>
        </div>
        <div className="neo-raised-xs w-14 h-14 rounded-2xl flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-accent" strokeWidth={2.5} />
        </div>
      </div>

      <div className="neo-raised rounded-3xl p-7 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Sparkles className="w-32 h-32 text-accent" />
        </div>
        <p className="font-display text-[10px] font-black uppercase tracking-widest text-accent mb-2">
          Conta
        </p>
        <p className="font-display text-lg font-black tracking-tight break-all text-white">
          {info?.email}
        </p>
      </div>

      <div className="neo-raised-sm rounded-3xl p-3 mb-7 overflow-hidden">
        <InfoRow
          icon={<Mail className="w-4 h-4 text-accent" strokeWidth={2.5} />}
          label="E-mail"
          value={info?.email ?? "—"}
        />
        <div className="h-px bg-surface-2 mx-5" />
        <InfoRow
          icon={<Calendar className="w-4 h-4 text-accent" strokeWidth={2.5} />}
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
        className="neo-raised-sm w-full flex items-center justify-center gap-2 px-5 py-4 text-danger font-display text-sm font-black tracking-widest uppercase rounded-full transition active:scale-[0.99] disabled:opacity-50"
      >
        {signingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <LogOut className="w-4 h-4" strokeWidth={2.5} />
            Fazer logout
          </>
        )}
      </button>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="neo-pressed-sm w-11 h-11 rounded-full flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-[10px] font-black uppercase tracking-widest text-text-muted leading-none">
          {label}
        </p>
        <p className="text-sm font-bold text-white mt-1.5 truncate">{value}</p>
      </div>
    </div>
  );
}
