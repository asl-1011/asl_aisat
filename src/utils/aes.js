import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.AES_SECRET_KEY, "hex"); // Ensure a 32-byte key
const iv = Buffer.from(process.env.AES_SECRET_IV, "hex"); // Ensure a 16-byte IV

export function encrypt(text) {
  if (!text) return "";
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decrypt(text) {
  if (!text) return "";
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
