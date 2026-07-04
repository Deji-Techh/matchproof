export function RawJsonViewer({ value }: { value: string }) {
  return (
    <pre className="mono max-h-[420px] overflow-auto rounded-md border border-[var(--border-subtle)] bg-black/60 p-3 text-xs leading-relaxed text-neutral-300">
      {value}
    </pre>
  );
}
