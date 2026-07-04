"use client";

import { TriangleAlert } from "lucide-react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="panel max-w-xl rounded-md p-6">
        <TriangleAlert className="mb-4 h-6 w-6 text-[var(--danger)]" />
        <h1 className="text-lg font-semibold">Console module failed</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          The view could not render. Secrets and stack traces are intentionally hidden from the UI.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-2 text-sm hover:bg-[var(--bg-hover)]"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
