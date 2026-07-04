import type { FeedUpdate, Fixture } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  getFixturesSnapshot,
  getHistoricalScores,
  getScoresSnapshot,
  getScoresUpdatesByFixture,
} from "@/lib/txline/client";
import type { TxlineRequestResult } from "@/lib/txline/types";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(record: RecordValue, keys: string[]) {
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

function dateValue(record: RecordValue, keys: string[]) {
  const value = stringValue(record, keys);
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function extractArray(value: unknown, preferredKeys: string[]): unknown[] {
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

function getSequence(record: RecordValue) {
  return stringValue(record, ["seq", "Seq", "sequence", "Sequence", "SequenceNumber", "sequenceNumber"]);
}

function getProviderTimestamp(record: RecordValue) {
  return dateValue(record, ["providerTimestamp", "ProviderTimestamp", "Timestamp", "timestamp", "UpdatedAt", "updatedAt"]);
}

async function audit(level: string, eventType: string, message: string, fixtureId?: string, metadata?: RecordValue) {
  await prisma.auditLog.create({
    data: {
      level,
      eventType,
      message,
      fixtureId,
      metadataJson: metadata ? JSON.stringify(metadata, null, 2) : undefined,
    },
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

  const rows = extractArray(result.data, ["scores", "Scores", "updates", "Updates", "items", "Items", "data", "Data"]);
  const updates = await Promise.all(
    rows.filter(isRecord).map((row) =>
      prisma.feedUpdate.create({
        data: {
          fixtureId: input.fixtureId,
          sourceType: "scores",
          sourceMode: input.mode,
          endpoint: result.endpoint,
          sequence: getSequence(row),
          providerTimestamp: getProviderTimestamp(row),
          rawJson: JSON.stringify(row, null, 2),
        },
      }),
    ),
  );

  await audit("info", "score_update_stored", `Stored ${updates.length} score update row(s).`, input.fixtureId, {
    endpoint: result.endpoint,
    mode: input.mode,
    rowCount: updates.length,
  });

  return { ok: true, updates, endpoint: result.endpoint };
}

function fetchScoreData(input: {
  fixtureId: string;
  mode: "snapshot" | "updates" | "historical";
}): Promise<TxlineRequestResult<unknown>> {
  if (input.mode === "historical") return getHistoricalScores(input.fixtureId);
  if (input.mode === "updates") return getScoresUpdatesByFixture(input.fixtureId);
  return getScoresSnapshot(input.fixtureId);
}
