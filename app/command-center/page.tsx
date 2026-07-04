import { Activity, Database, Radio, ShieldCheck, Siren } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { FixtureTable } from "@/components/tables/fixture-table";
import { SignalTable } from "@/components/tables/signal-table";
import { AuditLogTable } from "@/components/tables/audit-log-table";
import { getCommandCenterData } from "@/lib/db/queries";
import { DEMO_MODE_LABEL } from "@/lib/demo-data";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  const data = await getCommandCenterData();

  return (
    <main className="space-y-5">
      <PageHeader
        title="Command Center"
        detail="Live and replayable operational state for TxLINE World Cup fixture and score data."
      />
      <section className="panel rounded-md border-[var(--warning)]/30 p-3 text-sm text-yellow-100">
        <StatusBadge variant="warning">{DEMO_MODE_LABEL}</StatusBadge>
        <span className="ml-3 text-[var(--text-secondary)]">
          Seeded fallback data is active until TxLINE credentials are configured.
        </span>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Stream Health" value="Demo" detail={`Last update ${formatDateTime(data.latestUpdate?.ingestedAt)}`} icon={Radio} tone="warning" />
        <MetricCard title="Agent Runtime" value={data.signals.length} detail="Evidence-backed deterministic signals" icon={Siren} tone="info" />
        <MetricCard title="Proof Summary" value={data.verifications.length} detail="Proof requests and placeholders" icon={ShieldCheck} tone="proof" />
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <MetricCard title="Fixtures" value={data.fixtures.length} detail="Stored fixture rows" icon={Database} tone="neutral" />
        <MetricCard title="Score Updates" value={data.updateCount} detail="Stored source updates" icon={Activity} tone="success" />
      </section>
      <Section title="Fixture Overview">
        <FixtureTable fixtures={data.fixtures} />
      </Section>
      <Section title="Recent Signals">
        <SignalTable signals={data.signals} />
      </Section>
      <Section title="Audit Preview">
        <AuditLogTable logs={data.auditLogs} />
      </Section>
    </main>
  );
}

function PageHeader({ title, detail }: { title: string; detail: string }) {
  return (
    <header>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{detail}</p>
    </header>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium uppercase text-[var(--text-muted)]">{title}</h2>
      {children}
    </section>
  );
}
