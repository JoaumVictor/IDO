"use client";

import { X } from "lucide-react";
import { IDOAvatar } from "@/components/IDOAvatar";
import { CTA_BY_EVENT, TITLE_BY_EVENT } from "@/lib/daily-events/dialogues";
import type {
  DailyEventType,
  EnergyDeltaPayload,
  KnowledgePayload,
  PostSuggestionPayload,
  PreferencePayload,
  RandomMessagePayload,
  StalkPayload,
} from "@/lib/daily-events/types";
import { RandomMessageBody } from "./daily-events/RandomMessageBody";
import { KnowledgeBody } from "./daily-events/KnowledgeBody";
import { PreferenceBody } from "./daily-events/PreferenceBody";
import { EnergyBonusBody } from "./daily-events/EnergyBonusBody";
import { LowEnergyBody } from "./daily-events/LowEnergyBody";
import { StalkBody } from "./daily-events/StalkBody";
import { PostSuggestionBody } from "./daily-events/PostSuggestionBody";

interface DailyEventModalProps {
  eventType: DailyEventType;
  payload:
    | RandomMessagePayload
    | PostSuggestionPayload
    | StalkPayload
    | KnowledgePayload
    | PreferencePayload
    | EnergyDeltaPayload;
  onDismiss: () => void;
}

export function DailyEventModal({
  eventType,
  payload,
  onDismiss,
}: DailyEventModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6"
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="neo-raised w-full max-w-md rounded-3xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start gap-4">
          <div className="neo-raised-xs rounded-full p-1 shrink-0">
            <IDOAvatar size={64} />
          </div>
          <div className="flex-1 flex flex-col gap-1 pt-1">
            <span className="text-[10px] font-display font-bold text-accent uppercase tracking-widest">
              {TITLE_BY_EVENT[eventType]}
            </span>
            <h2 className="font-display text-xl font-black text-white tracking-tight leading-tight">
              Seu IDO acordou agora.
            </h2>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Fechar"
            className="neo-raised-xs rounded-full p-2 text-text-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {renderBody(eventType, payload, onDismiss)}
        </div>

        <button
          onClick={onDismiss}
          className="rounded-full px-6 py-3 bg-accent text-canvas font-display font-black tracking-wide neo-glow-accent"
        >
          {CTA_BY_EVENT[eventType]}
        </button>
      </div>
    </div>
  );
}

function renderBody(
  eventType: DailyEventType,
  payload: DailyEventModalProps["payload"],
  onDismiss: () => void,
) {
  switch (eventType) {
    case "random_message":
      return <RandomMessageBody payload={payload as RandomMessagePayload} />;
    case "knowledge":
      return <KnowledgeBody payload={payload as KnowledgePayload} />;
    case "preference":
      return <PreferenceBody payload={payload as PreferencePayload} />;
    case "energy_bonus":
      return <EnergyBonusBody payload={payload as EnergyDeltaPayload} />;
    case "low_energy":
      return <LowEnergyBody payload={payload as EnergyDeltaPayload} />;
    case "stalk":
      return (
        <StalkBody payload={payload as StalkPayload} onNavigate={onDismiss} />
      );
    case "post_suggestion":
      return (
        <PostSuggestionBody
          payload={payload as PostSuggestionPayload & { ido_line?: string }}
          onPublished={onDismiss}
        />
      );
  }
}
