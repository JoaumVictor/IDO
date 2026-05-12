"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type {
  DailyEventType,
  DailyEventResponse,
} from "@/lib/daily-events/types";

interface ActiveEvent {
  event_type: DailyEventType;
  payload: NonNullable<DailyEventResponse["payload"]>;
}

export function useDailyEvent() {
  const [event, setEvent] = useState<ActiveEvent | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session?.user?.id) return;
      const userId = session.user.id;
      const seenKey = `ido_daily_seen_${userId}`;

      // 1. Lê direto do banco — fonte de verdade
      const { data: row } = await supabase
        .from("ido_daily_events")
        .select("last_rolled_at, last_event_type, payload")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (row?.last_rolled_at && row?.payload) {
        // Já existe um evento no banco — mostra se ainda não foi exibido
        if (sessionStorage.getItem(seenKey) === row.last_rolled_at) return;
        sessionStorage.setItem(seenKey, row.last_rolled_at);
        setEvent({
          event_type: row.last_event_type as DailyEventType,
          payload: row.payload,
        });
        return;
      }

      // 2. Nenhum evento no banco ainda — chama a function para gerar
      const { data, error } =
        await supabase.functions.invoke<DailyEventResponse>("daily-event", {
          body: {},
        });
      if (cancelled || error || !data?.event_type || !data?.payload) return;

      // Re-lê do banco para pegar o last_rolled_at real como marcador
      const { data: newRow } = await supabase
        .from("ido_daily_events")
        .select("last_rolled_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (!cancelled) {
        sessionStorage.setItem(
          seenKey,
          newRow?.last_rolled_at ?? new Date().toISOString(),
        );
        setEvent({ event_type: data.event_type, payload: data.payload });
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => setEvent(null), []);

  return { event, dismiss };
}
