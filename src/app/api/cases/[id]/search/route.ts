import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runSearch } from "@/lib/search";
import { checkOrigin, fail, missing } from "@/lib/http";
export const runtime = "nodejs";
export const maxDuration = 90;
const searching = new Set<string>();
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let acquired = false;
  try {
    checkOrigin(request);
    const item = await db.searchCase.findUnique({ where: { id } });
    if (!item) return missing();
    if (!item.model.trim() && !item.partNumber.trim())
      return NextResponse.json(
        { error: "Bitte zuerst Modell oder Artikelnummer erfassen." },
        { status: 400 },
      );
    if (searching.has(id))
      return NextResponse.json(
        { error: "Für diesen Fall läuft bereits eine Suche." },
        { status: 409 },
      );
    searching.add(id);
    acquired = true;
    let output;
    try {
      output = await runSearch(item);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Suchanbieter nicht erreichbar.",
        },
        { status: 502 },
      );
    }
    await db.$transaction(async (tx) => {
      // Repeated searches preserve decisions and contact drafts. Old evidence remains visible.
      for (const hit of output.results) {
        const { matches: _matches, warnings, ...data } = hit;
        void _matches;
        await tx.candidate.upsert({
          where: {
            caseId_externalId: { caseId: id, externalId: hit.externalId },
          },
          update: {},
          create: { ...data, warnings: JSON.stringify(warnings), caseId: id },
        });
      }
      await tx.searchRun.create({
        data: {
          caseId: id,
          provider: output.provider,
          queries: JSON.stringify(output.queries),
          count: output.results.length,
        },
      });
      if (item.status === "OPEN")
        await tx.searchCase.update({
          where: { id },
          data: { status: "RESEARCHING" },
        });
    });
    return NextResponse.json({
      count: output.results.length,
      provider: output.provider,
    });
  } catch (error) {
    return fail(error);
  } finally {
    if (acquired) searching.delete(id);
  }
}
