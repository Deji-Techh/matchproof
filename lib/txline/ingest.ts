import type { FeedUpdate, Fixture } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { runAgentRuntime } from "@/lib/agents/runtime";
import type { AgentUpdate, AgentSignal } from "@/lib/agents/types";
import { appEventBus } from "@/lib/events/event-bus";
import {
  getFixturesSnapshot,
  getHistoricalScores,
  getScoresSnapshot,
  getScoresUpdatesByFixture,
} from "@/lib/txline/client";
import type { TxlineRequestResult } from "@/lib/txline/types";
import { parseJson } from "@/lib/utils";

type RecordValue = Record<string, unknown>;

export function isRecord(value: unknown): value is RecordValue {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function stringValue(record: RecordValue, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" || typeof value === "number") return String(value);
  }
  return undefined;
}

function booleanValue(record: RecordValue, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.toLowerCase() === "true";
  }
  return undefined;
}

export function dateValue(record: RecordValue, keys: string[]) {
  const value = stringValue(record, keys);
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function extractArray(value: unknown, preferredKeys: string[]): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [value].filter(Boolean);

  for (const key of preferredKeys) {
    const nested = value[key];
    if (Array.isArray(nested)) return nested;
    if (isRecord(nested)) {
      const nestedItems = extractArray(nested, preferredKeys);
      if (nestedItems.length > 0) return nestedItems;
    }
  }

  return [value];
}

export function getSequence(record: RecordValue) {
  return stringValue(record, ["seq", "Seq", "sequence", "Sequence", "SequenceNumber", "sequenceNumber"]);
}

export function getProviderTimestamp(record: RecordValue) {
  return dateValue(record, ["providerTimestamp", "ProviderTimestamp", "Timestamp", "timestamp", "UpdatedAt", "updatedAt"]);
}

export async function audit(level: string, eventType: string, message: string, fixtureId?: string, metadata?: RecordValue) {
  await prisma.auditLog.create({
    data: {
      level,
      eventType,
      message,
      fixtureId,
      metadataJson: metadata ? JSON.stringify(metadata, null, 2) : undefined,
    },
  });
  appEventBus.emit({
    type: eventType,
    at: new Date().toISOString(),
    fixtureId,
    payload: { level, message, metadata },
  });
}

export async function ingestFixturesSnapshot(): Promise<{
  ok: boolean;
  fixtures: Fixture[];
  error?: string;
  endpoint: string;
}> {
  const result = await getFixturesSnapshot();
  if (!result.ok) {
    await audit("warning", "fixture_snapshot_failed", "TxLINE fixture snapshot ingestion failed.", undefined, {
      endpoint: result.endpoint,
      status: result.status,
      error: result.error,
    });
    return { ok: false, fixtures: [], endpoint: result.endpoint, error: result.error };
  }

  const rows = extractArray(result.data, ["fixtures", "Fixtures", "items", "Items", "data", "Data"]);
  const fixtures = await Promise.all(
    rows.filter(isRecord).map((row) => {
      const fixtureId = stringValue(row, ["FixtureId", "fixtureId", "id", "Id"]);
      if (!fixtureId) return null;

      return prisma.fixture.upsert({
        where: { fixtureId },
        update: {
          competitionId: stringValue(row, ["CompetitionId", "competitionId"]),
          participant1: stringValue(row, ["Participant1", "participant1", "home", "Home"]),
          participant2: stringValue(row, ["Participant2", "participant2", "away", "Away"]),
          participant1IsHome: booleanValue(row, ["Participant1IsHome", "participant1IsHome"]),
          startTime: dateValue(row, ["StartTime", "startTime"]),
          status: stringValue(row, ["Status", "status"]),
          rawJson: JSON.stringify(row, null, 2),
        },
        create: {
          fixtureId,
          competitionId: stringValue(row, ["CompetitionId", "competitionId"]),
          participant1: stringValue(row, ["Participant1", "participant1", "home", "Home"]),
          participant2: stringValue(row, ["Participant2", "participant2", "away", "Away"]),
          participant1IsHome: booleanValue(row, ["Participant1IsHome", "participant1IsHome"]),
          startTime: dateValue(row, ["StartTime", "startTime"]),
          status: stringValue(row, ["Status", "status"]),
          rawJson: JSON.stringify(row, null, 2),
        },
      });
    }),
  );

  const stored = fixtures.filter((fixture): fixture is Fixture => Boolean(fixture));
  await audit("info", "fixture_snapshot_fetched", `Stored ${stored.length} fixture snapshot row(s).`, undefined, {
    endpoint: result.endpoint,
    rowCount: stored.length,
  });
  appEventBus.emit({
    type: "fixtures_stored",
    at: new Date().toISOString(),
    payload: { endpoint: result.endpoint, rowCount: stored.length },
  });

  return { ok: true, fixtures: stored, endpoint: result.endpoint };
}

