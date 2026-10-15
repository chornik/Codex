"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Candidate } from "@prisma/client";
import type { FullCase } from "@/lib/types";
import { buildQueries } from "@/lib/queries";
import { stages, euro, date, kindLabels, reviewLabels } from "@/lib/labels";
import {
  Search,
  ExternalLink,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Mail,
  ChevronDown,
  Check,
  ArrowRight,
  Clock3,
} from "lucide-react";
import { Badge, Button, Notice, Modal, api, errorText } from "./ui";
function warnings(hit: Candidate): string[] {
  try {
    return JSON.parse(hit.warnings);
  } catch {
    return ["Technische Eignung ungeklärt."];
  }
}
export function Research({
  item,
  onContact,
}: {
  item: FullCase;
  onContact: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [compare, setCompare] = useState(false);
  const [review, setReview] = useState<Candidate | null>(null);
  const [filter, setFilter] = useState("");
  const [note, setNote] = useState("");
  const [decision, setDecision] = useState("TECHNICAL_REVIEW");
  const [confirmed, setConfirmed] = useState(false);
  let queries: ReturnType<typeof buildQueries> = [];
  try {
    queries = buildQueries(item);
  } catch {
    /* identity is not yet sufficient */
  }
  async function search() {
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const output = await api<{ count: number; provider: string }>(
        `/api/cases/${item.id}/search`,
        { method: "POST" },
      );
      setNotice(
        output.count
          ? `${output.count} Hinweise gefunden (${output.provider === "demo" ? "fiktiver Demo-Katalog" : "Brave Websuche"}). Bestehende Entscheidungen bleiben erhalten.`
          : "Keine Treffer gefunden. Im Demo-Modus sind SQX32.00, UPS 32-80 180 und EKC 202D enthalten. Andere Modelle benötigen eine konfigurierte Websuche oder manuelle Recherche.",
      );
      router.refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  function openReview(hit: Candidate) {
    setReview(hit);
    setDecision(
      hit.reviewStatus === "UNREVIEWED" ? "TECHNICAL_REVIEW" : hit.reviewStatus,
    );
    setNote(hit.reviewNote);
    setConfirmed(false);
    setError("");
  }
  async function saveReview(e: React.FormEvent) {
    e.preventDefault();
    if (!review) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/candidates/${review.id}/review`, {
        method: "POST",
        body: JSON.stringify({ status: decision, note, confirmed }),
      });
      setReview(null);
      setNotice(
        "Entscheidung mit Begründung und Zeitpunkt gespeichert. Dies ist keine technische Freigabe.",
      );
      router.refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  const selected = item.candidates.filter((c) => chosen.includes(c.id));
  const filtered = item.candidates.filter((c) => !filter || c.kind === filter);
  return (
    <>
      <div className="section-intro">
        <div>
          <h2>Vier Suchwege. Ein nachvollziehbares Ergebnis.</h2>
          <p>
            Suchbegriffe werden aus den erfassten Produktdaten abgeleitet.
            Quellen und Unsicherheiten bleiben sichtbar.
          </p>
        </div>
        <Button
          busy={busy && !review}
          disabled={!queries.length || busy}
          onClick={search}
        >
          <Search size={17} />
          {item.searches.length ? "Erneut recherchieren" : "Recherche starten"}
        </Button>
      </div>
      {!queries.length && (
        <Notice
          error
          text="Bitte unter „Bearbeiten“ ein Modell oder eine Artikelnummer ergänzen, bevor Sie die Suche starten."
        />
      )}
      {!review && error && <Notice text={error} error />}
      {notice && <Notice text={notice} />}
      <section className="search-stages">
        {stages.map((stage, i) => (
          <div key={stage}>
            <span className="stage-number">0{i + 1}</span>
            <h3>{stage}</h3>
            <p>{queries[i]?.query || "Produktdaten ergänzen"}</p>
            {queries[i] && (
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(queries[i].query)}`}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                Manuell suchen <ExternalLink size={12} />
              </a>
            )}
          </div>
        ))}
      </section>
      <div className="section-heading results-heading">
        <div>
          <h2>
            Gesammelte Treffer{" "}
            <span className="count-pill">{item.candidates.length}</span>
          </h2>
          <p>
            Demoangebote sind fiktiv. Webtreffer sind ungeprüfte
            Recherchehinweise.
          </p>
        </div>
        <div className="inline-actions">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Treffertyp filtern"
          >
            <option value="">Alle Treffertypen</option>
            {Object.entries(kindLabels).map(([v, l]) => (
              <option value={v} key={v}>
                {l}
              </option>
            ))}
          </select>
          <Button
            variant={compare ? "primary" : "secondary"}
            disabled={selected.length < 2}
            onClick={() => setCompare(!compare)}
          >
            <Scale size={16} />
            {compare
              ? "Vergleich schließen"
              : `Vergleichen (${chosen.length}/3)`}
          </Button>
        </div>
      </div>
      {compare && selected.length >= 2 && (
        <section className="panel comparison">
          <div className="section-heading">
            <h2>Technischer Vergleich</h2>
            <Badge tone="amber">Eignung nicht bestätigt</Badge>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Prüfkriterium</th>
                  <th>Bestandsbauteil</th>
                  {selected.map((c) => (
                    <th key={c.id}>{c.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Hersteller / Artikel</th>
                  <td>
                    {item.manufacturer}
                    <br />
                    {item.partNumber || item.model}
                  </td>
                  {selected.map((c) => (
                    <td key={c.id}>
                      {c.manufacturer}
                      <br />
                      {c.partNumber}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Technische Angaben</th>
                  <td className="preserve-lines">
                    {item.parameters || "Nicht erfasst"}
                  </td>
                  {selected.map((c) => (
                    <td className="preserve-lines" key={c.id}>
                      {c.parameters}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Preis (ungeprüft)</th>
                  <td>—</td>
                  {selected.map((c) => (
                    <td key={c.id}>{euro(c.price)}</td>
                  ))}
                </tr>
                <tr>
                  <th>Offene Fragen</th>
                  <td>Bestandsdaten vor Ort verifizieren.</td>
                  {selected.map((c) => (
                    <td key={c.id}>
                      {warnings(c).map((w) => (
                        <p key={w} className="compare-warning">
                          {w}
                        </p>
                      ))}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Entscheidung</th>
                  <td>Fachpersonal erforderlich</td>
                  {selected.map((c) => (
                    <td key={c.id}>
                      <Badge
                        tone={c.reviewStatus === "APPROVED" ? "green" : "amber"}
                      >
                        {reviewLabels[c.reviewStatus]}
                      </Badge>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Quellenstand</th>
                  <td>Erfasste Angaben</td>
                  {selected.map((c) => (
                    <td key={c.id}>
                      {date(c.createdAt)}
                      <br />
                      <a
                        className="text-link"
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Quelle öffnen <ExternalLink size={12} />
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
      <div className="candidate-list">
        {filtered.map((hit) => (
          <article
            className={`panel candidate ${hit.reviewStatus === "REJECTED" ? "candidate-rejected" : ""}`}
            key={hit.id}
          >
            <div className="candidate-top">
              <label className="compare-check">
                <input
                  type="checkbox"
                  aria-label={`${hit.title} vergleichen`}
                  checked={chosen.includes(hit.id)}
                  disabled={!chosen.includes(hit.id) && chosen.length >= 3}
                  onChange={(e) => {
                    setChosen(
                      e.target.checked
                        ? [...chosen, hit.id]
                        : chosen.filter((id) => id !== hit.id),
                    );
                    setCompare(false);
                  }}
                />
                <span>Vergleichen</span>
              </label>
              <div className="candidate-badges">
                <Badge
                  tone={hit.externalId.startsWith("demo-") ? "neutral" : "blue"}
                >
                  {hit.externalId.startsWith("demo-")
                    ? "Fiktives Demoangebot"
                    : "Webhinweis"}
                </Badge>
                <Badge
                  tone={
                    hit.kind === "ALTERNATIVE"
                      ? "amber"
                      : hit.kind === "ORIGINAL"
                        ? "blue"
                        : "neutral"
                  }
                >
                  {kindLabels[hit.kind]}
                </Badge>
                <Badge
                  tone={
                    hit.reviewStatus === "APPROVED"
                      ? "green"
                      : hit.reviewStatus === "REJECTED"
                        ? "red"
                        : hit.reviewStatus === "TECHNICAL_REVIEW"
                          ? "amber"
                          : "neutral"
                  }
                >
                  {reviewLabels[hit.reviewStatus]}
                </Badge>
              </div>
            </div>
            <div className="candidate-main">
              <div className="candidate-product-icon">
                <span>{hit.manufacturer.slice(0, 2).toUpperCase()}</span>
                <small>BAUTEIL</small>
              </div>
              <div className="candidate-info">
                <div className="eyebrow">
                  SUCHSTUFE {hit.stage} · {hit.source}
                </div>
                <h3>{hit.title}</h3>
                <p>{hit.description}</p>
                <div className="candidate-source">
                  <a href={hit.url} target="_blank" rel="noreferrer">
                    <ExternalLink size={13} />
                    {hit.source}
                  </a>
                  <span>Erfasst: {date(hit.createdAt)}</span>
                </div>
              </div>
              <div className="candidate-price">
                <strong>{euro(hit.price)}</strong>
                <span>Preisindikator · ungeprüft</span>
                <small>{hit.availability}</small>
              </div>
            </div>
            <div className="candidate-bottom">
              <details>
                <summary>
                  Technische Daten & offene Fragen <ChevronDown size={15} />
                </summary>
                <div className="candidate-details">
                  <pre>{hit.parameters}</pre>
                  <ul>
                    {warnings(hit).map((w) => (
                      <li key={w}>
                        <AlertTriangle size={14} />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
              <div className="inline-actions">
                <Button variant="secondary" onClick={() => openReview(hit)}>
                  <ShieldCheck size={15} />
                  Ergebnis prüfen
                </Button>
                {hit.reviewStatus === "APPROVED" && (
                  <Button variant="ghost" onClick={onContact}>
                    <Mail size={15} />
                    Kontaktentwurf <ArrowRight size={14} />
                  </Button>
                )}
              </div>
            </div>
            {hit.reviewNote && (
              <div className="review-note">
                <Check size={14} />
                <span>
                  {hit.reviewNote}{" "}
                  <small>· {hit.reviewedAt ? date(hit.reviewedAt) : ""}</small>
                </span>
              </div>
            )}
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="panel empty-state">
          <Search size={35} />
          <h3>
            {item.searches.length
              ? "Keine Treffer für diese Auswahl"
              : "Die Recherche beginnt mit einer Spur."}
          </h3>
          <p>
            Starten Sie die strukturierte Suche. Es werden keine Händler
            kontaktiert.
          </p>
        </div>
      )}
      {item.searches.length > 0 && (
        <details className="panel search-history">
          <summary>
            <Clock3 size={17} />
            Suchprotokoll · {item.searches.length} Läufe
            <ChevronDown size={15} />
          </summary>
          {item.searches.map((run) => (
            <div className="history-run" key={run.id}>
              <strong>
                {date(run.createdAt)} ·{" "}
                {run.provider === "demo" ? "Demo-Katalog" : "Brave Websuche"} ·{" "}
                {run.count} Treffer
              </strong>
              {(
                JSON.parse(run.queries) as Array<{
                  stage: number;
                  query: string;
                }>
              ).map((q) => (
                <p key={q.stage}>
                  <span>0{q.stage}</span>
                  {q.query}
                </p>
              ))}
            </div>
          ))}
        </details>
      )}
      {review && (
        <Modal
          title="Recherchetreffer prüfen"
          onClose={() => {
            if (!busy) {
              setReview(null);
              setError("");
            }
          }}
        >
          <form onSubmit={saveReview} className="review-form">
            <Badge tone="blue">{kindLabels[review.kind]}</Badge>
            <h3>{review.title}</h3>
            <div className="review-warnings">
              {warnings(review).map((w) => (
                <p key={w}>
                  <AlertTriangle size={15} />
                  {w}
                </p>
              ))}
            </div>
            {error && <Notice text={error} error />}
            <label className="field">
              Entscheidung
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
              >
                {Object.entries(reviewLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Begründung & offene Prüfpunkte *
              <textarea
                required
                minLength={5}
                maxLength={2000}
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Welche Angaben wurden geprüft? Was muss der Fachbetrieb noch bestätigen?"
              />
            </label>
            <label className="confirmation">
              <input
                required
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>
                Ich dokumentiere diese Entscheidung aktiv. Eine Kontaktfreigabe
                bestätigt keine technische Eignung und löst weder Bestellung
                noch Nachricht aus.
              </span>
            </label>
            <Button
              type="submit"
              busy={busy}
              disabled={!confirmed || note.trim().length < 5}
            >
              <ShieldCheck size={16} />
              Entscheidung speichern
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}
