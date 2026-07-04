import type { LucideIcon } from "lucide-react";

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: "neutral" | "success" | "warning" | "danger" | "proof" | "info";
}) {
  const color =
    tone === "success"
      ? "text-[var(--success)]"
      : tone === "warning"
        ? "text-[var(--warning)]"
        : tone === "danger"
          ? "text-[var(--danger)]"
          : tone === "proof"
            ? "text-[var(--proof)]"
            : tone === "info"
              ? "text-[var(--info)]"
              : "text-[var(--text-secondary)]";

  return (
    <section className="panel rounded-md p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-[var(--text-muted)]">{title}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-3 text-xs text-[var(--text-secondary)]">{detail}</p>
    </section>
  );
}
