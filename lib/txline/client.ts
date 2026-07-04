import { getTxlineConfig, getTxlineHeaders } from "@/lib/txline/auth";
import type { TxlineRequestResult, TxlineScoreValidationParams } from "@/lib/txline/types";

const REQUEST_TIMEOUT_MS = 12_000;

async function txlineGet<T>(endpoint: string, init?: RequestInit): Promise<TxlineRequestResult<T>> {
  const config = getTxlineConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
      ...init,
      method: "GET",
      headers: {
        ...getTxlineHeaders(false),
        ...init?.headers,
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        endpoint,
        status: response.status,
        error: `TxLINE request failed with status ${response.status}`,
      };
    }

    const data = (await response.json()) as T;
    return { ok: true, endpoint, data };
  } catch (error) {
    return {
      ok: false,
      endpoint,
      error: error instanceof Error ? error.message : "Unknown TxLINE request error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function getFixturesSnapshot<T = unknown>() {
  return txlineGet<T>("/fixtures/snapshot");
}

export function getScoresSnapshot<T = unknown>(fixtureId: string) {
  return txlineGet<T>(`/scores/snapshot/${encodeURIComponent(fixtureId)}`);
}

export function getScoresUpdatesByFixture<T = unknown>(fixtureId: string) {
  return txlineGet<T>(`/scores/updates/${encodeURIComponent(fixtureId)}`);
}

export function getScoresUpdatesByTime<T = unknown>(epochDay: number, hour: number, interval: number) {
  return txlineGet<T>(`/scores/updates/${epochDay}/${hour}/${interval}`);
}

export function getHistoricalScores<T = unknown>(fixtureId: string) {
  return txlineGet<T>(`/scores/historical/${encodeURIComponent(fixtureId)}`);
}

export function getScoreStatValidation<T = unknown>(params: TxlineScoreValidationParams) {
  const query = new URLSearchParams({
    fixtureId: params.fixtureId,
    seq: params.seq,
    statKey: params.statKey,
  });

  if (params.secondStatKey) {
    query.set("secondStatKey", params.secondStatKey);
  }

  return txlineGet<T>(`/scores/stat-validation?${query.toString()}`);
}
