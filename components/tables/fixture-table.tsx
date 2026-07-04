import Link from "next/link";
import { ExternalLink, History, ShieldCheck } from "lucide-react";
import type { Fixture, FeedUpdate, AgentSignal, VerificationResult } from "@prisma/client";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/utils";

type FixtureRow = Fixture & {
  updates: FeedUpdate[];
  signals: AgentSignal[];
  verifications: VerificationResult[];
};

export function FixtureTable({ fixtures }: { fixtures: FixtureRow[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-[var(--border-subtle)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--bg-elevated)] text-xs uppercase text-[var(--text-muted)]">
          <tr>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Fixture</th>
            <th className="px-3 py-2">Start</th>
            <th className="px-3 py-2">Last score update</th>
            <th className="px-3 py-2">Signals</th>
            <th className="px-3 py-2">Proof</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fixtures.map((fixture) => {
            const proof = fixture.verifications.find((item) => item.status === "verified");
            const latestUpdate = fixture.updates[0];
            return (
              <tr key={fixture.id} className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]">
                <td className="px-3 py-3">
                  <StatusBadge variant={fixture.status === "live" ? "success" : "neutral"}>{fixture.status ?? "unknown"}</StatusBadge>
                </td>
                <td className="px-3 py-3">
                  <div className="font-medium">
                    {fixture.participant1} vs {fixture.participant2}
                  </div>
                  <div className="mono text-xs text-[var(--text-muted)]">{fixture.fixtureId}</div>
                </td>
                <td className="px-3 py-3 text-[var(--text-secondary)]">{formatDateTime(fixture.startTime)}</td>
                <td className="px-3 py-3 text-[var(--text-secondary)]">
                  {latestUpdate ? formatDateTime(latestUpdate.ingestedAt) : "No updates"}
                </td>
                <td className="px-3 py-3">{fixture.signals.length}</td>
                <td className="px-3 py-3">
                  <StatusBadge variant={proof ? "success" : "warning"}>{proof ? "verified" : "review"}</StatusBadge>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Link title="Open monitor" href={`/fixtures/${fixture.fixtureId}`} className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)]">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Link title="Start replay" href="/replay-lab" className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)]">
                      <History className="h-4 w-4" />
                    </Link>
                    <Link title="Verify candidate" href="/proof-console" className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)]">
                      <ShieldCheck className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
