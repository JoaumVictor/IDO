"use client";

import { useState } from "react";
import { Loader2, Send, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { PostSuggestionPayload } from "@/lib/daily-events/types";

interface PostSuggestionBodyProps {
  payload: PostSuggestionPayload & { ido_line?: string };
  onPublished: () => void;
}

type Stage = "pick" | "generating" | "review" | "publishing";

export function PostSuggestionBody({
  payload,
  onPublished,
}: PostSuggestionBodyProps) {
  const [stage, setStage] = useState<Stage>("pick");
  const [chosenTheme, setChosenTheme] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const generate = async (theme: string) => {
    setChosenTheme(theme);
    setStage("generating");
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke<
        { content: string } | { error: string }
      >("generate-post", { body: { theme } });
      if (error) {
        // Tenta extrair mensagem real do corpo da resposta
        const body = (error as any)?.context
          ? await (error as any).context.json().catch(() => null)
          : null;
        throw new Error(body?.error ?? error.message ?? "Erro ao gerar");
      }
      const result = data as { content: string };
      if (!result?.content) throw new Error("Resposta vazia");
      setDraft(result.content);
      setStage("review");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao gerar";
      setError(message);
      setStage("pick");
    }
  };

  const publish = async () => {
    setStage("publishing");
    setError(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sem sessão");
      const { error } = await supabase
        .from("posts")
        .insert({ content: draft, author_id: auth.user.id });
      if (error) throw error;
      onPublished();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao publicar";
      setError(message);
      setStage("review");
    }
  };

  if (stage === "pick") {
    return (
      <div className="flex flex-col gap-4">
        {payload.ido_line && (
          <p className="text-base text-text-secondary leading-relaxed font-medium">
            {payload.ido_line}
          </p>
        )}
        <div className="flex flex-col gap-3">
          {payload.themes.map((theme, idx) => (
            <button
              key={idx}
              onClick={() => generate(theme)}
              className="neo-raised-xs rounded-2xl px-5 py-4 text-left hover:neo-glow-accent transition-shadow"
            >
              <span className="text-[10px] font-display font-bold text-text-muted uppercase tracking-widest">
                opção {idx + 1}
              </span>
              <p className="text-sm font-medium text-white mt-1">{theme}</p>
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>
    );
  }

  if (stage === "generating") {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-text-secondary font-medium text-center">
          IDO escrevendo sobre &ldquo;{chosenTheme}&rdquo;...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="neo-pressed-sm rounded-2xl px-4 py-3">
        <span className="text-[10px] font-display font-bold text-text-muted uppercase tracking-widest">
          tema escolhido
        </span>
        <p className="text-xs text-text-secondary font-medium mt-0.5">
          {chosenTheme}
        </p>
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={5}
        maxLength={280}
        className="w-full neo-pressed-sm rounded-2xl px-4 py-3 text-sm text-white font-medium bg-transparent focus:outline-none resize-none"
      />
      <div className="flex gap-3">
        <button
          onClick={() => chosenTheme && generate(chosenTheme)}
          disabled={stage === "publishing"}
          className="neo-raised-xs rounded-full px-4 py-2 flex items-center gap-2 text-xs font-display font-black text-text-secondary disabled:opacity-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Gerar de novo
        </button>
        <button
          onClick={publish}
          disabled={stage === "publishing" || !draft.trim()}
          className="flex-1 rounded-full px-4 py-2 flex items-center justify-center gap-2 text-xs font-display font-black text-canvas bg-accent disabled:opacity-50"
        >
          {stage === "publishing" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          Publicar
        </button>
      </div>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}
