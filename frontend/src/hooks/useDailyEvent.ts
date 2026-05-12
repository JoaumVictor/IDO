"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type {
  DailyEventType,
  DailyEventResponse,
} from "@/lib/daily-events/types";

interface ActiveEvent {
  event_type: DailyEventType;
  payload: NonNullable<DailyEventResponse["payload"]>;
}

interface UseDailyEventResult {
  event: ActiveEvent | null;
  loading: boolean;
  dismiss: () => void;
}

export function useDailyEvent(): UseDailyEventResult {
  const [event, setEvent] = useState<ActiveEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const running = useRef(false);

  console.log("useDailyEvent init", { event, loading });

  useEffect(() => {
    if (running.current) return;
    running.current = true;

    const run = async () => {
      try {
        const { data: sessionRes } = await supabase.auth.getSession();
        const userId = sessionRes.session?.user?.id;
        if (!userId) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke<
          DailyEventResponse & { last_rolled_at?: string }
        >("daily-event", { body: {} });

        if (error) {
          console.error("daily-event invoke error", error);
          setLoading(false);
          return;
        }

        if (data?.event_type && data?.payload && data?.last_rolled_at) {
          // Chave guarda o last_rolled_at do último evento já exibido para este usuário
          const storageKey = `ido_daily_last_seen_${userId}`;
          const lastSeen = sessionStorage.getItem(storageKey);

          if (data.last_rolled_at !== lastSeen) {
            // Evento novo ou forçado pelo admin — exibe e registra
            sessionStorage.setItem(storageKey, data.last_rolled_at);
            setEvent({
              event_type: data.event_type,
              payload: data.payload,
            });
          }
        }
      } catch (err) {
        console.error("daily-event hook error", err);
      } finally {
        setLoading(false);
        running.current = false;
      }
    };

    run();
  }, []);

  const dismiss = useCallback(() => setEvent(null), []);

  return { event, loading, dismiss };
}
