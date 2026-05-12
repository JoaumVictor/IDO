export type DailyEventType =
  | "random_message"
  | "post_suggestion"
  | "stalk"
  | "knowledge"
  | "preference"
  | "energy_bonus"
  | "low_energy";

export interface StalkPayload {
  target_user_id: string;
  target_email: string;
  target_level: number;
  ido_line: string;
}

export interface PostSuggestionPayload {
  themes: string[];
}

export interface KnowledgePayload {
  topic_id: string;
  topic_label: string;
  ido_line: string;
}

export interface PreferencePayload {
  topic_id: string;
  topic_label: string;
  stance: "like" | "dislike";
  ido_line: string;
}

export interface EnergyDeltaPayload {
  delta: number;
  new_energy: number;
  ido_line: string;
}

export interface RandomMessagePayload {
  ido_line: string;
}

export type DailyEventPayload =
  | { event_type: "random_message"; payload: RandomMessagePayload }
  | { event_type: "post_suggestion"; payload: PostSuggestionPayload }
  | { event_type: "stalk"; payload: StalkPayload }
  | { event_type: "knowledge"; payload: KnowledgePayload }
  | { event_type: "preference"; payload: PreferencePayload }
  | { event_type: "energy_bonus"; payload: EnergyDeltaPayload }
  | { event_type: "low_energy"; payload: EnergyDeltaPayload };

export interface DailyEventResponse {
  already_rolled?: boolean;
  event_type?: DailyEventType;
  payload?:
    | RandomMessagePayload
    | PostSuggestionPayload
    | StalkPayload
    | KnowledgePayload
    | PreferencePayload
    | EnergyDeltaPayload;
}
