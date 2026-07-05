import { prisma } from "@/lib/db/prisma";
import {
  demoAuditLogs,
  demoFeedUpdates,
  demoFixture,
  demoFixtures,
  demoSignals,
  demoVerification,
} from "@/lib/demo-data";

let seeded = false;

export async function ensureDemoData() {
  if (process.env.ENABLE_DEMO_MODE !== "true") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (seeded) return;

  const fixtures = await Promise.all(
    demoFixtures.map((item) =>
      prisma.fixture.upsert({
        where: { fixtureId: item.fixtureId },
        update: {
          competitionId: item.competitionId,
          participant1: item.participant1,
          participant2: item.participant2,
          participant1IsHome: item.participant1IsHome,
          startTime: new Date(item.startTime),
          status: item.status,
          rawJson: JSON.stringify(item.raw, null, 2),
        },
        create: {
          fixtureId: item.fixtureId,
          competitionId: item.competitionId,
          participant1: item.participant1,
          participant2: item.participant2,
          participant1IsHome: item.participant1IsHome,
          startTime: new Date(item.startTime),
          status: item.status,
          rawJson: JSON.stringify(item.raw, null, 2),
        },
      }),
    ),
  );
  const fixture = fixtures.find((item) => item.fixtureId === demoFixture.fixtureId) ?? fixtures[0];

  await Promise.all(
    demoFeedUpdates.map((update) =>
      prisma.feedUpdate.upsert({
      where: { id: update.id },
      update: {
        fixtureId: update.fixtureId ?? fixture.fixtureId,
        sourceType: "scores",
        sourceMode: update.sourceMode,
        endpoint: "/api/scores/stream",
        sequence: update.sequence,
        providerTimestamp: new Date(update.providerTimestamp),
        ingestedAt: new Date(update.ingestedAt),
        rawJson: JSON.stringify(update.raw, null, 2),
      },
      create: {
        id: update.id,
        fixtureId: update.fixtureId ?? fixture.fixtureId,
        sourceType: "scores",
        sourceMode: update.sourceMode,
        endpoint: "/api/scores/stream",
        sequence: update.sequence,
        providerTimestamp: new Date(update.providerTimestamp),
        ingestedAt: new Date(update.ingestedAt),
        rawJson: JSON.stringify(update.raw, null, 2),
      },
      }),
    ),
  );

  await Promise.all(
    demoSignals.map((signal) =>
      prisma.agentSignal.upsert({
      where: { id: signal.id },
      update: {
        fixtureId: fixture.fixtureId,
        agentType: signal.agentType,
        severity: signal.severity,
        title: signal.title,
        summary: signal.summary,
        evidenceJson: JSON.stringify(signal.evidence, null, 2),
        sourceUpdateIds: JSON.stringify(signal.sourceUpdateIds),
        status: "open",
        createdAt: new Date(signal.createdAt),
      },
      create: {
        id: signal.id,
        fixtureId: fixture.fixtureId,
        agentType: signal.agentType,
        severity: signal.severity,
        title: signal.title,
        summary: signal.summary,
        evidenceJson: JSON.stringify(signal.evidence, null, 2),
        sourceUpdateIds: JSON.stringify(signal.sourceUpdateIds),
        status: "open",
        createdAt: new Date(signal.createdAt),
      },
      }),
    ),
  );

  await prisma.verificationResult.upsert({
    where: { id: demoVerification.id },
    update: {
      fixtureId: fixture.fixtureId,
      sourceUpdateId: demoVerification.sourceUpdateId,
      statKey: demoVerification.statKey,
      sequence: demoVerification.sequence,
      network: demoVerification.network,
      status: demoVerification.status,
      proofJson: JSON.stringify(demoVerification.proof, null, 2),
      resultJson: JSON.stringify(demoVerification.result, null, 2),
    },
    create: {
      id: demoVerification.id,
      fixtureId: fixture.fixtureId,
      sourceUpdateId: demoVerification.sourceUpdateId,
      statKey: demoVerification.statKey,
      sequence: demoVerification.sequence,
      network: demoVerification.network,
      status: demoVerification.status,
      proofJson: JSON.stringify(demoVerification.proof, null, 2),
      resultJson: JSON.stringify(demoVerification.result, null, 2),
    },
  });

  await Promise.all(
    demoAuditLogs.map((audit) =>
      prisma.auditLog.upsert({
      where: {
        id: `demo-audit-${audit.eventType}-${audit.createdAt}`,
      },
      update: {
        level: audit.level,
        eventType: audit.eventType,
        message: audit.message,
        fixtureId: fixture.fixtureId,
        metadataJson: JSON.stringify(audit.metadata, null, 2),
        createdAt: new Date(audit.createdAt),
      },
      create: {
        id: `demo-audit-${audit.eventType}-${audit.createdAt}`,
        level: audit.level,
        eventType: audit.eventType,
        message: audit.message,
        fixtureId: fixture.fixtureId,
        metadataJson: JSON.stringify(audit.metadata, null, 2),
        createdAt: new Date(audit.createdAt),
      },
      }),
    ),
  );

  await prisma.replaySession.upsert({
    where: { id: "demo-replay-session" },
    update: {
      fixtureId: fixture.fixtureId,
      status: "idle",
      speed: 1,
      currentIndex: 0,
    },
    create: {
      id: "demo-replay-session",
      fixtureId: fixture.fixtureId,
      status: "idle",
      speed: 1,
      currentIndex: 0,
    },
  });

  seeded = true;
}
