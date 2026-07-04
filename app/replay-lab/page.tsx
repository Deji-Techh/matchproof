import { History } from "lucide-react";
import { ReplayControls } from "@/components/replay/replay-controls";
import { Timeline } from "@/components/timeline/timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import { getReplayData } from "@/lib/db/queries";
import { getReplayProgress } from "@/lib/replay/replay-engine";

export const dynamic = "force-dynamic";

export default async function ReplayLabPage() {
  const { fixture } = await getReplayData();
  const session = fixture?.replaySessions[0] ?? null;
  const progress = getReplayProgress(session?.currentIndex ?? 0, fixture?.updates.length ?? 0);

  return (
    <main className="space-y-5">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <History className="h-6 w-6 text-[var(--info)]" />
          Replay Lab
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Replay historical or seeded score updates through the same monitoring surface.
        </p>
      </header>
      <ReplayControls />
      <section className="panel rounded-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">
              {fixture ? `${fixture.participant1} vs ${fixture.participant2}` : "No fixture selected"}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Event count: {fixture?.updates.length ?? 0}</p>
          </div>
          <StatusBadge variant={session?.status === "running" ? "success" : "warning"}>{session?.status ?? "idle"}</StatusBadge>
        </div>
        <div className="mt-4 h-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-main)]">
          <div className="h-full bg-[var(--info)]" style={{ width: `${progress}%` }} />
        </div>
      </section>
      {fixture && <Timeline updates={fixture.updates} signals={fixture.signals} verifications={fixture.verifications} />}
    </main>
  );
}
