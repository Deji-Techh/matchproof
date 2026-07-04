"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function SignalAcknowledgeButton({ signalId }: { signalId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function acknowledge() {
    setPending(true);
    try {
      await fetch(`/api/signals/${signalId}/acknowledge`, { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={acknowledge}
      title="Acknowledge signal"
      className="interactive-panel grid min-h-10 min-w-10 place-items-center border border-[var(--border-subtle)] p-2 disabled:opacity-50"
    >
      <CheckCircle2 className="h-4 w-4" />
    </button>
  );
}
