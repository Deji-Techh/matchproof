import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDemoData } from "@/lib/db/demo-seed";
import { ingestScoreData } from "@/lib/txline/ingest";

const BodySchema = z.object({
  fixtureId: z.string().min(1).max(120),
  mode: z.enum(["snapshot", "updates", "historical"]).default("snapshot"),
});

export async function POST(request: Request) {
  try {
    await ensureDemoData();
    const body = BodySchema.parse(await request.json());
    const result = await ingestScoreData(body);
    return NextResponse.json(result, { status: result.ok ? 200 : 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid score ingestion request" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Unable to ingest score data" }, { status: 500 });
  }
}
