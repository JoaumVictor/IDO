import { Zap } from "lucide-react";
import type { EnergyDeltaPayload } from "@/lib/daily-events/types";

export function EnergyBonusBody({ payload }: { payload: EnergyDeltaPayload }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-text-secondary leading-relaxed font-medium">
        {payload.ido_line}
      </p>
      <div className="neo-pressed-sm rounded-2xl px-5 py-4 flex items-center gap-3 neo-glow-gold">
        <Zap className="w-5 h-5 text-gold fill-gold shrink-0" />
        <div className="flex flex-col">
          <span className="text-[10px] font-display font-bold text-text-muted uppercase tracking-widest">
            energia
          </span>
          <span className="text-base font-display font-black text-white">
            +{payload.delta} · agora em {payload.new_energy}
          </span>
        </div>
      </div>
    </div>
  );
}
