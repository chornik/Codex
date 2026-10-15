import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { contactText } from "@/lib/contact";
import { checkOrigin, fail, missing } from "@/lib/http";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    const input = z
      .object({
        candidateId: z.string(),
        draftId: z.string().optional(),
        subject: z.string().trim().min(1).max(500).optional(),
        body: z.string().trim().min(1).max(15000).optional(),
      })
      .parse(await request.json());
    const item = await db.searchCase.findUnique({ where: { id } });
    const hit = await db.candidate.findFirst({
      where: { id: input.candidateId, caseId: id },
    });
    if (!item || !hit) return missing();
    if (hit.reviewStatus !== "APPROVED")
      return NextResponse.json(
        {
          error:
            "Bitte den Treffer zuerst mit Begründung für eine Kontaktaufnahme freigeben.",
        },
        { status: 409 },
      );
    if (input.draftId) {
      const draft = await db.contactDraft.findFirst({
        where: { id: input.draftId, caseId: id, candidateId: hit.id },
      });
      if (!draft) return missing();
      if (!input.subject || !input.body)
        return NextResponse.json(
          { error: "Betreff und Nachricht sind erforderlich." },
          { status: 400 },
        );
      return NextResponse.json(
        await db.contactDraft.update({
          where: { id: draft.id },
          data: { subject: input.subject, body: input.body },
        }),
      );
    }
    const existing = await db.contactDraft.findFirst({
      where: { caseId: id, candidateId: hit.id },
    });
    if (existing) return NextResponse.json(existing);
    return NextResponse.json(
      await db.contactDraft.create({
        data: { caseId: id, candidateId: hit.id, ...contactText(item, hit) },
      }),
      { status: 201 },
    );
  } catch (error) {
    return fail(error);
  }
}
