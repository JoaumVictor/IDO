import { Sparkles } from "lucide-react";
import type { KnowledgePayload } from "@/lib/daily-events/types";

export function KnowledgeBody({ payload }: { payload: KnowledgePayload }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-text-secondary leading-relaxed font-medium">
        {payload.ido_line}
      </p>
      <div className="neo-pressed-sm rounded-2xl px-5 py-4 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-accent shrink-0" />
        <div className="flex flex-col">
          <span className="text-[10px] font-display font-bold text-text-muted uppercase tracking-widest">
            novo conhecimento
          </span>
          <span className="text-base font-display font-black text-white">
            {payload.topic_label}
          </span>
        </div>
      </div>
    </div>
  );
}
