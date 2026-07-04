import { Activity, Database, Radio, ShieldCheck, Siren } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { FixtureTable } from "@/components/tables/fixture-table";
import { SignalTable } from "@/components/tables/signal-table";
import { AuditLogTable } from "@/components/tables/audit-log-table";
import { DataFlowPanel } from "@/components/cards/data-flow-panel";
import { IngestionControls } from "@/components/cards/ingestion-controls";
import { ExportJsonButton } from "@/components/export/export-json-button";
import { PageHeader, SectionShell } from "@/components/ui/page-header";
import { getCommandCenterData } from "@/lib/db/queries";
import { DEMO_MODE_LABEL } from "@/lib/demo-data";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  const data = await getCommandCenterData();
  const ingestFixture = data.fixtures.find((fixture) => fixture.status === "live") ?? data.fixtures.find((fixture) => fixture.updates.length > 0);

  return (
    <main className="space-y-5">
      <PageHeader
        icon={Radio}
        eyebrow="Live operations"
        title="Command Center"
        detail="Live and replayable operational state for TxLINE World Cup fixture and score data."
      >
        <ExportJsonButton />
      </PageHeader>
      <section className="panel reveal-up border-[var(--warning)]/30 p-4 text-sm text-yellow-100">
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
      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <DataFlowPanel />
        <IngestionControls fixtureId={ingestFixture?.fixtureId} />
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <MetricCard title="Fixtures" value={data.fixtures.length} detail="Stored fixture rows" icon={Database} tone="neutral" />
        <MetricCard title="Score Updates" value={data.updateCount} detail="Stored source updates" icon={Activity} tone="success" />
      </section>
      <SectionShell title="Fixture Overview">
        <FixtureTable fixtures={data.fixtures} />
      </SectionShell>
      <SectionShell title="Recent Signals">
        <SignalTable signals={data.signals} />
      </SectionShell>
      <SectionShell title="Audit Preview">
        <AuditLogTable logs={data.auditLogs} />
      </SectionShell>
    </main>
  );
}
