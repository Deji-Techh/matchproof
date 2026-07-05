import assert from "node:assert/strict";
import { runAgentRuntime } from "@/lib/agents/runtime";
import { requireOperatorKey } from "@/lib/security/operator-guard";
import { captureScoresStream, getReconnectDelayMs, parseSseBuffer } from "@/lib/txline/streams";
import { getStreamWorkerStatus, startStreamWorker, stopStreamWorker } from "@/lib/txline/stream-worker";
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

const multiFixtureSignals = runAgentRuntime([
  {
    id: "fixture-a-seq-1",
    fixtureId: "fixture-a",
    sourceMode: "stream",
    sequence: "1002",
    providerTimestamp: "2026-07-04T15:00:00.000Z",
    ingestedAt: "2026-07-04T15:00:01.000Z",
    payload: { fixtureId: "fixture-a", seq: 1002, period: "1H", score: { listedHome: 0, listedAway: 0 } },
  },
  {
    id: "fixture-b-seq-1",
    fixtureId: "fixture-b",
    sourceMode: "stream",
    sequence: "1002",
    providerTimestamp: "2026-07-04T15:00:02.000Z",
    ingestedAt: "2026-07-04T15:00:03.000Z",
    payload: { fixtureId: "fixture-b", seq: 1002, period: "1H", score: { listedHome: 0, listedAway: 0 } },
  },
]);
assert.equal(multiFixtureSignals.some((signal) => signal.title === "Duplicate score update detected"), false);
assert.equal(multiFixtureSignals.some((signal) => signal.title === "Score state changed"), false);

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
assert.equal(typeof captureScoresStream, "function");
assert.equal(typeof getStreamWorkerStatus, "function");
assert.equal(typeof startStreamWorker, "function");
assert.equal(typeof stopStreamWorker, "function");

const originalDemoMode = process.env.ENABLE_DEMO_MODE;
const originalOperatorKey = process.env.MATCHPROOF_OPERATOR_KEY;
process.env.ENABLE_DEMO_MODE = "false";
delete process.env.MATCHPROOF_OPERATOR_KEY;
assert.equal(requireOperatorKey(new Request("http://localhost"))?.status, 403);
process.env.MATCHPROOF_OPERATOR_KEY = "operator-secret";
assert.equal(requireOperatorKey(new Request("http://localhost", { headers: { "x-matchproof-operator-key": "wrong" } }))?.status, 401);
assert.equal(requireOperatorKey(new Request("http://localhost", { headers: { "x-matchproof-operator-key": "operator-secret" } })), null);
if (originalDemoMode === undefined) delete process.env.ENABLE_DEMO_MODE;
else process.env.ENABLE_DEMO_MODE = originalDemoMode;
if (originalOperatorKey === undefined) delete process.env.MATCHPROOF_OPERATOR_KEY;
else process.env.MATCHPROOF_OPERATOR_KEY = originalOperatorKey;

console.log("Smoke tests passed");
