import type { FeedUpdate } from "@prisma/client";
import { getTxlineConfig, getTxlineHeaders } from "@/lib/txline/auth";
import { audit, isRecord, storeScoreRows, stringValue } from "@/lib/txline/ingest";
import type { AgentSignal } from "@/lib/agents/types";

export type SseMessage = {
  event?: string;
  data: string;
  id?: string;
  retry?: number;
};

export type StreamCaptureResult =
  | {
      ok: true;
      endpoint: string;
      messageCount: number;
      heartbeatCount: number;
      updates: FeedUpdate[];
      signals: AgentSignal[];
    }
  | {
      ok: false;
      endpoint: string;
      status?: number;
      error: string;
      messageCount: number;
      heartbeatCount: number;
      updates: FeedUpdate[];
      signals: AgentSignal[];
    };

export function parseSseBlock(block: string): SseMessage | null {
  const message: SseMessage = { data: "" };

  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(":")) continue;
    const separator = line.indexOf(":");
    const field = separator === -1 ? line : line.slice(0, separator);
    const value = separator === -1 ? "" : line.slice(separator + 1).trimStart();

    if (field === "event") message.event = value;
    if (field === "data") message.data += `${value}\n`;
    if (field === "id") message.id = value;
    if (field === "retry") message.retry = Number(value);
  }

  message.data = message.data.trimEnd();
  return message.data || message.event ? message : null;
}

export function parseSseBuffer(buffer: string) {
  return buffer
    .split(/\n\n|\r\n\r\n/)
    .map(parseSseBlock)
    .filter((message): message is SseMessage => Boolean(message));
}

export function getReconnectDelayMs(attempt: number) {
  return Math.min(30_000, 1_000 * 2 ** Math.max(0, attempt - 1));
}

export async function captureScoresStream(input: {
  fixtureId: string;
  maxMessages?: number;
  maxDurationMs?: number;
  lastEventId?: string;
}): Promise<StreamCaptureResult> {
  const maxMessages = input.maxMessages ?? 8;
  const maxDurationMs = input.maxDurationMs ?? 10_000;
  const config = getTxlineConfig();
  const query = new URLSearchParams({ fixtureId: input.fixtureId });
  const endpoint = `/scores/stream?${query.toString()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), maxDurationMs);
  const updates: FeedUpdate[] = [];
  const signals: AgentSignal[] = [];
  let messageCount = 0;
  let heartbeatCount = 0;

  try {
    await audit("info", "stream_capture_started", "TxLINE score stream capture started.", input.fixtureId, {
      endpoint,
      maxMessages,
      maxDurationMs,
    });

    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      method: "GET",
      headers: {
        ...getTxlineHeaders(true),
        ...(input.lastEventId ? { "Last-Event-ID": input.lastEventId } : {}),
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      await audit("warning", "stream_capture_failed", `TxLINE score stream returned HTTP ${response.status}.`, input.fixtureId, {
        endpoint,
        status: response.status,
      });
      return {
        ok: false,
        endpoint,
        status: response.status,
        error: `TxLINE score stream returned HTTP ${response.status}`,
        messageCount,
        heartbeatCount,
        updates,
        signals,
      };
    }

    if (!response.body) {
      await audit("warning", "stream_capture_failed", "TxLINE score stream response did not include a readable body.", input.fixtureId, {
        endpoint,
      });
      return {
        ok: false,
        endpoint,
        error: "TxLINE score stream response did not include a readable body",
        messageCount,
        heartbeatCount,
        updates,
        signals,
      };
    }

    await audit("info", "stream_connected", "TxLINE score stream connected for bounded capture.", input.fixtureId, {
      endpoint,
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (messageCount < maxMessages) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer = `${buffer}${decoder.decode(value, { stream: true })}`.replace(/\r\n/g, "\n");
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const block of parts) {
        const message = parseSseBlock(block);
        if (!message) continue;
        if (message.event === "heartbeat") {
          heartbeatCount += 1;
          continue;
        }

        messageCount += 1;
        const payload = parseStreamPayload(message.data);
        if (!payload) {
          await audit("warning", "stream_payload_malformed", "TxLINE stream message could not be parsed as JSON.", input.fixtureId, {
            endpoint,
            messageId: message.id,
          });
          continue;
        }

        const eventFixtureId = stringValue(payload, ["fixtureId", "FixtureId"]) ?? input.fixtureId;
        if (eventFixtureId !== input.fixtureId) continue;

        const stored = await storeScoreRows({
          fixtureId: input.fixtureId,
          mode: "stream",
          endpoint,
          rows: [message.id ? { ...payload, SseEventId: message.id } : payload],
        });
        updates.push(...stored.updates);
        signals.push(...stored.signals);

        if (messageCount >= maxMessages) break;
      }
    }

    await audit("info", "stream_capture_completed", `Captured ${updates.length} score stream update row(s).`, input.fixtureId, {
      endpoint,
      messageCount,
      heartbeatCount,
      updateCount: updates.length,
      signalCount: signals.length,
    });

    return { ok: true, endpoint, messageCount, heartbeatCount, updates, signals };
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    const hasRows = updates.length > 0 || heartbeatCount > 0 || messageCount > 0;
    await audit(
      hasRows ? "info" : "warning",
      hasRows ? "stream_capture_completed" : "stream_capture_failed",
      hasRows ? `Stream capture window ended with ${updates.length} stored update row(s).` : "TxLINE score stream capture failed.",
      input.fixtureId,
      {
        endpoint,
        messageCount,
        heartbeatCount,
        updateCount: updates.length,
        signalCount: signals.length,
        error: isAbort ? "capture_window_elapsed" : error instanceof Error ? error.message : "Unknown stream capture error",
      },
    );

    if (hasRows) return { ok: true, endpoint, messageCount, heartbeatCount, updates, signals };

    return {
      ok: false,
      endpoint,
      error: isAbort ? "Stream capture window elapsed before any score update arrived." : error instanceof Error ? error.message : "Unknown stream capture error",
      messageCount,
      heartbeatCount,
      updates,
      signals,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function parseStreamPayload(data: string) {
  try {
    const parsed = JSON.parse(data) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
