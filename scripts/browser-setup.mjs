import { copyFileSync, constants, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const envFile = fileURLToPath(new URL("../.env", import.meta.url));
if (!existsSync(envFile))
  copyFileSync(
    new URL("../.env.example", import.meta.url),
    envFile,
    constants.COPYFILE_EXCL,
  );
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
for (const args of [["ci"], ["run", "setup"]]) {
  const result = spawnSync(npm, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(
  "partsdesk ist vorbereitet. Start: npm run browser (nur im privaten Codespace).",
);
