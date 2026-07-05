# MatchProof

**Autonomous verification for live World Cup data.**

MatchProof is a TxLINE-powered sports-data integrity, monitoring, replay, verification, and audit console for World Cup data.

## Overview

Status: Implemented MVP

MatchProof monitors fixture and score data, stores raw payloads as evidence, runs deterministic monitoring agents, supports replay, and records selected score/stat proof responses where TxLINE credentials and proof data are available.

## Problem

Live sports-data consumers need to know whether feeds are connected, timely, consistent, replayable, and verifiable. They also need a way to inspect what changed, when it arrived, and which source update caused an operational signal.

## Solution

MatchProof provides an operator console for TxLINE fixture and score feeds. It focuses on data integrity, auditability, deterministic signals, raw payload inspection, replay, and proof-response inspection.

## Key Features

- Status: Implemented - TxLINE client methods for fixture, score, historical, stream, and validation flows
- Status: Implemented - public landing page with product introduction
- Status: Implemented - responsive console for desktop and mobile viewports
- Status: Implemented - MatchProof logo and favicon
- Status: Implemented - match-state ticker from stored fixture data
- Status: Implemented - operator-triggered fixture and score ingestion routes with audit events
- Status: Implemented - bounded TxLINE score stream capture route with app-event SSE bridge
- Status: Implemented - protected long-running TxLINE score stream worker path
- Status: Implemented - Prisma schema with Supabase Postgres for hosted storage and SQLite fallback schema for local demo
- Status: Implemented - deterministic Feed Health Agent
- Status: Implemented - deterministic Match State Agent
- Status: Implemented - Signal feed with evidence drawers
- Status: Implemented - Match Monitor with raw payload viewer
- Status: Implemented - Replay Lab surface and replay API controls
- Status: Implemented - replay step advancement with audit trail
- Status: Implemented - Proof Console with safe demo fallback and TxLINE validation route
- Status: Implemented - Audit Log
- Status: Implemented - JSON evidence export
- Status: Implemented - mutation route rate limiting
- Status: Implemented - live-mode operator key guard for mutation routes
- Status: Implemented - Settings screen and Mode Control panel
- Status: Configured - service-level-12 TxLINE credentials can be supplied through Render environment variables
- Status: Pending - final deployed live-ingestion verification after Supabase runtime connection is stable
- Status: Pending - independent local/on-chain Solana proof verification

## Why TxLINE

TxLINE provides fixture, score, streaming, historical replay, and stat-validation flows that fit a data-integrity product. MatchProof uses TxLINE as the source data layer and preserves raw payload evidence for inspection.

## Architecture

The application uses Next.js, TypeScript, Tailwind CSS, shadcn-compatible component structure, lucide-react, Prisma, Supabase Postgres for hosted evidence storage, SQLite for local/offline demo, and Server-Sent Events for app updates.

## Autonomous Agents

Agents are deterministic. The MVP includes Feed Health, Match State, and Proof agent logic. Signals include evidence, severity, status, source update IDs, and timestamps.

## TxLINE Integration

Status: Implemented for route/client/worker surfaces; deployed live-ingestion verification remains pending until the Supabase runtime connection is stable.

Runtime client methods, ingestion routes, bounded stream capture, and the protected stream worker path are implemented. `ENABLE_DEMO_MODE` decides whether the UI seeds fallback evidence or triggers live TxLINE ingestion.

Default target:

- `TXLINE_NETWORK=mainnet`
- `TXLINE_SERVICE_LEVEL=12`
- `TXLINE_API_ORIGIN=https://txline.txodds.com`

Operator ingestion routes:

- `POST /api/ingest/fixtures`
- `POST /api/ingest/scores`
- `POST /api/ingest/stream`
- `GET /api/ingest/stream-worker`
- `POST /api/ingest/stream-worker`

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

Replay mode uses stored updates and seeded fallback data in demo mode. Seeded data is clearly labeled and is not presented as live TxLINE data or real Solana verification.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible component conventions
- lucide-react
- Prisma
- Supabase Postgres
- SQLite local demo schema
- Server-Sent Events
- Playwright browser smoke checks

## Project Structure

```txt
app/
components/
lib/
prisma/
scripts/
```

Hackathon technical details are summarized in `TECHNICAL_DOCUMENTATION.md`.

## Getting Started

```bash
npm install
npm run dev:demo
```

## Environment Variables

See `.env.example`.

## Running Locally

```bash
npm run dev:demo
```

Open `http://localhost:3000`.

## Database Modes

MatchProof supports two database paths:

- Live / Render: Supabase hosted Postgres using the default `prisma/schema.prisma` and migrations.
- Local demo: SQLite fallback using `prisma/schema.sqlite.prisma` and `npm run dev:demo`.

`ENABLE_DEMO_MODE` controls data behavior, not the Prisma provider at runtime:

