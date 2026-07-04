export function RawJsonViewer({ value }: { value: string }) {
  return (
    <pre className="mono max-h-[420px] overflow-auto border border-[var(--border-subtle)] bg-black p-3 text-xs leading-relaxed text-neutral-300">
      {value}
    </pre>
  );
}
