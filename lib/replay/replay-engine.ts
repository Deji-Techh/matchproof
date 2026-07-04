import type { FeedUpdate } from "@prisma/client";
import type { AgentUpdate } from "@/lib/agents/types";
import { parseJson } from "@/lib/utils";

export const REPLAY_SPEEDS = [0.5, 1, 2, 5, 10] as const;
export type ReplayStatus = "idle" | "running" | "paused" | "completed" | "failed";

export function toAgentUpdate(update: FeedUpdate): AgentUpdate {
  const payload = parseJson<Record<string, unknown>>(update.rawJson, {});

  return {
    id: update.id,
    fixtureId: update.fixtureId ?? String(payload.fixtureId ?? ""),
    sourceMode: update.sourceMode as AgentUpdate["sourceMode"],
    sequence: update.sequence ?? undefined,
    providerTimestamp: update.providerTimestamp?.toISOString(),
    ingestedAt: update.ingestedAt.toISOString(),
    payload,
  };
}

export function getReplayProgress(currentIndex: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((currentIndex / total) * 100));
}
