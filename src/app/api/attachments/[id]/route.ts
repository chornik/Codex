import { db } from "@/lib/db";
import { readFile } from "@/lib/files";
import { fail, missing } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const file = await db.attachment.findUnique({ where: { id } });
    if (!file) return missing();
    const bytes = await readFile(file.storageName);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
