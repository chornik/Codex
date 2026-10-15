import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
export function hostedConfig(env) {
  let origin;
  try {
    origin = new URL(env.APP_ORIGIN || env.RENDER_EXTERNAL_URL || "");
  } catch {
    throw new Error(
      "Die HTTPS-Adresse der Website fehlt (APP_ORIGIN oder RENDER_EXTERNAL_URL).",
    );
  }
  if (
    origin.protocol !== "https:" ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash ||
    origin.username ||
    origin.password
  )
    throw new Error(
      "Die Website benötigt eine genaue HTTPS-Adresse ohne Pfad oder Zugangsdaten.",
    );
  const username = env.DEMO_USERNAME || "demo";
  if (!username || username.includes(":") || username.length > 64)
    throw new Error("Der Demo-Benutzername ist ungültig.");
  if (
    !env.DEMO_PASSWORD ||
    env.DEMO_PASSWORD.length < 24 ||
    env.DEMO_PASSWORD.length > 1024
  )
    throw new Error(
      "DEMO_PASSWORD muss sicher in den Hosting-Einstellungen gesetzt sein (mindestens 24 Zeichen).",
    );
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT ist ungültig.");
  return { origin: origin.origin, port, username };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  config({ path: path.join(root, ".env"), quiet: true });
  const settings = hostedConfig(process.env);
  const env = {
    ...process.env,
    APP_ORIGIN: settings.origin,
    DEMO_AUTH_REQUIRED: "1",
  };
  const setup = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "setup"],
    { cwd: root, env, stdio: "inherit" },
  );
  if (setup.error) throw setup.error;
  if (setup.status !== 0) process.exit(setup.status ?? 1);
  console.log("partsdesk startet als passwortgeschützte Webdemo.");
  const child = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "0.0.0.0",
      "--port",
      String(settings.port),
    ],
    { cwd: root, env, stdio: "inherit" },
  );
  child.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  child.on("exit", (code) => {
    process.exitCode = code ?? 1;
  });
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () => child.kill(signal));
}
