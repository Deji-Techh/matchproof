import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

const API_ORIGIN = process.env.TXLINE_API_ORIGIN ?? "https://txline.txodds.com";
const API_BASE_URL = process.env.TXLINE_API_BASE_URL ?? `${API_ORIGIN}/api`;
const SELECTED_LEAGUES: number[] = [];

function getArg(name: string) {
  const prefixed = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (prefixed) return prefixed.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function loadKeypair() {
  const defaultKeypairPath = path.join(os.homedir(), ".config/solana/id.json");
  const keypairPath = getArg("--keypair") ?? process.env.SOLANA_KEYPAIR_PATH ?? defaultKeypairPath;
  if (!fs.existsSync(keypairPath)) {
    throw new Error(`Solana keypair not found at ${keypairPath}`);
  }
  const secret = JSON.parse(fs.readFileSync(keypairPath, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

async function startGuestSession() {
  const response = await fetch(`${API_ORIGIN}/auth/guest/start`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`TxLINE guest session failed: ${response.status} ${await response.text()}`);
  }
  const body = (await response.json()) as { token?: string; jwt?: string } | string;
  const token = typeof body === "string" ? body : body.token ?? body.jwt;
  if (!token) {
    throw new Error(`TxLINE guest session response did not include a token: ${JSON.stringify(body)}`);
  }
  return token;
}

async function main() {
  const txSig = getArg("--tx-sig") ?? process.argv[2];
  if (!txSig || txSig.startsWith("--")) {
    throw new Error("Usage: npm run txline:activate -- --tx-sig <subscription_tx_signature>");
  }

  const wallet = loadKeypair();
  const guestJwt = await startGuestSession();
  const messageString = `${txSig}:${SELECTED_LEAGUES.join(",")}:${guestJwt}`;
  const message = new TextEncoder().encode(messageString);
  const signature = nacl.sign.detached(message, wallet.secretKey);
  const walletSignature = Buffer.from(signature).toString("base64");

  console.error(`Wallet: ${wallet.publicKey.toBase58()}`);
  console.error(`Activation message: ${txSig}::${guestJwt.slice(0, 12)}...`);
  console.error("Activating TxLINE API token...");

  const response = await fetch(`${API_BASE_URL}/token/activate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${guestJwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txSig,
      walletSignature,
      leagues: SELECTED_LEAGUES,
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`TxLINE activation failed: ${response.status} ${text}`);
  }

  let apiToken = text;
  try {
    const body = JSON.parse(text) as { token?: string } | string;
    apiToken = typeof body === "string" ? body : body.token ?? text;
  } catch {
    apiToken = text;
  }

  console.log("TXLINE_GUEST_JWT=" + guestJwt);
  console.log("TXLINE_API_TOKEN=" + apiToken);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
