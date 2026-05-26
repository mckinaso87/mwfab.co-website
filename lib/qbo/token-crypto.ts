import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { getQboOAuthEnv } from "@/lib/env";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;

function getKey(): Buffer {
  const { tokenEncryptionKey } = getQboOAuthEnv();
  const key = Buffer.from(tokenEncryptionKey, "base64");
  if (key.length !== 32) {
    throw new Error("QBO_TOKEN_ENCRYPTION_KEY must be 32 bytes (base64-encoded).");
  }
  return key;
}

/** Encrypt plaintext for storage in Supabase. */
export function encryptToken(plaintext: string): string {
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

/** Decrypt a value previously stored with encryptToken. */
export function decryptToken(ciphertext: string): string {
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted token format.");
  const [ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
