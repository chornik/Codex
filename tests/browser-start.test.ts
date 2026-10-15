import { describe, expect, it } from "vitest";
import { codespacesOrigin } from "../scripts/browser-start.mjs";
describe("Browserstart im privaten Codespace", () => {
  it("leitet genau die eigene weitergeleitete HTTPS-Adresse ab", () => {
    expect(
      codespacesOrigin({
        CODESPACES: "true",
        CODESPACE_NAME: "patient-space-1234",
        GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: "app.github.dev",
      }),
    ).toBe("https://patient-space-1234-3000.app.github.dev");
  });
  it("öffnet außerhalb eines Codespaces keine Netzwerkschnittstelle", () => {
    expect(() => codespacesOrigin({})).toThrow("nur für GitHub Codespaces");
    expect(() =>
      codespacesOrigin({
        CODESPACES: "false",
        CODESPACE_NAME: "patient-space-1234",
      }),
    ).toThrow();
  });
  it("weist manipulierte Namen und unbekannte Domains zurück", () => {
    expect(() =>
      codespacesOrigin({ CODESPACES: "true", CODESPACE_NAME: "bad.name/path" }),
    ).toThrow();
    expect(() =>
      codespacesOrigin({
        CODESPACES: "true",
        CODESPACE_NAME: "patient-space-1234",
        GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: "evil.example",
      }),
    ).toThrow();
  });
});
