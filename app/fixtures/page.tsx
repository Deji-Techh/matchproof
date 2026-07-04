import { CalendarDays, Filter } from "lucide-react";
import { FixtureTable } from "@/components/tables/fixture-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { getFixtures } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function FixturesPage() {
  const fixtures = await getFixtures();

  return (
    <main className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <CalendarDays className="h-6 w-6 text-[var(--info)]" />
            Fixtures
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Fixture inventory, last score update, signal count, and proof status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--text-muted)]" />
          <StatusBadge variant="success">live</StatusBadge>
          <StatusBadge>upcoming</StatusBadge>
          <StatusBadge>completed</StatusBadge>
          <StatusBadge variant="warning">has signals</StatusBadge>
          <StatusBadge variant="proof">proof available</StatusBadge>
        </div>
      </header>
      {fixtures.length > 0 ? (
        <FixtureTable fixtures={fixtures} />
      ) : (
        <EmptyState icon={CalendarDays} title="No fixtures stored" detail="Load TxLINE fixtures or enable demo mode." />
      )}
    </main>
  );
}
