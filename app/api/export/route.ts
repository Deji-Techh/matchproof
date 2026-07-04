import { NextResponse } from "next/server";
import { ensureDemoData } from "@/lib/db/demo-seed";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await ensureDemoData();
    const [fixtures, feedUpdates, agentSignals, verificationResults, auditLogs, replaySessions] = await Promise.all([
      prisma.fixture.findMany({ orderBy: { startTime: "desc" } }),
      prisma.feedUpdate.findMany({ orderBy: { ingestedAt: "asc" } }),
      prisma.agentSignal.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.verificationResult.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.auditLog.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.replaySession.findMany({ orderBy: { startedAt: "desc" } }),
    ]);

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      product: "MatchProof",
      boundary: "sports-data integrity, verification, replay, and audit console",
      fixtures,
      feedUpdates,
      agentSignals,
      verificationResults,
      auditLogs,
      replaySessions,
    });
  } catch {
    return NextResponse.json({ error: "Unable to export audit evidence" }, { status: 500 });
  }
}
