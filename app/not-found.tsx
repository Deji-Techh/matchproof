import Link from "next/link";
import { Radar } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="panel max-w-xl rounded-md p-6">
        <Radar className="mb-4 h-6 w-6 text-[var(--info)]" />
        <h1 className="text-lg font-semibold">Route not found</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          This console route is outside the documented MatchProof surface.
        </p>
        <Link
          href="/command-center"
          className="mt-5 inline-flex rounded border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-2 text-sm hover:bg-[var(--bg-hover)]"
        >
          Command Center
        </Link>
      </section>
    </main>
  );
}
