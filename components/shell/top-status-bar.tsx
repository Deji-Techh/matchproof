import { Activity, Radio, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { MatchTicker } from "@/components/shell/match-ticker";

const consoleLinks = [
  ["Command", "/command-center"],
  ["Fixtures", "/fixtures"],
  ["Signals", "/signals"],
  ["Proof", "/proof-console"],
  ["Replay", "/replay-lab"],
  ["Audit", "/audit-log"],
];

export function TopStatusBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
      <MatchTicker />
      <div className="flex min-h-16 items-center justify-between gap-3 px-3 sm:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center bg-[var(--accent-red)] font-black text-black">MP</span>
          <span>
            <span className="block text-base font-black uppercase leading-none tracking-normal">MatchProof</span>
            <span className="mono mt-1 block text-[10px] uppercase text-[var(--text-muted)]">Autonomous verification console</span>
          </span>
        </Link>
        <div className="hidden min-w-0 items-center gap-2 lg:flex">
          <StatusBadge variant="info">Devnet</StatusBadge>
          <StatusBadge variant="warning">Demo mode</StatusBadge>
          <span className="mx-2 h-5 w-px bg-[var(--border-subtle)]" />
          <span className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Radio className="h-4 w-4 text-[var(--warning)]" />
            Seeded fallback stream
          </span>
          <span className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Activity className="h-4 w-4 text-[var(--success)]" />
            Agents deterministic
          </span>
          <span className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <ShieldCheck className="h-4 w-4 text-[var(--proof)]" />
            Proof gated
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link className="interactive-panel border border-[var(--accent-red)] bg-[var(--accent-red)] px-3 py-2 text-xs font-black uppercase text-black md:hidden" href="/command-center">
            Console
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className="interactive-panel border border-[var(--border-subtle)] p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-[var(--border-subtle)] px-4 py-2 md:hidden">
        {consoleLinks.map(([label, href]) => (
          <Link key={href} href={href} className="interactive-panel whitespace-nowrap border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold uppercase">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
