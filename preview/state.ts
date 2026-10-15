import type { Hotel } from "@prisma/client";
import type { FullCase } from "../src/lib/types";
import { demoSearch } from "../src/lib/search";
import { buildQueries } from "../src/lib/queries";
export const storageKey = "partsdesk-html-preview-v1";
export const changedEvent = "partsdesk-preview-changed";
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export type PreviewState = { version: 1; hotels: Hotel[]; cases: FullCase[] };
export function addSearch(item: FullCase) {
  const hits = demoSearch(item);
  for (const hit of hits) {
    if (item.candidates.some((c) => c.externalId === hit.externalId)) continue;
    const { matches, warnings, ...data } = hit;
    void matches;
    item.candidates.push({
      ...data,
      id: uid(),
      caseId: item.id,
      warnings: JSON.stringify(warnings),
      reviewStatus: "UNREVIEWED",
      reviewNote: "",
      reviewedAt: null,
      createdAt: new Date(),
    });
  }
  item.candidates.sort(
    (a, b) => a.stage - b.stage || (a.price || 0) - (b.price || 0),
  );
  item.searches.unshift({
    id: uid(),
    caseId: item.id,
    provider: "demo",
    queries: JSON.stringify(buildQueries(item)),
    count: hits.length,
    createdAt: new Date(),
  });
  if (item.status === "OPEN") item.status = "RESEARCHING";
  return hits.length;
}
export function seedState(): PreviewState {
  const cities = [
    "Wien",
    "Salzburg",
    "Innsbruck",
    "Graz",
    "Linz",
    "Bregenz",
    "Klagenfurt",
    "Villach",
    "Baden",
    "Kitzbühel",
    "Zell am See",
    "Schladming",
    "Seefeld",
    "Lech",
    "Sölden",
    "Ischgl",
    "Mayrhofen",
    "St. Anton",
    "Bad Gastein",
    "Velden",
    "Krems",
    "Melk",
    "Eisenstadt",
    "Steyr",
    "Dornbirn",
  ];
  const hotels = cities.map((city, i) => ({
    id: `hotel-${i + 1}`,
    city,
    name:
      ["Hotel am Stadtpark", "Hotel Mirabell", "Alpenresidenz Innsbruck"][i] ||
      `Hotel ${city}`,
  }));
  const examples = [
    {
      id: "case-siemens",
      title: "Stellantrieb für Heizkreisverteiler",
      hotelId: "hotel-1",
      category: "Ventile & Antriebe",
      urgency: "HIGH",
      manufacturer: "Siemens",
      model: "SQX32.00",
      partNumber: "SQX32.00",
      systemYear: "1998",
      serialNumber: "DEMO-1998-0042",
      parameters:
        "Versorgung: AC 230 V\nStellsignal: 3-Punkt\nHub: 20 mm\nStellkraft: 700 N\nVentilanschluss: vor Ort prüfen",
      description:
        "Der Stellantrieb fährt nicht mehr zuverlässig in die Endlage. Originalteil bevorzugt, Alternativen nur nach technischer Prüfung. Fiktiver Beispielfall.",
    },
    {
      id: "case-grundfos",
      title: "Umwälzpumpe im Wellnessbereich",
      hotelId: "hotel-3",
      category: "Pumpen",
      urgency: "CRITICAL",
      manufacturer: "Grundfos",
      model: "UPS 32-80 180",
      partNumber: "",
      systemYear: "2004",
      serialNumber: "",
      parameters:
        "Versorgung: AC 230 V\nEinbaulänge: 180 mm\nArbeitspunkt: noch zu ermitteln",
      description:
        "Erhöhte Laufgeräusche und zeitweilige Ausfälle. Hydraulische Kennlinie und Anschlüsse durch Fachpersonal abgleichen. Fiktiver Beispielfall.",
    },
    {
      id: "case-danfoss",
      title: "Kühlstellenregler für Kühlraum Küche",
      hotelId: "hotel-2",
      category: "Klima & Kälte",
      urgency: "NORMAL",
      manufacturer: "Danfoss",
      model: "EKC 202D",
      partNumber: "",
      systemYear: "2010",
      serialNumber: "",
      parameters: "Fühlertyp und Versorgung noch ungeklärt",
      description:
        "Display sporadisch ohne Anzeige. Vor einer Beschaffung Fehlerdiagnose durch den Kältefachbetrieb veranlassen. Fiktiver Beispielfall.",
    },
  ];
  const cases: FullCase[] = examples.map((c, i) => ({
    ...c,
    number: 1001 + i,
    status: "OPEN",
    hotel: hotels.find((h) => h.id === c.hotelId)!,
    createdAt: new Date(),
    updatedAt: new Date(),
    attachments: [],
    candidates: [],
    searches: [],
    drafts: [],
    benefit: null,
  }));
  addSearch(cases[0]);
  addSearch(cases[1]);
  cases[1].status = "REVIEW";
  const alternate = cases[1].candidates.find((c) => c.kind === "ALTERNATIVE");
  if (alternate) {
    alternate.reviewStatus = "TECHNICAL_REVIEW";
    alternate.reviewNote =
      "Arbeitspunkt, Regelung und Einbaulänge durch den Fachbetrieb prüfen.";
    alternate.reviewedAt = new Date();
  }
  cases[0].benefit = {
    id: uid(),
    caseId: cases[0].id,
    partCost: 285,
    laborCost: 320,
    replacementCost: 8500,
    downtimeDays: 2,
    dailyCost: 450,
    extensionMonths: 24,
    notes:
      "Fiktive Planwerte, netto. Keine garantierte Einsparung oder Lebensdauerverlängerung.",
    updatedAt: new Date(),
  };
  return { version: 1, hotels, cases };
}
let current: PreviewState | undefined;
let memoryOnly = false;
export function getState(): PreviewState {
  if (current) return current;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const value = JSON.parse(raw) as PreviewState;
      if (
        value.version === 1 &&
        Array.isArray(value.cases) &&
        Array.isArray(value.hotels) &&
        value.hotels.length === 25 &&
        value.cases.every(
          (c) =>
            typeof c.id === "string" &&
            Array.isArray(c.candidates) &&
            Array.isArray(c.attachments) &&
            Array.isArray(c.searches) &&
            Array.isArray(c.drafts),
        )
      )
        current = value;
    }
  } catch {
    memoryOnly = true;
  }
  return (current ||= seedState());
}
export function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(getState()));
  } catch {
    memoryOnly = true;
  }
  window.dispatchEvent(new Event(changedEvent));
}
export const storageIsTemporary = () => memoryOnly;
export function resetState() {
  current = seedState();
  persist();
}
