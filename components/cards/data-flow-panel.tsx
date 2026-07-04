import { Archive, Database, Radio, ScrollText, ShieldCheck, Siren } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

const nodes = [
  { label: "TxLINE", detail: "Fixtures + scores", icon: Radio, tone: "text-[var(--info)]" },
  { label: "Raw Store", detail: "Payload evidence", icon: Database, tone: "text-[var(--text-secondary)]" },
  { label: "Agents", detail: "Deterministic signals", icon: Siren, tone: "text-[var(--warning)]" },
  { label: "Proof", detail: "Stat validation", icon: ShieldCheck, tone: "text-[var(--proof)]" },
  { label: "Audit", detail: "Replayable log", icon: ScrollText, tone: "text-[var(--success)]" },
];

export function DataFlowPanel() {
  return (
    <section className="panel rounded-md p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Archive className="h-4 w-4 text-[var(--info)]" />
            Evidence Flow
          </h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Operational path from feed arrival to reviewable proof.</p>
        </div>
        <StatusBadge variant="info">deterministic</StatusBadge>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-5">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <div key={node.label} className="relative rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${node.tone}`} />
                <span className="text-sm font-medium">{node.label}</span>
              </div>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">{node.detail}</p>
              {index < nodes.length - 1 && (
                <span className="absolute right-[-7px] top-1/2 hidden h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-[var(--border-strong)] bg-[var(--bg-elevated)] md:block" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
