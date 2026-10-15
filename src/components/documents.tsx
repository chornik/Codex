"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  ScanLine,
  Download,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { FullCase } from "@/lib/types";
import type { ExtractedFields } from "@/lib/extraction";
import { Button, Notice, api, errorText } from "./ui";
import { date } from "@/lib/labels";
const fieldLabels = {
  manufacturer: "Hersteller",
  model: "Modell / Typ",
  partNumber: "Artikelnummer",
  serialNumber: "Seriennummer",
  parameters: "Technische Parameter",
};
export function Documents({ item }: { item: FullCase }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    text: string;
    fields: ExtractedFields;
  } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  async function upload(file: File) {
    setBusy("upload");
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.append("file", file);
      await api(`/api/cases/${item.id}/attachments`, { method: "POST", body });
      setNotice(
        "Datei lokal gespeichert. Die Erkennung können Sie jetzt separat starten.",
      );
      router.refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
      if (input.current) input.current.value = "";
    }
  }
  async function extract(attachmentId?: string) {
    setBusy(attachmentId || "text");
    setError("");
    setNotice("");
    setResult(null);
    try {
      const data = await api<{ text: string; fields: ExtractedFields }>(
        `/api/cases/${item.id}/extract`,
        {
          method: "POST",
          body: JSON.stringify(attachmentId ? { attachmentId } : { text }),
        },
      );
      setResult(data);
      setSelected(
        Object.keys(data.fields).filter(
          (k) => !item[k as keyof ExtractedFields],
        ),
      );
      router.refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  }
  async function apply() {
    if (!result) return;
    setBusy("apply");
    setError("");
    try {
      const fields = Object.fromEntries(
        selected.map((k) => [k, result.fields[k as keyof ExtractedFields]]),
      );
      await api(`/api/cases/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(fields),
      });
      setNotice(
        "Die ausgewählten Daten wurden übernommen. Bitte am Original überprüfen.",
      );
      setResult(null);
      router.refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <div className="section-intro">
        <div>
          <h2>Aus Unterlagen werden Suchspuren.</h2>
          <p>
            Lokale OCR und regelbasierte Analyse. Keine Dokumente werden an
            externe KI-Dienste gesendet.
          </p>
        </div>
        <span className="privacy-chip">
          <span className="tiny-dot" />
          LOKAL VERARBEITET
        </span>
      </div>
      {error && <Notice text={error} error />}
      {notice && <Notice text={notice} />}
      <p className="sample-links">
        Zum Ausprobieren:{" "}
        <a href="/samples/typenschild.png" download>
          Demo-Typenschild (PNG)
        </a>
        <span>·</span>
        <a href="/samples/typenschild.pdf" download>
          PDF
        </a>
        <span>·</span>
        <a href="/samples/typenschild.txt" download>
          TXT
        </a>
      </p>
      <div className="two-columns">
        <section className="panel">
          <div className="section-heading">
            <h2>Fotos & Dokumente</h2>
            <span className="count-pill">{item.attachments.length} / 20</span>
          </div>
          <div
            className="upload-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f && !busy) void upload(f);
            }}
          >
            <UploadCloud size={30} />
            <h3>Das Typenschild ist ein guter Anfang.</h3>
            <p>Foto oder Datei hier ablegen</p>
            <Button
              busy={busy === "upload"}
              disabled={!!busy}
              variant="secondary"
              onClick={() => input.current?.click()}
            >
              Datei auswählen
            </Button>
            <small>JPG, PNG, WebP, PDF oder TXT · max. 10 MB / Datei</small>
            <input
              aria-label="Datei hochladen"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.txt"
              ref={input}
              className="sr-only"
              disabled={!!busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
              }}
            />
          </div>
          <div className="attachment-list">
            {item.attachments.map((a) => (
              <div className="attachment" key={a.id}>
                <div className="file-icon">
                  <FileText size={21} />
                </div>
                <div className="attachment-info">
                  <strong>{a.originalName}</strong>
                  <small>
                    {(a.size / 1024).toFixed(0)} KB · {date(a.createdAt)}
                    {a.extractedText ? " · Bereits ausgelesen" : ""}
                  </small>
                </div>
                <a
                  href={`/api/attachments/${a.id}`}
                  className="icon-button"
                  aria-label={`${a.originalName} herunterladen`}
                >
                  <Download size={16} />
                </a>
                <Button
                  variant="secondary"
                  busy={busy === a.id}
                  disabled={!!busy}
                  onClick={() => extract(a.id)}
                >
                  <ScanLine size={15} />
                  Auslesen
                </Button>
              </div>
            ))}
          </div>
        </section>
        <section className="panel padded">
          <div className="section-heading no-padding">
            <h2>
              <Sparkles size={19} />
              Text analysieren
            </h2>
          </div>
          <p className="muted">
            Angaben von einem Typenschild, einem Wartungsbericht oder einem
            Datenblatt einfügen.
          </p>
          <label className="field">
            Ausgangstext
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
              maxLength={30000}
              placeholder={
                "Siemens\nTyp: SQX32.00\nS/N: 1998-0042\nAC 230 V / 50 Hz\nHub: 20 mm"
              }
            />
          </label>
          <Button
            onClick={() => extract()}
            disabled={!text.trim() || !!busy}
            busy={busy === "text"}
          >
            <ScanLine size={16} />
            Produktdaten erkennen
          </Button>
          <p className="small-note">
            Erkennt bekannte Hersteller und beschriftete Felder. OCR kann
            Zeichen verwechseln. Aus gescannten PDFs bitte einzelne Seiten als
            Bild hochladen.
          </p>
        </section>
      </div>
      {busy && busy !== "upload" && busy !== "apply" && (
        <div role="status" className="processing">
          Dokument wird lokal ausgewertet. Bilderkennung kann beim ersten Mal
          etwas länger dauern …
        </div>
      )}
      {result && (
        <section className="panel extraction-result">
          <div className="section-heading">
            <div>
              <h2>
                <Sparkles size={19} />
                Erkannte Daten prüfen
              </h2>
              <p>
                Bestehende Werte sind zunächst abgewählt. Aktivierte Felder
                ersetzen den bisherigen Wert.
              </p>
            </div>
          </div>
          <div className="extraction-columns">
            <div>
              <h3>Vorschläge</h3>
              {Object.entries(result.fields).length ? (
                Object.entries(result.fields).map(([key, value]) => (
                  <div className="extracted-field" key={key}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selected.includes(key)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, key]
                              : selected.filter((k) => k !== key),
                          )
                        }
                      />
                      <strong>
                        {fieldLabels[key as keyof ExtractedFields]}
                      </strong>
                    </label>
                    <textarea
                      aria-label={`Erkannt: ${fieldLabels[key as keyof ExtractedFields]}`}
                      rows={key === "parameters" ? 4 : 1}
                      value={value}
                      onChange={(e) =>
                        setResult({
                          ...result,
                          fields: { ...result.fields, [key]: e.target.value },
                        })
                      }
                    />
                    {item[key as keyof ExtractedFields] && (
                      <small>
                        Bisher: {item[key as keyof ExtractedFields]}
                      </small>
                    )}
                  </div>
                ))
              ) : (
                <p>
                  Keine strukturierten Produktdaten erkannt. Nutzen Sie den
                  Rohtext und ergänzen Sie die Angaben über „Bearbeiten“.
                </p>
              )}
              <Button
                onClick={apply}
                busy={busy === "apply"}
                disabled={!selected.length || !!busy}
              >
                Ausgewählte Daten übernehmen <ArrowRight size={16} />
              </Button>
            </div>
            <div>
              <h3>Erkannter Rohtext</h3>
              <pre className="raw-text">{result.text}</pre>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
