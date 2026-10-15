import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CaseWorkspace } from "@/components/case-workspace";
export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, hotels] = await Promise.all([
    db.searchCase.findUnique({
      where: { id },
      include: {
        hotel: true,
        attachments: { orderBy: { createdAt: "desc" } },
        candidates: { orderBy: [{ stage: "asc" }, { price: "asc" }] },
        searches: { orderBy: { createdAt: "desc" } },
        drafts: { orderBy: { updatedAt: "desc" } },
        benefit: true,
      },
    }),
    db.hotel.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!item) notFound();
  return <CaseWorkspace key={item.id} item={item} hotels={hotels} />;
}
