import { NextResponse } from "next/server";
import { ensureDemoData } from "@/lib/db/demo-seed";
import { getHealthSummary } from "@/lib/db/queries";

export async function POST() {
  if (process.env.ENABLE_DEMO_MODE !== "true") {
    return NextResponse.json(
      {
        ok: false,
        mode: "live",
        error: "Demo seeding is disabled because ENABLE_DEMO_MODE is not true.",
      },
      { status: 409 },
    );
  }

  try {
    await ensureDemoData();
    return NextResponse.json({
      ok: true,
      mode: "demo",
      summary: await getHealthSummary(),
    });
  } catch (error) {
    console.error("Demo seed failed", error);
    return NextResponse.json({ ok: false, error: "Unable to seed demo data." }, { status: 500 });
  }
}
