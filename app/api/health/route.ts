import { NextResponse } from "next/server";
import { getHealthSummary } from "@/lib/db/queries";
import { getSafeTxlineStatus } from "@/lib/txline/auth";

export async function GET() {
  try {
    const summary = await getHealthSummary();
    return NextResponse.json({
      ok: true,
      app: "MatchProof",
      summary,
      txline: getSafeTxlineStatus(),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Health check failed" }, { status: 500 });
  }
}
