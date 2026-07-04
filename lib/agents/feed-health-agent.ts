import type { AgentSignal, AgentUpdate } from "@/lib/agents/types";

const DELAY_THRESHOLD_SECONDS = 90;

export function runFeedHealthAgent(updates: AgentUpdate[]): AgentSignal[] {
  const signals: AgentSignal[] = [];
  const seenSequences = new Map<string, AgentUpdate>();

  for (const update of updates) {
    if (!update.fixtureId) {
      signals.push(makeSignal(update, "high", "Missing fixture ID", "A score update arrived without a fixture ID.", { updateId: update.id }));
    }

    if (!update.payload || typeof update.payload !== "object") {
      signals.push(makeSignal(update, "high", "Malformed payload", "A score update could not be parsed as an object.", { updateId: update.id }));
      continue;
    }

    if (update.sequence) {
      const previous = seenSequences.get(update.sequence);
      if (previous) {
        signals.push(
          makeSignal(update, "low", "Duplicate score update detected", "The same fixture sequence was received more than once.", {
            sequence: update.sequence,
            duplicateUpdateId: update.id,
            originalUpdateId: previous.id,
          }),
        );
      } else {
        seenSequences.set(update.sequence, update);
      }
    }

    if (update.providerTimestamp) {
      const delaySeconds =
        (new Date(update.ingestedAt).getTime() - new Date(update.providerTimestamp).getTime()) / 1000;
      if (delaySeconds > DELAY_THRESHOLD_SECONDS) {
        signals.push(
          makeSignal(update, "medium", "Score stream delay detected", `The update arrived ${Math.round(delaySeconds)} seconds after the provider timestamp.`, {
            delayedSeconds: Math.round(delaySeconds),
            thresholdSeconds: DELAY_THRESHOLD_SECONDS,
            sequence: update.sequence,
          }),
        );
      }
    }
  }

  return signals;
}

function makeSignal(
  update: AgentUpdate,
  severity: AgentSignal["severity"],
  title: string,
  summary: string,
  evidence: Record<string, unknown>,
): AgentSignal {
  return {
    id: `feed-${update.id}-${title.toLowerCase().replaceAll(" ", "-")}`,
    fixtureId: update.fixtureId,
    agentType: "feed_health",
    severity,
    title,
    summary,
    evidence,
    sourceUpdateIds: [update.id],
    createdAt: update.ingestedAt,
    status: "open",
  };
}
