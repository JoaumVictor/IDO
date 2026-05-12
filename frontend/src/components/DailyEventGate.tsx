"use client";

import { useDailyEvent } from "@/hooks/useDailyEvent";
import { DailyEventModal } from "./DailyEventModal";

export function DailyEventGate() {
  const { event, dismiss } = useDailyEvent();
  if (!event) return null;
  return (
    <DailyEventModal
      eventType={event.event_type}
      payload={event.payload}
      onDismiss={dismiss}
    />
  );
}
