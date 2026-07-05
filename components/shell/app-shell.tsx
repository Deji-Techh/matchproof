import { SidebarNav } from "@/components/shell/sidebar-nav";
import { TopStatusBar } from "@/components/shell/top-status-bar";
import { ShellFrame } from "@/components/shell/shell-frame";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellFrame topBar={<TopStatusBar />} sidebar={<SidebarNav />}>
      {children}
    </ShellFrame>
  );
}
