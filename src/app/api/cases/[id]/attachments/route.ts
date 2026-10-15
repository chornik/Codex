import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storeFile, removeFile } from "@/lib/files";
import { checkOrigin, fail, missing } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    if (!(await db.searchCase.findUnique({ where: { id } }))) return missing();
    if (Number(request.headers.get("content-length") || 0) > 11 * 1024 * 1024)
      return NextResponse.json(
        { error: "Maximal 10 MB pro Datei." },
        { status: 413 },
      );
    if ((await db.attachment.count({ where: { caseId: id } })) >= 20)
      return NextResponse.json(
        { error: "Maximal 20 Dateien pro Fall." },
        { status: 400 },
      );
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File))
      return NextResponse.json(
        { error: "Bitte eine Datei wählen." },
        { status: 400 },
      );
    let stored;
    try {
      stored = await storeFile(file);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Upload fehlgeschlagen.",
        },
        { status: 400 },
      );
    }
    try {
      return NextResponse.json(
        await db.attachment.create({ data: { caseId: id, ...stored } }),
        { status: 201 },
      );
    } catch (error) {
      await removeFile(stored.storageName);
      throw error;
    }
  } catch (error) {
    return fail(error);
  }
}
