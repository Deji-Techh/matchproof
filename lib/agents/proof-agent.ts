import type { AgentSignal } from "@/lib/agents/types";

export type VerificationState = "not_requested" | "pending" | "verified" | "rejected" | "failed" | "unsupported";

export function createProofSignal(input: {
  fixtureId: string;
  sourceUpdateId?: string | null;
  status: VerificationState;
  sequence?: string | null;
  statKey?: string | null;
  createdAt?: string;
}): AgentSignal {
  const severity = input.status === "verified" ? "low" : input.status === "rejected" ? "high" : "medium";

  return {
    id: `proof-${input.fixtureId}-${input.sequence ?? "unknown"}-${input.statKey ?? "stat"}`,
    fixtureId: input.fixtureId,
    agentType: "proof",
    severity,
    title: input.status === "verified" ? "Score proof verified" : "Score proof requires review",
    summary:
      input.status === "verified"
        ? "TxLINE score/stat validation returned a successful Solana-backed verification."
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
