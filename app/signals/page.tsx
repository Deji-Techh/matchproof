import { Siren } from "lucide-react";
import { RawJsonViewer } from "@/components/ui/raw-json-viewer";
import { SignalTable } from "@/components/tables/signal-table";
import { getSignals } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const signals = await getSignals();

  return (
    <main className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Siren className="h-6 w-6 text-[var(--warning)]" />
          Signals
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Deterministic agent signals with source update IDs and evidence.
        </p>
      </header>
      <SignalTable signals={signals} />
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase text-[var(--text-muted)]">Evidence Drawers</h2>
        {signals.map((signal) => (
          <article id={signal.id} key={signal.id} className="panel scroll-mt-20 rounded-md p-4">
            <h3 className="font-medium">{signal.title}</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{signal.summary}</p>
            <p className="mono mt-3 text-xs text-[var(--text-muted)]">Source update IDs: {signal.sourceUpdateIds}</p>
            <div className="mt-3">
              <RawJsonViewer value={signal.evidenceJson} />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
