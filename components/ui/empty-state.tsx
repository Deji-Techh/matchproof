import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail: string }) {
  return (
    <section className="panel-strong track-line p-6 pt-9 text-center">
      <Icon className="mx-auto h-6 w-6 text-[var(--text-muted)]" />
      <h2 className="mt-3 text-sm font-black uppercase">{title}</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{detail}</p>
    </section>
  );
}
