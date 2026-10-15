import { describe, it, expect, afterEach, vi } from "vitest";
import {
  caseSchema,
  reviewSchema,
  benefitSchema,
  calculateBenefit,
} from "../src/lib/validation";
import { buildQueries, demoSearch, runSearch } from "../src/lib/search";
import { extractFields } from "../src/lib/extraction";
import { detectType, MAX_FILE_SIZE, storeFile } from "../src/lib/files";
import { checkOrigin } from "../src/lib/http";
import { contactText } from "../src/lib/contact";
const identity = {
  manufacturer: "Siemens",
  model: "SQX32.00",
  partNumber: "",
  category: "Ventile & Antriebe",
  parameters: "AC 230 V",
};
const validCase = {
  ...identity,
  title: "Stellantrieb Heizung",
  hotelId: "hotel-1",
  urgency: "HIGH",
  serialNumber: "",
  systemYear: "1998",
  description: "",
};
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("Fallvalidierung und menschliche Entscheidungen", () => {
  it("akzeptiert einen Fall mit unbekannter Artikelnummer", () =>
    expect(caseSchema.parse(validCase).partNumber).toBe(""));
  it("lehnt fehlendes Hotel, Kategorie und ungültiges Jahr ab", () => {
    expect(caseSchema.safeParse({ ...validCase, hotelId: "" }).success).toBe(
      false,
    );
    expect(
      caseSchema.safeParse({ ...validCase, category: "beliebig" }).success,
    ).toBe(false);
    expect(
      caseSchema.safeParse({ ...validCase, systemYear: "98" }).success,
    ).toBe(false);
  });
  it("erzwingt Begründung und explizite Bestätigung für Entscheidungen", () => {
    expect(
      reviewSchema.safeParse({
        status: "APPROVED",
        note: "Daten geprüft",
        confirmed: false,
      }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({ status: "APPROVED", note: "", confirmed: true })
        .success,
    ).toBe(false);
    expect(
      reviewSchema.parse({
        status: "TECHNICAL_REVIEW",
        note: "Spannung vor Ort prüfen.",
        confirmed: true,
      }).status,
    ).toBe("TECHNICAL_REVIEW");
  });
});
describe("Lokale Erkennung", () => {
  it("erkennt Hersteller, Modell, Artikel- und Seriennummer sowie Parameter", () => {
    expect(
      extractFields(
        "SIEMENS\nTyp: SQX32.00\nArtikelnummer: SQX32.00\nS/N: AB-1234\nAC 230 V\nHub: 20 mm",
      ),
    ).toEqual({
      manufacturer: "SIEMENS",
      model: "SQX32.00",
      partNumber: "SQX32.00",
      serialNumber: "AB-1234",
      parameters: "AC 230 V\nHub: 20 mm",
    });
  });
  it("erfindet bei unbekanntem Text keine Daten", () =>
    expect(extractFields("Unlesbares Schild, bitte prüfen.")).toEqual({}));
  it("erkennt bekannte Typbezeichnungen auch ohne Feldlabel", () =>
    expect(extractFields("Grundfos UPS 32-80 180").model).toBe(
      "UPS 32-80 180",
    ));
});
it("verwechselt das Wort Typenschild nicht mit dem Feld Typ", () => {
  expect(
    extractFields("FIKTIVES DEMO-TYPENSCHILD\nSIEMENS\nTyp: SQX32.00").model,
  ).toBe("SQX32.00");
});
describe("Strukturierte Recherche", () => {
  it("erstellt vier unterschiedliche Suchstufen", () => {
    const q = buildQueries(identity);
    expect(q).toHaveLength(4);
    expect(q.map((v) => v.stage)).toEqual([1, 2, 3, 4]);
    expect(q.every((v) => v.query.includes("SQX32.00"))).toBe(true);
  });
  it("sucht nicht ohne Identität", () =>
    expect(() => buildQueries({ ...identity, model: "" })).toThrow("Modell"));
  it("liefert passende Originale und Alternativen, keine beliebigen Angebote", () => {
    const hits = demoSearch(identity);
    expect(hits).toHaveLength(4);
    expect(hits.some((h) => h.kind === "ALTERNATIVE")).toBe(true);
    expect(demoSearch({ ...identity, model: "UNKNOWN-XYZ" })).toHaveLength(0);
  });
  it("vermeidet unpräzise Teiltreffer", () =>
    expect(demoSearch({ ...identity, model: "SQX" })).toHaveLength(0));
  it("funktioniert standardmäßig ohne Netzwerk", async () => {
    vi.stubEnv("SEARCH_PROVIDER", "demo");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await runSearch(identity)).results).toHaveLength(4);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("meldet fehlende optionale Zugangsdaten", async () => {
    vi.stubEnv("SEARCH_PROVIDER", "brave");
    vi.stubEnv("BRAVE_SEARCH_API_KEY", "");
    await expect(runSearch(identity)).rejects.toThrow("fehlt");
  });
  it("dedupliziert Webtreffer und verwirft unsichere URLs", async () => {
    vi.stubEnv("SEARCH_PROVIDER", "brave");
    vi.stubEnv("BRAVE_SEARCH_API_KEY", "test-only");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          web: {
            results: [
              { title: "Datenblatt", url: "https://example.org/part" },
              { title: "Bad", url: "javascript:alert(1)" },
            ],
          },
        }),
      }),
    );
    const output = await runSearch(identity);
    expect(output.results).toHaveLength(1);
    expect(output.results[0].kind).toBe("WEB");
    expect(output.results[0].price).toBeNull();
  });
  it("bricht bei Anbieterfehler ab, ohne Teilergebnisse als Erfolg zu melden", async () => {
    vi.stubEnv("SEARCH_PROVIDER", "brave");
    vi.stubEnv("BRAVE_SEARCH_API_KEY", "test-only");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429 }),
    );
    await expect(runSearch(identity)).rejects.toThrow("429");
  });
});
describe("Dateischutz", () => {
  it("erkennt tatsächliche Dateisignaturen statt einer umbenannten Dateiendung", () => {
    expect(detectType(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe(
      "image/png",
    );
    expect(detectType(Buffer.from("%PDF-1.4"))).toBe("application/pdf");
    expect(detectType(Buffer.from("<script>alert(1)</script>"))).toBeNull();
  });
  it("weist ausführbare Uploads und übergroße Dateien zurück", async () => {
    await expect(
      storeFile(new File(["<svg/>"], "fake.png", { type: "image/png" })),
    ).rejects.toThrow("Erlaubt");
    await expect(
      storeFile(new File([new Uint8Array(MAX_FILE_SIZE + 1)], "large.txt")),
    ).rejects.toThrow("10 MB");
  });
});
describe("Wirtschaftliche Einschätzung", () => {
  const costs = {
    partCost: 285,
    laborCost: 320,
    replacementCost: 8500,
    downtimeDays: 2,
    dailyCost: 450,
    extensionMonths: 24,
    notes: "",
  };
  it("berechnet Kosten und Szenarien ohne die Lebensdauer monetär zu erfinden", () =>
    expect(calculateBenefit(costs)).toEqual({
      repairCost: 605,
      avoidedInvestment: 7895,
      avoidedDowntime: 900,
      potentialBenefit: 8795,
    }));
  it("zeigt auch negativen Nutzen und validiert Eingabegrenzen", () => {
    expect(
      calculateBenefit({ ...costs, replacementCost: 0, dailyCost: 0 })
        .potentialBenefit,
    ).toBe(-605);
    expect(benefitSchema.safeParse({ ...costs, partCost: -1 }).success).toBe(
      false,
    );
    expect(
      benefitSchema.safeParse({ ...costs, extensionMonths: 1.5 }).success,
    ).toBe(false);
    expect(
      benefitSchema.safeParse({ ...costs, dailyCost: Infinity }).success,
    ).toBe(false);
  });
  it("formuliert eine unverbindliche Anfrage ohne Bestellversprechen", () => {
    const text = contactText(
      { ...identity, title: "Heizkreis" },
      { title: "Antrieb", partNumber: "SQX32.00" },
    );
    expect(text.body).toContain("keine Bestellung");
    expect(text.body).toContain("noch nicht bestätigt");
  });
});

describe("Lokale Origin-Prüfung", () => {
  it("akzeptiert den Browser-Host auch bei intern normalisierter Next-URL", () =>
    expect(() =>
      checkOrigin(
        new Request("http://localhost:3101/api/cases", {
          headers: { host: "127.0.0.1:3101", origin: "http://127.0.0.1:3101" },
        }),
      ),
    ).not.toThrow());
  it("weist fremde Ursprünge und DNS-Rebinding-Hosts zurück", () => {
    expect(() =>
      checkOrigin(
        new Request("http://localhost:3101/api/cases", {
          headers: { host: "127.0.0.1:3101", origin: "https://evil.example" },
        }),
      ),
    ).toThrow();
    expect(() =>
      checkOrigin(
        new Request("http://evil.example:3101/api/cases", {
          headers: {
            host: "evil.example:3101",
            origin: "http://evil.example:3101",
          },
        }),
      ),
    ).toThrow();
  });
});

describe("Private Codespaces-Origin", () => {
  const external = "https://patient-space-1234-3000.app.github.dev";
  it("erlaubt ausschließlich die explizit konfigurierte HTTPS-Adresse, auch hinter einem lokalen Proxy", () => {
    vi.stubEnv("APP_ORIGIN", external);
    for (const host of [
      "patient-space-1234-3000.app.github.dev",
      "localhost:3000",
    ]) {
      expect(() =>
        checkOrigin(
          new Request("http://localhost:3000/api/cases", {
            headers: { host, origin: external },
          }),
        ),
      ).not.toThrow();
    }
  });
  it("blockiert andere Codespaces, fremde Ursprünge und manipulierte Forwarded-Header", () => {
    vi.stubEnv("APP_ORIGIN", external);
    for (const origin of [
      "https://another-user-3000.app.github.dev",
      "https://evil.example",
      "http://patient-space-1234-3000.app.github.dev",
    ]) {
      expect(() =>
        checkOrigin(
          new Request("http://localhost:3000/api/cases", {
            headers: {
              host: "patient-space-1234-3000.app.github.dev",
              origin,
              "x-forwarded-host": "patient-space-1234-3000.app.github.dev",
            },
          }),
        ),
      ).toThrow();
    }
    expect(() =>
      checkOrigin(
        new Request("http://localhost:3000/api/cases", {
          headers: { host: "evil.example", origin: external },
        }),
      ),
    ).toThrow();
  });
  it("behält lokalen Betrieb bei und lehnt unsichere Konfiguration ab", () => {
    vi.stubEnv("APP_ORIGIN", external);
    expect(() =>
      checkOrigin(
        new Request("http://localhost:3000/api/cases", {
          headers: { host: "localhost:3000", origin: "http://localhost:3000" },
        }),
      ),
    ).not.toThrow();
    vi.stubEnv("APP_ORIGIN", "http://public.example");
    expect(() =>
      checkOrigin(
        new Request("http://localhost:3000/api/cases", {
          headers: { host: "localhost:3000", origin: "http://localhost:3000" },
        }),
      ),
    ).toThrow();
  });
});
