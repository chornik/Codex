import Link from "next/link";
import {
  BookOpen,
  ScanLine,
  Search,
  ShieldCheck,
  Mail,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
export default function Guide() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">DAS PARTSDESK HANDBUCH</div>
          <h1>Von der Spur zur Entscheidung.</h1>
          <p>Ein gemeinsamer Ablauf für Haustechnik und Technical Services.</p>
        </div>
        <BookOpen size={35} className="muted" />
      </div>
      <div className="guide-grid">
        {[
          {
            icon: ScanLine,
            title: "01 · Bauteil dokumentieren",
            text: "Hotel, Hersteller, Modell und Artikelnummer erfassen. Typenschild frontal und scharf fotografieren. JPG, PNG, WebP, Text-PDF oder TXT hochladen. Lokale OCR erkennt mögliche Daten; Vorschläge am Original kontrollieren und aktiv übernehmen.",
          },
          {
            icon: Search,
            title: "02 · Strukturiert recherchieren",
            text: "Vier Suchstufen untersuchen Originalteile, mögliche Nachfolger, Alternativen und internationale Restbestände. Standardmäßig werden ausschließlich fiktive Demoangebote durchsucht. Manuelle Suchlinks öffnen eine Suchmaschine erst bei Ihrem Klick. Eine optional konfigurierte Brave API übermittelt nur die angezeigten Suchbegriffe.",
          },
          {
            icon: ShieldCheck,
            title: "03 · Technisch prüfen",
            text: "Bis zu drei Treffer vergleichen. Spannung, Signal, Leistung, Maße, Anschlüsse, Kennlinien, Zulassungen und Sicherheitsfunktionen am Originaldatenblatt und vor Ort prüfen. Eine gleiche Artikelbezeichnung reicht nicht als Eignungsnachweis. Bei Brandschutz, Kälteanlagen und anderen sicherheitsrelevanten Anlagen qualifiziertes Fachpersonal einbinden.",
          },
          {
            icon: Mail,
            title: "04 · Entscheidung & Kontakt",
            text: "Treffer begründet ablehnen, zur technischen Prüfung markieren oder für eine Kontaktaufnahme freigeben. Diese Freigabe ist keine technische Abnahme oder Beschaffungsfreigabe. Ein bearbeitbarer Anfrageentwurf kann anschließend lokal gespeichert oder als Text exportiert werden. Die Anwendung versendet keine Nachrichten und bestellt nichts.",
          },
          {
            icon: TrendingUp,
            title: "05 · Wirtschaftlichkeit dokumentieren",
            text: "Ersatzteil und Einbau einem möglichen Anlagentausch gegenüberstellen. Ausfallkosten nur ergänzen, wenn sie nicht bereits enthalten sind. Annahmen, Angebotsstand und mögliche Lebensdauerverlängerung dokumentieren. Rechenwerte sind Schätzungen und keine garantierten Einsparungen.",
          },
          {
            icon: BookOpen,
            title: "Rahmen dieses lokalen MVP",
            text: "Die Beispieldaten sind fiktiv. Es gibt keine Anmeldung und keine Rollenprüfung. Nur auf einem vertrauenswürdigen lokalen Rechner verwenden. Für einen produktiven Gruppenbetrieb sind unter anderem Anmeldung, Berechtigungen pro Hotel, nachvollziehbare Bearbeiteridentitäten, unveränderbare Audit-Historie und ein abgestimmtes Datenschutz- und Backupkonzept erforderlich.",
          },
        ].map((step) => (
          <section className="panel guide-card" key={step.title}>
            <step.icon size={25} />
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </section>
        ))}
      </div>
      <div className="guide-cta">
        <h2>Bereit für die erste Spur?</h2>
        <Link href="/cases/new" className="btn btn-primary">
          Suchfall anlegen <ArrowRight size={17} />
        </Link>
      </div>
    </>
  );
}
