import assert from "node:assert/strict";
import { runAgentRuntime } from "@/lib/agents/runtime";
import { getReconnectDelayMs, parseSseBuffer } from "@/lib/txline/streams";
import { toAgentUpdate } from "@/lib/replay/replay-engine";
import {
  getFixturesSnapshot,
  getHistoricalScores,
  getScoreStatValidation,
  getScoresSnapshot,
  getScoresUpdatesByFixture,
  getScoresUpdatesByTime,
} from "@/lib/txline/client";

const updates = [
  {
    id: "u1",
    fixtureId: "f1",
    sourceMode: "seed" as const,
    sequence: "1",
    providerTimestamp: "2026-07-04T15:00:00.000Z",
    ingestedAt: "2026-07-04T15:00:01.000Z",
    payload: { fixtureId: "f1", seq: 1, period: "1H", score: { listedHome: 0, listedAway: 0 } },
  },
  {
    id: "u2",
    fixtureId: "f1",
    sourceMode: "seed" as const,
    sequence: "2",
    providerTimestamp: "2026-07-04T15:01:00.000Z",
    ingestedAt: "2026-07-04T15:03:00.000Z",
    payload: { fixtureId: "f1", seq: 2, period: "1H", score: { listedHome: 1, listedAway: 0 } },
  },
  {
    id: "u3",
    fixtureId: "f1",
    sourceMode: "seed" as const,
    sequence: "2",
    providerTimestamp: "2026-07-04T15:01:00.000Z",
    ingestedAt: "2026-07-04T15:03:02.000Z",
    payload: { fixtureId: "f1", seq: 2, period: "1H", score: { listedHome: 1, listedAway: 0 } },
  },
];

const signals = runAgentRuntime(updates);
assert.equal(signals.some((signal) => signal.title === "Score state changed"), true);
assert.equal(signals.some((signal) => signal.title === "Duplicate score update detected"), true);
assert.equal(signals.some((signal) => signal.title === "Score stream delay detected"), true);

const messages = parseSseBuffer("event: score\ndata: {\"seq\":1}\n\nid: 2\ndata: ok\n\n");
assert.equal(messages.length, 2);
assert.equal(messages[0]?.event, "score");
assert.equal(messages[1]?.id, "2");
assert.equal(getReconnectDelayMs(4), 8000);
assert.equal(typeof toAgentUpdate, "function");
assert.equal(typeof getFixturesSnapshot, "function");
assert.equal(typeof getScoresSnapshot, "function");
assert.equal(typeof getScoresUpdatesByFixture, "function");
assert.equal(typeof getScoresUpdatesByTime, "function");
assert.equal(typeof getHistoricalScores, "function");
assert.equal(typeof getScoreStatValidation, "function");

console.log("Smoke tests passed");
