import { Radio, Settings } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

export function TopStatusBar() {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm border border-[var(--info)]" />
          <span className="font-semibold">MatchProof</span>
        </div>
        <StatusBadge variant="info">Devnet</StatusBadge>
        <StatusBadge variant="warning">Demo Mode</StatusBadge>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-2 text-xs text-[var(--text-secondary)] sm:flex">
          <Radio className="h-4 w-4 text-[var(--warning)]" />
          Seeded fallback stream
        </span>
        <Link
          href="/settings"
          aria-label="Settings"
          className="rounded border border-[var(--border-subtle)] p-2 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
