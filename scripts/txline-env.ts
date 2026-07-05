import { randomBytes } from "node:crypto";

const apiOrigin = "https://txline.txodds.com";
const apiBaseUrl = `${apiOrigin}/api`;

async function main() {
  const includeGuestJwt = process.argv.includes("--guest-jwt");
  const values: Record<string, string> = {
    DATABASE_URL: "file:./dev.db",
    ENABLE_DEMO_MODE: "true",
    ENABLE_PUBLIC_EXPORT: "false",
    TXLINE_NETWORK: "mainnet",
    TXLINE_SERVICE_LEVEL: "12",
    TXLINE_API_ORIGIN: apiOrigin,
    TXLINE_API_BASE_URL: apiBaseUrl,
    SOLANA_RPC_URL: "https://api.mainnet-beta.solana.com",
    TXLINE_PROGRAM_ID: "9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA",
    TXLINE_TXL_TOKEN_MINT: "Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL",
    MATCHPROOF_OPERATOR_KEY: randomBytes(32).toString("hex"),
  };

  if (includeGuestJwt) {
    const response = await fetch(`${apiOrigin}/auth/guest/start`, { method: "POST" });
    if (!response.ok) {
      throw new Error(`TxLINE guest session failed: ${response.status} ${await response.text()}`);
    }
    const body = (await response.json()) as { token?: string; jwt?: string } | string;
    const token = typeof body === "string" ? body : body.token ?? body.jwt;
    if (!token) {
      throw new Error(`TxLINE guest session response did not include a token: ${JSON.stringify(body)}`);
    }
    values.TXLINE_GUEST_JWT = token;
  } else {
    values.TXLINE_GUEST_JWT = "<run npm run txline:env -- --guest-jwt, then activate with wallet>";
  }

  values.TXLINE_API_TOKEN = "<activated after service-level-12 subscription transaction>";

  for (const [key, value] of Object.entries(values)) {
    console.log(`${key}=${value}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
