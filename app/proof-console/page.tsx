import { ShieldCheck } from "lucide-react";
import { ProofCard } from "@/components/cards/proof-card";
import { ProofRequestForm } from "@/components/cards/proof-request-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { getVerificationResults } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function ProofConsolePage() {
  const verifications = await getVerificationResults();

  return (
    <main className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <ShieldCheck className="h-6 w-6 text-[var(--proof)]" />
            Proof Console
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Score/stat validation records, raw proof material, and validation results.
          </p>
        </div>
        <StatusBadge variant="proof">Solana validation surface</StatusBadge>
      </header>
      <section className="grid gap-3 md:grid-cols-3">
        <div className="panel rounded-md p-4">
          <p className="text-xs uppercase text-[var(--text-muted)]">Pending proof requests</p>
          <p className="mt-2 text-2xl font-semibold">{verifications.filter((item) => item.status === "pending").length}</p>
        </div>
        <div className="panel rounded-md p-4">
          <p className="text-xs uppercase text-[var(--text-muted)]">Verified updates</p>
          <p className="mt-2 text-2xl font-semibold">{verifications.filter((item) => item.status === "verified").length}</p>
        </div>
        <div className="panel rounded-md p-4">
          <p className="text-xs uppercase text-[var(--text-muted)]">Review required</p>
          <p className="mt-2 text-2xl font-semibold">{verifications.filter((item) => item.status !== "verified").length}</p>
        </div>
      </section>
      {verifications[0] && (
        <ProofRequestForm
          fixtureId={verifications[0].fixtureId}
          sourceUpdateId={verifications[0].sourceUpdateId ?? undefined}
          sequence={verifications[0].sequence ?? "1002"}
          statKey={verifications[0].statKey ?? "1002"}
        />
      )}
      <section className="space-y-3">
        {verifications.map((verification) => (
          <ProofCard key={verification.id} verification={verification} />
        ))}
      </section>
    </main>
  );
}
