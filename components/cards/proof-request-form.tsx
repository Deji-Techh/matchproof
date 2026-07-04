"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export function ProofRequestForm({
  fixtureId,
  sourceUpdateId,
  sequence,
  statKey,
}: {
  fixtureId: string;
  sourceUpdateId?: string;
  sequence: string;
  statKey: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("Ready to request validation");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    try {
      const response = await fetch("/api/verify/score-stat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixtureId,
          sourceUpdateId,
          sequence: String(formData.get("sequence") ?? sequence),
          statKey: String(formData.get("statKey") ?? statKey),
        }),
      });
      const payload = (await response.json()) as { verification?: { status: string }; error?: string };
      setMessage(payload.verification ? `Validation status: ${payload.verification.status}` : (payload.error ?? "Validation failed"));
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel-strong track-line p-4 pt-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-black uppercase">
            <ShieldCheck className="h-4 w-4 text-[var(--proof)]" />
            Request Score/Stat Validation
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Uses TxLINE credentials when configured. Without credentials, the result is stored as unsupported demo fallback.
          </p>
        </div>
        <StatusBadge variant="proof">proof request</StatusBadge>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <label className="text-xs uppercase text-[var(--text-muted)]">
          Sequence
          <input
            name="sequence"
            defaultValue={sequence}
            className="mt-1 w-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
        </label>
        <label className="text-xs uppercase text-[var(--text-muted)]">
          Stat key
          <input
            name="statKey"
            defaultValue={statKey}
            className="mt-1 w-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="interactive-panel min-h-10 self-end border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-black uppercase text-violet-100 disabled:opacity-50"
        >
          Verify
        </button>
      </div>
      <p className="mt-3 text-xs text-[var(--text-secondary)]">{message}</p>
    </form>
  );
}
