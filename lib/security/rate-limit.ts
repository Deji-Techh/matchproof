import { NextResponse } from "next/server";

const buckets = new Map<string, number[]>();

export function checkRateLimit(
  request: Request,
  scope: string,
  options: { limit: number; windowMs: number } = { limit: 30, windowMs: 60_000 },
) {
  const now = Date.now();
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || request.headers.get("x-real-ip") || "local";
  const key = `${scope}:${ip}`;
  const recent = (buckets.get(key) ?? []).filter((timestamp) => now - timestamp < options.windowMs);

  if (recent.length >= options.limit) {
    return NextResponse.json(
      {
        error: "Too many requests. Retry after the current rate-limit window.",
      },
      { status: 429 },
    );
  }

  recent.push(now);
  buckets.set(key, recent);
  return null;
}
