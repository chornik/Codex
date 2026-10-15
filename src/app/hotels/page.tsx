import Link from "next/link";
import { Building2, MapPin, ArrowUpRight } from "lucide-react";
import { db } from "@/lib/db";
export default async function HotelsPage() {
  const hotels = await db.hotel.findMany({
    include: { _count: { select: { cases: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">EIN GEMEINSAMER WISSENSSTAND</div>
          <h1>Unsere Hotels</h1>
          <p>25 Beispielstandorte. Recherchewissen für die gesamte Gruppe.</p>
        </div>
        <span className="privacy-chip">{hotels.length} STANDORTE</span>
      </div>
      <div className="hotel-grid">
        {hotels.map((h, i) => (
          <Link
            href={`/?view=cases&hotel=${h.id}`}
            key={h.id}
            className="panel hotel-card"
          >
            <div className={`hotel-symbol hotel-color-${i % 4}`}>
              <Building2 size={25} />
            </div>
            <h2>{h.name}</h2>
            <p>
              <MapPin size={14} />
              {h.city}
            </p>
            <div>
              <span>{h._count.cases} Suchfälle</span>
              <ArrowUpRight size={18} />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
