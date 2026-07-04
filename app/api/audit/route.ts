import { NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/db/queries";

export async function GET() {
  try {
    return NextResponse.json({ auditLogs: await getAuditLogs() });
  } catch {
    return NextResponse.json({ error: "Unable to load audit logs" }, { status: 500 });
  }
}
