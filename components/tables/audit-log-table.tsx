import type { AuditLog, Fixture } from "@prisma/client";
import { StatusBadge } from "@/components/ui/status-badge";
import { RawJsonViewer } from "@/components/ui/raw-json-viewer";
import { formatDateTime } from "@/lib/utils";

export function AuditLogTable({ logs }: { logs: (AuditLog & { fixture?: Fixture | null })[] }) {
  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <article key={log.id} className="panel interactive-panel p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge variant={log.level === "warning" ? "warning" : log.level === "error" ? "danger" : "neutral"}>{log.level}</StatusBadge>
                <span className="mono text-xs text-[var(--text-secondary)]">{log.eventType}</span>
              </div>
              <p className="mt-2 text-sm font-semibold">{log.message}</p>
            </div>
            <span className="text-xs text-[var(--text-muted)]">{formatDateTime(log.createdAt)}</span>
          </div>
          {log.metadataJson && (
            <div className="mt-3">
              <RawJsonViewer value={log.metadataJson} />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
