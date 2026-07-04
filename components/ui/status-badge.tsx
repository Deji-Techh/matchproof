import { cn } from "@/lib/utils";

const variants = {
  success: "border-green-500/30 bg-green-500/10 text-green-300",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  danger: "border-red-500/30 bg-red-500/10 text-red-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  proof: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  neutral: "border-neutral-700 bg-neutral-900 text-neutral-300",
};

export function StatusBadge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-1 text-[11px] font-semibold uppercase tracking-normal",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
