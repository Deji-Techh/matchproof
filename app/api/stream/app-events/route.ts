import { ensureDemoData } from "@/lib/db/demo-seed";
import { appEventBus } from "@/lib/events/event-bus";

export async function GET() {
  await ensureDemoData();
  appEventBus.emit({ type: "app_events_opened", at: new Date().toISOString() });
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `event: status\ndata: ${JSON.stringify({
            app: "MatchProof",
            mode: "demo",
            streamStatus: "seeded fallback",
            at: new Date().toISOString(),
          })}\n\n`,
        ),
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
