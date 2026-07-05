import { notFound } from "next/navigation";
import { Activity, Database, ShieldCheck, Siren } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { RawJsonViewer } from "@/components/ui/raw-json-viewer";
import { StatusBadge } from "@/components/ui/status-badge";
import { Timeline } from "@/components/timeline/timeline";
import { SectionShell } from "@/components/ui/page-header";
import { getFixtureMonitor } from "@/lib/db/queries";
import { formatDateTime, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FixtureMonitorPage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = await params;
  const fixture = await getFixtureMonitor(fixtureId);
  if (!fixture) notFound();

  const latestUpdate = fixture.updates.at(-1);
  const latestPayload = parseJson<{ score?: { listedHome?: number; listedAway?: number }; period?: string }>(
    latestUpdate?.rawJson,
    {},
  );
  const score =
    typeof latestPayload.score?.listedHome === "number" && typeof latestPayload.score?.listedAway === "number"
      ? `${latestPayload.score.listedHome}-${latestPayload.score.listedAway}`
      : "Unknown";

  return (
    <main className="space-y-5">
      <header className="panel-strong track-line reveal-up p-4 pt-8 sm:p-5 sm:pt-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge variant={fixture.status === "live" ? "success" : "neutral"}>{fixture.status ?? "unknown"}</StatusBadge>
              <span className="mono text-xs text-[var(--text-muted)]">{fixture.fixtureId}</span>
            </div>
            <h1 className="page-title safe-word mt-4 font-black uppercase leading-none tracking-normal">
              {fixture.participant1} vs {fixture.participant2}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Feed home designation: {fixture.participant1IsHome ? fixture.participant1 : fixture.participant2}. Start:{" "}
              {formatDateTime(fixture.startTime)}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-5xl font-black sm:text-6xl">{score}</p>
            <p className="mt-1 text-sm font-semibold uppercase text-[var(--text-secondary)]">Period {latestPayload.period ?? "unknown"}</p>
          </div>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Score Updates" value={fixture.updates.length} detail="Stored source updates" icon={Activity} tone="success" />
        <MetricCard title="Signals" value={fixture.signals.length} detail="Agent detections" icon={Siren} tone="warning" />
        <MetricCard title="Proof Records" value={fixture.verifications.length} detail="Validation attempts" icon={ShieldCheck} tone="proof" />
        <MetricCard title="Raw Payload" value="Stored" detail="Fixture snapshot evidence" icon={Database} tone="info" />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <SectionShell title="Timeline">
          <Timeline updates={fixture.updates} signals={fixture.signals} verifications={fixture.verifications} />
        </SectionShell>
        <aside className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 bg-[var(--accent-primary)]" />
            <h2 className="text-sm font-black uppercase text-[var(--text-secondary)]">Raw Fixture Payload</h2>
          </div>
          <RawJsonViewer value={fixture.rawJson} />
        </aside>
      </section>
    </main>
  );
}
