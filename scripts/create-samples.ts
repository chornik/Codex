import fs from "node:fs/promises";
import sharp from "sharp";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
async function main() {
  await fs.mkdir("public/samples", { recursive: true });
  const text =
    "FIKTIVES DEMO-TYPENSCHILD\nSIEMENS\nTyp: SQX32.00\nArtikelnummer: SQX32.00\nS/N: DEMO-1998-0042\nAC 230 V / 50 Hz\nHub: 20 mm\nStellkraft: 700 N\nKeine technische Spezifikation. Angaben am echten Bauteil prüfen.\n";
  await fs.writeFile("public/samples/typenschild.txt", text);
  const image =
    '<svg width="1400" height="800" xmlns="http://www.w3.org/2000/svg"><rect width="1400" height="800" rx="25" fill="#f3f3ee"/><rect x="30" y="30" width="1340" height="740" rx="12" fill="white" stroke="#ccc" stroke-width="3"/><g fill="#192c30" font-family="DejaVu Sans" font-size="45"><text x="85" y="115">FIKTIVES DEMO-TYPENSCHILD</text><text x="85" y="215" font-size="65" font-weight="bold">SIEMENS</text><text x="85" y="305">Typ: SQX32.00</text><text x="85" y="390">Artikelnummer: SQX32.00</text><text x="85" y="475">S/N: DEMO-1998-0042</text><text x="85" y="560">AC 230 V / 50 Hz</text><text x="85" y="645">Hub: 20 mm / Stellkraft: 700 N</text><text x="85" y="720" font-size="25" fill="#999">BEISPIELDATEN - KEINE TECHNISCHE SPEZIFIKATION</text></g></svg>';
  await sharp(Buffer.from(image))
    .png()
    .toFile("public/samples/typenschild.png");
  const pdf = await PDFDocument.create();
  const page = pdf.addPage();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  text
    .split("\n")
    .forEach((line, i) =>
      page.drawText(line, {
        x: 45,
        y: 770 - i * 34,
        font,
        size: i === 0 ? 17 : 14,
        color: rgb(0.15, 0.23, 0.25),
      }),
    );
  await fs.writeFile("public/samples/typenschild.pdf", await pdf.save());
  console.log("Demo-Typenschild als PNG, PDF und TXT erstellt.");
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
