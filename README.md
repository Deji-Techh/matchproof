# MatchProof

**Autonomous verification for live World Cup data.**

MatchProof is a TxLINE-powered sports-data integrity, monitoring, replay, verification, and audit console for live World Cup data.

## Overview

Status: Implemented

MatchProof monitors fixture and score data, stores raw payloads for evidence, runs deterministic monitoring agents, supports replay, and records selected score/stat proof responses where TxLINE credentials and proof data are available.

## Problem

Live sports data consumers need to know whether feeds are connected, timely, consistent, replayable, and verifiable. They also need a way to inspect what changed, when it arrived, and which source update caused an operational signal.

## Solution

Status: Implemented

MatchProof provides an operator console for TxLINE fixture and score feeds. It focuses on data integrity, auditability, deterministic signals, raw payload inspection, replay, and proof-response inspection.

## Key Features

- Status: Implemented - documented TxLINE client methods for fixture, score, historical, stream, and validation flows
- Status: Implemented - public landing page with video-backed product introduction
- Status: Implemented - responsive console redesign for desktop and mobile viewports
- Status: Implemented - MatchProof logo and favicon
- Status: Implemented - match-state ticker showing previous results, current monitored matches, and upcoming fixtures from stored fixture data
- Status: Implemented - operator-triggered fixture and score ingestion routes with audit events
- Status: Implemented - bounded TxLINE score stream capture route with app event SSE bridge
- Status: Implemented - protected long-running TxLINE score stream worker path
- Status: Implemented - Prisma schema and SQLite demo seed
- Status: Implemented - deterministic Feed Health Agent
- Status: Implemented - deterministic Match State Agent
- Status: Implemented - Signal feed with evidence drawers
- Status: Implemented - Match Monitor with raw payload viewer
- Status: Implemented - Replay Lab surface and replay API controls
- Status: Implemented - replay step advancement with audit trail
- Status: Implemented - Proof Console with safe demo fallback and real TxLINE validation route
- Status: Implemented - Audit Log
- Status: Implemented - JSON evidence export
- Status: Implemented - mutation route rate limiting
- Status: Implemented - live-mode operator key guard for mutation routes
- Status: Implemented - Settings screen
- Status: Implemented - clearly labeled demo mode
- Status: Pending - activated TxLINE service-level-12 credentials in hosted environment
- Status: Pending - independent local/on-chain Solana proof verification

## Why TxLINE

TxLINE provides fixture, score, streaming, historical replay, and stat-validation flows that fit a data integrity product. MatchProof uses TxLINE as the source data layer and preserves raw payload evidence for inspection.

## Architecture

Status: Implemented

The application uses Next.js, TypeScript, Tailwind CSS, shadcn-compatible component structure, lucide-react, Prisma, SQLite for local MVP storage, and Server-Sent Events for app updates.

## Autonomous Agents

Status: Implemented

Agents are deterministic. The MVP includes Feed Health, Match State, and Proof agent logic. Signals include evidence, severity, status, source update IDs, and timestamps.

## TxLINE Integration

Status: Implemented for route/client/worker surfaces; pending for credential-backed live data in the hosted environment.

Runtime client methods, ingestion routes, bounded stream capture, and the protected stream worker path are implemented. Demo mode remains active until TxLINE credentials are configured.

The default documented target is the World Cup free real-time tier:

- `TXLINE_NETWORK=mainnet`
- `TXLINE_SERVICE_LEVEL=12`
- `TXLINE_API_ORIGIN=https://txline.txodds.com`

Operator ingestion routes:

- `POST /api/ingest/fixtures`
- `POST /api/ingest/scores`
- `POST /api/ingest/stream`
- `GET /api/ingest/stream-worker`
- `POST /api/ingest/stream-worker`

Evidence export:

- `GET /api/export`

Expected TxLINE endpoints:

- `GET /api/fixtures/snapshot`
- `GET /api/scores/snapshot/{fixtureId}`
- `GET /api/scores/updates/{fixtureId}`
- `GET /api/scores/updates/{epochDay}/{hourOfDay}/{interval}`
- `GET /api/scores/stream`
- `GET /api/scores/historical/{fixtureId}`
- `GET /api/scores/stat-validation`

## Solana Verification

Status: Implemented for TxLINE proof-response retrieval and storage; pending for independent local/on-chain verification.

