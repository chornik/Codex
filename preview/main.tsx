import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  ArrowUpRight,
  ArrowLeft,
  RotateCcw,
  Monitor,
} from "lucide-react";
import { Shell } from "../src/components/shell";
import { Dashboard } from "../src/components/dashboard";
import { CaseWorkspace } from "../src/components/case-workspace";
import { CaseForm } from "../src/components/case-form";
import { Button } from "../src/components/ui";
import Guide from "../src/app/guide/page";
import { Navigation, navigate } from "./navigation";
import Link from "./navigation";
import {
  getState,
  changedEvent,
  resetState,
  storageIsTemporary,
} from "./state";
import { getFile } from "./files";
import { previewApi } from "./api";
declare const __SAMPLES__: Record<
  string,
  { data: string; type: string; name: string }
>;

// All application API calls stay in this document. There is no remote API or secret.
window.fetch = async (input, init) => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
  if (url.startsWith("/api/")) return previewApi(url, init);
  throw new Error("Diese eigenständige Vorschau lädt keine externen Dienste.");
};
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.addEventListener("click", (event) => {
  const anchor = (event.target as Element)?.closest?.("a");
  const href = anchor?.getAttribute("href");
  if (!href) return;
  if (href.startsWith("/samples/")) {
    event.preventDefault();
    const sample = __SAMPLES__[href];
    if (sample) {
      const bytes = Uint8Array.from(atob(sample.data), (c) => c.charCodeAt(0));
      download(new Blob([bytes], { type: sample.type }), sample.name);
    }
  }
  if (href.startsWith("/api/attachments/")) {
    event.preventDefault();
    const id = href.split("/").pop()!;
    const file = getState()
      .cases.flatMap((c) => c.attachments)
      .find((a) => a.id === id);
    void getFile(id)
      .then((blob) => download(blob, file?.originalName || "Dokument"))
      .catch((error) =>
        alert(
          error instanceof Error ? error.message : "Datei nicht verfügbar.",
        ),
      );
  }
});
function App() {
  const [, setRevision] = useState(0);
  useEffect(() => {
    const update = () => setRevision((v) => v + 1);
    const navigate = () => {
      update();
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", navigate);
    window.addEventListener(changedEvent, update);
    return () => {
      window.removeEventListener("hashchange", navigate);
      window.removeEventListener(changedEvent, update);
    };
  }, []);
  const route = new URL(
    location.hash.slice(1) || "/",
    "https://partsdesk.invalid",
  );
  const state = getState();
  const router = {
    path: route.pathname,
    search: route.search,
    push: (href: string) => {
      navigate(href);
    },
    refresh: () => setRevision((v) => v + 1),
  };
  const sorted = () =>
    [...state.cases].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  let content;
  if (route.pathname === "/cases/new")
    content = (
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
              Dieser Fall wird ausschließlich in der Browserdemo gespeichert.
            </p>
          </div>
        </div>
        <section className="panel">
          <CaseForm hotels={state.hotels} />
        </section>
      </>
    );
  else if (route.pathname.startsWith("/cases/")) {
    const item = state.cases.find(
      (c) => c.id === decodeURIComponent(route.pathname.split("/")[2]),
    );
    content = item ? (
      <CaseWorkspace
        key={item.id}
        item={item}
        hotels={state.hotels}
        browserPreview
      />
    ) : (
      <div className="panel empty-state">
        <h1>Suchfall nicht gefunden</h1>
        <Link href="/" className="btn btn-primary">
          Zur Übersicht
        </Link>
      </div>
    );
  } else if (route.pathname === "/hotels")
    content = (
      <>
        <div className="page-heading">
          <div>
            <div className="eyebrow">EIN GEMEINSAMER WISSENSSTAND</div>
            <h1>Unsere Hotels</h1>
            <p>25 fiktive Beispielstandorte.</p>
          </div>
        </div>
        <div className="hotel-grid">
          {state.hotels.map((hotel, i) => (
            <Link
              key={hotel.id}
              href={`/?view=cases&hotel=${hotel.id}`}
              className="panel hotel-card"
            >
              <div className={`hotel-symbol hotel-color-${i % 4}`}>
                <Building2 size={25} />
              </div>
              <h2>{hotel.name}</h2>
              <p>
                <MapPin size={14} />
                {hotel.city}
              </p>
              <div>
                <span>
                  {state.cases.filter((c) => c.hotelId === hotel.id).length}{" "}
                  Suchfälle
                </span>
                <ArrowUpRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      </>
    );
  else if (route.pathname === "/guide") content = <Guide />;
  else
    content = (
      <Dashboard
        key={`${route.search}`}
        cases={sorted().map((c) => ({
          ...c,
          _count: {
            candidates: c.candidates.length,
            attachments: c.attachments.length,
          },
        }))}
        hotels={state.hotels}
        view={route.searchParams.get("view") || ""}
        initialHotel={route.searchParams.get("hotel") || ""}
      />
    );
  return (
    <Navigation.Provider value={router}>
      <Shell demo>
        <section className="html-preview-notice">
          <div>
            <strong>
              <Monitor size={16} />
              Interaktive Browserdemo
            </strong>
            <p>
              Demo-Katalog und Daten bleiben in diesem Browser. Foto-OCR,
              PDF-Auslesen und echte Websuche sind Funktionen der vollständigen
              Serverversion.
            </p>
            {storageIsTemporary() && (
              <p role="status">
                Diese Vorschau darf hier nicht dauerhaft speichern. Änderungen
                gelten nur für diese Sitzung.
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              if (
                confirm(
                  "Nur die Fälle dieser Browserdemo auf die Beispieldaten zurücksetzen?",
                )
              ) {
                resetState();
                navigate("/");
              }
            }}
          >
            <RotateCcw size={14} />
            Demofälle zurücksetzen
          </Button>
        </section>
        {content}
      </Shell>
    </Navigation.Provider>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
