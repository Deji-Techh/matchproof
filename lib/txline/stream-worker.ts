import { appEventBus } from "@/lib/events/event-bus";
import { getSafeTxlineStatus } from "@/lib/txline/auth";
import { audit } from "@/lib/txline/ingest";
import { captureScoresStream, getReconnectDelayMs } from "@/lib/txline/streams";

type StreamWorkerState = {
  running: boolean;
  fixtureId?: string;
  startedAt?: string;
  stoppedAt?: string;
  lastError?: string;
  lastCaptureAt?: string;
  captureCount: number;
  updateCount: number;
  signalCount: number;
  reconnectAttempts: number;
};

const initialState: StreamWorkerState = {
  running: false,
  captureCount: 0,
  updateCount: 0,
  signalCount: 0,
  reconnectAttempts: 0,
};

const globalKey = "__matchproofStreamWorker";

type GlobalWithWorker = typeof globalThis & {
  [globalKey]?: {
    state: StreamWorkerState;
    stopRequested: boolean;
    loop?: Promise<void>;
  };
};

function workerStore() {
  const globalWorker = globalThis as GlobalWithWorker;
  globalWorker[globalKey] ??= {
    state: { ...initialState },
    stopRequested: false,
  };
  return globalWorker[globalKey];
}

export function getStreamWorkerStatus() {
  return { ...workerStore().state };
}

export async function startStreamWorker(input: { fixtureId: string; captureWindowMs?: number; maxMessages?: number }) {
  const store = workerStore();
  if (store.state.running) return { ok: true, status: getStreamWorkerStatus(), started: false };

  const txline = getSafeTxlineStatus();
  if (!txline.hasGuestJwt || !txline.hasApiToken) {
    await audit("warning", "stream_worker_start_skipped", "TxLINE credentials are not configured. Stream worker was not started.", input.fixtureId, {
      network: txline.network,
      serviceLevel: txline.serviceLevel,
    });
    return {
      ok: false,
      status: getStreamWorkerStatus(),
      started: false,
      error: "TxLINE credentials are not configured. Demo mode remains available.",
    };
  }

  store.stopRequested = false;
  store.state = {
    running: true,
    fixtureId: input.fixtureId,
    startedAt: new Date().toISOString(),
    stoppedAt: undefined,
    lastError: undefined,
    lastCaptureAt: undefined,
    captureCount: 0,
    updateCount: 0,
    signalCount: 0,
    reconnectAttempts: 0,
  };

  await audit("info", "stream_worker_started", "TxLINE score stream worker started.", input.fixtureId, {
    captureWindowMs: input.captureWindowMs ?? 30_000,
    maxMessages: input.maxMessages ?? 25,
  });
  appEventBus.emit({ type: "stream_worker_started", at: new Date().toISOString(), fixtureId: input.fixtureId });

  store.loop = runWorkerLoop(input).catch(async (error) => {
    store.state.running = false;
    store.state.stoppedAt = new Date().toISOString();
    store.state.lastError = error instanceof Error ? error.message : "Unknown stream worker failure";
    await audit("warning", "stream_worker_failed", "TxLINE score stream worker stopped after an unhandled failure.", input.fixtureId, {
      error: store.state.lastError,
    });
  });

  return { ok: true, status: getStreamWorkerStatus(), started: true };
}

export async function stopStreamWorker() {
  const store = workerStore();
  store.stopRequested = true;
  store.state.running = false;
  store.state.stoppedAt = new Date().toISOString();
  await audit("info", "stream_worker_stopped", "TxLINE score stream worker stop requested.", store.state.fixtureId, {
    captureCount: store.state.captureCount,
    updateCount: store.state.updateCount,
    signalCount: store.state.signalCount,
  });
  appEventBus.emit({ type: "stream_worker_stopped", at: new Date().toISOString(), fixtureId: store.state.fixtureId });
  return { ok: true, status: getStreamWorkerStatus() };
}

async function runWorkerLoop(input: { fixtureId: string; captureWindowMs?: number; maxMessages?: number }) {
  const store = workerStore();
  const captureWindowMs = input.captureWindowMs ?? 30_000;
  const maxMessages = input.maxMessages ?? 25;

  while (!store.stopRequested) {
    const result = await captureScoresStream({
      fixtureId: input.fixtureId,
      maxDurationMs: captureWindowMs,
      maxMessages,
    });

    store.state.lastCaptureAt = new Date().toISOString();
    store.state.captureCount += 1;
    store.state.updateCount += result.updates.length;
    store.state.signalCount += result.signals.length;
    store.state.lastError = result.ok ? undefined : result.error;
    store.state.reconnectAttempts = result.ok ? 0 : store.state.reconnectAttempts + 1;

    appEventBus.emit({
      type: "stream_worker_capture",
      at: new Date().toISOString(),
      fixtureId: input.fixtureId,
      payload: {
        ok: result.ok,
        updateCount: result.updates.length,
        signalCount: result.signals.length,
        heartbeatCount: result.heartbeatCount,
      },
    });

    if (store.stopRequested) break;
    const delay = result.ok ? 500 : getReconnectDelayMs(store.state.reconnectAttempts);
    await sleep(delay);
  }

  store.state.running = false;
  store.state.stoppedAt = new Date().toISOString();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
