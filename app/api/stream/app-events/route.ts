import { ensureDemoData } from "@/lib/db/demo-seed";
import { appEventBus } from "@/lib/events/event-bus";

export async function GET() {
  await ensureDemoData();
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  function encode(event: string, data: unknown) {
    return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  const stream = new ReadableStream({
    start(controller) {
      const openedAt = new Date().toISOString();
      controller.enqueue(
        encode("status", {
          app: "MatchProof",
          mode: process.env.ENABLE_DEMO_MODE === "true" ? "demo" : "live",
          streamStatus: "connected",
          at: openedAt,
        }),
      );

      for (const event of appEventBus.recent()) {
        controller.enqueue(encode(event.type, event));
      }

      unsubscribe = appEventBus.subscribe((event) => {
        try {
          controller.enqueue(encode(event.type, event));
        } catch {
          unsubscribe?.();
          if (heartbeat) clearInterval(heartbeat);
        }
      });

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encode("heartbeat", {
              app: "MatchProof",
              at: new Date().toISOString(),
            }),
          );
        } catch {
          unsubscribe?.();
          if (heartbeat) clearInterval(heartbeat);
        }
      }, 15_000);
    },
    cancel() {
      unsubscribe?.();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  appEventBus.emit({ type: "app_events_opened", at: new Date().toISOString() });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
