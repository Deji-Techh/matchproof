import { NextResponse } from "next/server";
import { ensureDemoData } from "@/lib/db/demo-seed";
import { ingestFixturesSnapshot } from "@/lib/txline/ingest";

export async function POST() {
  try {
    await ensureDemoData();
    const result = await ingestFixturesSnapshot();
    return NextResponse.json(result, { status: result.ok ? 200 : 202 });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to ingest fixture snapshot" }, { status: 500 });
  }
}
