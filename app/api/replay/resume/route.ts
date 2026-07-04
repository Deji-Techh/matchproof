import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ensureDemoData } from "@/lib/db/demo-seed";

export async function POST() {
  try {
    await ensureDemoData();
    const session = await prisma.replaySession.update({
      where: { id: "demo-replay-session" },
      data: { status: "running" },
    });
    await prisma.auditLog.create({
      data: {
        level: "info",
        eventType: "replay_resumed",
        message: `Replay resumed for fixture ${session.fixtureId}.`,
        fixtureId: session.fixtureId,
      },
    });
    return NextResponse.json({ session });
  } catch {
    return NextResponse.json({ error: "Unable to resume replay" }, { status: 500 });
  }
}
