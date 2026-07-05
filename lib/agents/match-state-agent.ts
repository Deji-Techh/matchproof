import type { AgentSignal, AgentUpdate } from "@/lib/agents/types";

export function runMatchStateAgent(updates: AgentUpdate[]): AgentSignal[] {
  const signals: AgentSignal[] = [];
  const stateByFixture = new Map<
    string,
    {
      previousScore: string | null;
      previousPeriod: string | null;
      previousUpdate: AgentUpdate | null;
    }
  >();

  for (const update of updates) {
    const fixtureKey = update.fixtureId || "unknown";
    const state =
      stateByFixture.get(fixtureKey) ??
      ({
        previousScore: null,
        previousPeriod: null,
        previousUpdate: null,
      } satisfies {
        previousScore: string | null;
        previousPeriod: string | null;
        previousUpdate: AgentUpdate | null;
      });
    const score = formatScore(update.payload.score);
    const period = typeof update.payload.period === "string" ? update.payload.period : null;

    if (state.previousScore && score && state.previousScore !== score) {
      signals.push({
        id: `state-score-${update.id}`,
        fixtureId: update.fixtureId,
        agentType: "match_state",
        severity: "low",
        title: "Score state changed",
        summary: `Fixture score changed from ${state.previousScore} to ${score}.`,
        evidence: {
          previousScore: state.previousScore,
          nextScore: score,
          sequence: update.sequence,
        },
        sourceUpdateIds: state.previousUpdate ? [state.previousUpdate.id, update.id] : [update.id],
        createdAt: update.ingestedAt,
        status: "open",
      });
    }

    if (state.previousPeriod && period && state.previousPeriod !== period) {
      signals.push({
        id: `state-period-${update.id}`,
        fixtureId: update.fixtureId,
        agentType: "match_state",
        severity: "low",
        title: "Period changed",
        summary: `Fixture period changed from ${state.previousPeriod} to ${period}.`,
        evidence: {
          previousPeriod: state.previousPeriod,
          nextPeriod: period,
          sequence: update.sequence,
        },
        sourceUpdateIds: state.previousUpdate ? [state.previousUpdate.id, update.id] : [update.id],
        createdAt: update.ingestedAt,
        status: "open",
      });
    }

    if (score) state.previousScore = score;
    if (period) state.previousPeriod = period;
    state.previousUpdate = update;
    stateByFixture.set(fixtureKey, state);
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
