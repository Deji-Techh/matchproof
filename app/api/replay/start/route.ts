import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { ensureDemoData } from "@/lib/db/demo-seed";
import { REPLAY_SPEEDS } from "@/lib/replay/replay-engine";
import { checkRateLimit } from "@/lib/security/rate-limit";

const BodySchema = z.object({
  fixtureId: z.string().min(1).max(120),
  speed: z.number().refine((value) => REPLAY_SPEEDS.includes(value as (typeof REPLAY_SPEEDS)[number])).default(1),
});

export async function POST(request: Request) {
  try {
    const limited = checkRateLimit(request, "replay-start", { limit: 40, windowMs: 60_000 });
    if (limited) return limited;

    await ensureDemoData();
    const body = BodySchema.parse(await request.json());
    const session = await prisma.replaySession.upsert({
      where: { id: "demo-replay-session" },
      update: {
        fixtureId: body.fixtureId,
        status: "running",
        speed: body.speed,
        startedAt: new Date(),
        endedAt: null,
        currentIndex: 0,
      },
      create: {
        id: "demo-replay-session",
        fixtureId: body.fixtureId,
        status: "running",
        speed: body.speed,
        startedAt: new Date(),
      },
    });
    await prisma.auditLog.create({
      data: {
        level: "info",
        eventType: "replay_started",
        message: `Replay started for fixture ${body.fixtureId}.`,
        fixtureId: body.fixtureId,
        metadataJson: JSON.stringify({ speed: body.speed }, null, 2),
      },
    });
    return NextResponse.json({ session });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid replay request" }, { status: 400 });
    return NextResponse.json({ error: "Unable to start replay" }, { status: 500 });
  }
}
