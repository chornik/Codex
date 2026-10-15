import { db } from "@/lib/db";
import { Dashboard } from "@/components/dashboard";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; hotel?: string }>;
}) {
  const [cases, hotels, params] = await Promise.all([
    db.searchCase.findMany({
      include: {
        hotel: true,
        _count: { select: { candidates: true, attachments: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.hotel.findMany({ orderBy: { name: "asc" } }),
    searchParams,
  ]);
  return (
    <Dashboard
      key={`${params.view || ""}:${params.hotel || ""}`}
      cases={cases}
      hotels={hotels}
      view={params.view || ""}
      initialHotel={params.hotel || ""}
    />
  );
}
