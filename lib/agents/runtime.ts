import type { AgentUpdate } from "@/lib/agents/types";
import { runFeedHealthAgent } from "@/lib/agents/feed-health-agent";
import { runMatchStateAgent } from "@/lib/agents/match-state-agent";

export function runAgentRuntime(updates: AgentUpdate[]) {
  const ordered = [...updates].sort((a, b) => new Date(a.ingestedAt).getTime() - new Date(b.ingestedAt).getTime());

  return [...runFeedHealthAgent(ordered), ...runMatchStateAgent(ordered)].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
