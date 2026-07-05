import {
  Activity,
  BookOpenCheck,
  CheckCircle2,
  Database,
  FileJson,
  History,
  KeyRound,
  Radio,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { PageHeader, SectionShell } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

export const dynamic = "force-dynamic";

const walkthrough = [
  {
    title: "Open the Command Center",
    detail: "Start with the live operations view. Confirm mode, stream status, fixture count, score update count, agent signals, and proof records.",
    icon: Radio,
  },
  {
    title: "Load or inspect fixtures",
    detail: "Use fixture sync when credentials are configured, then open Fixtures to inspect match inventory, latest update time, signal count, and proof status.",
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
    detail: "Proof Console calls TxLINE validation when credentials and proof data are available, stores the response, and avoids overclaiming independent Solana verification.",
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
  "Command Center: show service level 12, live/demo mode, ingestion controls, and evidence flow.",
  "Fixtures: open a match and inspect raw TxLINE payloads, score timeline, signals, and proof records.",
  "Signals: show source update IDs and evidence JSON for each deterministic agent signal.",
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
        detail="A judge-ready walkthrough for running MatchProof, activating TxLINE credentials, proving the data flow, and testing the build."
      >
        <StatusBadge variant="success">World Cup SL12</StatusBadge>
        <StatusBadge variant="proof">Evidence first</StatusBadge>
      </PageHeader>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="panel-strong track-line p-4 pt-7 sm:p-5 sm:pt-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center border border-[var(--border-subtle)] bg-black">
              <Radio className="h-5 w-5 text-[var(--accent-primary)]" />
            </span>
            <div>
              <p className="text-xs font-black uppercase text-[var(--text-muted)]">System map</p>
              <h2 className="text-xl font-black uppercase">TxLINE update to audit evidence</h2>
            </div>
          </div>
          <pre className="mono mt-5 overflow-x-auto border border-[var(--border-subtle)] bg-black p-4 text-xs leading-6 text-[var(--text-secondary)]">
{`TxLINE fixtures / scores / stream
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
          title="Activate TxLINE service level 12"
          detail="Run these locally with the same Solana mainnet wallet used for the subscription transaction."
          commands={`solana balance
npm run txline:subscribe
npm run txline:activate -- <subscription_tx_signature>`}
          output={`TXLINE_GUEST_JWT=<fresh guest token>
TXLINE_API_TOKEN=<activated token>`}
        />
        <TerminalPanel
          title="Configure Render live mode"
          detail="Set these as Render environment variables. Keep secrets out of Git and chat."
          commands={`DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
TXLINE_NETWORK=mainnet
TXLINE_SERVICE_LEVEL=12
TXLINE_API_ORIGIN=https://txline.txodds.com
TXLINE_API_BASE_URL=https://txline.txodds.com/api
ENABLE_DEMO_MODE=false
ENABLE_PUBLIC_EXPORT=false
TXLINE_GUEST_JWT=<secret>
TXLINE_API_TOKEN=<secret>
MATCHPROOF_OPERATOR_KEY=<secret>`}
          output={`curl https://matchproof.onrender.com/api/health
# expect: mode=live, network=mainnet, serviceLevel=12, hasApiToken=true`}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <TerminalPanel
          title="Operate live ingestion"
          detail="Mutation routes are protected in live mode. Use the operator key header."
          commands={`OPKEY=<your_operator_key>
curl -X POST https://matchproof.onrender.com/api/ingest/fixtures \\
  -H "x-matchproof-operator-key: $OPKEY"

curl -X POST https://matchproof.onrender.com/api/ingest/stream-worker \\
  -H "Content-Type: application/json" \\
  -H "x-matchproof-operator-key: $OPKEY" \\
  -d '{"action":"start"}'`}
          output={`curl https://matchproof.onrender.com/api/ingest/stream-worker
# expect: running=true after the worker starts`}
        />
        <TerminalPanel
          title="Run validation checks"
          detail="These are the checks used before shipping the hackathon build."
          commands={`npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
PLAYWRIGHT_BASE_URL=https://matchproof.onrender.com npm run test:browser`}
          output={`Smoke tests passed
Browser smoke passed
Render deploy status: live`}
        />
      </section>

      <section className="panel-strong p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-black uppercase text-[var(--accent-primary)]">
              <KeyRound className="h-4 w-4" />
              Safety boundary
            </p>
            <h2 className="mt-3 text-xl font-black uppercase">What MatchProof never does</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              The app verifies data integrity only. It does not place wagers, recommend outcomes, run a prediction market, calculate betting edge, or settle user funds.
            </p>
          </div>
          <StatusBadge variant="warning">No betting flows</StatusBadge>
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
