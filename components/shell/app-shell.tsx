import { SidebarNav } from "@/components/shell/sidebar-nav";
import { TopStatusBar } from "@/components/shell/top-status-bar";
import { ShellFrame } from "@/components/shell/shell-frame";
import { getSafeTxlineStatus } from "@/lib/txline/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const txline = getSafeTxlineStatus();

  return (
    <ShellFrame topBar={<TopStatusBar />} sidebar={<SidebarNav txline={txline} />}>
      {children}
    </ShellFrame>
  );
}
