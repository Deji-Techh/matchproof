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
    <div className="overflow-x-auto border border-[var(--border-subtle)] bg-black">
      <table className="min-w-[980px] w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--bg-elevated)] text-xs font-black uppercase text-[var(--text-muted)]">
          <tr>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Fixture</th>
            <th className="px-4 py-3">Start</th>
            <th className="px-4 py-3">Last score update</th>
            <th className="px-4 py-3">Signals</th>
            <th className="px-4 py-3">Proof</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fixtures.map((fixture) => {
            const proof = fixture.verifications.find((item) => item.status === "verified" || item.status === "proof_received");
            const latestUpdate = fixture.updates[0];
            return (
              <tr key={fixture.id} className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]">
                <td className="px-4 py-4">
                  <StatusBadge variant={fixture.status === "live" ? "success" : "neutral"}>{fixture.status ?? "unknown"}</StatusBadge>
                </td>
                <td className="px-4 py-4">
                  <div className="font-black">
                    {fixture.participant1} vs {fixture.participant2}
                  </div>
                  <div className="mono text-xs text-[var(--text-muted)]">{fixture.fixtureId}</div>
                </td>
                <td className="px-4 py-4 text-[var(--text-secondary)]">{formatDateTime(fixture.startTime)}</td>
                <td className="px-4 py-4 text-[var(--text-secondary)]">
                  {latestUpdate ? formatDateTime(latestUpdate.ingestedAt) : "No updates"}
                </td>
                <td className="px-4 py-4 font-black">{fixture.signals.length}</td>
                <td className="px-4 py-4">
                  <StatusBadge variant={proof ? "proof" : "warning"}>{proof ? "proof" : "review"}</StatusBadge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Link title="Open monitor" href={`/fixtures/${fixture.fixtureId}`} className="interactive-panel grid min-h-10 min-w-10 place-items-center border border-[var(--border-subtle)] p-2">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Link title="Start replay" href="/replay-lab" className="interactive-panel grid min-h-10 min-w-10 place-items-center border border-[var(--border-subtle)] p-2">
                      <History className="h-4 w-4" />
                    </Link>
                    <Link title="Verify candidate" href="/proof-console" className="interactive-panel grid min-h-10 min-w-10 place-items-center border border-[var(--border-subtle)] p-2">
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
