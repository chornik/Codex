import Link from "next/link";
import { ArrowLeft, FileSearch, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { CaseForm } from "@/components/case-form";
export default async function NewCase() {
  const hotels = await db.hotel.findMany({ orderBy: { name: "asc" } });
  return (
    <>
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        Zurück zur Übersicht
      </Link>
      <div className="page-heading">
        <div>
          <div className="eyebrow">EINE NEUE SPUR</div>
          <h1>Neuen Suchfall anlegen</h1>
          <p>
            Beschreiben Sie das Bauteil. Gemeinsam bringen wir die Recherche
            weiter.
          </p>
        </div>
      </div>
      <div className="form-layout">
        <section className="panel">
          <CaseForm hotels={hotels} />
        </section>
        <aside>
          <div className="panel guidance-card">
            <FileSearch size={28} />
            <h3>Starten Sie mit dem, was Sie wissen.</h3>
            <p>
              Ein lesbares Typenschild ist oft die beste Spur. Fotos und
              Dokumente können Sie nach dem Anlegen hochladen und lokal auslesen
              lassen.
            </p>
            <hr />
            <ShieldCheck size={24} />
            <h3>Prüfen statt vermuten.</h3>
            <p>
              Übernommene Produktdaten und spätere Treffer müssen fachlich
              bestätigt werden. Bei Brandschutz und sicherheitsrelevanten
              Anlagen ist eine qualifizierte Prüfung unverzichtbar.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
