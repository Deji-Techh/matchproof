import type { FeedUpdate, AgentSignal, VerificationResult } from "@prisma/client";
import { Activity, Radio, ShieldCheck, Siren } from "lucide-react";
import { RawJsonViewer } from "@/components/ui/raw-json-viewer";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/utils";

export function Timeline({
  updates,
  signals,
  verifications,
}: {
  updates: FeedUpdate[];
  signals: AgentSignal[];
  verifications: VerificationResult[];
}) {
  const items = [
    ...updates.map((item) => ({ type: "update" as const, at: item.ingestedAt, item })),
    ...signals.map((item) => ({ type: "signal" as const, at: item.createdAt, item })),
    ...verifications.map((item) => ({ type: "proof" as const, at: item.createdAt, item })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <div className="space-y-3">
      {items.map((entry) => {
        const Icon = entry.type === "update" ? Radio : entry.type === "signal" ? Siren : ShieldCheck;
        return (
          <article key={`${entry.type}-${entry.item.id}`} className="panel rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-2">
                <Icon className="h-4 w-4 text-[var(--info)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge variant={entry.type === "proof" ? "proof" : entry.type === "signal" ? "warning" : "info"}>
                    {entry.type}
                  </StatusBadge>
                  <span className="text-xs text-[var(--text-muted)]">{formatDateTime(entry.at)}</span>
                </div>
                {entry.type === "update" && (
                  <div className="mt-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-[var(--success)]" />
                      <span>Score update sequence {entry.item.sequence ?? "unknown"}</span>
                    </div>
                    <div className="mt-3">
                      <RawJsonViewer value={entry.item.rawJson} />
                    </div>
                  </div>
                )}
                {entry.type === "signal" && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={entry.item.severity} />
                      <h3 className="font-medium">{entry.item.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{entry.item.summary}</p>
                    <div className="mt-3">
                      <RawJsonViewer value={entry.item.evidenceJson} />
                    </div>
                  </div>
                )}
                {entry.type === "proof" && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge variant={entry.item.status === "verified" ? "success" : "warning"}>{entry.item.status}</StatusBadge>
                      <span className="mono text-xs text-[var(--text-secondary)]">
                        seq {entry.item.sequence ?? "unknown"} / stat {entry.item.statKey ?? "unknown"}
                      </span>
                    </div>
                    <div className="mt-3">
                      <RawJsonViewer value={entry.item.proofJson ?? "{}"} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
