import "dotenv/config";
import { db } from "../src/lib/db";
import { catalog } from "../src/lib/catalog";
import { buildQueries } from "../src/lib/queries";

async function main() {
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
  for (const [i, city] of cities.entries())
    await db.hotel.upsert({
      where: { id: `hotel-${i + 1}` },
      create: {
        id: `hotel-${i + 1}`,
        name:
          i === 0
            ? "Hotel am Stadtpark"
            : i === 1
              ? "Hotel Mirabell"
              : i === 2
                ? "Alpenresidenz Innsbruck"
                : `Hotel ${city}`,
        city,
      },
      update: {},
    });
  const cases = [
    {
      id: "case-siemens",
      number: 1001,
      title: "Stellantrieb für Heizkreisverteiler",
      hotelId: "hotel-1",
      category: "Ventile & Antriebe",
      urgency: "HIGH",
      status: "RESEARCHING",
      manufacturer: "Siemens",
      model: "SQX32.00",
      partNumber: "SQX32.00",
      serialNumber: "DEMO-1998-0042",
      systemYear: "1998",
      parameters:
        "Versorgung: AC 230 V\nStellsignal: 3-Punkt\nHub: 20 mm\nStellkraft: 700 N\nVentilanschluss: vor Ort prüfen",
      description:
        "Der Stellantrieb am Heizkreisverteiler im Untergeschoss fährt nicht mehr zuverlässig in die Endlage. Typenschild ist noch lesbar. Originalteil bevorzugt; Alternativen nur nach technischer Prüfung. Alle Angaben und Angebote sind Beispieldaten.",
    },
    {
      id: "case-grundfos",
      number: 1002,
      title: "Umwälzpumpe im Wellnessbereich",
      hotelId: "hotel-3",
      category: "Pumpen",
      urgency: "CRITICAL",
      status: "REVIEW",
      manufacturer: "Grundfos",
      model: "UPS 32-80 180",
      partNumber: "",
      serialNumber: "",
      systemYear: "2004",
      parameters:
        "Versorgung: AC 230 V\nEinbaulänge: 180 mm\nArbeitspunkt: noch zu ermitteln",
      description:
        "Erhöhte Laufgeräusche und zeitweilige Ausfälle. Ersatzpumpe für den Wellness-Heizkreis recherchieren. Hydraulische Kennlinie und Anschluss vor Austausch abgleichen. Fiktiver Beispielfall.",
    },
    {
      id: "case-danfoss",
      number: 1003,
      title: "Kühlstellenregler für Kühlraum Küche",
      hotelId: "hotel-2",
      category: "Klima & Kälte",
      urgency: "NORMAL",
      status: "OPEN",
      manufacturer: "Danfoss",
      model: "EKC 202D",
      partNumber: "",
      serialNumber: "",
      systemYear: "2010",
      parameters: "Fühlertyp und Versorgung noch ungeklärt",
      description:
        "Display sporadisch ohne Anzeige. Vor Ersatzteilbeschaffung Fehlerdiagnose durch Kältefachbetrieb veranlassen. Fiktiver Beispielfall.",
    },
  ];
  for (const item of cases) {
    const exists = await db.searchCase.findUnique({ where: { id: item.id } });
    if (exists) continue; // repeatable, never overwrite user edits
    await db.searchCase.create({ data: item });
    if (item.id === "case-danfoss") continue;
    const hits = catalog.filter((c) =>
      c.matches.some((m) =>
        item.model
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .startsWith(m.toLowerCase().replace(/[^a-z0-9]/g, "")),
      ),
    );
    for (const hit of hits) {
      const { matches: _matches, warnings, ...data } = hit;
      void _matches;
      await db.candidate.create({
        data: {
          ...data,
          warnings: JSON.stringify(warnings),
          caseId: item.id,
          ...(item.id === "case-grundfos" && hit.kind === "ALTERNATIVE"
            ? {
                reviewStatus: "TECHNICAL_REVIEW",
                reviewNote:
                  "Einbaulänge, Arbeitspunkt und Regelung vom Fachbetrieb prüfen lassen.",
                reviewedAt: new Date(),
              }
            : {}),
        },
      });
    }
    await db.searchRun.create({
      data: {
        caseId: item.id,
        provider: "demo",
        queries: JSON.stringify(buildQueries(item)),
        count: hits.length,
      },
    });
  }
  await db.benefit.upsert({
    where: { caseId: "case-siemens" },
    update: {},
    create: {
      caseId: "case-siemens",
      partCost: 285,
      laborCost: 320,
      replacementCost: 8500,
      downtimeDays: 2,
      dailyCost: 450,
      extensionMonths: 24,
      notes:
        "Fiktive Planwerte, netto. Austausch des Heizkreisverteilers als Vergleichsszenario. Kein belastbares Angebot; Lebensdauerverlängerung nicht zugesichert.",
    },
  });
  console.log(
    "25 Hotels und 3 Beispielfälle vorbereitet. Vorhandene Fälle bleiben erhalten.",
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
