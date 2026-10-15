import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/validation";
import { checkOrigin, fail, missing } from "@/lib/http";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    const input = reviewSchema.parse(await request.json());
    if (!(await db.candidate.findUnique({ where: { id } }))) return missing();
    const result = await db.$transaction(async (tx) => {
      const hit = await tx.candidate.update({
        where: { id },
        data: {
          reviewStatus: input.status,
          reviewNote: input.note,
          reviewedAt: new Date(),
        },
      });
      if (input.status === "TECHNICAL_REVIEW")
        await tx.searchCase.update({
          where: { id: hit.caseId },
          data: { status: "REVIEW" },
        });
      return hit;
    });
    return NextResponse.json(result);
  } catch (error) {
    return fail(error);
  }
}
