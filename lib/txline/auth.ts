import { redactSecret } from "@/lib/utils";
import type { TxlineConfig } from "@/lib/txline/types";

export function getTxlineConfig(): TxlineConfig {
  const network = process.env.TXLINE_NETWORK === "mainnet" ? "mainnet" : "devnet";
  const apiOrigin =
    process.env.TXLINE_API_ORIGIN ??
    (network === "mainnet" ? "https://txline.txodds.com" : "https://txline-dev.txodds.com");

  return {
    network,
    apiOrigin,
    apiBaseUrl: process.env.TXLINE_API_BASE_URL ?? `${apiOrigin}/api`,
    hasGuestJwt: Boolean(process.env.TXLINE_GUEST_JWT),
    hasApiToken: Boolean(process.env.TXLINE_API_TOKEN),
    solanaRpcUrl:
      process.env.SOLANA_RPC_URL ??
      (network === "mainnet" ? "https://api.mainnet-beta.solana.com" : "https://api.devnet.solana.com"),
    programId: process.env.TXLINE_PROGRAM_ID,
    txlTokenMint: process.env.TXLINE_TXL_TOKEN_MINT,
  };
}

function assertTxlineCredentials() {
  if (!process.env.TXLINE_GUEST_JWT || !process.env.TXLINE_API_TOKEN) {
    throw new Error("TxLINE credentials are not configured. Demo mode remains available.");
  }
}

export function getTxlineHeaders(stream = false) {
  assertTxlineCredentials();

  return {
    Authorization: `Bearer ${process.env.TXLINE_GUEST_JWT}`,
    "X-Api-Token": process.env.TXLINE_API_TOKEN as string,
    ...(stream
      ? {
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        }
      : {
          "Content-Type": "application/json",
        }),
  };
}

export function getSafeTxlineStatus() {
  const config = getTxlineConfig();

  return {
    ...config,
    guestJwt: redactSecret(process.env.TXLINE_GUEST_JWT),
    apiToken: redactSecret(process.env.TXLINE_API_TOKEN),
  };
}
