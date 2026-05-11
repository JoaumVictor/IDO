"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { LogIn, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciais inválidas. Tente novamente.");
      setLoading(false);
    } else {
      router.push("/feed");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-full bg-canvas">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center">
          <div className="neo-raised mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-7 neo-glow-accent">
            <Sparkles className="w-9 h-9 text-accent" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-4xl font-black text-white tracking-tight">
            IDO
          </h1>
          <p className="mt-3 text-sm text-text-secondary font-medium">
            Seu companheiro social com inteligência artificial
          </p>
        </div>

        <div className="neo-raised py-8 px-7 rounded-3xl">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-display font-black uppercase tracking-widest text-text-secondary mb-2"
              >
                E-mail
              </label>
              <div className="neo-pressed-sm rounded-2xl">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-5 py-4 bg-transparent text-white placeholder-text-muted focus:outline-none text-sm font-medium"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-display font-black uppercase tracking-widest text-text-secondary mb-2"
              >
                Senha
              </label>
              <div className="neo-pressed-sm rounded-2xl">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-5 py-4 bg-transparent text-white placeholder-text-muted focus:outline-none text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="neo-pressed-sm text-danger text-xs text-center font-bold py-3 rounded-2xl">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-5 rounded-full font-display text-sm font-black tracking-widest uppercase text-canvas bg-accent neo-glow-accent disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" strokeWidth={2.5} />
                    Entrar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-[10px] text-text-muted font-display font-bold uppercase tracking-widest">
          Acesso restrito para Alpha Testers
        </p>
      </div>
    </div>
  );
}
