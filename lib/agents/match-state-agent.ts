import type { AgentSignal, AgentUpdate } from "@/lib/agents/types";

export function runMatchStateAgent(updates: AgentUpdate[]): AgentSignal[] {
  const signals: AgentSignal[] = [];
  let previousScore: string | null = null;
  let previousPeriod: string | null = null;
  let previousUpdate: AgentUpdate | null = null;

  for (const update of updates) {
    const score = formatScore(update.payload.score);
    const period = typeof update.payload.period === "string" ? update.payload.period : null;

    if (previousScore && score && previousScore !== score) {
      signals.push({
        id: `state-score-${update.id}`,
        fixtureId: update.fixtureId,
        agentType: "match_state",
        severity: "low",
        title: "Score state changed",
        summary: `Fixture score changed from ${previousScore} to ${score}.`,
        evidence: {
          previousScore,
          nextScore: score,
          sequence: update.sequence,
        },
        sourceUpdateIds: previousUpdate ? [previousUpdate.id, update.id] : [update.id],
        createdAt: update.ingestedAt,
        status: "open",
      });
    }

    if (previousPeriod && period && previousPeriod !== period) {
      signals.push({
        id: `state-period-${update.id}`,
        fixtureId: update.fixtureId,
        agentType: "match_state",
        severity: "low",
        title: "Period changed",
        summary: `Fixture period changed from ${previousPeriod} to ${period}.`,
        evidence: {
          previousPeriod,
          nextPeriod: period,
          sequence: update.sequence,
        },
        sourceUpdateIds: previousUpdate ? [previousUpdate.id, update.id] : [update.id],
        createdAt: update.ingestedAt,
        status: "open",
      });
    }

    if (score) previousScore = score;
    if (period) previousPeriod = period;
    previousUpdate = update;
  }

  return signals;
}

function formatScore(score: AgentUpdate["payload"]["score"]) {
  if (!score) return null;
  const listedHome = score.listedHome;
  const listedAway = score.listedAway;
  if (typeof listedHome !== "number" || typeof listedAway !== "number") return null;
  return `${listedHome}-${listedAway}`;
}
