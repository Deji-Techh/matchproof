import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export function requireOperatorKey(request: Request) {
  if (process.env.ENABLE_DEMO_MODE === "true") return null;

  const expected = process.env.MATCHPROOF_OPERATOR_KEY;
  if (!expected) {
    return NextResponse.json(
      { error: "Operator key is required for mutations outside demo mode." },
      { status: 403 },
    );
  }

  const provided =
    request.headers.get("x-matchproof-operator-key") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!provided || !safeEqual(provided, expected)) {
    return NextResponse.json({ error: "Unauthorized operator action." }, { status: 401 });
  }

  return null;
}

function safeEqual(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
}
