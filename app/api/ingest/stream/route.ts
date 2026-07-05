import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDemoData } from "@/lib/db/demo-seed";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getSafeTxlineStatus } from "@/lib/txline/auth";
import { audit } from "@/lib/txline/ingest";
import { captureScoresStream } from "@/lib/txline/streams";
import { requireOperatorKey } from "@/lib/security/operator-guard";

const BodySchema = z.object({
  fixtureId: z.string().min(1).max(120),
  maxMessages: z.number().int().min(1).max(20).default(8),
  maxDurationMs: z.number().int().min(1_000).max(20_000).default(10_000),
  lastEventId: z.string().min(1).max(160).optional(),
});

export async function POST(request: Request) {
  try {
    const unauthorized = requireOperatorKey(request);
    if (unauthorized) return unauthorized;

    const limited = checkRateLimit(request, "ingest-stream", { limit: 8, windowMs: 60_000 });
    if (limited) return limited;

    await ensureDemoData();
    const body = BodySchema.parse(await request.json());
    const txline = getSafeTxlineStatus();

    if (!txline.hasGuestJwt || !txline.hasApiToken) {
      await audit("warning", "stream_capture_skipped", "TxLINE credentials are not configured. Demo mode remains available.", body.fixtureId, {
        endpoint: "/scores/stream",
        network: txline.network,
      });
      return NextResponse.json(
        {
          ok: false,
          endpoint: "/scores/stream",
          error: "TxLINE credentials are not configured. Demo mode remains available.",
          messageCount: 0,
          heartbeatCount: 0,
          updates: [],
          signals: [],
        },
        { status: 202 },
      );
    }

    const result = await captureScoresStream(body);
    return NextResponse.json(result, { status: result.ok ? 200 : 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid stream capture request" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Unable to capture TxLINE score stream" }, { status: 500 });
  }
}
