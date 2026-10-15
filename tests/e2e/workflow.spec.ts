import { test, expect } from "@playwright/test";
test("vollständiger Rechercheablauf mit Upload, Vergleich, Freigabe, Kontakt und Nutzen", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Alles im Blick." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Technische Prüfung", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Status filtern" }),
  ).toHaveValue("REVIEW");
  await expect(page.locator(".case-table tbody tr")).toHaveCount(1);
  await page.getByRole("link", { name: "Übersicht", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Status filtern" }),
  ).toHaveValue("");
  await page.getByRole("link", { name: "Neuer Suchfall", exact: true }).click();
  await page
    .getByLabel("Bezeichnung des Suchfalls")
    .fill(`E2E Stellantrieb ${Date.now()}`);
  await page.getByLabel("Hotel *").selectOption("hotel-1");
  await page.getByLabel("Modell / Typ", { exact: true }).fill("SQX32.00");
  await page
    .getByRole("button", { name: "Suchfall anlegen", exact: true })
    .click();
  await expect(page).toHaveURL(/\/cases\/(?!new)[a-z0-9]+/);
  const caseUrl = page.url();
  await page.getByRole("tab", { name: /Dokumente & Erkennung/ }).click();
  await page.getByLabel("Datei hochladen").setInputFiles({
    name: "typenschild.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(
      "SIEMENS\nTyp: SQX32.00\nS/N: E2E-1234\nAC 230 V\nHub: 20 mm",
    ),
  });
  await expect(
    page.getByText("Datei lokal gespeichert.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Auslesen", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Erkannte Daten prüfen" }),
  ).toBeVisible();
  await expect(page.getByLabel("Erkannt: Hersteller")).toHaveValue("SIEMENS");
  await page
    .getByRole("button", { name: "Ausgewählte Daten übernehmen" })
    .click();
  await expect(
    page.getByText("Die ausgewählten Daten wurden übernommen.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /Recherche & Vergleich/ }).click();
  await page.getByRole("button", { name: "Recherche starten" }).click();
  await expect(page.locator(".candidate")).toHaveCount(4);
  await page.locator(".candidate").nth(0).getByRole("checkbox").check();
  await page.locator(".candidate").nth(1).getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Vergleichen (2/3)", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Technischer Vergleich" }),
  ).toBeVisible();
  const hit = page.locator(".candidate").first();
  await hit.getByRole("button", { name: "Ergebnis prüfen" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Entscheidung", exact: true })
    .selectOption("APPROVED");
  await dialog
    .getByLabel("Begründung")
    .fill(
      "Nur für unverbindliche Anfrage freigegeben. Technische Eignung noch offen.",
    );
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Entscheidung speichern" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    hit.getByText("Für Kontakt freigegeben", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Erneut recherchieren" }).click();
  await expect(page.locator(".candidate")).toHaveCount(4);
  await expect(
    hit.getByText("Für Kontakt freigegeben", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Kontaktentwürfe" }).click();
  await page.getByRole("button", { name: "Entwurf erstellen" }).click();
  await expect(page.getByLabel("Nachricht")).toHaveValue(/keine Bestellung/);
  await page
    .getByLabel("Betreff", { exact: true })
    .fill("Meine unverbindliche E2E-Anfrage");
  await page.getByRole("button", { name: "Speichern", exact: true }).click();
  await expect(
    page.getByText("Entwurf gespeichert.", { exact: true }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Als TXT herunterladen" }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/kontaktentwurf/);
  await page.getByRole("tab", { name: "Wirtschaftlicher Nutzen" }).click();
  await page.getByLabel("Kosten Ersatzteil").fill("285");
  await page.getByLabel("Einbau & Nebenarbeiten").fill("320");
  await page.getByLabel("Vergleich: Gesamtanlagentausch").fill("8500");
  await page.getByLabel("Vermiedene Ausfalltage").fill("2");
  await page.getByLabel("Ausfallkosten pro Tag").fill("450");
  await page.getByRole("button", { name: "Einschätzung speichern" }).click();
  await expect(page.locator(".benefit-total")).toContainText("8.795");
  await page.reload();
  await page.getByRole("tab", { name: "Wirtschaftlicher Nutzen" }).click();
  await expect(page.getByLabel("Kosten Ersatzteil")).toHaveValue("285");
  await page.goto(caseUrl);
  await page.getByRole("tab", { name: "Kontaktentwürfe" }).click();
  await expect(page.getByLabel("Betreff", { exact: true })).toHaveValue(
    "Meine unverbindliche E2E-Anfrage",
  );
});
test("API validiert Uploads und verhindert Kontaktentwürfe ohne Freigabe", async ({
  request,
}) => {
  const badCase = await request.post("/api/cases", { data: { title: "X" } });
  expect(badCase.status()).toBe(400);
  const upload = await request.post("/api/cases/case-siemens/attachments", {
    multipart: {
      file: {
        name: "fake.png",
        mimeType: "image/png",
        buffer: Buffer.from("<script>alert(1)</script>"),
      },
    },
  });
  expect(upload.status()).toBe(400);
  const response = await request.post("/api/cases/case-grundfos/drafts", {
    data: { candidateId: "not-existing" },
  });
  expect(response.status()).toBe(404);
  const item = await (await request.get("/api/cases/case-grundfos")).json();
  const unreviewed = item.candidates.find(
    (c: { reviewStatus: string }) => c.reviewStatus !== "APPROVED",
  );
  expect(unreviewed).toBeTruthy();
  const denied = await request.post("/api/cases/case-grundfos/drafts", {
    data: { candidateId: unreviewed.id },
  });
  expect(denied.status()).toBe(409);
  const unchecked = await request.post(
    `/api/candidates/${unreviewed.id}/review`,
    {
      data: {
        status: "APPROVED",
        note: "Prüfung noch offen",
        confirmed: false,
      },
    },
  );
  expect(unchecked.status()).toBe(400);
  const rejected = await request.post(
    `/api/candidates/${unreviewed.id}/review`,
    {
      data: {
        status: "REJECTED",
        note: "Anschluss passt nicht zur vorhandenen Anlage.",
        confirmed: true,
      },
    },
  );
  expect(rejected.status()).toBe(200);
  const technical = await request.post(
    `/api/candidates/${unreviewed.id}/review`,
    {
      data: {
        status: "TECHNICAL_REVIEW",
        note: "Arbeitspunkt durch den Fachbetrieb prüfen.",
        confirmed: true,
      },
    },
  );
  expect(technical.status()).toBe(200);
  const after = await (await request.get("/api/cases/case-grundfos")).json();
  expect(after.status).toBe("REVIEW");
  const source = await request.get("/api/attachments/missing");
  expect(source.status()).toBe(404);
  const foreign = await request.patch("/api/cases/case-siemens", {
    headers: { Origin: "https://evil.example" },
    data: { title: "unerlaubt" },
  });
  expect(foreign.status()).toBe(403);
});
test("mobile Navigation und Hotelfilter funktionieren", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await page.getByRole("link", { name: "Unsere Hotels", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Unsere Hotels" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Hotel am Stadtpark/ }).click();
  await expect(
    page.getByRole("combobox", { name: "Hotel filtern" }),
  ).toHaveValue("hotel-1");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("Produktionsserver liest hochgeladene Bilder und PDFs lokal aus", async ({
  request,
}) => {
  const { readFile } = await import("node:fs/promises");
  const created = await request.post("/api/cases", {
    data: {
      title: `E2E Dokumentenerkennung ${Date.now()}`,
      hotelId: "hotel-1",
      category: "Ventile & Antriebe",
      urgency: "NORMAL",
      manufacturer: "",
      model: "",
      serialNumber: "",
      partNumber: "",
      systemYear: "",
      description: "",
      parameters: "",
    },
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  for (const [extension, mimeType] of [
    ["png", "image/png"],
    ["pdf", "application/pdf"],
  ]) {
    const bytes = await readFile(`public/samples/typenschild.${extension}`);
    const uploaded = await request.post(`/api/cases/${id}/attachments`, {
      multipart: {
        file: { name: `typenschild.${extension}`, mimeType, buffer: bytes },
      },
    });
    expect(uploaded.status()).toBe(201);
    const attachment = await uploaded.json();
    const download = await request.get(`/api/attachments/${attachment.id}`);
    expect(download.headers()["content-type"]).toBe(mimeType);
    expect(await download.body()).toEqual(bytes);
    const extracted = await request.post(`/api/cases/${id}/extract`, {
      data: { attachmentId: attachment.id },
    });
    const result = await extracted.json();
    expect(extracted.status(), JSON.stringify(result)).toBe(200);
    expect(result.fields.model).toContain("SQX32.00");
    expect(result.fields.manufacturer.toLowerCase()).toBe("siemens");
    const foreign = await request.post("/api/cases/case-siemens/extract", {
      data: { attachmentId: attachment.id },
    });
    expect(foreign.status()).toBe(404);
  }
});

test("Schreibanfragen über die konfigurierte private HTTPS-Adresse funktionieren", async ({
  request,
}) => {
  const headers = {
    host: "patient-space-1234-3000.app.github.dev",
    origin: "https://patient-space-1234-3000.app.github.dev",
  };
  const response = await request.post("/api/cases", {
    headers,
    data: {
      title: `Codespaces-Proxy ${Date.now()}`,
      hotelId: "hotel-1",
      category: "Ventile & Antriebe",
      urgency: "NORMAL",
      manufacturer: "",
      model: "SQX32.00",
      serialNumber: "",
      partNumber: "",
      systemYear: "",
      description: "",
      parameters: "",
    },
  });
  expect(response.status(), await response.text()).toBe(201);
  const { id } = await response.json();
  const file = await request.post(`/api/cases/${id}/attachments`, {
    headers,
    multipart: {
      file: {
        name: "codespaces.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("Typ: SQX32.00"),
      },
    },
  });
  expect(file.status()).toBe(201);
  const rejected = await request.patch(`/api/cases/${id}`, {
    headers: { ...headers, origin: "https://another-user-3000.app.github.dev" },
    data: { title: "Fremde Änderung" },
  });
  expect(rejected.status()).toBe(403);
});

test("Website schützt Seiten, Dateien und APIs; nur der Health-Check ist öffentlich", async ({
  baseURL,
  request,
}) => {
  // Native fetch deliberately bypasses Playwright's inherited HTTP credentials.
  const urlFor = (pathname: string) => new URL(pathname, baseURL).href;
  for (const url of [
    "/",
    "/cases/case-siemens",
    "/api/cases/case-siemens",
    "/api/attachments/missing",
    "/samples/typenschild.png",
  ]) {
    const response = await fetch(urlFor(url));
    expect(response.status, url).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("Basic");
    await response.text();
  }
  const wrong = await fetch(urlFor("/"), {
    headers: {
      authorization: `Basic ${Buffer.from("demo:incorrect-test-only").toString("base64")}`,
    },
  });
  expect(wrong.status).toBe(401);
  await wrong.text();
  const health = await fetch(urlFor("/api/health"));
  expect(health.status).toBe(200);
  expect(await health.json()).toEqual({ status: "ok" });
  const write = await fetch(urlFor("/api/cases"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "Unauthenticated write" }),
  });
  expect(write.status).toBe(401);
  await write.text();
  const authenticated = await request.get("/");
  expect(authenticated.status()).toBe(200);
  expect(await authenticated.text()).toContain("Geschützte Online-Testdemo");
});
