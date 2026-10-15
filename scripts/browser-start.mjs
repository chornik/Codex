import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
export function codespacesOrigin(env) {
  if (
    env.CODESPACES !== "true" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(env.CODESPACE_NAME || "")
  ) {
    throw new Error(
      "Dieser Startweg ist nur für GitHub Codespaces vorgesehen. Lokal bitte npm run dev verwenden.",
    );
  }
  const domain =
    env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || "app.github.dev";
  if (domain !== "app.github.dev")
    throw new Error(
      "Unbekannte Codespaces-Domain. Domain erst prüfen und gezielt konfigurieren.",
    );
  return `https://${env.CODESPACE_NAME}-3000.${domain}`;
}
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) ===
    fileURLToPath(new URL(`file://${process.argv[1]}`))
) {
  const origin = codespacesOrigin(process.env);
  console.log(
    "partsdesk startet für den privaten Codespace-Port 3000. Port-Sichtbarkeit in GitHub auf Private belassen.",
  );
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "dev",
      "--webpack",
      "--hostname",
      "0.0.0.0",
      "--port",
      "3000",
    ],
    {
      cwd: fileURLToPath(new URL("../", import.meta.url)),
      stdio: "inherit",
      env: { ...process.env, APP_ORIGIN: origin },
    },
  );
  child.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  child.on("exit", (code) => {
    process.exitCode = code ?? 1;
  });
  for (const signal of ["SIGTERM", "SIGINT"])
    process.on(signal, () => child.kill(signal));
}
