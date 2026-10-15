import { catalog, type CatalogItem } from "./catalog";
import { buildQueries, type Identity } from "./queries";
export { buildQueries } from "./queries";
export type { Identity } from "./queries";
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
export function demoSearch(input: Identity): CatalogItem[] {
  const terms = [input.model, input.partNumber]
    .map(normalize)
    .filter((s) => s.length >= 4);
  return catalog.filter((item) =>
    item.matches.some((match) =>
      terms.some((term) => term === normalize(match)),
    ),
  );
}
export async function runSearch(input: Identity) {
  const queries = buildQueries(input);
  const provider = process.env.SEARCH_PROVIDER || "demo";
  if (provider === "demo")
    return { provider: "demo", queries, results: demoSearch(input) };
  if (provider !== "brave")
    throw new Error("SEARCH_PROVIDER muss demo oder brave sein.");
  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (!key)
    throw new Error(
      "Brave Search ist aktiviert, aber BRAVE_SEARCH_API_KEY fehlt in der lokalen Umgebung.",
    );
  const results = new Map<string, CatalogItem>();
  // Bounded queries. Never visit pages, contact vendors or issue procurement actions.
  for (const query of queries) {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query.query);
    url.searchParams.set("count", "5");
    const response = await fetch(url, {
      headers: { "X-Subscription-Token": key, Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(
        `Brave Search antwortet mit HTTP ${response.status}. Es wurden keine Teilergebnisse gespeichert.`,
      );
    const data = (await response.json()) as {
      web?: {
        results?: Array<{ title: string; url: string; description?: string }>;
      };
    };
    for (const hit of data.web?.results ?? []) {
      let parsed: URL;
      try {
        parsed = new URL(hit.url);
      } catch {
        continue;
      }
      if (
        !["https:", "http:"].includes(parsed.protocol) ||
        parsed.username ||
        parsed.password
      )
        continue;
      if (results.has(parsed.href)) continue;
      results.set(parsed.href, {
        externalId: parsed.href,
        title: hit.title.slice(0, 300),
        manufacturer: "Nicht verifiziert",
        partNumber: "Nicht verifiziert",
        kind: "WEB",
        stage: query.stage,
        source: parsed.hostname,
        url: parsed.href,
        description: (hit.description || "").slice(0, 2000),
        price: null,
        availability: "Nicht geprüft",
        parameters:
          "Keine verifizierten technischen Daten. Originalquelle und Datenblatt manuell prüfen.",
        warnings: [
          "Ungeprüfter Suchmaschinenhinweis; Inhalt kann veraltet oder falsch sein.",
          "Artikelidentität, Bestand und technische Eignung nicht bestätigt.",
        ],
        matches: [],
      });
    }
  }
  return { provider, queries, results: [...results.values()] };
}
