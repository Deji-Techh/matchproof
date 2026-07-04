"use client";

import { Download } from "lucide-react";

export function ExportJsonButton() {
  return (
    <a
      href="/api/export"
      download="matchproof-export.json"
      className="inline-flex items-center gap-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm hover:border-[var(--border-strong)]"
    >
      <Download className="h-4 w-4" />
      Export JSON
    </a>
  );
}
