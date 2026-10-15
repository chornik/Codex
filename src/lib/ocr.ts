import path from "node:path";
import { createWorker } from "tesseract.js";
import sharp from "sharp";
import { PDFParse } from "pdf-parse";
// All OCR assets are installed through npm; documents never leave this machine.
let busy = false;
export async function extractDocument(
  bytes: Buffer,
  mimeType: string,
): Promise<string> {
  if (mimeType === "text/plain") return bytes.toString("utf8").slice(0, 30000);
  if (mimeType === "application/pdf") {
    const parser = new PDFParse({ data: new Uint8Array(bytes) });
    try {
      const result = await parser.getText({ first: 30 });
      if (!result.text.trim())
        throw new Error(
          "Das PDF enthält keinen lesbaren Text. Bitte das Typenschild als Foto hochladen oder Text manuell einfügen.",
        );
      return result.text.slice(0, 30000);
    } finally {
      await parser.destroy();
    }
  }
  if (busy)
    throw new Error(
      "Eine Bilderkennung läuft bereits. Bitte kurz warten und erneut versuchen.",
    );
  busy = true;
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
  try {
    const image = await sharp(bytes, { limitInputPixels: 25000000 })
      .rotate()
      .resize({
        width: 2200,
        height: 2200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .grayscale()
      .normalize()
      .png()
      .toBuffer();
    // Direct dependency with a local npm install. Avoid require.resolve here:
    // webpack can replace it with a numeric module ID in production builds.
    const langPath = path.resolve(
      process.cwd(),
      "node_modules/@tesseract.js-data/eng/4.0.0",
    );
    worker = await createWorker("eng", 1, {
      langPath,
      cacheMethod: "none",
      gzip: true,
    });
    const result = await worker.recognize(image);
    if (!result.data.text.trim())
      throw new Error(
        "Kein lesbarer Text erkannt. Bitte ein schärferes Foto verwenden oder Daten manuell erfassen.",
      );
    return result.data.text.slice(0, 30000);
  } finally {
    await worker?.terminate();
    busy = false;
  }
}
