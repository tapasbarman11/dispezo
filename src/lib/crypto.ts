import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

const SECRET =
  process.env.ENCRYPTION_KEY!;

const KEY = crypto
  .createHash("sha256")
  .update(SECRET)
  .digest();

const IV_LENGTH = 16;

export function encrypt(text: string): string {

  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    KEY,
    iv
  );

  let encrypted = cipher.update(
    text,
    "utf8",
    "hex"
  );

  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(
  encrypted: string
): string {

  const parts = encrypted.split(":");

  const iv = Buffer.from(parts[0], "hex");

  const encryptedText = parts[1];

  const decipher =
    crypto.createDecipheriv(
      ALGORITHM,
      KEY,
      iv
    );

  let decrypted = decipher.update(
    encryptedText,
    "hex",
    "utf8"
  );

  decrypted += decipher.final("utf8");

  return decrypted;
}