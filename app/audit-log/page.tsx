import { ScrollText } from "lucide-react";
import { AuditLogTable } from "@/components/tables/audit-log-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAuditLogs } from "@/lib/db/queries";
import { ExportJsonButton } from "@/components/export/export-json-button";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const logs = await getAuditLogs();

  return (
    <main className="space-y-5">
      <PageHeader
        icon={ScrollText}
        eyebrow="Evidence ledger"
        title="Audit Log"
        detail="System events for ingestion, agents, replay, stream status, and proof activity."
      >
        <div className="flex flex-wrap gap-2">
          <ExportJsonButton />
          <StatusBadge>info</StatusBadge>
          <StatusBadge variant="warning">warning</StatusBadge>
          <StatusBadge variant="danger">error</StatusBadge>
          <StatusBadge variant="proof">proof</StatusBadge>
        </div>
      </PageHeader>
      <AuditLogTable logs={logs} />
    </main>
  );
}
