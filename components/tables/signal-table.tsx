import Link from "next/link";
import { Eye, History, ShieldCheck } from "lucide-react";
import type { AgentSignal, Fixture } from "@prisma/client";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/utils";
import { SignalAcknowledgeButton } from "@/components/tables/signal-acknowledge-button";

type SignalRow = AgentSignal & { fixture?: Fixture | null };

export function SignalTable({ signals }: { signals: SignalRow[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-[var(--border-subtle)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--bg-elevated)] text-xs uppercase text-[var(--text-muted)]">
          <tr>
            <th className="px-3 py-2">Severity</th>
            <th className="px-3 py-2">Agent</th>
            <th className="px-3 py-2">Signal</th>
            <th className="px-3 py-2">Fixture</th>
            <th className="px-3 py-2">Created</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((signal) => (
            <tr key={signal.id} className="border-t border-[var(--border-subtle)] align-top hover:bg-[var(--bg-hover)]">
              <td className="px-3 py-3">
                <SeverityBadge severity={signal.severity} />
              </td>
              <td className="mono px-3 py-3 text-xs text-[var(--text-secondary)]">{signal.agentType}</td>
              <td className="px-3 py-3">
                <div className="font-medium">{signal.title}</div>
                <div className="mt-1 max-w-xl text-xs text-[var(--text-secondary)]">{signal.summary}</div>
              </td>
              <td className="px-3 py-3">
                {signal.fixtureId ? (
                  <Link className="text-[var(--info)] hover:underline" href={`/fixtures/${signal.fixtureId}`}>
                    {signal.fixture?.participant1 && signal.fixture?.participant2
                      ? `${signal.fixture.participant1} vs ${signal.fixture.participant2}`
                      : signal.fixtureId}
                  </Link>
                ) : (
                  "Global"
                )}
              </td>
              <td className="px-3 py-3 text-[var(--text-secondary)]">{formatDateTime(signal.createdAt)}</td>
              <td className="px-3 py-3">
                <StatusBadge variant={signal.status === "open" ? "warning" : "neutral"}>{signal.status}</StatusBadge>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <a href={`#${signal.id}`} title="Inspect evidence" className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)]">
                    <Eye className="h-4 w-4" />
                  </a>
                  <Link href="/proof-console" title="Verify score update" className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)]">
                    <ShieldCheck className="h-4 w-4" />
                  </Link>
                  <SignalAcknowledgeButton signalId={signal.id} />
                  <Link href="/replay-lab" title="Replay fixture" className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)]">
                    <History className="h-4 w-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
