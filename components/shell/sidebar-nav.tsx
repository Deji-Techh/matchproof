"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Cable,
  History,
  LayoutDashboard,
  Radio,
  ScrollText,
  Settings,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

const items = [
  { href: "/command-center", label: "Command Center", icon: LayoutDashboard },
  { href: "/fixtures", label: "Fixtures", icon: CalendarDays },
  { href: "/signals", label: "Signals", icon: Siren },
  { href: "/proof-console", label: "Proof Console", icon: ShieldCheck },
  { href: "/replay-lab", label: "Replay Lab", icon: History },
  { href: "/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-12 hidden h-[calc(100vh-48px)] w-60 shrink-0 flex-col justify-between bg-[var(--bg-panel)] p-3 md:flex">
      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                active
                  ? "border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  : "border-transparent",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-[var(--border-subtle)] pt-3">
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-2">
            <Cable className="h-3.5 w-3.5" />
            Network
          </span>
          <StatusBadge variant="info">Devnet</StatusBadge>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5" />
            Score stream
          </span>
          <StatusBadge variant="warning">Demo</StatusBadge>
        </div>
        <p className="mono text-[11px] text-[var(--text-muted)]">v0.1.0</p>
      </div>
    </aside>
  );
}
