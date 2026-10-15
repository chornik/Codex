import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { caseSchema } from "@/lib/validation";
import { checkOrigin, fail } from "@/lib/http";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const data = caseSchema.parse(await request.json());
    if (!(await db.hotel.findUnique({ where: { id: data.hotelId } })))
      return NextResponse.json(
        { error: "Hotel nicht gefunden." },
        { status: 400 },
      );
    const result = await db.$transaction(async (tx) => {
      const max = await tx.searchCase.aggregate({ _max: { number: true } });
      return tx.searchCase.create({
        data: { ...data, number: (max._max.number ?? 1000) + 1 },
      });
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
