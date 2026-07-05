# TxLINE API Feedback

## Team Experience

TxLINE is a strong fit for a sports-data integrity console because the product surface is organized around fixtures, scores, stream updates, historical replay, and validation proofs. The single normalized schema made it straightforward to model raw feed updates and keep evidence linked to deterministic agent signals.

## What Worked Well

- The World Cup free tier is useful for hackathon builds because it removes commercial-data setup friction.
- The distinction between delayed service level 1 and real-time service level 12 is clear.
- The docs clearly warn that the Solana RPC, TxLINE program ID, guest JWT, and activation endpoint must all match the same network.
- The availability of score streams, historical replay, and validation proof endpoints supports a complete monitoring and audit workflow.
- The API shape maps cleanly into an operator-console product: ingest, inspect, replay, verify, and audit.

## Friction

- API token activation depends on an on-chain subscription transaction, wallet signing, guest JWT activation, and network matching. That is reasonable for a verifiable data product, but it is more setup work than a typical hackathon API key.
- Service level 12 is documented for mainnet, while devnet examples often default to service level 1. It is easy to accidentally mix devnet and mainnet values.
- The proof flow needs careful product wording. A successful TxLINE validation response is valuable proof material, but it should not be presented as independent local/on-chain verification unless the application actually performs that second validation layer.
- The stream integration needs clear examples for production-style workers, reconnect behavior, and SSE parsing edge cases.
- For teams starting from only frontend/backend experience, the Solana activation step is the steepest part of onboarding.

## What We Would Improve

- Add a copy-paste service-level-12 mainnet activation script.
- Provide a minimal hosted-token activation sandbox for hackathon users.
- Include example payloads for score stream events, heartbeats, replay data, and stat-validation responses.
- Add a short "common network mismatch errors" troubleshooting section.
- Provide an end-to-end reference app that shows: subscribe, activate, stream, store payload, fetch validation proof, and display proof status safely.

## Overall

The schema and endpoint coverage are strong. The main friction is credential activation rather than the data model itself. Once the token is activated, TxLINE is well suited to a real-time World Cup monitoring, replay, and verification console.
