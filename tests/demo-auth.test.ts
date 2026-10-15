import { describe, expect, it } from "vitest";
import { demoAccess } from "../src/lib/demo-auth";
import { hostedConfig } from "../scripts/web-start.mjs";
const password = "unit-test-only-credential-not-a-real-password";
const env = {
  DEMO_AUTH_REQUIRED: "1",
  DEMO_USERNAME: "demo",
  DEMO_PASSWORD: password,
};
const auth = (value: string) =>
  `Basic ${Buffer.from(value).toString("base64")}`;
describe("Geschützter Website-Zugang", () => {
  it("lässt den bisherigen lokalen Betrieb unverändert", () =>
    expect(demoAccess(null, {})).toBe("open"));
  it("akzeptiert ausschließlich den passenden Zugang", () => {
    expect(demoAccess(auth(`demo:${password}`), env)).toBe("allowed");
    expect(demoAccess(auth(`other:${password}`), env)).toBe("denied");
    expect(demoAccess(auth("demo:incorrect"), env)).toBe("denied");
    expect(demoAccess(null, env)).toBe("denied");
    expect(demoAccess("Bearer wrong", env)).toBe("denied");
    expect(demoAccess("Basic $$$", env)).toBe("denied");
  });
  it("öffnet bei fehlender oder unsicherer Konfiguration keinen Zugang", () => {
    expect(demoAccess(null, { DEMO_AUTH_REQUIRED: "1" })).toBe("unconfigured");
    expect(demoAccess(null, { ...env, DEMO_PASSWORD: "short" })).toBe(
      "unconfigured",
    );
    expect(demoAccess(null, { ...env, DEMO_USERNAME: "bad:user" })).toBe(
      "unconfigured",
    );
    expect(demoAccess(null, { RENDER: "true" })).toBe("unconfigured");
  });
});
describe("Website-Startkonfiguration", () => {
  it("übernimmt die Render-HTTPS-Adresse und den zugewiesenen Port", () => {
    expect(
      hostedConfig({
        ...env,
        RENDER_EXTERNAL_URL: "https://partsdesk-example.onrender.com",
        PORT: "10000",
      }),
    ).toEqual({
      origin: "https://partsdesk-example.onrender.com",
      port: 10000,
      username: "demo",
    });
  });
  it("erlaubt eine explizite eigene HTTPS-Adresse", () =>
    expect(
      hostedConfig({ ...env, APP_ORIGIN: "https://demo.example.org" }).origin,
    ).toBe("https://demo.example.org"));
  it("stoppt bei fehlendem Passwort, HTTP, URL-Zugangsdaten und ungültigem Port", () => {
    for (const source of [
      { APP_ORIGIN: "https://demo.example.org" },
      { ...env, APP_ORIGIN: "http://demo.example.org" },
      { ...env, APP_ORIGIN: "https://user:password@demo.example.org" },
      { ...env, APP_ORIGIN: "https://demo.example.org/path" },
      { ...env, APP_ORIGIN: "https://demo.example.org", PORT: "bad" },
      { ...env, APP_ORIGIN: "https://demo.example.org", PORT: "70000" },
    ])
      expect(() => hostedConfig(source)).toThrow();
  });
});
