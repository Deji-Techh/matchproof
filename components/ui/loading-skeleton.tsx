export function LoadingSkeleton() {
  return (
    <main className="space-y-4 p-6">
      <div className="h-8 w-64 animate-pulse rounded bg-neutral-800" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse rounded-md bg-neutral-900" />
        <div className="h-32 animate-pulse rounded-md bg-neutral-900" />
        <div className="h-32 animate-pulse rounded-md bg-neutral-900" />
      </div>
      <div className="h-96 animate-pulse rounded-md bg-neutral-900" />
    </main>
  );
}
