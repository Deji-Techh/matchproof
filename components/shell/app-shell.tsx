"use client";

import { usePathname } from "next/navigation";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { TopStatusBar } from "@/components/shell/top-status-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/") {
    return <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      <TopStatusBar />
      <div className="flex">
        <SidebarNav />
        <div className="min-w-0 flex-1 border-l border-[var(--border-subtle)]">
          <div className="mx-auto max-w-[1540px] p-4 sm:p-5 lg:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
