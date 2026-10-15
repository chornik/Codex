// Entirely fictional offers: no claim about real stock, prices or compatibility.
export type CatalogItem = {
  externalId: string;
  title: string;
  manufacturer: string;
  partNumber: string;
  kind: "ORIGINAL" | "ALTERNATIVE" | "WEB";
  stage: number;
  source: string;
  url: string;
  description: string;
  price: number | null;
  availability: string;
  parameters: string;
  warnings: string[];
  matches: string[];
};
export const catalog: CatalogItem[] = [
  {
    externalId: "demo-sqx-original",
    title: "Siemens SQX32.00 · Stellantrieb",
    manufacturer: "Siemens",
    partNumber: "SQX32.00",
    kind: "ORIGINAL",
    stage: 1,
    source: "IndustrieDepot · Demo",
    url: "https://industriesupply.example/sqx32",
    description:
      "Fiktiver Restbestand eines elektromechanischen Stellantriebs. Verpackung und Zustand vor Beschaffung prüfen.",
    price: 285,
    availability: "Demo: Restbestand, 2 Stück",
    parameters:
      "Versorgung: AC 230 V\nStellsignal: 3-Punkt\nHub: 20 mm\nStellkraft: 700 N",
    warnings: [
      "Typenschild und genaue Ausführung abgleichen.",
      "Lageralter, Gewährleistung und Funktionstest klären.",
    ],
    matches: ["sqx32", "sqx32.00"],
  },
  {
    externalId: "demo-sqx-refurb",
    title: "SQX32.00 · Generalüberholtes Original",
    manufacturer: "Siemens",
    partNumber: "SQX32.00",
    kind: "ORIGINAL",
    stage: 4,
    source: "European HVAC Exchange · Demo",
    url: "https://hvac-exchange.example/siemens-sqx",
    description:
      "Fiktives Angebot aus den Niederlanden. Überholtes Bauteil mit zu bestätigendem Prüfprotokoll.",
    price: 195,
    availability: "Demo: gebraucht / überholt",
    parameters:
      "Versorgung: AC 230 V\nStellsignal: 3-Punkt\nHub: 20 mm\nStellkraft: 700 N",
    warnings: [
      "Prüfprotokoll und Rückgaberecht anfordern.",
      "Internationale Lieferung und Steuerbehandlung prüfen.",
    ],
    matches: ["sqx32", "sqx32.00"],
  },
  {
    externalId: "demo-sax",
    title: "Siemens SAX31.00 · Alternativkandidat",
    manufacturer: "Siemens",
    partNumber: "SAX31.00",
    kind: "ALTERNATIVE",
    stage: 2,
    source: "Building Parts Partner · Demo",
    url: "https://buildingparts.example/sax31",
    description:
      "Fiktiver Recherchehinweis auf eine andere Antriebsbaureihe. Keine bestätigte Nachfolge- oder Austauschbeziehung.",
    price: 349,
    availability: "Demo: auf Anfrage",
    parameters:
      "Versorgung: AC 230 V\nStellsignal: 3-Punkt\nHub: herstellerseitig abgleichen\nVentiladapter: ungeklärt",
    warnings: [
      "Mechanische Aufnahme und Ventilkennlinie ungeklärt.",
      "Hub, Stellkraft und Endlagen durch Fachpersonal prüfen.",
      "Kein bestätigter Nachfolger.",
    ],
    matches: ["sqx32", "sqx32.00"],
  },
  {
    externalId: "demo-belimo",
    title: "Belimo NV230A · Technische Recherche",
    manufacturer: "Belimo",
    partNumber: "NV230A",
    kind: "ALTERNATIVE",
    stage: 3,
    source: "Antriebstechnik Kontor · Demo",
    url: "https://antriebe.example/nv230a",
    description:
      "Fiktiver herstellerübergreifender Alternativkandidat. Nur als Ausgangspunkt einer technischen Untersuchung.",
    price: 420,
    availability: "Demo: unverbindlicher Hinweis",
    parameters:
      "Versorgung: AC 230 V\nStellsignal: 3-Punkt\nVentiladapter: erforderlich / ungeklärt\nStellzeit: abgleichen",
    warnings: [
      "Keine bestätigte Kompatibilität.",
      "Adapter, Hub, Kraft und Sicherheitsfunktion vollständig prüfen.",
      "Umbau kann Systemfreigabe und Dokumentation erfordern.",
    ],
    matches: ["sqx32", "sqx32.00"],
  },
  {
    externalId: "demo-grundfos",
    title: "Grundfos UPS 32-80 180 · Restposten",
    manufacturer: "Grundfos",
    partNumber: "UPS 32-80 180",
    kind: "ORIGINAL",
    stage: 1,
    source: "Pumpenlager Süd · Demo",
    url: "https://pumpenlager.example/ups-32-80",
    description:
      "Fiktiver Restposten einer Umwälzpumpe. Artikelnummer, Einbaulänge und hydraulischen Arbeitspunkt bestätigen lassen.",
    price: 510,
    availability: "Demo: Restbestand",
    parameters:
      "Versorgung: AC 230 V\nEinbaulänge: 180 mm\nFörderhöhe: bis 8 m (zu bestätigen)\nAnschluss: abgleichen",
    warnings: [
      "Konkrete Artikelvariante und Betriebsmedium fehlen.",
      "Hydraulischer Abgleich und Leistungsaufnahme prüfen.",
    ],
    matches: ["ups32", "ups 32", "ups 32-80"],
  },
  {
    externalId: "demo-magna",
    title: "Grundfos MAGNA1 32-80 · Alternativkandidat",
    manufacturer: "Grundfos",
    partNumber: "MAGNA1 32-80",
    kind: "ALTERNATIVE",
    stage: 3,
    source: "Pumpenpartner · Demo",
    url: "https://pumpenpartner.example/magna1",
    description:
      "Fiktiver Hinweis auf eine moderne Pumpenbaureihe. Elektrischer und hydraulischer Umbau können notwendig sein.",
    price: 880,
    availability: "Demo: auf Anfrage",
    parameters:
      "Versorgung: AC 230 V\nRegelung: elektronisch\nEinbaulänge: Variante prüfen\nKennlinie: offen",
    warnings: [
      "Keine bestätigte Austauschbarkeit.",
      "Arbeitspunkt, Anschlüsse, Einbaumaße und Regelung prüfen.",
    ],
    matches: ["ups32", "ups 32", "ups 32-80"],
  },
  {
    externalId: "demo-danfoss",
    title: "Danfoss EKC 202D · Kühlstellenregler",
    manufacturer: "Danfoss",
    partNumber: "EKC 202D",
    kind: "ORIGINAL",
    stage: 1,
    source: "Kältekomponenten Markt · Demo",
    url: "https://kaelteteile.example/ekc202d",
    description:
      "Fiktives Originalteilangebot. Exakte Bestellnummer und Parametrierung sind vor einer Anfrage abzugleichen.",
    price: 175,
    availability: "Demo: begrenzter Restbestand",
    parameters:
      "Modell: EKC 202D\nVersorgung: Ausführung prüfen\nFühler: Typ prüfen\nRelais: Belegung prüfen",
    warnings: [
      "Versorgungsvariante und Bestellnummer ungeklärt.",
      "Parametrierung und Fühlerkennlinie sichern.",
    ],
    matches: ["ekc202", "ekc 202", "ekc202d"],
  },
];
