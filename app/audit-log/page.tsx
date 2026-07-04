import { ScrollText } from "lucide-react";
import { AuditLogTable } from "@/components/tables/audit-log-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAuditLogs } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const logs = await getAuditLogs();

  return (
    <main className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <ScrollText className="h-6 w-6 text-[var(--info)]" />
            Audit Log
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            System events for ingestion, agents, replay, stream status, and proof activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge>info</StatusBadge>
          <StatusBadge variant="warning">warning</StatusBadge>
          <StatusBadge variant="danger">error</StatusBadge>
          <StatusBadge variant="proof">proof</StatusBadge>
        </div>
      </header>
      <AuditLogTable logs={logs} />
    </main>
  );
}
