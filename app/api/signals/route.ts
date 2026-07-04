import { NextResponse } from "next/server";
import { getSignals } from "@/lib/db/queries";

export async function GET() {
  try {
    return NextResponse.json({ signals: await getSignals() });
  } catch {
    return NextResponse.json({ error: "Unable to load signals" }, { status: 500 });
  }
}
