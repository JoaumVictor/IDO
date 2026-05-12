import type { RandomMessagePayload } from "@/lib/daily-events/types";

export function RandomMessageBody({ payload }: { payload: RandomMessagePayload }) {
  return (
    <p className="text-base text-text-secondary leading-relaxed font-medium">
      {payload.ido_line}
    </p>
  );
}
