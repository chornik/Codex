"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContactDraft } from "@prisma/client";
import type { FullCase } from "@/lib/types";
import {
  FilePenLine,
  Mail,
  Copy,
  Download,
  Save,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button, Notice, api, errorText, Badge } from "./ui";
import { date } from "@/lib/labels";
export function Contacts({
  item,
  onResearch,
}: {
  item: FullCase;
  onResearch: () => void;
}) {
  const approved = item.candidates.filter((c) => c.reviewStatus === "APPROVED");
  const [candidateId, setCandidateId] = useState(approved[0]?.id || "");
  const [draft, setDraft] = useState<ContactDraft | null>(
    item.drafts[0] || null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const router = useRouter();
  async function create() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api<ContactDraft>(`/api/cases/${item.id}/drafts`, {
        method: "POST",
        body: JSON.stringify({ candidateId: candidateId || approved[0]?.id }),
      });
      setDraft(result);
      setNotice(
        "Kontaktentwurf erstellt. Bitte Inhalt und Empfänger selbst prüfen. Es wurde nichts versendet.",
      );
      router.refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!draft) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api<ContactDraft>(`/api/cases/${item.id}/drafts`, {
        method: "POST",
        body: JSON.stringify({
          candidateId: draft.candidateId,
          draftId: draft.id,
          subject: draft.subject,
          body: draft.body,
        }),
      });
      setDraft(result);
      setNotice("Entwurf gespeichert.");
      router.refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
      setNotice("Entwurf in die Zwischenablage kopiert.");
    } catch {
      setError(
        "Zwischenablage nicht verfügbar. Bitte den Text manuell kopieren oder herunterladen.",
      );
    }
  }
  function download() {
    if (!draft) return;
    const url = URL.createObjectURL(
      new Blob([`${draft.subject}\n\n${draft.body}`], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `kontaktentwurf-${item.number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
  const stillApproved =
    !!draft && approved.some((c) => c.id === draft.candidateId);
  return (
    <>
      <div className="section-intro">
        <div>
          <h2>Gut vorbereitet ins Gespräch.</h2>
          <p>
            Entwürfe für Ihre persönliche Anfrage. Kein Versand, keine
            Bestellung, keine automatische Kontaktaufnahme.
          </p>
        </div>
        <Badge tone="green">
          <ShieldCheck size={12} />
          Menschliche Freigabe erforderlich
        </Badge>
      </div>
      {error && <Notice text={error} error />}
      {notice && <Notice text={notice} />}
      <div className="contacts-layout">
        <aside className="panel padded">
          <FilePenLine size={25} className="accent" />
          <h3>Kontaktentwurf vorbereiten</h3>
          <p className="muted">
            Nur für ausdrücklich zur Kontaktaufnahme freigegebene Treffer.
          </p>
          {approved.length ? (
            <>
              <label className="field">
                Freigegebener Treffer
                <select
                  value={candidateId || approved[0].id}
                  onChange={(e) => setCandidateId(e.target.value)}
                >
                  {approved.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                onClick={create}
                busy={busy}
                disabled={!(candidateId || approved[0]?.id)}
              >
                <Mail size={16} />
                Entwurf erstellen
              </Button>
            </>
          ) : (
            <>
              <div className="inline-note">
                <p>Noch kein Treffer für eine Kontaktaufnahme freigegeben.</p>
              </div>
              <Button variant="secondary" onClick={onResearch}>
                Treffer prüfen <ArrowRight size={16} />
              </Button>
            </>
          )}
          {item.drafts.length > 0 && (
            <div className="saved-drafts">
              <h3>Gespeicherte Entwürfe</h3>
              {item.drafts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setDraft(d);
                    setError("");
                    setNotice("");
                  }}
                  className={draft?.id === d.id ? "selected" : ""}
                >
                  <Mail size={15} />
                  <span>
                    {d.subject}
                    <small>{date(d.updatedAt)}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>
        <section className="panel padded">
          {draft ? (
            <>
              <div className="section-heading no-padding">
                <h2>Ihr Anfrageentwurf</h2>
                <Badge>NICHT VERSENDET</Badge>
              </div>
              {!stillApproved && (
                <Notice
                  text="Die Kontaktfreigabe dieses Treffers liegt nicht mehr vor. Prüfen Sie die Entscheidung erneut, bevor Sie den Entwurf weiterverwenden."
                  error
                />
              )}
              <label className="field">
                Betreff
                <input
                  maxLength={500}
                  value={draft.subject}
                  onChange={(e) =>
                    setDraft({ ...draft, subject: e.target.value })
                  }
                />
              </label>
              <label className="field">
                Nachricht
                <textarea
                  maxLength={15000}
                  rows={20}
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                />
              </label>
              <div className="inline-actions wrap">
                <Button
                  busy={busy}
                  onClick={save}
                  disabled={
                    !stillApproved ||
                    !draft.subject.trim() ||
                    !draft.body.trim()
                  }
                >
                  <Save size={15} />
                  Speichern
                </Button>
                <Button
                  variant="secondary"
                  onClick={copy}
                  disabled={!stillApproved}
                >
                  <Copy size={15} />
                  Kopieren
                </Button>
                <Button
                  variant="secondary"
                  onClick={download}
                  disabled={!stillApproved}
                >
                  <Download size={15} />
                  Als TXT herunterladen
                </Button>
              </div>
              <p className="small-note">
                Empfängeradresse und Versand erfolgen ausschließlich manuell
                außerhalb dieser Anwendung. Bitte personenbezogene oder
                vertrauliche Angaben vor einer Weitergabe prüfen.
              </p>
            </>
          ) : (
            <div className="empty-state">
              <Mail size={36} />
              <h3>Eine fundierte Anfrage beginnt hier.</h3>
              <p>
                Treffer freigeben und einen bearbeitbaren Entwurf erstellen.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
