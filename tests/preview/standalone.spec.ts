import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
async function openPreview(page: Page) {
  const errors: string[] = [];
  const network: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (/^https?:/.test(request.url())) network.push(request.url());
  });
  await page.setContent(await readFile("index.html", "utf8"));
  await expect(
    page.getByRole("heading", { name: "Alles im Blick." }),
  ).toBeVisible();
  return { errors, network };
}
test("HTML-Vorschau funktioniert ohne Server: Recherche, Vergleich, menschliche Entscheidung, Kontakt und Nutzen", async ({
  page,
}) => {
  const result = await openPreview(page);
  await page
    .getByRole("link", {
      name: "Stellantrieb für Heizkreisverteiler",
      exact: true,
    })
    .click();
  await page.getByRole("tab", { name: /Recherche & Vergleich/ }).click();
  await expect(page.locator(".candidate")).toHaveCount(4);
  await page.getByRole("button", { name: "Erneut recherchieren" }).click();
  await expect(page.locator(".candidate")).toHaveCount(4);
  await page.locator(".candidate").nth(0).getByRole("checkbox").check();
  await page.locator(".candidate").nth(1).getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Vergleichen (2/3)", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Technischer Vergleich" }),
  ).toBeVisible();
  await page
    .locator(".candidate")
    .first()
    .getByRole("button", { name: "Ergebnis prüfen" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Entscheidung", exact: true })
    .selectOption("APPROVED");
  await dialog
    .getByLabel("Begründung")
    .fill(
      "Nur zur unverbindlichen Kontaktanfrage. Technische Eignung ist ungeklärt.",
    );
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Entscheidung speichern" }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole("tab", { name: "Kontaktentwürfe" }).click();
  await page.getByRole("button", { name: "Entwurf erstellen" }).click();
  await expect(page.getByLabel("Nachricht")).toHaveValue(/keine Bestellung/);
  await page
    .getByLabel("Betreff", { exact: true })
    .fill("Browserdemo – unverbindliche Anfrage");
  await page.getByRole("button", { name: "Speichern", exact: true }).click();
  await expect(
    page.getByText("Entwurf gespeichert.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Wirtschaftlicher Nutzen" }).click();
  await page.getByLabel("Kosten Ersatzteil").fill("300");
  await page.getByRole("button", { name: "Einschätzung speichern" }).click();
  await expect(
    page.getByText("Wirtschaftliche Einschätzung gespeichert."),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Alle Suchfälle", exact: true })
    .last()
    .click();
  await page
    .getByRole("link", {
      name: "Stellantrieb für Heizkreisverteiler",
      exact: true,
    })
    .click();
  await page.getByRole("tab", { name: "Wirtschaftlicher Nutzen" }).click();
  await expect(page.getByLabel("Kosten Ersatzteil")).toHaveValue("300");
  expect(result.network).toEqual([]);
  expect(result.errors).toEqual([]);
});
test("HTML-Vorschau legt Fälle an und liest TXT; Bild-OCR wird ehrlich als Serverfunktion markiert", async ({
  page,
}) => {
  const result = await openPreview(page);
  await page.getByRole("link", { name: "Neuer Suchfall", exact: true }).click();
  await page
    .getByLabel("Bezeichnung des Suchfalls")
    .fill("Browserdemo neuer Stellantrieb");
  await page.getByLabel("Hotel *").selectOption("hotel-2");
  await page
    .getByRole("button", { name: "Suchfall anlegen", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Browserdemo neuer Stellantrieb" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /Dokumente & Erkennung/ }).click();
  await page
    .getByLabel("Datei hochladen")
    .setInputFiles({
      name: "typenschild.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("SIEMENS\nTyp: SQX32.00\nAC 230 V\nHub: 20 mm"),
    });
  await page.getByRole("button", { name: "Auslesen", exact: true }).click();
  await expect(page.getByLabel("Erkannt: Modell / Typ")).toHaveValue(
    "SQX32.00",
  );
  await page
    .getByRole("button", { name: "Ausgewählte Daten übernehmen" })
    .click();
  await expect(
    page.getByText("Die ausgewählten Daten wurden übernommen.", {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .getByLabel("Datei hochladen")
    .setInputFiles("public/samples/typenschild.png");
  const photo = page
    .locator(".attachment")
    .filter({ hasText: "typenschild.png" });
  await expect(
    photo.getByRole("button", { name: "Auslesen", exact: true }),
  ).toBeDisabled();
  await page.getByRole("tab", { name: /Recherche & Vergleich/ }).click();
  await page.getByRole("button", { name: "Recherche starten" }).click();
  await expect(page.locator(".candidate")).toHaveCount(4);
  expect(result.network).toEqual([]);
  expect(result.errors).toEqual([]);
});
test("HTML-Vorschau funktioniert auch mobil mit Hotel- und Statusnavigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPreview(page);
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await page.getByRole("link", { name: "Unsere Hotels", exact: true }).click();
  await expect(page.locator(".hotel-card")).toHaveCount(25);
  await page.getByRole("link", { name: /Hotel am Stadtpark/ }).click();
  await expect(
    page.getByRole("combobox", { name: "Hotel filtern" }),
  ).toHaveValue("hotel-1");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
