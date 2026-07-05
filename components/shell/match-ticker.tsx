"use client";

import { useMemo } from "react";
import type { AgentSignal, FeedUpdate, Fixture, VerificationResult } from "@prisma/client";

type FixtureRow = Fixture & {
  updates: FeedUpdate[];
  signals: AgentSignal[];
  verifications: VerificationResult[];
};

type TickerItem = {
  section: "previous" | "current" | "upcoming";
  text: string;
};

const kickoffFormatter = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  month: "short",
  day: "2-digit",
});

export function MatchTicker({ fixtures }: { fixtures: FixtureRow[] }) {
  const items = useMemo(() => buildTickerItems(fixtures), [fixtures]);
  const visibleItems = items.length > 0 ? items : [{ section: "current" as const, text: "No stored match state" }];
  const tickerItems = [...visibleItems, ...visibleItems, ...visibleItems];

  return (
    <div className="live-strip h-9">
      <div className="live-strip-track flex h-full items-center gap-7 px-4 text-[11px] font-black uppercase text-[var(--text-secondary)]">
        {tickerItems.map((item, index) => (
          <span key={`${item.section}-${item.text}-${index}`} className="flex items-center gap-2 whitespace-nowrap">
            <span className={dotClass(item.section)} />
            <span className="text-[var(--text-muted)]">{label(item.section)}</span>
            <span>{item.text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function buildTickerItems(fixtures: FixtureRow[]): TickerItem[] {
  const rows = fixtures.map((fixture) => ({ fixture, latest: latestUpdate(fixture) }));
  const previous = rows
    .filter(({ fixture, latest }) => isCompleted(fixture, latest))
    .sort((a, b) => timeValue(b.fixture.startTime) - timeValue(a.fixture.startTime))
    .slice(0, 3)
    .map(({ fixture, latest }) => ({
      section: "previous" as const,
      text: `${team(fixture.participant1)} ${scoreText(latest)} ${team(fixture.participant2)} ${periodText(latest, "FT")}`,
    }));

  const current = rows
    .filter(({ fixture, latest }) => isCurrent(fixture, latest))
    .sort((a, b) => timeValue(a.fixture.startTime) - timeValue(b.fixture.startTime))
    .slice(0, 3)
    .map(({ fixture, latest }) => ({
      section: "current" as const,
      text: `${team(fixture.participant1)} ${scoreText(latest)} ${team(fixture.participant2)} ${periodText(latest, "LIVE")}`,
    }));

  const upcoming = rows
    .filter(({ fixture, latest }) => isUpcoming(fixture, latest))
    .sort((a, b) => timeValue(a.fixture.startTime) - timeValue(b.fixture.startTime))
    .slice(0, 3)
    .map(({ fixture }) => ({
      section: "upcoming" as const,
      text: `${team(fixture.participant1)} vs ${team(fixture.participant2)} ${kickoffText(fixture.startTime)}`,
    }));

  return [...previous, ...current, ...upcoming];
}

function latestUpdate(fixture: FixtureRow) {
  return [...fixture.updates].sort((a, b) => new Date(b.ingestedAt).getTime() - new Date(a.ingestedAt).getTime())[0];
}

function isCompleted(fixture: FixtureRow, latest?: FeedUpdate) {
  const status = `${fixture.status ?? ""} ${rawStatus(latest)}`.toLowerCase();
  return status.includes("completed") || status.includes("finished") || status.includes("full_time") || status.includes("ft");
}

function isCurrent(fixture: FixtureRow, latest?: FeedUpdate) {
  if (isCompleted(fixture, latest)) return false;
  const status = `${fixture.status ?? ""} ${rawStatus(latest)}`.toLowerCase();
  return status.includes("live") || status.includes("half") || status.includes("period") || status.includes("second_half") || status.includes("first_half");
}

function isUpcoming(fixture: FixtureRow, latest?: FeedUpdate) {
  if (isCompleted(fixture, latest) || isCurrent(fixture, latest)) return false;
  const status = `${fixture.status ?? ""} ${rawStatus(latest)}`.toLowerCase();
  return status.includes("upcoming") || status.includes("scheduled") || !latest;
}

function rawStatus(update?: FeedUpdate) {
  return parseRaw(update)?.status ?? "";
}

function scoreText(update?: FeedUpdate) {
  const score = parseRaw(update)?.score;
  if (typeof score?.listedHome === "number" && typeof score?.listedAway === "number") {
    return `${score.listedHome}-${score.listedAway}`;
  }
  return "0-0";
}

function periodText(update: FeedUpdate | undefined, fallback: string) {
  const period = parseRaw(update)?.period;
  return typeof period === "string" ? period : fallback;
}

function parseRaw(update?: FeedUpdate): { status?: string; period?: string; score?: { listedHome?: number; listedAway?: number } } | null {
  if (!update?.rawJson) return null;
  try {
    return JSON.parse(update.rawJson) as { status?: string; period?: string; score?: { listedHome?: number; listedAway?: number } };
  } catch {
    return null;
  }
}

function kickoffText(value: Date | string | null) {
  if (!value) return "time pending";
  return kickoffFormatter.format(new Date(value));
}

function timeValue(value: Date | string | null) {
  return value ? new Date(value).getTime() : 0;
}

function team(value?: string | null) {
  return value ?? "TBD";
}

function label(section: TickerItem["section"]) {
  return section === "previous" ? "Previous" : section === "current" ? "Current" : "Upcoming";
}

function dotClass(section: TickerItem["section"]) {
  const color =
    section === "previous"
      ? "bg-[var(--text-muted)]"
      : section === "current"
        ? "bg-[var(--accent-primary)]"
        : "bg-[var(--accent-data)]";
  return `h-1.5 w-1.5 rounded-sm ${color}`;
}
