import type { LucideIcon } from "lucide-react";

export function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  detail,
  children,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  detail: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="track-line panel-strong reveal-up p-4 pt-8 sm:p-5 sm:pt-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-black uppercase text-[var(--accent-primary)]">
            <Icon className="h-4 w-4" />
            {eyebrow}
          </p>
          <h1 className="page-title safe-word mt-3 font-black uppercase leading-none tracking-normal">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{detail}</p>
        </div>
        {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
      </div>
    </header>
  );
}

export function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 reveal-up">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 bg-[var(--accent-primary)]" />
        <h2 className="text-sm font-black uppercase text-[var(--text-secondary)]">{title}</h2>
      </div>
      {children}
    </section>
  );
}
