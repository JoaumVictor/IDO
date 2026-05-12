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

/** Retorna a data de hoje no fuso de SP (GMT-3) no formato "YYYY-MM-DD". */
function todaySP(): string {
  return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function useDailyEvent(): UseDailyEventResult {
  const [event, setEvent] = useState<ActiveEvent | null>(null);
  const [loading, setLoading] = useState(true);
  // Impede dupla chamada dentro do mesmo render cycle (StrictMode / hot-reload)
  const running = useRef(false);

  console.log(event, loading);

  useEffect(() => {
    if (running.current) return;

    running.current = true;

    const run = async () => {
      try {
        const { data: sessionRes } = await supabase.auth.getSession();
        const token = sessionRes.session?.access_token;
        const userId = sessionRes.session?.user?.id;
        if (!token || !userId) {
          setLoading(false);
          return;
        }

        // Chave inclui user_id + data SP — isolada por conta e por dia
        const storageKey = `ido_daily_checked_${userId}_${todaySP()}`;
        if (sessionStorage.getItem(storageKey)) {
          setLoading(false);
          return;
        }

        const { data, error } =
          await supabase.functions.invoke<DailyEventResponse>("daily-event", {
            body: {},
          });

        if (error) {
          console.error("daily-event invoke error", error);
          setLoading(false);
          return;
        }

        // Marca como verificado hoje para não re-disparar na mesma sessão
        sessionStorage.setItem(storageKey, "1");

        // Mostra o modal se tiver payload — independente de already_rolled
        // (cobre o caso do admin ter forçado o evento antes do usuário abrir o app)
        if (data && data.event_type && data.payload) {
          setEvent({
            event_type: data.event_type,
            payload: data.payload,
          });
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
