import type { CSSProperties } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Boxes,
  Database,
  FileJson,
  Gauge,
  History,
  Radio,
  ScrollText,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { MatchTicker } from "@/components/shell/match-ticker";
import { getHealthSummary } from "@/lib/db/queries";
import { formatDateTime } from "@/lib/utils";

/* ------------------------------------------------------------------
 * LANDING PAGE CONTENT STORYBOARD
 *
 * Static nav is visible immediately.
 * Only content blocks cascade in on page load.
 *
 *    0ms   video field + live strip visible
 *  100ms   hero proof copy reveals from left
 *  240ms   hero product console reveals from right
 *  420ms   metric rail reveals upward
 *  640ms   how-it-works cards stagger upward
 *  820ms   operator surface panels reveal upward
 * ------------------------------------------------------------------ */

const REVEAL = {
  heroCopy: "100ms",
  heroConsole: "240ms",
  metrics: "420ms",
  cards: "640ms",
  panels: "820ms",
};

const replaySteps = [
  {
    icon: Database,
    title: "Capture",
    body: "Fixture snapshots and score updates are stored with raw payload evidence.",
  },
  {
    icon: Siren,
    title: "Detect",
    body: "Deterministic agents flag stale, malformed, duplicate, and state-changing updates.",
  },
  {
    icon: History,
    title: "Replay",
    body: "Operators replay the exact update sequence that created a signal.",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    body: "Proof requests call TxLINE validation when credentials and proof data are available.",
  },
];

const surfaces = [
  ["Command Center", "Stream health, agent runtime, verification summary, and ingestion controls."],
  ["Match Monitor", "Fixture state, score timeline, raw payloads, signals, and proof records."],
  ["Replay Lab", "Step through stored events without mutating live evidence."],
  ["Audit Log", "Trace operator actions, agent output, ingestion errors, and proof requests."],
];

