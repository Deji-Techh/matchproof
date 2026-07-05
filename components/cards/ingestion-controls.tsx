"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarSync, DatabaseZap, History, Radio, RefreshCcw, Square } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

type ActionState = {
  status: "idle" | "pending" | "ok" | "review";
  message: string;
};

export function IngestionControls({ fixtureId }: { fixtureId?: string }) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>({
    status: "idle",
    message: "Ingestion controls ready",
  });

  async function run(action: "fixtures" | "snapshot" | "updates" | "historical" | "stream" | "worker-start" | "worker-stop") {
    setState({ status: "pending", message: "Request in progress" });

    const request =
      action === "fixtures"
        ? fetch("/api/ingest/fixtures", { method: "POST" })
        : action === "worker-start" || action === "worker-stop"
          ? fetch("/api/ingest/stream-worker", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                action === "worker-start"
                  ? { action: "start", fixtureId, captureWindowMs: 30_000, maxMessages: 25 }
                  : { action: "stop" },
              ),
            })
        : action === "stream"
          ? fetch("/api/ingest/stream", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fixtureId, maxMessages: 8, maxDurationMs: 10_000 }),
            })
        : fetch("/api/ingest/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fixtureId, mode: action }),
          });

    const response = await request;
    const payload = (await response.json()) as {
      ok?: boolean;
      fixtures?: unknown[];
      updates?: unknown[];
      signals?: unknown[];
      error?: string;
      endpoint?: string;
      heartbeatCount?: number;
      messageCount?: number;
      started?: boolean;
      status?: {
        running?: boolean;
        updateCount?: number;
        signalCount?: number;
        captureCount?: number;
      };
    };

    const count = payload.fixtures?.length ?? payload.updates?.length ?? 0;
    const message = payload.ok
      ? action === "worker-start"
        ? payload.started
          ? "Stream worker started"
          : "Stream worker already running"
        : action === "worker-stop"
          ? "Stream worker stop requested"
          : action === "stream"
        ? `Captured ${count} stream row(s), ${payload.signals?.length ?? 0} signal(s), ${payload.heartbeatCount ?? 0} heartbeat(s)`
        : `Stored ${count} row(s) from ${payload.endpoint ?? "TxLINE"}`
      : (payload.error ?? "Request recorded for operator review");

    setState({ status: payload.ok ? "ok" : "review", message });
    router.refresh();
  }

  const disabled = state.status === "pending";

  return (
    <section className="panel-strong p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase">TxLINE Ingestion</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Credentials stay server-side; failed live calls create audit evidence.
          </p>
        </div>
        <StatusBadge variant={state.status === "ok" ? "success" : state.status === "review" ? "warning" : "neutral"}>
          {state.status}
        </StatusBadge>
      </div>
      <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap sm:items-center">
        <ControlButton disabled={disabled} icon={CalendarSync} label="Sync fixtures" onClick={() => run("fixtures")} />
        <ControlButton disabled={disabled || !fixtureId} icon={RefreshCcw} label="Score snapshot" onClick={() => run("snapshot")} />
        <ControlButton disabled={disabled || !fixtureId} icon={DatabaseZap} label="Recent updates" onClick={() => run("updates")} />
        <ControlButton disabled={disabled || !fixtureId} icon={History} label="Historical" onClick={() => run("historical")} />
        <ControlButton disabled={disabled || !fixtureId} icon={Radio} label="Stream capture" onClick={() => run("stream")} />
        <ControlButton disabled={disabled || !fixtureId} icon={Radio} label="Start worker" onClick={() => run("worker-start")} />
        <ControlButton disabled={disabled} icon={Square} label="Stop worker" onClick={() => run("worker-stop")} />
      </div>
      <p data-testid="ingestion-status" className="mt-3 text-xs text-[var(--text-secondary)]">
        {state.message}
      </p>
    </section>
  );
}

function ControlButton({
  disabled,
  icon: Icon,
  label,
  onClick,
}: {
  disabled: boolean;
  icon: typeof RefreshCcw;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="interactive-panel inline-flex min-h-10 items-center justify-center gap-2 border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
