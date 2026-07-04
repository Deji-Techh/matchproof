"use client";

import { Download } from "lucide-react";

export function ExportJsonButton() {
  return (
    <a
      href="/api/export"
      download="matchproof-export.json"
      className="interactive-panel inline-flex items-center gap-2 border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-semibold uppercase"
    >
      <Download className="h-4 w-4" />
      Export JSON
    </a>
  );
}