export default async function Home() {
  const summary = await getHealthSummary();
  const modeVariant = summary.mode === "live" ? "success" : "warning";

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      <LandingNav mode={summary.mode} />
      <MatchTicker />

      <section className="relative isolate min-h-[calc(100vh-105px)] overflow-hidden border-b border-[var(--border-subtle)]">
        <video
          className="hero-video absolute inset-0 -z-20 h-full w-full object-cover"
          src="/media/matchproof-field.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Football pitch background video"
        />
        <div className="absolute inset-0 -z-10 bg-black/72" />
        <div className="absolute inset-x-0 top-0 -z-10 h-20 bg-[var(--bg-main)]/80" />
        <div className="mx-auto grid min-h-[calc(100vh-105px)] max-w-[1600px] items-center gap-8 px-4 py-10 sm:px-5 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-10">
          <div className="reveal-left max-w-4xl" style={delay(REVEAL.heroCopy)}>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge variant={modeVariant}>{summary.mode} mode</StatusBadge>
              <StatusBadge variant="info">TxLINE-powered</StatusBadge>
              <StatusBadge variant="proof">Solana proof surface</StatusBadge>
            </div>
            <h1 className="hero-title safe-word mt-7 max-w-5xl font-black uppercase leading-[0.92] tracking-normal">
              Autonomous verification for live World Cup data.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
              MatchProof turns fixture feeds, score updates, deterministic agent signals, replay sessions, and proof checks into one evidence-first operator console.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/command-center"
                className="interactive-panel inline-flex min-h-11 items-center gap-2 border border-[var(--accent-red)] bg-[var(--accent-red)] px-4 py-3 text-sm font-black uppercase text-black sm:px-5"
              >
                Open console
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#system"
                className="interactive-panel inline-flex min-h-11 items-center gap-2 border border-[var(--border-strong)] bg-black px-4 py-3 text-sm font-semibold uppercase text-[var(--text-primary)] sm:px-5"
              >
                View system
                <Gauge className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="reveal-right" style={delay(REVEAL.heroConsole)}>
            <HeroConsole
              fixtureCount={summary.fixtureCount}
              updateCount={summary.updateCount}
              signalCount={summary.signalCount}
              verificationCount={summary.verificationCount}
              latestUpdateAt={summary.latestUpdateAt}
            />
          </div>
        </div>
      </section>

      <section className="bg-black py-8">
        <div className="mx-auto grid max-w-[1600px] gap-3 px-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-4 lg:px-10">
          {[
            ["Fixtures", summary.fixtureCount],
            ["Score updates", summary.updateCount],
            ["Agent signals", summary.signalCount],
            ["Proof records", summary.verificationCount],
          ].map(([label, value], index) => (
            <div key={label} className="reveal-up panel-strong interactive-panel p-4 sm:p-5" style={delay(REVEAL.metrics, index * 70)}>
              <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">{label}</p>
              <p className="mt-3 text-4xl font-black">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="system" className="section-band track-line py-16">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-5 lg:px-10">
          <div className="reveal-up max-w-3xl" style={delay(REVEAL.cards)}>
            <p className="text-xs font-black uppercase text-[var(--accent-red)]">How it works</p>
            <h2 className="page-title safe-word mt-3 font-black uppercase leading-none tracking-normal">Sport action becomes auditable data.</h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {replaySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="reveal-up panel interactive-panel p-5" style={delay(REVEAL.cards, index * 80)}>
                  <Icon className="h-6 w-6 text-[var(--accent-cyan)]" />
                  <h3 className="mt-5 text-xl font-black uppercase">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{step.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-main)] py-16">
        <div className="mx-auto grid max-w-[1600px] gap-8 px-4 sm:px-5 lg:grid-cols-[0.7fr_1.3fr] lg:px-10">
          <div className="reveal-up" style={delay(REVEAL.panels)}>
            <p className="text-xs font-black uppercase text-[var(--accent-red)]">Operator surfaces</p>
            <h2 className="page-title safe-word mt-3 font-black uppercase leading-none tracking-normal">Built for inspection under pressure.</h2>
            <p className="mt-5 text-sm leading-6 text-[var(--text-secondary)]">
              The console prioritizes source evidence, deterministic status, replayability, and audit trails. It never provides outcome recommendations or transactional sports guidance.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {surfaces.map(([title, body], index) => (
              <article key={title} className="reveal-up panel-strong interactive-panel p-5" style={delay(REVEAL.panels, index * 70)}>
                <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                  <h3 className="font-black uppercase">{title}</h3>
                  <FileJson className="h-5 w-5 text-[var(--text-muted)]" />
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border-subtle)] bg-black px-4 py-8 sm:px-5 lg:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 text-sm text-[var(--text-secondary)]">
          <p className="font-black uppercase text-[var(--text-primary)]">MatchProof</p>
          <p>Sports-data integrity, monitoring, replay, verification, and audit only.</p>
        </div>
      </footer>
    </main>
  );
}

function LandingNav({ mode }: { mode: string }) {
  return (
    <nav className="flex min-h-16 items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] px-3 sm:px-5 lg:px-10">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center bg-[var(--accent-red)] font-black text-black">MP</span>
        <span>
          <span className="block font-black uppercase leading-none">MatchProof</span>
          <span className="mono mt-1 block text-[10px] uppercase text-[var(--text-muted)]">World Cup data verification</span>
        </span>
      </Link>
      <div className="hidden items-center gap-2 md:flex">
        <StatusBadge variant={mode === "live" ? "success" : "warning"}>{mode} mode</StatusBadge>
        <Link className="interactive-panel border border-[var(--border-subtle)] px-4 py-2 text-xs font-semibold uppercase" href="/fixtures">
          Fixtures
        </Link>
        <Link className="interactive-panel border border-[var(--border-subtle)] px-4 py-2 text-xs font-semibold uppercase" href="/proof-console">
          Proof console
        </Link>
      </div>
      <Link className="interactive-panel border border-[var(--accent-red)] bg-[var(--accent-red)] px-3 py-2 text-xs font-black uppercase text-black md:hidden" href="/command-center">
        Console
      </Link>
    </nav>
  );
}

function HeroConsole({
  fixtureCount,
  updateCount,
  signalCount,
  verificationCount,
  latestUpdateAt,
}: {
  fixtureCount: number;
  updateCount: number;
  signalCount: number;
  verificationCount: number;
  latestUpdateAt: Date | null;
}) {
  const rows = [
    ["Feed health", "Seeded fallback stream", Radio, "warning"],
    ["Agent runtime", `${signalCount} deterministic signals`, Activity, "success"],
    ["Raw evidence", `${updateCount} score updates stored`, Boxes, "info"],
    ["Proof queue", `${verificationCount} validation records`, ShieldCheck, "proof"],
    ["Audit trail", `${fixtureCount} fixture context rows`, ScrollText, "neutral"],
  ] as const;

  return (
    <aside className="data-scan panel-strong track-line p-4 pt-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <p className="mono text-[11px] uppercase text-[var(--text-muted)]">Command Center Preview</p>
          <h2 className="mt-2 text-2xl font-black uppercase">Live integrity board</h2>
        </div>
        <StatusBadge variant="warning">Demo stream</StatusBadge>
      </div>
      <div className="mt-4 space-y-2">
        {rows.map(([label, value, Icon, variant]) => (
          <div key={label} className="flex items-center justify-between gap-4 border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-3">
            <div className="flex min-w-0 items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 text-[var(--text-secondary)]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">{label}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">{value}</p>
              </div>
            </div>
            <StatusBadge variant={variant}>{variant}</StatusBadge>
          </div>
        ))}
      </div>
      <div className="mt-4 border border-[var(--border-subtle)] bg-black p-4">
        <p className="mono text-[11px] uppercase text-[var(--text-muted)]">Latest source update</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{formatDateTime(latestUpdateAt)}</p>
      </div>
    </aside>
  );
}

function delay(base: string, offset = 0): CSSProperties {
  const ms = Number(base.replace("ms", "")) + offset;
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}
