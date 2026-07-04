import { notFound } from "next/navigation";
import { Activity, Database, ShieldCheck, Siren } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { RawJsonViewer } from "@/components/ui/raw-json-viewer";
import { StatusBadge } from "@/components/ui/status-badge";
import { Timeline } from "@/components/timeline/timeline";
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
      <header className="panel rounded-md p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge variant={fixture.status === "live" ? "success" : "neutral"}>{fixture.status ?? "unknown"}</StatusBadge>
              <span className="mono text-xs text-[var(--text-muted)]">{fixture.fixtureId}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold">
              {fixture.participant1} vs {fixture.participant2}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Feed home designation: {fixture.participant1IsHome ? fixture.participant1 : fixture.participant2}. Start:{" "}
              {formatDateTime(fixture.startTime)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-semibold">{score}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Period {latestPayload.period ?? "unknown"}</p>
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
        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase text-[var(--text-muted)]">Timeline</h2>
          <Timeline updates={fixture.updates} signals={fixture.signals} verifications={fixture.verifications} />
        </div>
        <aside className="space-y-3">
          <h2 className="text-sm font-medium uppercase text-[var(--text-muted)]">Raw Fixture Payload</h2>
          <RawJsonViewer value={fixture.rawJson} />
        </aside>
      </section>
    </main>
  );
}
