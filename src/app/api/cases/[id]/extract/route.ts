import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { readFile } from "@/lib/files";
import { extractDocument } from "@/lib/ocr";
import { extractFields } from "@/lib/extraction";
import { checkOrigin, fail, missing } from "@/lib/http";
export const runtime = "nodejs";
export const maxDuration = 90;
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    if (!(await db.searchCase.findUnique({ where: { id } }))) return missing();
    const input = z
      .object({
        text: z.string().max(30000).optional(),
        attachmentId: z.string().optional(),
      })
      .parse(await request.json());
    let text = input.text || "";
    if (input.attachmentId) {
      const file = await db.attachment.findFirst({
        where: { id: input.attachmentId, caseId: id },
      });
      if (!file) return missing();
      try {
        text = await extractDocument(
          await readFile(file.storageName),
          file.mimeType,
        );
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Datei konnte nicht gelesen werden.",
          },
          { status: 422 },
        );
      }
      await db.attachment.update({
        where: { id: file.id },
        data: { extractedText: text },
      });
    }
    if (!text.trim())
      return NextResponse.json(
        { error: "Bitte Text eingeben oder eine Datei auswählen." },
        { status: 400 },
      );
    return NextResponse.json({
      text,
      fields: extractFields(text),
      method: input.attachmentId
        ? "Lokale OCR / Textextraktion"
        : "Lokale Textanalyse",
    });
  } catch (error) {
    return fail(error);
  }
}
