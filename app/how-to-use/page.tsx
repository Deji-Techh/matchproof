import { Activity, BookOpenCheck, CheckCircle2, Database, FileJson, History, Radio, ShieldCheck, Terminal } from "lucide-react";
import { PageHeader, SectionShell } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

export const dynamic = "force-dynamic";

const walkthrough = [
  {
    title: "Open the Command Center",
    detail: "Start with the operations view. Confirm mode, fixture count, score update count, agent signals, and proof records.",
    icon: Radio,
  },
  {
    title: "Load or inspect fixtures",
    detail: "Use the active ingestion path, then open Fixtures to inspect match inventory, latest update time, signal count, and proof status.",
    icon: Database,
  },
  {
    title: "Run deterministic agents",
    detail: "Score snapshots and stream updates persist raw payloads, run Feed Health and Match State checks, and create evidence-backed signals.",
    icon: Activity,
  },
  {
    title: "Replay the evidence",
    detail: "Replay Lab steps through stored updates without mutating source data, giving judges a deterministic demo even when no match is live.",
    icon: History,
  },
  {
    title: "Request proof material",
    detail: "Proof Console stores proof responses when available and avoids overclaiming independent Solana verification.",
    icon: ShieldCheck,
  },
  {
    title: "Export the audit package",
    detail: "Audit Log and JSON export show fixtures, feed updates, signals, proof records, replay sessions, and operator activity for review.",
    icon: FileJson,
  },
];

const judgeFlow = [
  "Landing page: explain MatchProof as a sports-data integrity console.",
  "Command Center: show mode, ingestion controls, and evidence flow.",
  "Fixtures: open a match and inspect raw payloads, score timeline, signals, and proof records.",
  "Signals: show source update IDs and evidence JSON for deterministic agent signals.",
  "Replay Lab: start, step, pause, and reset a replay session.",
  "Proof Console: explain proof_received versus independent local/on-chain verification.",
  "Audit Log: show a traceable event ledger and export JSON evidence.",
];

export default function HowToUsePage() {
  return (
    <main className="space-y-5">
      <PageHeader
        icon={BookOpenCheck}
        eyebrow="Operator playbook"
        title="How to Use"
        detail="A judge-ready walkthrough for running MatchProof, proving the data flow, and testing the build."
      >
        <StatusBadge variant="success">Evidence first</StatusBadge>
        <StatusBadge variant="proof">Replayable</StatusBadge>
      </PageHeader>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="panel-strong track-line p-4 pt-7 sm:p-5 sm:pt-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center border border-[var(--border-subtle)] bg-black">
              <Radio className="h-5 w-5 text-[var(--accent-primary)]" />
            </span>
            <div>
              <p className="text-xs font-black uppercase text-[var(--text-muted)]">System map</p>
              <h2 className="text-xl font-black uppercase">Update to audit evidence</h2>
            </div>
          </div>
          <pre className="mono mt-5 overflow-x-auto border border-[var(--border-subtle)] bg-black p-4 text-xs leading-6 text-[var(--text-secondary)]">
{`Fixture / score source
        |
        v
MatchProof ingestion route or stream worker
        |
        v
FeedUpdate row with raw payload evidence
        |
        v
Deterministic agent runtime
        |
        v
AgentSignal + VerificationResult + AuditLog
        |
        v
Command Center, Match Monitor, Replay Lab, Export`}
          </pre>
        </article>

        <article className="panel p-4">
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
            <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
            <h2 className="text-sm font-black uppercase">Five-minute judge path</h2>
          </div>
          <ol className="mt-4 space-y-3">
            {judgeFlow.map((item, index) => (
              <li key={item} className="grid grid-cols-[32px_1fr] gap-3 text-sm leading-6 text-[var(--text-secondary)]">
                <span className="mono grid h-8 w-8 place-items-center border border-[var(--border-subtle)] bg-black text-[var(--accent-primary)]">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <SectionShell title="Use the Product">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {walkthrough.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="panel interactive-panel p-4">
                <Icon className="h-5 w-5 text-[var(--accent-data)]" />
                <h3 className="mt-4 text-sm font-black uppercase">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{step.detail}</p>
              </article>
            );
          })}
        </section>
      </SectionShell>

      <section className="grid gap-4 xl:grid-cols-2">
        <TerminalPanel
          title="Configure Render database"
          detail="Use Supabase session-pooler URLs for Prisma runtime and migrations. Keep real values in Render only."
          commands={`DATABASE_URL=<Supabase session pooler URL, port 5432>
DIRECT_URL=<Supabase session pooler URL, port 5432>
ENABLE_DEMO_MODE=false
ENABLE_PUBLIC_EXPORT=false
MATCHPROOF_OPERATOR_KEY=<secret>`}
          output={`Avoid the transaction-pooler runtime if Prisma logs:
prepared statement "sXX" does not exist`}
        />
        <TerminalPanel
          title="Run validation checks"
          detail="These are the checks used before shipping the hackathon build."
          commands={`npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
npm run test:browser`}
          output={`Smoke tests passed
Browser smoke passed
Render deploy status: live`}
        />
      </section>

      <section className="panel-strong p-4 sm:p-5">
        <div className="max-w-3xl">
          <h2 className="text-xl font-black uppercase">Product boundary</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            MatchProof verifies data integrity only. It does not handle user funds, execute outcome actions, or provide outcome recommendations.
          </p>
        </div>
      </section>
    </main>
  );
}

function TerminalPanel({
  title,
  detail,
  commands,
  output,
}: {
  title: string;
  detail: string;
  commands: string;
  output: string;
}) {
  return (
    <article className="panel interactive-panel p-4">
      <div className="flex items-start gap-3 border-b border-[var(--border-subtle)] pb-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center border border-[var(--border-subtle)] bg-black">
          <Terminal className="h-4 w-4 text-[var(--accent-primary)]" />
        </span>
        <div>
          <h2 className="text-sm font-black uppercase">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{detail}</p>
        </div>
      </div>
      <pre className="mono mt-4 overflow-x-auto border border-[var(--border-subtle)] bg-black p-4 text-xs leading-6 text-[var(--text-secondary)]">
        {commands}
      </pre>
      <div className="mt-3 border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3">
        <p className="text-[10px] font-black uppercase text-[var(--text-muted)]">Expected result</p>
        <pre className="mono mt-2 overflow-x-auto text-xs leading-6 text-[var(--success)]">{output}</pre>
      </div>
    </article>
  );
}
