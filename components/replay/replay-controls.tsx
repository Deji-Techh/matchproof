"use client";

import { Pause, Play, RotateCcw, StepForward, Trash2 } from "lucide-react";
import { REPLAY_SPEEDS } from "@/lib/replay/replay-engine";

export function ReplayControls() {
  return (
    <div className="panel rounded-md p-4">
      <div className="flex flex-wrap items-center gap-2">
        <button className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)]" title="Start replay" type="button">
          <Play className="h-4 w-4" />
        </button>
        <button className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)]" title="Pause replay" type="button">
          <Pause className="h-4 w-4" />
        </button>
        <button className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)]" title="Reset replay" type="button">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)]" title="Jump to next signal" type="button">
          <StepForward className="h-4 w-4" />
        </button>
        <button className="rounded border border-[var(--border-subtle)] p-2 hover:border-[var(--border-strong)]" title="Clear session" type="button">
          <Trash2 className="h-4 w-4" />
        </button>
        <select className="rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm">
          {REPLAY_SPEEDS.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
