import { NextResponse } from "next/server";
import { ensureDemoData } from "@/lib/db/demo-seed";
import { ingestFixturesSnapshot } from "@/lib/txline/ingest";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { requireOperatorKey } from "@/lib/security/operator-guard";

export async function POST(request: Request) {
  try {
    const unauthorized = requireOperatorKey(request);
    if (unauthorized) return unauthorized;

    const limited = checkRateLimit(request, "ingest-fixtures", { limit: 10, windowMs: 60_000 });
    if (limited) return limited;

    await ensureDemoData();
    const result = await ingestFixturesSnapshot();
    return NextResponse.json(result, { status: result.ok ? 200 : 202 });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to ingest fixture snapshot" }, { status: 500 });
  }
}
