"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, RotateCcw, StepForward, Trash2 } from "lucide-react";
import { REPLAY_SPEEDS } from "@/lib/replay/replay-engine";
import { StatusBadge } from "@/components/ui/status-badge";

export function ReplayControls({
  fixtureId,
  initialStatus,
}: {
  fixtureId?: string;
  initialStatus?: string;
}) {
  const router = useRouter();
  const [speed, setSpeed] = useState(1);
  const [status, setStatus] = useState(initialStatus ?? "idle");
  const [message, setMessage] = useState("Replay controls ready");
  const [pending, setPending] = useState(false);

  async function postReplay(action: "start" | "pause" | "resume" | "reset") {
    if (!fixtureId && action === "start") {
      setMessage("No fixture selected");
      return;
    }

    setPending(true);
    try {
      const response = await fetch(`/api/replay/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "start" ? JSON.stringify({ fixtureId, speed }) : undefined,
      });
      const payload = (await response.json()) as { session?: { status: string }; error?: string };
      if (!response.ok || !payload.session) {
        setMessage(payload.error ?? "Replay action failed");
        return;
      }
      setStatus(payload.session.status);
      setMessage(`Replay ${payload.session.status}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="panel rounded-md p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
        <button
          disabled={pending}
          onClick={() => postReplay(status === "paused" ? "resume" : "start")}
          className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)] disabled:opacity-50"
          title={status === "paused" ? "Resume replay" : "Start replay"}
          type="button"
        >
          <Play className="h-4 w-4" />
        </button>
        <button
          disabled={pending}
          onClick={() => postReplay("pause")}
          className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)] disabled:opacity-50"
          title="Pause replay"
          type="button"
        >
          <Pause className="h-4 w-4" />
        </button>
        <button
          disabled={pending}
          onClick={() => postReplay("reset")}
          className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)] disabled:opacity-50"
          title="Reset replay"
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          disabled={pending}
          onClick={() => setMessage("Jump target selected from the signal timeline")}
          className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)] disabled:opacity-50"
          title="Jump to next signal"
          type="button"
        >
          <StepForward className="h-4 w-4" />
        </button>
        <button
          disabled={pending}
          onClick={() => postReplay("reset")}
          className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)] disabled:opacity-50"
          title="Clear session"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <select
          value={speed}
          onChange={(event) => setSpeed(Number(event.target.value))}
          className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
        >
          {REPLAY_SPEEDS.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant={status === "running" ? "success" : status === "paused" ? "warning" : "neutral"}>{status}</StatusBadge>
          <span className="text-xs text-[var(--text-secondary)]">{message}</span>
        </div>
      </div>
    </div>
  );
}
