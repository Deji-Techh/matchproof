import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ensureDemoData } from "@/lib/db/demo-seed";

export async function POST() {
  try {
    await ensureDemoData();
    const session = await prisma.replaySession.findUnique({ where: { id: "demo-replay-session" } });
    if (!session) return NextResponse.json({ error: "Replay session not found" }, { status: 404 });

    const totalUpdates = await prisma.feedUpdate.count({ where: { fixtureId: session.fixtureId } });
    const nextIndex = Math.min(session.currentIndex + 1, totalUpdates);
    const status = nextIndex >= totalUpdates ? "completed" : "running";
    const updated = await prisma.replaySession.update({
      where: { id: session.id },
      data: {
        currentIndex: nextIndex,
        status,
        endedAt: status === "completed" ? new Date() : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        level: "info",
        eventType: status === "completed" ? "replay_completed" : "replay_advanced",
        message:
          status === "completed"
            ? `Replay completed for fixture ${session.fixtureId}.`
            : `Replay advanced to event ${nextIndex} of ${totalUpdates}.`,
        fixtureId: session.fixtureId,
        metadataJson: JSON.stringify({ currentIndex: nextIndex, totalUpdates }, null, 2),
      },
    });

    return NextResponse.json({ session: updated, totalUpdates });
  } catch {
    return NextResponse.json({ error: "Unable to advance replay" }, { status: 500 });
  }
}