- `ENABLE_DEMO_MODE=true` seeds clearly labeled fallback data.
- `ENABLE_DEMO_MODE=false` uses real TxLINE ingestion controls. Any non-`true` value is treated as live mode.

## Supabase / Render database setup

Prisma is configured with both runtime and migration URLs:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

For Render, use Supabase's pooler host, not the direct IPv6 database host.

Recommended stable setup for this MVP:

```txt
DATABASE_URL=Supabase session pooler URL, port 5432
DIRECT_URL=Supabase session pooler URL, port 5432
```

The transaction pooler on port `6543` can trigger Prisma prepared-statement errors such as `prepared statement "sXX" does not exist` unless it is configured exactly for PgBouncer compatibility. For this deployment, prefer the session pooler for runtime queries.

Do not use `db.<project-ref>.supabase.co:5432` on Render if it cannot be reached from the service.

## Demo Mode

Demo mode is clearly labeled:

```txt
DEMO MODE - SEEDED FALLBACK DATA
```

Seeded data is never presented as live TxLINE data or real Solana verification. The seeded demo includes previous, current, and upcoming fixture rows so the match-state ticker and fixture views can be evaluated without live TxLINE credentials.

## Testing

```bash
npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
npm run test:browser
```

Mobile visual checks are performed with Playwright screenshots at `390x844` for the landing page, Command Center, and Match Monitor.

## Deployment

The Render deployment target is:

```txt
https://matchproof.onrender.com
```

`render.yaml` is included for repeatable Render deployment. Configure these in Render environment variables:

```txt
DATABASE_URL=<Supabase session pooler URL, port 5432>
DIRECT_URL=<Supabase session pooler URL, port 5432>
ENABLE_DEMO_MODE=false
ENABLE_PUBLIC_EXPORT=false
TXLINE_NETWORK=mainnet
TXLINE_SERVICE_LEVEL=12
TXLINE_API_ORIGIN=https://txline.txodds.com
TXLINE_API_BASE_URL=https://txline.txodds.com/api
SOLANA_RPC_URL=<mainnet Solana RPC URL>
TXLINE_PROGRAM_ID=<TxLINE program ID>
TXLINE_TXL_TOKEN_MINT=<TxLINE token mint>
TXLINE_GUEST_JWT=<activated guest JWT>
TXLINE_API_TOKEN=<activated TxLINE API token>
MATCHPROOF_OPERATOR_KEY=<private operator key>
```

## TxLINE Endpoints Used

Client methods are implemented for fixture snapshot, score snapshot, score updates, bounded score stream capture, long-running score stream worker, historical scores, and score stat validation flows.

The Command Center exposes operator controls for fixture sync, score snapshots, recent score updates, historical score ingestion, short score stream capture, and starting/stopping the score stream worker. Settings also includes a Mode Control panel: in demo mode it seeds fallback data, and in live mode it triggers real TxLINE fixture ingestion with the operator key.

State-changing API routes include lightweight per-client rate limits to reduce accidental or anonymous abuse in public demo deployments.

In live mode (`ENABLE_DEMO_MODE=false`), mutation routes require `MATCHPROOF_OPERATOR_KEY` through either the `x-matchproof-operator-key` header or a Bearer token. Evidence export is public only in demo mode unless `ENABLE_PUBLIC_EXPORT=true`.

## Product Boundary

MatchProof is not a betting, wagering, gambling, prediction-market, or trading-strategy product.

It does not recommend bets, place wagers, provide picks, calculate gambling profit, manage bankrolls, settle prediction markets, or provide buy/sell recommendations for sports outcomes.

## Known Limitations

- Status: In Progress - deployed Supabase runtime verification is being stabilized.
- Status: In Progress - hosted stream worker operation requires an operator-triggered start after deployment.
- Status: Planned - independent local/on-chain Solana verification beyond TxLINE proof-response retrieval.
- Status: Planned - final public repository switch requires project-owner approval.

## Hackathon Submission

Status: In Progress

Final submission still requires project-owner approval to make the repository public, a demo video, final deployed health/browser checks, final TxLINE endpoint notes, API feedback, and a completed public-repo preparation checklist. The repository must remain private until project-owner approval.

## Feedback on TxLINE

Our experience with the TxLINE API was positive. The fixture, score snapshot, score update, historical, stream, and stat-validation surfaces gave enough structure to build MatchProof as a verifiable resolution console rather than a generic scores dashboard.

What worked well was the evidence-oriented shape of the data: fixture IDs, score update sequences, stat keys, raw payloads, and proof-response material can all be preserved and replayed later. That fits MatchProof's audit-console approach.

The main friction was operational rather than conceptual. We needed clearer hackathon examples for the full path from one World Cup fixture ID to one score update, one stat key, one stat-validation request, and one proof response. Activation also required careful environment alignment between guest JWT, API token, Solana network, program ID, and service level. More end-to-end examples for stream deployment on hosted platforms would help future builders move faster.

## License

MIT License. See `LICENSE`.
