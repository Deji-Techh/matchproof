import { Cable, Database, Radio, Settings } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { ModeControl } from "@/components/settings/mode-control";
import { getSafeTxlineStatus } from "@/lib/txline/auth";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const txline = getSafeTxlineStatus();
  const mode = process.env.ENABLE_DEMO_MODE === "true" ? "demo" : "live";
  const hasCredentials = txline.hasGuestJwt && txline.hasApiToken;

  return (
    <main className="space-y-5">
      <PageHeader
        icon={Settings}
        eyebrow="Runtime configuration"
        title="Settings"
        detail="Configuration status, network consistency, stream settings, and deterministic thresholds."
      />
      <ModeControl mode={mode} hasCredentials={hasCredentials} />
      <section className="grid gap-4 lg:grid-cols-3">
        <Panel icon={Cable} title="TxLINE Credentials">
          <Row label="Guest JWT" value={txline.guestJwt} />
          <Row label="API token" value={txline.apiToken} />
          <Row label="API base URL" value={txline.apiBaseUrl} />
        </Panel>
        <Panel icon={Radio} title="Network">
          <Row label="Network" value={txline.network} />
          <Row label="Service level" value={String(txline.serviceLevel)} />
          <Row label="Solana RPC" value={txline.solanaRpcUrl} />
          <Row label="Program ID" value={txline.programId ?? "not configured"} />
        </Panel>
        <Panel icon={Database} title="Agent Thresholds">
          <Row label="Stale feed delay" value="90 seconds" />
          <Row label="Duplicate updates" value="sequence match" />
          <Row label="Replay speeds" value="0.5x, 1x, 2x, 5x, 10x" />
        </Panel>
      </section>
      <section className="panel p-4">
        <StatusBadge variant="warning">Credentials remain server-side</StatusBadge>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Raw API tokens are never displayed after configuration. Store real values in `.env` or Render environment variables.
        </p>
      </section>
    </main>
  );
}

function Panel({ icon: Icon, title, children }: { icon: typeof Settings; title: string; children: React.ReactNode }) {
  return (
    <section className="panel interactive-panel p-4">
      <h2 className="flex items-center gap-2 text-sm font-black uppercase">
        <Icon className="h-4 w-4 text-[var(--info)]" />
        {title}
      </h2>
      <dl className="mt-4 space-y-3">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase text-[var(--text-muted)]">{label}</dt>
      <dd className="mono mt-1 break-all text-xs text-[var(--text-secondary)]">{value}</dd>
    </div>
  );
}
