"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { DailyEventType, DailyEventResponse } from "@/lib/daily-events/types";

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
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    const run = async () => {
      try {
        const { data: sessionRes } = await supabase.auth.getSession();
        const token = sessionRes.session?.access_token;
        if (!token) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke<DailyEventResponse>(
          "daily-event",
          { body: {} }
        );

        if (error) {
          console.error("daily-event invoke error", error);
          setLoading(false);
          return;
        }

        if (data && !data.already_rolled && data.event_type && data.payload) {
          setEvent({
            event_type: data.event_type,
            payload: data.payload,
          });
        }
      } catch (err) {
        console.error("daily-event hook error", err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const dismiss = useCallback(() => setEvent(null), []);

  return { event, loading, dismiss };
}
