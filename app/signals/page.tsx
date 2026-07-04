import { Siren } from "lucide-react";
import { RawJsonViewer } from "@/components/ui/raw-json-viewer";
import { SignalTable } from "@/components/tables/signal-table";
import { getSignals } from "@/lib/db/queries";
import { PageHeader, SectionShell } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const signals = await getSignals();

  return (
    <main className="space-y-5">
      <PageHeader
        icon={Siren}
        eyebrow="Agent evidence"
        title="Signals"
        detail="Deterministic agent signals with source update IDs and evidence."
      />
      <SignalTable signals={signals} />
      <SectionShell title="Evidence Drawers">
        {signals.map((signal) => (
          <article id={signal.id} key={signal.id} className="panel interactive-panel scroll-mt-28 p-4">
            <h3 className="font-black uppercase">{signal.title}</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{signal.summary}</p>
            <p className="mono mt-3 text-xs text-[var(--text-muted)]">Source update IDs: {signal.sourceUpdateIds}</p>
            <div className="mt-3">
              <RawJsonViewer value={signal.evidenceJson} />
            </div>
          </article>
        ))}
      </SectionShell>
    </main>
  );
}
