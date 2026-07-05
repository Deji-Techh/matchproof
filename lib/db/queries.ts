import { prisma } from "@/lib/db/prisma";
import { ensureDemoData } from "@/lib/db/demo-seed";

export async function getHealthSummary() {
  await ensureDemoData();
  const [fixtureCount, updateCount, signalCount, verificationCount, latestUpdate] = await Promise.all([
    prisma.fixture.count(),
    prisma.feedUpdate.count(),
    prisma.agentSignal.count(),
    prisma.verificationResult.count(),
    prisma.feedUpdate.findFirst({ orderBy: { ingestedAt: "desc" } }),
  ]);

  return {
    mode: process.env.ENABLE_DEMO_MODE === "true" ? "demo" : "live",
    fixtureCount,
    updateCount,
    signalCount,
    verificationCount,
    latestUpdateAt: latestUpdate?.ingestedAt ?? null,
  };
}

export async function getCommandCenterData() {
  await ensureDemoData();
  const [fixtures, signals, auditLogs, verifications, latestUpdate, updateCount] = await Promise.all([
    prisma.fixture.findMany({
      orderBy: { startTime: "desc" },
      include: {
        signals: true,
        verifications: true,
        updates: { orderBy: { ingestedAt: "desc" }, take: 1 },
      },
    }),
    prisma.agentSignal.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { fixture: true } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.verificationResult.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.feedUpdate.findFirst({ orderBy: { ingestedAt: "desc" } }),
    prisma.feedUpdate.count(),
  ]);

  return { fixtures, signals, auditLogs, verifications, latestUpdate, updateCount };
}

export async function getFixtures() {
  await ensureDemoData();
  return prisma.fixture.findMany({
    orderBy: { startTime: "desc" },
    include: {
      signals: true,
      verifications: true,
      updates: { orderBy: { ingestedAt: "desc" }, take: 1 },
    },
  });
}

export async function getFixtureMonitor(fixtureId: string) {
  await ensureDemoData();
  return prisma.fixture.findUnique({
    where: { fixtureId },
    include: {
      updates: { orderBy: { ingestedAt: "asc" } },
      signals: { orderBy: { createdAt: "desc" } },
      verifications: { orderBy: { createdAt: "desc" } },
      auditLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      replaySessions: { orderBy: { startedAt: "desc" }, take: 1 },
    },
  });
}

export async function getSignals() {
  await ensureDemoData();
  return prisma.agentSignal.findMany({
    orderBy: { createdAt: "desc" },
    include: { fixture: true },
  });
}

export async function getAuditLogs() {
  await ensureDemoData();
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { fixture: true },
  });
}

export async function getVerificationResults() {
  await ensureDemoData();
  return prisma.verificationResult.findMany({
    orderBy: { createdAt: "desc" },
    include: { fixture: true, sourceUpdate: true },
  });
}

export async function getReplayData() {
  await ensureDemoData();
  const fixtures = await getFixtures();
  const activeFixture =
    fixtures.find((fixture) => fixture.status === "live") ??
    fixtures.find((fixture) => fixture.updates.length > 0) ??
    fixtures[0] ??
    null;
  const fixture = activeFixture ? await getFixtureMonitor(activeFixture.fixtureId) : null;
  return { fixtures, fixture };
}
