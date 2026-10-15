import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const uploadDir = () =>
  path.resolve(process.env.UPLOAD_DIR || "./data/uploads");
export function detectType(buffer: Buffer): string | null {
  if (
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image/png";
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255)
    return "image/jpeg";
  if (
    buffer.subarray(0, 4).toString() === "RIFF" &&
    buffer.subarray(8, 12).toString() === "WEBP"
  )
    return "image/webp";
  if (buffer.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  return null;
}
export async function storeFile(file: File) {
  if (!file.size || file.size > MAX_FILE_SIZE)
    throw new Error("Dateien müssen zwischen 1 Byte und 10 MB groß sein.");
  const bytes = Buffer.from(await file.arrayBuffer());
  let mimeType = detectType(bytes);
  if (!mimeType && /\.txt$/i.test(file.name) && !bytes.includes(0)) {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      mimeType = "text/plain";
    } catch {
      /* reject invalid UTF-8 */
    }
  }
  if (!mimeType)
    throw new Error(
      "Erlaubt sind echte JPG-, PNG-, WebP-, PDF- und UTF-8-TXT-Dateien.",
    );
  const storageName = randomUUID();
  await fs.mkdir(uploadDir(), { recursive: true });
  await fs.writeFile(path.join(uploadDir(), storageName), bytes, {
    flag: "wx",
    mode: 0o600,
  });
  return {
    storageName,
    mimeType,
    size: bytes.length,
    originalName: path.basename(file.name).slice(0, 200),
  };
}
export async function readFile(storageName: string) {
  if (!/^[a-z0-9-]+$/i.test(storageName))
    throw new Error("Ungültige Dateireferenz.");
  return fs.readFile(path.join(uploadDir(), storageName));
}
export async function removeFile(storageName: string) {
  await fs.unlink(path.join(uploadDir(), storageName)).catch(() => {});
}
