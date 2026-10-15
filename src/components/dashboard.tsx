"use client";
import { useState } from "react";
import Link from "next/link";
import type { Hotel } from "@prisma/client";
import type { ListCase } from "@/lib/types";
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Search,
  FolderOpen,
  ScanLine,
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  Wrench,
  Clock3,
  ChevronRight,
} from "lucide-react";
import { Badge, Safety } from "./ui";
import { statusLabels, urgencyLabels, date } from "@/lib/labels";
export function Dashboard({
  cases,
  hotels,
  view,
  initialHotel,
}: {
  cases: ListCase[];
  hotels: Hotel[];
  view: string;
  initialHotel: string;
}) {
  const [query, setQuery] = useState("");
  const [hotel, setHotel] = useState(initialHotel);
  const [status, setStatus] = useState(view === "review" ? "REVIEW" : "");
  const shown = cases.filter(
    (c) =>
      (!hotel || c.hotelId === hotel) &&
      (!status || c.status === status) &&
      `${c.title} ${c.manufacturer} ${c.model} ${c.partNumber} ${c.number} ${c.hotel.name}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const counts = {
    active: cases.filter((c) => c.status !== "RESOLVED").length,
    review: cases.filter((c) => c.status === "REVIEW").length,
    hits: cases.reduce((sum, c) => sum + c._count.candidates, 0),
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">TECHNIK, DIE WEITERLÄUFT</div>
          <h1>
            {view === "review"
              ? "Technische Prüfung"
              : view === "cases"
                ? "Alle Suchfälle"
                : "Alles im Blick."}
          </h1>
          <p>
            {view === "review"
              ? "Offene technische Fragen klären und Entscheidungen dokumentieren."
              : "Ersatzteile finden. Wissen verbinden. Anlagen erhalten."}
          </p>
        </div>
        <Link className="btn btn-primary" href="/cases/new">
          <Plus size={18} />
          Neuer Suchfall
        </Link>
      </div>
      <section className="stats-grid" aria-label="Kennzahlen">
        <Stat
          icon={<FolderOpen size={21} />}
          value={counts.active}
          label="Aktive Suchfälle"
          detail="In der gesamten Hotelgruppe"
          tone="blue"
        />
        <Stat
          icon={<Search size={21} />}
          value={counts.hits}
          label="Recherchetreffer"
          detail="Quellen für die weitere Prüfung"
          tone="green"
        />
        <Stat
          icon={<ShieldCheck size={21} />}
          value={counts.review}
          label="In technischer Prüfung"
          detail="Fachliche Klärung erforderlich"
          tone="amber"
        />
        <Stat
          icon={<Building2 size={21} />}
          value={hotels.length}
          label="Hotels im Netzwerk"
          detail="Ein gemeinsamer Wissensstand"
          tone="purple"
        />
      </section>
      {!view && (
        <section className="hero-panel">
          <div className="hero-copy">
            <div className="hero-tag">
              <span className="tiny-dot" /> IHR RECHERCHE-ASSISTENT
            </div>
            <h2>
              Das passende Teil beginnt
              <br />
              mit der richtigen Spur.
            </h2>
            <p>
              Typenschild erfassen, Suchwege verbinden und mögliche
              <br className="desktop-break" /> Alternativen fundiert prüfen – an
              einem Ort.
            </p>
            <Link href="/cases/new" className="hero-link">
              Neue Recherche starten <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="visual-chip chip-one">
              <ScanLine size={18} />
              <span>Typenschild erkannt</span>
              <span className="chip-check">✓</span>
            </div>
            <div className="part-illustration">
              <div className="part-top" />
              <div className="part-body">
                <div className="part-label">
                  PARTS<span>SQX32.00</span>
                  <i />
                  <i />
                  <i />
                </div>
                <div className="part-screw" />
              </div>
              <div className="part-base" />
              <div className="part-shaft" />
            </div>
            <div className="visual-chip chip-two">
              <Search size={17} />
              <div>
                Eine neue Spur.<small>Vier strukturierte Suchwege.</small>
              </div>
            </div>
          </div>
        </section>
      )}
      <div className="dashboard-lower">
        <section className="panel cases-panel">
          <div className="section-heading">
            <div>
              <h2>
                {view === "review" ? "Fälle zur Prüfung" : "Ihre Suchfälle"}{" "}
                <span className="count-pill">{shown.length}</span>
              </h2>
              <p>Von der ersten Anfrage bis zur dokumentierten Entscheidung.</p>
            </div>
            <SlidersHorizontal size={19} className="muted" />
          </div>
          <div className="filterbar">
            <div className="search-input">
              <Search size={17} />
              <input
                aria-label="Suchfälle durchsuchen"
                placeholder="Fall, Modell oder Hersteller suchen …"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Hotel filtern"
              value={hotel}
              onChange={(e) => setHotel(e.target.value)}
            >
              <option value="">Alle Hotels</option>
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Status filtern"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Alle Status</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="table-scroll">
            <table className="case-table">
              <thead>
                <tr>
                  <th>SUCHFALL / BAUTEIL</th>
                  <th>HOTEL</th>
                  <th>STATUS</th>
                  <th>PRIORITÄT</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link className="case-title" href={`/cases/${c.id}`}>
                        {c.title}
                      </Link>
                      <div className="table-sub">
                        #{c.number} <span>·</span> {c.manufacturer}{" "}
                        {c.model || "Modell offen"}
                      </div>
                    </td>
                    <td>
                      <span className="hotel-name">{c.hotel.name}</span>
                      <div className="table-sub">{c.hotel.city}</div>
                    </td>
                    <td>
                      <Badge
                        tone={
                          c.status === "REVIEW"
                            ? "amber"
                            : c.status === "RESOLVED"
                              ? "green"
                              : c.status === "RESEARCHING"
                                ? "blue"
                                : "neutral"
                        }
                      >
                        {statusLabels[c.status]}
                      </Badge>
                      <div className="table-sub">
                        {c._count.candidates} Treffer
                      </div>
                    </td>
                    <td>
                      <span
                        className={`priority priority-${c.urgency.toLowerCase()}`}
                      >
                        <i />
                        {urgencyLabels[c.urgency]}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="row-open"
                        aria-label={`${c.title} öffnen`}
                        href={`/cases/${c.id}`}
                      >
                        <ChevronRight size={19} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!shown.length && (
            <div className="empty-state">
              <FolderOpen size={32} />
              <h3>Keine Suchfälle gefunden</h3>
              <p>Filter anpassen oder einen neuen Fall anlegen.</p>
              <Link href="/cases/new" className="btn btn-secondary">
                Suchfall anlegen
              </Link>
            </div>
          )}
          <div className="table-footer">
            <span>
              {shown.length} von {cases.length} Suchfällen
            </span>
            <span>
              <Clock3 size={13} /> Daten lokal gespeichert
            </span>
          </div>
        </section>
        {!view && (
          <aside className="dashboard-aside">
            <div className="panel workflow-card">
              <div className="section-heading">
                <h2>So wird aus Suche Wissen.</h2>
                <Wrench size={18} className="muted" />
              </div>
              {[
                {
                  title: "Bauteil verstehen",
                  text: "Fotos, Typenschild und technische Daten erfassen.",
                },
                {
                  title: "Spuren verfolgen",
                  text: "Originalteile, Nachfolger und Alternativen recherchieren.",
                },
                {
                  title: "Gemeinsam entscheiden",
                  text: "Quellen prüfen und nächste Schritte aktiv freigeben.",
                },
              ].map((step, index) => (
                <div className="workflow-step" key={step.title}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
              <Link className="text-link" href="/guide">
                Ablauf kennenlernen <ArrowUpRight size={15} />
              </Link>
            </div>
            <div className="note-card">
              <div className="note-icon">
                <ShieldCheck size={21} />
              </div>
              <h3>Ihre Expertise entscheidet.</h3>
              <p>
                Die Assistenz findet Hinweise. Technische Eignung, Beschaffung
                und Kontaktaufnahme bleiben in Ihrer Hand.
              </p>
              <span>MENSCHLICHE ENTSCHEIDUNG IM MITTELPUNKT</span>
            </div>
          </aside>
        )}
      </div>
      <div className="recent-caption">
        Letzte Aktualisierung eines Falls:{" "}
        {cases[0] ? date(cases[0].updatedAt) : "Noch keine Fälle"}
      </div>
      <Safety compact />
    </>
  );
}
function Stat({
  icon,
  value,
  label,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  detail: string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-value">{value.toString().padStart(2, "0")}</div>
      <h3>{label}</h3>
      <p>{detail}</p>
    </div>
  );
}
