import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { benefitSchema } from "@/lib/validation";
import { checkOrigin, fail, missing } from "@/lib/http";
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    if (!(await db.searchCase.findUnique({ where: { id } }))) return missing();
    const data = benefitSchema.parse(await request.json());
    return NextResponse.json(
      await db.benefit.upsert({
        where: { caseId: id },
        create: { ...data, caseId: id },
        update: data,
      }),
    );
  } catch (error) {
    return fail(error);
  }
}
