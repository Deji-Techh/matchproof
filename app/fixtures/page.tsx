import { CalendarDays, Filter } from "lucide-react";
import { FixtureTable } from "@/components/tables/fixture-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getFixtures } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function FixturesPage() {
  const fixtures = await getFixtures();

  return (
    <main className="space-y-5">
      <PageHeader
        icon={CalendarDays}
        eyebrow="Fixture inventory"
        title="Fixtures"
        detail="Fixture inventory, last score update, signal count, and proof status."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--text-muted)]" />
          <StatusBadge variant="success">live</StatusBadge>
          <StatusBadge>upcoming</StatusBadge>
          <StatusBadge>completed</StatusBadge>
          <StatusBadge variant="warning">has signals</StatusBadge>
          <StatusBadge variant="proof">proof available</StatusBadge>
        </div>
      </PageHeader>
      {fixtures.length > 0 ? (
        <FixtureTable fixtures={fixtures} />
      ) : (
        <EmptyState icon={CalendarDays} title="No fixtures stored" detail="Load TxLINE fixtures or enable demo mode." />
      )}
    </main>
  );
}
