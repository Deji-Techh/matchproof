import type { VerificationResult, Fixture, FeedUpdate } from "@prisma/client";
import { ShieldCheck } from "lucide-react";
import { RawJsonViewer } from "@/components/ui/raw-json-viewer";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/utils";

export function ProofCard({
  verification,
}: {
  verification: VerificationResult & { fixture?: Fixture | null; sourceUpdate?: FeedUpdate | null };
}) {
  const verified = verification.status === "verified";
  return (
    <article className="panel rounded-md p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[var(--proof)]" />
            <h2 className="font-semibold">{verification.fixture?.participant1 ?? "Fixture"} proof request</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Sequence {verification.sequence ?? "unknown"} / stat key {verification.statKey ?? "unknown"}
          </p>
        </div>
        <StatusBadge variant={verified ? "success" : "warning"}>{verified ? "verified on solana" : verification.status}</StatusBadge>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase text-[var(--text-muted)]">Network</dt>
          <dd>{verification.network}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--text-muted)]">Created</dt>
          <dd>{formatDateTime(verification.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-[var(--text-muted)]">Source update</dt>
          <dd className="mono text-xs">{verification.sourceUpdateId ?? "not linked"}</dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <RawJsonViewer value={verification.proofJson ?? "{}"} />
        <RawJsonViewer value={verification.resultJson ?? "{}"} />
      </div>
    </article>
  );
}
