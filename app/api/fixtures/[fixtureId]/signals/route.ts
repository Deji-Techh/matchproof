import { NextResponse } from "next/server";
import { z } from "zod";
import { getFixtureMonitor } from "@/lib/db/queries";

const ParamsSchema = z.object({ fixtureId: z.string().min(1).max(120) });

export async function GET(_request: Request, { params }: { params: Promise<{ fixtureId: string }> }) {
  try {
    const parsed = ParamsSchema.parse(await params);
    const fixture = await getFixtureMonitor(parsed.fixtureId);
    if (!fixture) return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
    return NextResponse.json({ signals: fixture.signals });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid fixture ID" }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to load fixture signals" }, { status: 500 });
  }
}
