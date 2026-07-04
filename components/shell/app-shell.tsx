import { SidebarNav } from "@/components/shell/sidebar-nav";
import { TopStatusBar } from "@/components/shell/top-status-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      <TopStatusBar />
      <div className="flex">
        <SidebarNav />
        <div className="min-w-0 flex-1 border-l border-[var(--border-subtle)]">
          <div className="mx-auto max-w-[1500px] p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
