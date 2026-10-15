"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Hotel } from "@prisma/client";
import type { FullCase } from "@/lib/types";
import type { CaseInput } from "@/lib/validation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Pencil,
  Search,
  Files,
  ListChecks,
  Mail,
  TrendingUp,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { Badge, Button, Notice, Modal, Safety, api, errorText } from "./ui";
import { urgencyLabels, statusLabels, date } from "@/lib/labels";
import { CaseForm } from "./case-form";
import { Research } from "./research";
import { Documents } from "./documents";
import { Economics } from "./economics";
import { Contacts } from "./contacts";
const tabs = [
  { id: "overview", label: "Überblick", icon: ClipboardList },
  { id: "documents", label: "Dokumente & Erkennung", icon: Files },
  { id: "research", label: "Recherche & Vergleich", icon: Search },
  { id: "contacts", label: "Kontaktentwürfe", icon: Mail },
  { id: "benefit", label: "Wirtschaftlicher Nutzen", icon: TrendingUp },
];
export function CaseWorkspace({
  item,
  hotels,
  browserPreview = false,
}: {
  item: FullCase;
  hotels: Hotel[];
  browserPreview?: boolean;
}) {
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function changeStatus(status: string) {
    setBusy(true);
    setError("");
    try {
      await api(`/api/cases/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link href="/" className="back-link">
        <ArrowLeft size={16} />
        Alle Suchfälle
      </Link>
      <div className="case-heading">
        <div>
          <div className="case-meta">
            <span className="eyebrow">SUCHFALL #{item.number}</span>
            <Badge
              tone={
                item.urgency === "CRITICAL"
                  ? "red"
                  : item.urgency === "HIGH"
                    ? "amber"
                    : "neutral"
              }
            >
              {item.urgency === "HIGH"
                ? "Hohe"
                : `${urgencyLabels[item.urgency]}e`}{" "}
              Priorität
            </Badge>
          </div>
          <h1>{item.title}</h1>
          <p>
            <Building2 size={15} />
            {item.hotel.name}
            <span>·</span>
            <MapPin size={14} />
            {item.hotel.city}
            <span>·</span>Erfasst am {date(item.createdAt)}
          </p>
        </div>
        <div className="case-actions">
          <label className="sr-only" htmlFor="case-status">
            Fallstatus
          </label>
          <select
            id="case-status"
            aria-label="Fallstatus"
            value={item.status}
            disabled={busy}
            onChange={(e) => changeStatus(e.target.value)}
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil size={16} />
            Bearbeiten
          </Button>
        </div>
      </div>
      {error && <Notice text={error} error />}
      <div className="case-progress">
        <div className="complete">
          <CheckCircle2 size={16} />
          Fall erfasst
        </div>
        <span />
        <div className={item.attachments.length ? "complete" : ""}>
          <Files size={16} />
          Daten sammeln
        </div>
        <span />
        <div className={item.searches.length ? "complete" : ""}>
          <Search size={16} />
          Recherchieren
        </div>
        <span />
        <div
          className={
            item.candidates.some((c) => c.reviewStatus !== "UNREVIEWED")
              ? "complete"
              : ""
          }
        >
          <ListChecks size={16} />
          Ergebnisse prüfen
        </div>
      </div>
      <div className="tabs" role="tablist" aria-label="Suchfall-Bereiche">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onKeyDown={(e) => {
              const i = tabs.findIndex((t) => t.id === tab);
              const next =
                e.key === "ArrowRight"
                  ? (i + 1) % tabs.length
                  : e.key === "ArrowLeft"
                    ? (i + tabs.length - 1) % tabs.length
                    : e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? tabs.length - 1
                        : -1;
              if (next >= 0) {
                e.preventDefault();
                setTab(tabs[next].id);
                document.getElementById(`tab-${tabs[next].id}`)?.focus();
              }
            }}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={17} />
            {t.label}
            {t.id === "documents" && item.attachments.length > 0 && (
              <span>{item.attachments.length}</span>
            )}
            {t.id === "research" && item.candidates.length > 0 && (
              <span>{item.candidates.length}</span>
            )}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="tab-content"
      >
        {tab === "overview" && (
          <div className="overview-grid">
            <section className="panel">
              <div className="section-heading">
                <h2>Das gesuchte Bauteil</h2>
                <span className="subtle-icon">
                  <ClipboardList size={20} />
                </span>
              </div>
              <div className="identity-grid">
                {[
                  { label: "Hersteller", value: item.manufacturer },
                  { label: "Modell / Typ", value: item.model },
                  { label: "Artikelnummer", value: item.partNumber },
                  { label: "Seriennummer", value: item.serialNumber },
                  { label: "Kategorie", value: item.category },
                  { label: "Baujahr der Anlage", value: item.systemYear },
                ].map((f) => (
                  <div key={f.label}>
                    <span>{f.label}</span>
                    <strong>{f.value || "Noch nicht erfasst"}</strong>
                  </div>
                ))}
              </div>
              <div className="content-section">
                <h3>Technische Parameter</h3>
                <pre className="parameter-block">
                  {item.parameters ||
                    "Noch keine technischen Parameter erfasst."}
                </pre>
              </div>
              <div className="content-section">
                <h3>Ausgangslage & Hinweise</h3>
                <p className="preserve-lines">
                  {item.description || "Noch keine Beschreibung erfasst."}
                </p>
              </div>
            </section>
            <aside className="overview-aside">
              <div className="next-step-card">
                <span className="stat-icon blue">
                  <Search size={22} />
                </span>
                <h2>Die nächste Spur wartet.</h2>
                <p>
                  {item.model || item.partNumber
                    ? "Die wichtigsten Identifikationsdaten sind erfasst. Starten Sie die strukturierte Recherche oder ergänzen Sie Ihre Unterlagen."
                    : "Erfassen Sie das Modell oder die Artikelnummer – manuell oder mit lokaler Texterkennung."}
                </p>
                <Button
                  onClick={() =>
                    setTab(
                      item.model || item.partNumber ? "research" : "documents",
                    )
                  }
                >
                  {item.model || item.partNumber
                    ? "Zur Recherche"
                    : "Daten erkennen lassen"}
                  <Search size={16} />
                </Button>
                <button
                  className="text-link"
                  onClick={() => setTab("documents")}
                >
                  Fotos & Dokumente ergänzen <Files size={15} />
                </button>
              </div>
              <div className="panel summary-card">
                <h3>Rechercheprotokoll</h3>
                <div>
                  <span>Suchläufe</span>
                  <strong>{item.searches.length}</strong>
                </div>
                <div>
                  <span>Treffer gesammelt</span>
                  <strong>{item.candidates.length}</strong>
                </div>
                <div>
                  <span>Für Kontakt freigegeben</span>
                  <strong>
                    {
                      item.candidates.filter(
                        (c) => c.reviewStatus === "APPROVED",
                      ).length
                    }
                  </strong>
                </div>
                <div>
                  <span>Dokumente</span>
                  <strong>{item.attachments.length}</strong>
                </div>
                <div>
                  <span>Kontaktentwürfe</span>
                  <strong>{item.drafts.length}</strong>
                </div>
              </div>
            </aside>
          </div>
        )}
        {tab === "documents" && (
          <Documents item={item} browserPreview={browserPreview} />
        )}
        {tab === "research" && (
          <Research item={item} onContact={() => setTab("contacts")} />
        )}
        {tab === "contacts" && (
          <Contacts item={item} onResearch={() => setTab("research")} />
        )}
        {tab === "benefit" && <Economics item={item} />}
      </div>
      <Safety />
      {editing && (
        <Modal title="Suchfall bearbeiten" onClose={() => setEditing(false)}>
          <CaseForm
            hotels={hotels}
            caseId={item.id}
            initial={{
              title: item.title,
              hotelId: item.hotelId,
              category: item.category as CaseInput["category"],
              urgency: item.urgency as CaseInput["urgency"],
              manufacturer: item.manufacturer,
              model: item.model,
              partNumber: item.partNumber,
              serialNumber: item.serialNumber,
              systemYear: item.systemYear,
              description: item.description,
              parameters: item.parameters,
            }}
            onSaved={() => setEditing(false)}
          />
        </Modal>
      )}
    </>
  );
}
