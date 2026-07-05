import { ShieldCheck } from "lucide-react";
import { ProofCard } from "@/components/cards/proof-card";
import { ProofRequestForm } from "@/components/cards/proof-request-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { getVerificationResults } from "@/lib/db/queries";
import { PageHeader, SectionShell } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function ProofConsolePage() {
  const verifications = await getVerificationResults();

  return (
    <main className="space-y-5">
      <PageHeader
        icon={ShieldCheck}
        eyebrow="Verification surface"
        title="Proof Console"
        detail="Score/stat validation records, raw proof material, and validation results."
      >
        <StatusBadge variant="proof">Solana validation surface</StatusBadge>
      </PageHeader>
      <section className="grid gap-3 md:grid-cols-3">
        <div className="panel interactive-panel p-4">
          <p className="text-xs font-black uppercase text-[var(--text-muted)]">Pending proof requests</p>
          <p className="mt-2 text-3xl font-black">{verifications.filter((item) => item.status === "pending").length}</p>
        </div>
        <div className="panel interactive-panel p-4">
          <p className="text-xs font-black uppercase text-[var(--text-muted)]">Proof responses</p>
          <p className="mt-2 text-3xl font-black">{verifications.filter((item) => item.status === "proof_received" || item.status === "verified").length}</p>
        </div>
        <div className="panel interactive-panel p-4">
          <p className="text-xs font-black uppercase text-[var(--text-muted)]">Review required</p>
          <p className="mt-2 text-3xl font-black">{verifications.filter((item) => item.status !== "proof_received" && item.status !== "verified").length}</p>
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
      <SectionShell title="Proof Records">
        {verifications.map((verification) => (
          <ProofCard key={verification.id} verification={verification} />
        ))}
      </SectionShell>
    </main>
  );
}
