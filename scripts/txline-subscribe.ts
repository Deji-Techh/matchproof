import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

const RPC_URL = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
const PROGRAM_ID = new PublicKey(process.env.TXLINE_PROGRAM_ID ?? "9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA");
const TXL_TOKEN_MINT = new PublicKey(process.env.TXLINE_TXL_TOKEN_MINT ?? "Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL");

const SERVICE_LEVEL_ID = Number(process.env.TXLINE_SERVICE_LEVEL ?? "12");
const WEEKS = Number(process.env.TXLINE_SUBSCRIPTION_WEEKS ?? "4");

const defaultKeypairPath = path.join(os.homedir(), ".config/solana/id.json");
const keypairPath = process.argv[2] ?? process.env.SOLANA_KEYPAIR_PATH ?? defaultKeypairPath;

if (!fs.existsSync(keypairPath)) {
  throw new Error(`Solana keypair not found at ${keypairPath}`);
}

const secret = JSON.parse(fs.readFileSync(keypairPath, "utf8")) as number[];
const wallet = Keypair.fromSecretKey(Uint8Array.from(secret));
const connection = new Connection(RPC_URL, "confirmed");

const [tokenTreasuryPda] = PublicKey.findProgramAddressSync([Buffer.from("token_treasury_v2")], PROGRAM_ID);
const tokenTreasuryVault = getAssociatedTokenAddressSync(
  TXL_TOKEN_MINT,
  tokenTreasuryPda,
  true,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
);
const [pricingMatrixPda] = PublicKey.findProgramAddressSync([Buffer.from("pricing_matrix")], PROGRAM_ID);
const userTokenAccount = getAssociatedTokenAddressSync(
  TXL_TOKEN_MINT,
  wallet.publicKey,
  false,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
);

const subscribeDiscriminator = Buffer.from([254, 28, 191, 138, 156, 179, 183, 53]);
const data = Buffer.alloc(11);
subscribeDiscriminator.copy(data, 0);
data.writeUInt16LE(SERVICE_LEVEL_ID, 8);
data.writeUInt8(WEEKS, 10);

const instruction = new TransactionInstruction({
  programId: PROGRAM_ID,
  keys: [
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: pricingMatrixPda, isSigner: false, isWritable: false },
    { pubkey: TXL_TOKEN_MINT, isSigner: false, isWritable: false },
    { pubkey: userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: tokenTreasuryVault, isSigner: false, isWritable: true },
    { pubkey: tokenTreasuryPda, isSigner: false, isWritable: false },
    { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ],
  data,
});

const transaction = new Transaction().add(instruction);
transaction.feePayer = wallet.publicKey;

console.log(`Wallet: ${wallet.publicKey.toBase58()}`);
console.log(`RPC: ${RPC_URL}`);
console.log(`TxLINE program: ${PROGRAM_ID.toBase58()}`);
console.log(`Service level: ${SERVICE_LEVEL_ID}`);
console.log(`Weeks: ${WEEKS}`);
console.log("Submitting TxLINE subscription transaction...");

async function main() {
  const txSig = await sendAndConfirmTransaction(connection, transaction, [wallet], {
    commitment: "confirmed",
  });

  console.log("\nSubscription transaction:");
  console.log(txSig);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
