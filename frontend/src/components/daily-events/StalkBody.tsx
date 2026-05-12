import Link from "next/link";
import { Eye } from "lucide-react";
import { IDOAvatar } from "@/components/IDOAvatar";
import type { StalkPayload } from "@/lib/daily-events/types";

interface StalkBodyProps {
  payload: StalkPayload;
  onNavigate: () => void;
}

export function StalkBody({ payload, onNavigate }: StalkBodyProps) {
  const handle = payload.target_email?.split("@")[0] ?? "ido";
  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-text-secondary leading-relaxed font-medium">
        {payload.ido_line}
      </p>
      <Link
        href={`/profile/${payload.target_user_id}`}
        onClick={onNavigate}
        className="neo-pressed-sm rounded-2xl px-5 py-4 flex items-center gap-4 hover:neo-glow-accent transition-shadow"
      >
        <IDOAvatar size={56} className="neo-raised-xs" />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-base font-display font-black text-white truncate">
            @{handle}
          </span>
          <span className="text-xs text-text-muted font-medium">
            IDO Nvl {payload.target_level}
          </span>
        </div>
        <Eye className="w-5 h-5 text-accent shrink-0" />
      </Link>
    </div>
  );
}
