import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDemoData } from "@/lib/db/demo-seed";
import { requireOperatorKey } from "@/lib/security/operator-guard";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStreamWorkerStatus, startStreamWorker, stopStreamWorker } from "@/lib/txline/stream-worker";

const BodySchema = z.object({
  action: z.enum(["start", "stop"]),
  fixtureId: z.string().min(1).max(120).optional(),
  captureWindowMs: z.number().int().min(5_000).max(60_000).optional(),
  maxMessages: z.number().int().min(1).max(100).optional(),
});

export async function GET() {
  return NextResponse.json({ status: getStreamWorkerStatus() });
}

export async function POST(request: Request) {
  try {
    const unauthorized = requireOperatorKey(request);
    if (unauthorized) return unauthorized;

    const limited = checkRateLimit(request, "stream-worker", { limit: 12, windowMs: 60_000 });
    if (limited) return limited;

    await ensureDemoData();
    const body = BodySchema.parse(await request.json());
    if (body.action === "stop") return NextResponse.json(await stopStreamWorker());
    if (!body.fixtureId) {
      return NextResponse.json({ ok: false, error: "fixtureId is required to start the stream worker" }, { status: 400 });
    }

    const result = await startStreamWorker({
      fixtureId: body.fixtureId,
      captureWindowMs: body.captureWindowMs,
      maxMessages: body.maxMessages,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid stream worker request" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Unable to update stream worker" }, { status: 500 });
  }
}
