# MatchProof

**Autonomous verification for live World Cup data.**

MatchProof is a TxLINE-powered sports-data integrity, monitoring, replay, verification, and audit console for live World Cup data.

## Overview

Status: Planned

MatchProof monitors fixture and score data, stores raw payloads for evidence, runs deterministic monitoring agents, supports replay, and verifies selected score/stat updates through TxLINE proof flows where credentials and proof data are available.

## Problem

Live sports data consumers need to know whether feeds are connected, timely, consistent, replayable, and verifiable. They also need a way to inspect what changed, when it arrived, and which source update caused an operational signal.

## Solution

MatchProof provides an operator console for TxLINE fixture and score feeds. It focuses on data integrity, auditability, deterministic signals, raw payload inspection, replay, and Solana-backed verification.

## Key Features

- Status: Planned - TxLINE fixture ingestion
- Status: Planned - Score snapshot ingestion
- Status: Planned - Score stream monitoring
- Status: Planned - Deterministic Feed Health Agent
- Status: Planned - Deterministic Match State Agent
- Status: Planned - Signal feed with evidence drawers
- Status: Planned - Match Monitor with raw payload viewer
- Status: Planned - Replay Lab
- Status: Planned - Proof Console
- Status: Planned - Audit Log
- Status: Planned - clearly labeled demo mode

## Why TxLINE

TxLINE provides fixture, score, streaming, historical replay, and stat-validation flows that fit a data integrity product. MatchProof uses TxLINE as the source data layer and preserves raw payload evidence for inspection.

## Architecture

Status: Planned

The documented architecture uses Next.js, TypeScript, Tailwind CSS, shadcn/ui, lucide-react, Prisma, SQLite for local MVP storage, and Server-Sent Events for app updates.

## Autonomous Agents

Status: Planned

Agents are deterministic. The MVP includes Feed Health, Match State, and Proof agent logic. Signals must include evidence, severity, status, source update IDs, and timestamps.

## TxLINE Integration

Status: Planned

Expected endpoints:

- `GET /api/fixtures/snapshot`
- `GET /api/scores/snapshot/{fixtureId}`
- `GET /api/scores/updates/{fixtureId}`
- `GET /api/scores/updates/{epochDay}/{hourOfDay}/{interval}`
- `GET /api/scores/stream`
- `GET /api/scores/historical/{fixtureId}`
- `GET /api/scores/stat-validation`

## Solana Verification

Status: Planned

The Proof Console will request score/stat validation where supported. The app must only show `VERIFIED ON SOLANA` after a real successful verification.

## Replay Mode

Status: Planned

Replay mode will use historical TxLINE updates where available, with seeded fallback data only in clearly labeled demo mode.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- Prisma
- SQLite
- Server-Sent Events

## Project Structure

Status: In Progress

```txt
app/
components/
lib/
prisma/
docs/
```

The full target structure is documented in `05_ARCHITECTURE.md`.

## Getting Started

Status: Planned

Project setup has not been implemented yet. Follow `10_CODEX_HANDOFF.md` for the next build step.

## Environment Variables

See `.env.example`.

## Running Locally

Status: Planned

Local run commands will be documented after the Next.js project setup is complete.

## Demo Mode

Status: Planned

Demo mode must be clearly labeled:

```txt
DEMO MODE - SEEDED FALLBACK DATA
```

Seeded data must never be presented as live TxLINE data or real Solana verification.

## Testing

Status: Planned

Validation commands will be added when the application package scripts are created.

## Deployment

Status: Planned

Deployment is not configured yet.

## TxLINE Endpoints Used

Status: Planned

No runtime endpoint integration has been implemented yet. Target endpoints are listed under TxLINE Integration.

## Product Boundary

MatchProof is not a betting, wagering, gambling, prediction-market, or trading-strategy product.

It does not recommend bets, place wagers, provide picks, calculate gambling profit, manage bankrolls, settle prediction markets, or provide buy/sell recommendations for sports outcomes.

## Known Limitations

- Status: Planned - application shell is not implemented yet.
- Status: Planned - database schema is not implemented yet.
- Status: Planned - TxLINE credentials are not configured.
- Status: Planned - live stream integration is not implemented yet.
- Status: Planned - proof verification is not implemented yet.

## Hackathon Submission

Status: Planned

Final submission requires a public repository, deployed app, demo video, accurate setup instructions, TxLINE endpoint notes, API feedback, and a completed public-repo preparation checklist. The repository must remain private until project-owner approval.

## Feedback on TxLINE

Status: Planned

Feedback will be updated after implementation experience with the TxLINE endpoints.

## License

MIT License. See `LICENSE`.