The Proof Console can store proof records and the `/api/verify/score-stat` route calls TxLINE stat validation when credentials are configured. When the TxLINE endpoint returns proof material, MatchProof records that as `proof_received`. It does not claim independent Solana verification until a local/on-chain validation layer is implemented and succeeds.

## Replay Mode

Status: Implemented

Replay mode uses stored updates and seeded fallback data in demo mode. Seeded data is clearly labeled and is not presented as live TxLINE data.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible component conventions
- lucide-react
- Prisma
- SQLite
- Server-Sent Events
- Playwright browser smoke checks

## Project Structure

Status: Implemented

```txt
app/
components/
lib/
prisma/
docs/
scripts/
```

The full target structure is documented in `05_ARCHITECTURE.md`.

## Getting Started

Status: Implemented

```bash
npm install
DATABASE_URL="file:./dev.db" ENABLE_DEMO_MODE=true npx prisma migrate dev
DATABASE_URL="file:./dev.db" ENABLE_DEMO_MODE=true npm run dev
```

## Environment Variables

See `.env.example`.

## Running Locally

Status: Implemented

```bash
DATABASE_URL="file:./dev.db" ENABLE_DEMO_MODE=true npm run dev
```

Open `http://localhost:3000`.

## Demo Mode

Status: Implemented

Demo mode is clearly labeled:

```txt
DEMO MODE - SEEDED FALLBACK DATA
```

Seeded data is never presented as live TxLINE data or real Solana verification.

The seeded demo includes previous, current, and upcoming fixture rows so the match-state ticker and fixture views can be evaluated without live TxLINE credentials.

## Testing

Status: Implemented

```bash
DATABASE_URL="file:./dev.db" ENABLE_DEMO_MODE=true npm run lint
DATABASE_URL="file:./dev.db" ENABLE_DEMO_MODE=true npm run typecheck
DATABASE_URL="file:./dev.db" ENABLE_DEMO_MODE=true npm test
DATABASE_URL="file:./dev.db" ENABLE_DEMO_MODE=true npm run test:browser
DATABASE_URL="file:./dev.db" ENABLE_DEMO_MODE=true npm run build
```

Mobile visual checks are performed with Playwright screenshots at `390x844` for the landing page, Command Center, and Match Monitor.

## Deployment

Status: Implemented

The Render deployment is live at `https://matchproof.onrender.com`.

`render.yaml` is included for repeatable Render deployment. Configure real TxLINE credentials in Render environment variables if live integration is required.

## TxLINE Endpoints Used

Status: Implemented

Client methods are implemented for the fixture snapshot, score snapshot, score updates, bounded score stream capture, long-running score stream worker, historical scores, and score stat validation flows.

The Command Center exposes operator controls for fixture sync, score snapshots, recent score updates, historical score ingestion, short score stream capture, and starting/stopping the score stream worker. If credentials are missing, failed live calls are recorded as audit events and demo data remains active.

State-changing API routes include lightweight per-client rate limits to reduce accidental or anonymous abuse in public demo deployments.

In live mode (`ENABLE_DEMO_MODE=false`), mutation routes require `MATCHPROOF_OPERATOR_KEY` through either the `x-matchproof-operator-key` header or a Bearer token. Evidence export is public only in demo mode unless `ENABLE_PUBLIC_EXPORT=true`.

## Product Boundary

MatchProof is not a betting, wagering, gambling, prediction-market, or trading-strategy product.

It does not recommend bets, place wagers, provide picks, calculate gambling profit, manage bankrolls, settle prediction markets, or provide buy/sell recommendations for sports outcomes.

## Known Limitations

- Status: In Progress - TxLINE service level 12 is configured as the mainnet target, but activated credentials are not configured in this local or hosted demo environment.
- Status: In Progress - the stream worker path exists, but hosted live operation requires activated TxLINE credentials.
- Status: Planned - independent local/on-chain Solana verification beyond TxLINE proof-response retrieval.
- Status: Planned - final public repository switch requires project-owner approval.

## Hackathon Submission

Status: In Progress

The deployed app is available at `https://matchproof.onrender.com`.

Final submission still requires project-owner approval to make the repository public, a demo video, final TxLINE endpoint notes, API feedback, and a completed public-repo preparation checklist. The repository must remain private until project-owner approval.

## Feedback on TxLINE

Status: In Progress

The client and route surfaces are implemented. API feedback will be updated after testing with real TxLINE credentials.

## License

MIT License. See `LICENSE`.
