import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { ensureDemoData } from "@/lib/db/demo-seed";
import { createProofSignal } from "@/lib/agents/proof-agent";
import { getSafeTxlineStatus } from "@/lib/txline/auth";
import { getScoreStatValidation } from "@/lib/txline/client";

const BodySchema = z.object({
  fixtureId: z.string().min(1).max(120),
  sourceUpdateId: z.string().min(1).max(160).optional(),
  sequence: z.string().min(1).max(80),
  statKey: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  try {
    await ensureDemoData();
    const body = BodySchema.parse(await request.json());
    const txline = getSafeTxlineStatus();
    const canCallTxline = txline.hasGuestJwt && txline.hasApiToken;
    const validation = canCallTxline
      ? await getScoreStatValidation({ fixtureId: body.fixtureId, seq: body.sequence, statKey: body.statKey })
      : {
          ok: false as const,
          endpoint: "/scores/stat-validation",
          error: "TxLINE credentials are not configured. Demo mode remains available.",
        };

    const status = validation.ok ? "verified" : canCallTxline ? "failed" : "unsupported";
    const verification = await prisma.verificationResult.create({
      data: {
        fixtureId: body.fixtureId,
        sourceUpdateId: body.sourceUpdateId,
        sequence: body.sequence,
        statKey: body.statKey,
        network: txline.network,
        status,
        proofJson: JSON.stringify(validation, null, 2),
        resultJson: JSON.stringify(
          {
            verified: validation.ok,
            source: validation.endpoint,
            demoFallback: !canCallTxline,
          },
          null,
          2,
        ),
        errorMessage: validation.ok ? null : validation.error,
      },
    });

    await prisma.auditLog.create({
      data: {
        level: validation.ok ? "info" : "warning",
        eventType: validation.ok ? "verification_passed" : "verification_failed",
        message: validation.ok
          ? `Score/stat validation passed for fixture ${body.fixtureId}.`
          : `Score/stat validation did not complete for fixture ${body.fixtureId}.`,
        fixtureId: body.fixtureId,
        metadataJson: JSON.stringify({ verificationId: verification.id, status }, null, 2),
      },
    });

    const proofSignal = createProofSignal({
      fixtureId: body.fixtureId,
      sourceUpdateId: body.sourceUpdateId,
      sequence: body.sequence,
      statKey: body.statKey,
      status,
    });
    await prisma.agentSignal.upsert({
      where: { id: proofSignal.id },
      update: {
        severity: proofSignal.severity,
        title: proofSignal.title,
        summary: proofSignal.summary,
        evidenceJson: JSON.stringify(proofSignal.evidence, null, 2),
        sourceUpdateIds: JSON.stringify(proofSignal.sourceUpdateIds),
        status: proofSignal.status,
      },
      create: {
        id: proofSignal.id,
        fixtureId: proofSignal.fixtureId,
        agentType: proofSignal.agentType,
        severity: proofSignal.severity,
        title: proofSignal.title,
        summary: proofSignal.summary,
        evidenceJson: JSON.stringify(proofSignal.evidence, null, 2),
        sourceUpdateIds: JSON.stringify(proofSignal.sourceUpdateIds),
        status: proofSignal.status,
        createdAt: new Date(proofSignal.createdAt),
      },
    });

    return NextResponse.json({ verification });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
    return NextResponse.json({ error: "Unable to verify score stat" }, { status: 500 });
  }
}
