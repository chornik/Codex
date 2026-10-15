import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { caseSchema } from "@/lib/validation";
import { checkOrigin, fail, missing } from "@/lib/http";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    if (!(await db.searchCase.findUnique({ where: { id } }))) return missing();
    const data = caseSchema
      .partial()
      .extend({
        status: z
          .enum(["OPEN", "RESEARCHING", "REVIEW", "RESOLVED"])
          .optional(),
      })
      .parse(await request.json());
    if (
      data.hotelId &&
      !(await db.hotel.findUnique({ where: { id: data.hotelId } }))
    )
      return NextResponse.json(
        { error: "Hotel nicht gefunden." },
        { status: 400 },
      );
    return NextResponse.json(
      await db.searchCase.update({ where: { id }, data }),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const result = await db.searchCase.findUnique({
      where: { id },
      include: {
        hotel: true,
        candidates: true,
        searches: true,
        drafts: true,
        benefit: true,
        attachments: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            size: true,
            extractedText: true,
            createdAt: true,
          },
        },
      },
    });
    return result ? NextResponse.json(result) : missing();
  } catch (error) {
    return fail(error);
  }
}
