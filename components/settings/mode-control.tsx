"use client";

import { useState } from "react";
import { DatabaseZap, KeyRound, Radio, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

type ModeControlProps = {
  mode: "demo" | "live";
  hasCredentials: boolean;
};

type ActionState = {
  status: "idle" | "pending" | "ok" | "review";
  message: string;
};

export function ModeControl({ mode, hasCredentials }: ModeControlProps) {
  const [operatorKey, setOperatorKey] = useState("");
  const [state, setState] = useState<ActionState>({
    status: "idle",
    message: mode === "demo" ? "Demo fallback seeding is available." : "Live TxLINE ingestion is available when credentials and operator key are configured.",
  });

  async function triggerDemoSeed() {
    setState({ status: "pending", message: "Seeding fallback data" });
    const response = await fetch("/api/demo/seed", { method: "POST" });
    const payload = (await response.json()) as { ok?: boolean; summary?: { fixtureCount?: number; updateCount?: number }; error?: string };

    setState({
      status: payload.ok ? "ok" : "review",
      message: payload.ok
        ? `Seeded fallback data: ${payload.summary?.fixtureCount ?? 0} fixture(s), ${payload.summary?.updateCount ?? 0} update(s).`
        : (payload.error ?? "Demo seed request failed."),
    });

    if (payload.ok) window.location.reload();
  }

  async function triggerLiveSync() {
    setState({ status: "pending", message: "Syncing live TxLINE fixtures" });
    const response = await fetch("/api/ingest/fixtures", {
      method: "POST",
      headers: requestHeaders(operatorKey),
    });
    const payload = (await response.json()) as { ok?: boolean; fixtures?: unknown[]; error?: string; endpoint?: string };

    setState({
      status: payload.ok ? "ok" : "review",
      message: payload.ok
        ? `Stored ${payload.fixtures?.length ?? 0} fixture row(s) from ${payload.endpoint ?? "TxLINE"}.`
        : (payload.error ?? "Live fixture sync failed."),
    });

    if (payload.ok) window.location.reload();
  }

  const isDemo = mode === "demo";

  return (
    <section className="panel-strong p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-black uppercase">
            <Radio className="h-4 w-4 text-[var(--accent-primary)]" />
            Mode Control
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            Render controls the environment flag. This panel triggers the matching data path for the active mode: demo seeding when
            <span className="mono"> ENABLE_DEMO_MODE=true</span>, or live TxLINE ingestion when
            <span className="mono"> ENABLE_DEMO_MODE=false</span>.
          </p>
        </div>
        <StatusBadge variant={isDemo ? "warning" : "success"}>{isDemo ? "Demo mode" : "Live mode"}</StatusBadge>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3">
          <p className="flex items-center gap-2 text-xs font-black uppercase text-[var(--text-muted)]">
            <DatabaseZap className="h-4 w-4 text-[var(--warning)]" />
            Demo trigger
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Seeds clearly labeled fallback fixtures, score updates, signals, proof placeholders, replay state, and audit rows.
          </p>
          <button
            type="button"
            disabled={!isDemo || state.status === "pending"}
            onClick={triggerDemoSeed}
            className="interactive-panel mt-4 inline-flex min-h-10 items-center gap-2 border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DatabaseZap className="h-4 w-4" />
            Seed fallback data
          </button>
        </div>

        <div className="border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3">
          <p className="flex items-center gap-2 text-xs font-black uppercase text-[var(--text-muted)]">
            <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
            Live trigger
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Uses server-side TxLINE credentials and the operator key to ingest real fixture rows from TxLINE.
          </p>
          <label className="mt-4 flex items-center gap-2 border border-[var(--border-subtle)] px-3 py-2">
            <KeyRound className="h-4 w-4 text-[var(--accent-primary)]" />
            <input
              value={operatorKey}
              onChange={(event) => setOperatorKey(event.target.value)}
              type="password"
              autoComplete="off"
              placeholder="MATCHPROOF_OPERATOR_KEY"
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
          </label>
          <button
            type="button"
            disabled={isDemo || !hasCredentials || state.status === "pending"}
            onClick={triggerLiveSync}
            className="interactive-panel mt-3 inline-flex min-h-10 items-center gap-2 border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Radio className="h-4 w-4" />
            Sync live TxLINE fixtures
          </button>
        </div>
      </div>

      <p data-testid="mode-control-status" className="mt-4 text-xs text-[var(--text-secondary)]">
        {state.message}
      </p>
    </section>
  );
}

function requestHeaders(operatorKey: string): Record<string, string> {
  const trimmed = operatorKey.trim();
  return trimmed ? { "x-matchproof-operator-key": trimmed } : {};
}
