import { expect, it } from "vitest";
import sharp from "sharp";
import { extractDocument } from "../src/lib/ocr";
import { extractFields } from "../src/lib/extraction";
it("führt lokale OCR mit installierten Sprachdaten aus", async () => {
  const image = await sharp(
    Buffer.from(
      '<svg width="1200" height="440" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="440" fill="white"/><g font-family="DejaVu Sans" font-size="52" fill="black"><text x="60" y="100">SIEMENS</text><text x="60" y="200">Typ: SQX32.00</text><text x="60" y="300">AC 230 V / 50 Hz</text><text x="60" y="390">S/N: DEMO-1234</text></g></svg>',
    ),
  )
    .png()
    .toBuffer();
  const text = await extractDocument(image, "image/png");
  const fields = extractFields(text);
  expect(fields.manufacturer?.toLowerCase()).toBe("siemens");
  expect(fields.model).toContain("SQX32.00");
  expect(text).toContain("230");
});
it("liest UTF-8-Text ohne externe Dienste", async () =>
  expect(
    await extractDocument(Buffer.from("Typ: SQX32.00"), "text/plain"),
  ).toBe("Typ: SQX32.00"));
it("liest Text-PDF und lehnt defekte Dokumente ab", async () => {
  const { PDFDocument, StandardFonts } = await import("pdf-lib");
  const document = await PDFDocument.create();
  const page = document.addPage();
  const font = await document.embedFont(StandardFonts.Helvetica);
  page.drawText("SIEMENS Typ: SQX32.00", { x: 50, y: 700, font, size: 20 });
  const bytes = await document.save();
  const text = await extractDocument(Buffer.from(bytes), "application/pdf");
  expect(text).toContain("SQX32.00");
  await expect(
    extractDocument(Buffer.from("%PDF-broken"), "application/pdf"),
  ).rejects.toThrow();
});
