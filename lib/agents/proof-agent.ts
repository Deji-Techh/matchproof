import type { AgentSignal } from "@/lib/agents/types";

export type VerificationState = "not_requested" | "pending" | "proof_received" | "verified" | "rejected" | "failed" | "unsupported";

export function createProofSignal(input: {
  fixtureId: string;
  sourceUpdateId?: string | null;
  status: VerificationState;
  sequence?: string | null;
  statKey?: string | null;
  createdAt?: string;
}): AgentSignal {
  const severity = input.status === "verified" || input.status === "proof_received" ? "low" : input.status === "rejected" ? "high" : "medium";

  return {
    id: `proof-${input.fixtureId}-${input.sequence ?? "unknown"}-${input.statKey ?? "stat"}`,
    fixtureId: input.fixtureId,
    agentType: "proof",
    severity,
    title:
      input.status === "verified"
        ? "Score proof verified"
        : input.status === "proof_received"
          ? "TxLINE proof response received"
          : "Score proof requires review",
    summary:
      input.status === "verified"
        ? "TxLINE score/stat validation returned a successful Solana-backed verification."
        : input.status === "proof_received"
          ? "TxLINE returned score/stat proof material. Independent local/on-chain validation is still pending."
        : "The selected update does not currently have a successful verification result.",
    evidence: {
      status: input.status,
      sequence: input.sequence,
      statKey: input.statKey,
    },
    sourceUpdateIds: input.sourceUpdateId ? [input.sourceUpdateId] : [],
    createdAt: input.createdAt ?? new Date().toISOString(),
    status: "open",
  };
}
