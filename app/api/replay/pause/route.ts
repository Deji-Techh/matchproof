import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ensureDemoData } from "@/lib/db/demo-seed";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const limited = checkRateLimit(request, "replay-pause", { limit: 40, windowMs: 60_000 });
    if (limited) return limited;

    await ensureDemoData();
    const session = await prisma.replaySession.update({
      where: { id: "demo-replay-session" },
      data: { status: "paused" },
    });
    await prisma.auditLog.create({
      data: {
        level: "info",
        eventType: "replay_paused",
        message: `Replay paused for fixture ${session.fixtureId}.`,
        fixtureId: session.fixtureId,
      },
    });
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "Unable to pause replay" }, { status: 500 });
  }
}
