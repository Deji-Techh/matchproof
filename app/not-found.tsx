import Link from "next/link";
import { Radar } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="panel-strong track-line max-w-xl p-6 pt-9">
        <Radar className="mb-4 h-6 w-6 text-[var(--info)]" />
        <h1 className="text-lg font-black uppercase">Route not found</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          This console route is outside the documented MatchProof surface.
        </p>
        <Link
          href="/command-center"
          className="interactive-panel mt-5 inline-flex border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-semibold uppercase"
        >
          Command Center
        </Link>
      </section>
    </main>
  );
}
