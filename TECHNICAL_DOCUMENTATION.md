# MatchProof Technical Documentation

## Core Idea

MatchProof is an evidence-first operator console for live World Cup data. It ingests TxLINE fixture and score feeds, stores raw payloads, runs deterministic monitoring agents, supports replay, and records TxLINE proof responses for score/stat validation.

MatchProof is not a betting, wagering, gambling, prediction-market, or trading product.

## Hackathon Track Fit

MatchProof targets the TxODDS World Cup "Prediction Markets and Settlement" track without adding wagering functionality. The project focuses on the data integrity and verification layer that settlement or analytics systems need before they can trust a match update.

## TxLINE Configuration

Target free tier:

```txt
TXLINE_NETWORK=mainnet
TXLINE_SERVICE_LEVEL=12
TXLINE_API_ORIGIN=https://txline.txodds.com
TXLINE_API_BASE_URL=https://txline.txodds.com/api
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
TXLINE_PROGRAM_ID=9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA
TXLINE_TXL_TOKEN_MINT=Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL
```

Service level 12 is the free real-time World Cup and International Friendlies tier on mainnet. The guest JWT, subscription transaction, activation endpoint, Solana RPC, program ID, and API host must all use the same network.

## TxLINE Endpoints Used

MatchProof implements client and route surfaces for:

```txt
POST /auth/guest/start
POST /api/token/activate
GET /api/fixtures/snapshot
GET /api/scores/snapshot/{fixtureId}
GET /api/scores/updates/{fixtureId}
GET /api/scores/updates/{epochDay}/{hourOfDay}/{interval}
GET /api/scores/stream
GET /api/scores/historical/{fixtureId}
GET /api/scores/stat-validation
```

The hosted deployment can run in demo or live mode. `ENABLE_DEMO_MODE=true` seeds labeled fallback data. `ENABLE_DEMO_MODE=false` uses real TxLINE ingestion controls with server-side credentials. Any non-`true` value is treated as live mode.

## Data Flow

```txt
TxLINE fixture or score source
-> MatchProof ingestion route or stream worker
-> raw payload stored as FeedUpdate
-> deterministic agent runtime
-> AgentSignal with evidence and source update link
-> AuditLog
-> App SSE event for frontend refresh
```

## Stream Worker

The stream worker path connects to the TxLINE score stream, parses SSE events, persists score updates, runs the agent runtime, writes audit logs, emits app events, and reconnects with backoff.

Implemented route surface:

```txt
GET /api/ingest/stream-worker
POST /api/ingest/stream-worker
POST /api/ingest/stream
GET /api/stream/app-events
```

## Deterministic Agents

Feed Health Agent:

- detects malformed payloads
- detects stale provider timestamps
- detects duplicate fixture-scoped sequence numbers

Match State Agent:

- tracks previous score and period per fixture
- emits fixture-scoped score and period changes

Proof Agent:

- records proof request failures
- records TxLINE proof responses as `proof_received`
- does not claim independent Solana verification unless that layer succeeds

## Storage

MatchProof uses Prisma with two database paths:

- Live / Render: Supabase hosted Postgres using `prisma/schema.prisma` and the tracked Postgres migrations.
- Local/offline demo: SQLite using `prisma/schema.sqlite.prisma` and `npm run dev:demo`.

Main models:

- `Fixture`
- `FeedUpdate`
- `AgentSignal`
- `VerificationResult`
- `ReplaySession`
- `AuditLog`

`ENABLE_DEMO_MODE` controls data behavior, not the generated Prisma provider at runtime. Use the Settings Mode Control panel to trigger the active data path:

- Demo mode: `ENABLE_DEMO_MODE=true` seeds fallback data.
- Live mode: `ENABLE_DEMO_MODE=false` syncs real TxLINE fixtures using the operator key.

## Operator Security

Public read-only pages are available for demo judging. In live mode:

- mutation routes require `MATCHPROOF_OPERATOR_KEY`
- evidence export is disabled unless `ENABLE_PUBLIC_EXPORT=true`
- rate limiting is in-memory and intended as demo protection only

Protected mutation routes:

```txt
POST /api/ingest/fixtures
POST /api/ingest/scores
POST /api/ingest/stream
POST /api/ingest/stream-worker
POST /api/verify/score-stat
POST /api/signals/[id]/acknowledge
```

## Demo Video Flow

1. Open the landing page and Command Center.
2. Show the Settings Mode Control panel and TxLINE service-level-12 configuration.
3. In demo mode, trigger fallback seeding; in live mode, enter the operator key and trigger TxLINE fixture sync.
4. Show seeded fixtures, raw payloads, and agent signals.
5. Open a fixture monitor and inspect evidence.
6. Run Replay Lab through start, step, pause, and reset.
7. Open Proof Console and explain `proof_received` vs independent Solana verification.
8. Show Audit Log and JSON evidence export.

## Deployment

Live demo:

```txt
https://matchproof.onrender.com
```

Required Render environment variables:

```txt
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
ENABLE_DEMO_MODE=false
ENABLE_PUBLIC_EXPORT=false
TXLINE_NETWORK=mainnet
TXLINE_SERVICE_LEVEL=12
TXLINE_API_ORIGIN=https://txline.txodds.com
TXLINE_API_BASE_URL=https://txline.txodds.com/api
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
TXLINE_PROGRAM_ID=9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA
TXLINE_TXL_TOKEN_MINT=Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL
TXLINE_GUEST_JWT=<activated guest JWT>
TXLINE_API_TOKEN=<activated TxLINE API token>
MATCHPROOF_OPERATOR_KEY=<private operator key>
```

Generate the non-secret Render values and a private operator key locally:

```bash
npm run txline:env
```

Fetch a fresh TxLINE guest JWT for the activation flow:

```bash
npm run txline:env -- --guest-jwt
```

For local SQLite demo mode, run:

```bash
npm run dev:demo
```

Switch Render to `ENABLE_DEMO_MODE=false` only after Supabase Postgres, activated TxLINE credentials, and `MATCHPROOF_OPERATOR_KEY` are configured.

## Validation

Local validation commands:

```bash
npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
npm run test:browser
```

## Known Limitations

- Activated TxLINE service-level-12 credentials are required before the hosted worker can ingest real live stream events.
- Independent local/on-chain Solana proof verification is pending; current proof flow records TxLINE validation responses as proof material.
- Supabase Postgres is required for durable hosted evidence storage; SQLite remains available only for local/offline demo mode.
- In-memory rate limiting is demo protection only.
