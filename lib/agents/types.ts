import type { ScoreUpdatePayload } from "@/lib/txline/types";

export type AgentType = "feed_health" | "match_state" | "proof" | "optional_data_feed_health";
export type SignalSeverity = "low" | "medium" | "high" | "critical";
export type SignalStatus = "open" | "acknowledged" | "resolved";

export type AgentSignal = {
  id: string;
  fixtureId: string;
  agentType: AgentType;
  severity: SignalSeverity;
  title: string;
  summary: string;
  evidence: Record<string, unknown>;
  sourceUpdateIds: string[];
  createdAt: string;
  status: SignalStatus;
};

export type AgentUpdate = {
  id: string;
  fixtureId: string;
  sourceMode: "snapshot" | "stream" | "historical" | "replay" | "seed";
  sequence?: string;
  providerTimestamp?: string;
  ingestedAt: string;
  payload: ScoreUpdatePayload;
};