export async function ingestScoreData(input: {
  fixtureId: string;
  mode: "snapshot" | "updates" | "historical";
}): Promise<{
  ok: boolean;
  updates: FeedUpdate[];
  error?: string;
  endpoint: string;
}> {
  const result = await fetchScoreData(input);
  if (!result.ok) {
    await audit("warning", "score_ingestion_failed", "TxLINE score ingestion failed.", input.fixtureId, {
      endpoint: result.endpoint,
      mode: input.mode,
      status: result.status,
      error: result.error,
    });
    return { ok: false, updates: [], endpoint: result.endpoint, error: result.error };
  }

  const rows = extractArray(result.data, ["scores", "Scores", "updates", "Updates", "items", "Items", "data", "Data"]).filter(isRecord);
  const { updates, signals } = await storeScoreRows({
    fixtureId: input.fixtureId,
    mode: input.mode,
    endpoint: result.endpoint,
    rows,
  });

  await audit("info", "score_update_stored", `Stored ${updates.length} score update row(s).`, input.fixtureId, {
    endpoint: result.endpoint,
    mode: input.mode,
    rowCount: updates.length,
    signalCount: signals.length,
  });

  return { ok: true, updates, endpoint: result.endpoint };
}

export async function storeScoreRows(input: {
  fixtureId: string;
  mode: "snapshot" | "updates" | "historical" | "stream";
  endpoint: string;
  rows: RecordValue[];
}): Promise<{ updates: FeedUpdate[]; signals: AgentSignal[] }> {
  const updates = await Promise.all(
    input.rows.map((row) =>
      prisma.feedUpdate.create({
        data: {
          fixtureId: input.fixtureId,
          sourceType: "scores",
          sourceMode: input.mode,
          endpoint: input.endpoint,
          sequence: getSequence(row),
          providerTimestamp: getProviderTimestamp(row),
          rawJson: JSON.stringify(row, null, 2),
        },
      }),
    ),
  );

  appEventBus.emit({
    type: "score_updates_stored",
    at: new Date().toISOString(),
    fixtureId: input.fixtureId,
    payload: { endpoint: input.endpoint, mode: input.mode, rowCount: updates.length },
  });

  const signals = updates.length > 0 ? await runAgentsForFixture(input.fixtureId) : [];
  return { updates, signals };
}

export async function runAgentsForFixture(fixtureId: string) {
  const feedUpdates = await prisma.feedUpdate.findMany({
    where: { fixtureId },
    orderBy: { ingestedAt: "asc" },
  });
  const agentUpdates = feedUpdates.map(toAgentUpdate);
  const signals = runAgentRuntime(agentUpdates).filter((signal) => signal.fixtureId === fixtureId);

  await Promise.all(
    signals.map((signal) =>
      prisma.agentSignal.upsert({
        where: { id: signal.id },
        update: {
          severity: signal.severity,
          title: signal.title,
          summary: signal.summary,
          evidenceJson: JSON.stringify(signal.evidence, null, 2),
          sourceUpdateIds: JSON.stringify(signal.sourceUpdateIds),
          status: signal.status,
        },
        create: {
          id: signal.id,
          fixtureId: signal.fixtureId,
          agentType: signal.agentType,
          severity: signal.severity,
          title: signal.title,
          summary: signal.summary,
          evidenceJson: JSON.stringify(signal.evidence, null, 2),
          sourceUpdateIds: JSON.stringify(signal.sourceUpdateIds),
          status: signal.status,
          createdAt: new Date(signal.createdAt),
        },
      }),
    ),
  );

  if (signals.length > 0) {
    await audit("info", "agent_signal_created", `Agent runtime produced ${signals.length} signal(s).`, fixtureId, {
      signalCount: signals.length,
      source: "score_ingestion",
    });
    appEventBus.emit({
      type: "agent_signals_created",
      at: new Date().toISOString(),
      fixtureId,
      payload: { signalCount: signals.length },
    });
  }

  return signals;
}

function toAgentUpdate(update: FeedUpdate): AgentUpdate {
  const payload = parseJson<Record<string, unknown>>(update.rawJson, {});

  return {
    id: update.id,
    fixtureId: update.fixtureId ?? String(payload.fixtureId ?? payload.FixtureId ?? ""),
    sourceMode: update.sourceMode as AgentUpdate["sourceMode"],
    sequence: update.sequence ?? undefined,
    providerTimestamp: update.providerTimestamp?.toISOString(),
    ingestedAt: update.ingestedAt.toISOString(),
    payload,
  };
}

function fetchScoreData(input: {
  fixtureId: string;
  mode: "snapshot" | "updates" | "historical";
}): Promise<TxlineRequestResult<unknown>> {
  if (input.mode === "historical") return getHistoricalScores(input.fixtureId);
  if (input.mode === "updates") return getScoresUpdatesByFixture(input.fixtureId);
  return getScoresSnapshot(input.fixtureId);
}
