export type TxlineNetwork = "devnet" | "mainnet";

export type TxlineConfig = {
  network: TxlineNetwork;
  apiOrigin: string;
  apiBaseUrl: string;
  hasGuestJwt: boolean;
  hasApiToken: boolean;
  solanaRpcUrl: string;
  programId?: string;
  txlTokenMint?: string;
};

export type TxlineScoreValidationParams = {
  fixtureId: string;
  seq: string;
  statKey: string;
  secondStatKey?: string;
};

export type TxlineRequestResult<T> =
  | {
      ok: true;
      data: T;
      endpoint: string;
    }
  | {
      ok: false;
      endpoint: string;
      status?: number;
      error: string;
    };

export type ScoreUpdatePayload = {
  fixtureId?: string;
  seq?: string | number;
  status?: string;
  period?: string;
  score?: {
    listedHome?: number;
    listedAway?: number;
  };
  providerTimestamp?: string;
  [key: string]: unknown;
};
