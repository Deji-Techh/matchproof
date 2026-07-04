import { NextResponse } from "next/server";
import { getFixtures } from "@/lib/db/queries";

export async function GET() {
  try {
    return NextResponse.json({ fixtures: await getFixtures() });
  } catch {
    return NextResponse.json({ error: "Unable to load fixtures" }, { status: 500 });
  }
}
