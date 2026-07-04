import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { ensureDemoData } from "@/lib/db/demo-seed";

const ParamsSchema = z.object({ id: z.string().min(1).max(160) });

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDemoData();
    const parsed = ParamsSchema.parse(await params);
    const signal = await prisma.agentSignal.update({
      where: { id: parsed.id },
      data: { status: "acknowledged" },
    });
    await prisma.auditLog.create({
      data: {
        level: "info",
        eventType: "agent_signal_acknowledged",
        message: `Signal ${parsed.id} acknowledged by operator action.`,
        fixtureId: signal.fixtureId,
        metadataJson: JSON.stringify({ signalId: parsed.id }, null, 2),
      },
    });
    return NextResponse.json({ signal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid signal ID" }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to acknowledge signal" }, { status: 500 });
  }
}
