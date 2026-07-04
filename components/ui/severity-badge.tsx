import { StatusBadge } from "@/components/ui/status-badge";

export function SeverityBadge({ severity }: { severity: string }) {
  const variant =
    severity === "critical" || severity === "high"
      ? "danger"
      : severity === "medium"
        ? "warning"
        : severity === "low"
          ? "info"
          : "neutral";

  return <StatusBadge variant={variant}>{severity}</StatusBadge>;
}
