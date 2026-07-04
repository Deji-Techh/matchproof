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
    <section className="panel interactive-panel data-scan p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-[var(--text-muted)]">{title}</p>
          <p className="mt-3 text-3xl font-black">{value}</p>
        </div>
        <div className="border border-[var(--border-subtle)] bg-black p-2">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      <p className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-xs leading-5 text-[var(--text-secondary)]">{detail}</p>
    </section>
  );
}
