import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
const root = fileURLToPath(new URL("../", import.meta.url));
const samples = {};
for (const [extension, type] of [
  ["png", "image/png"],
  ["pdf", "application/pdf"],
  ["txt", "text/plain"],
]) {
  const name = `typenschild.${extension}`;
  samples[`/samples/${name}`] = {
    name,
    type,
    data: (await readFile(path.join(root, "public/samples", name))).toString(
      "base64",
    ),
  };
}
const bundle = await build({
  absWorkingDir: root,
  entryPoints: ["preview/main.tsx"],
  bundle: true,
  write: false,
  platform: "browser",
  format: "iife",
  target: "es2022",
  jsx: "automatic",
  minify: true,
  legalComments: "inline",
  metafile: true,
  alias: {
    "next/link": path.join(root, "preview/navigation.tsx"),
    "next/navigation": path.join(root, "preview/navigation.tsx"),
  },
  define: {
    "process.env.NODE_ENV": '"production"',
    __SAMPLES__: JSON.stringify(samples),
  },
  logLevel: "silent",
});
const thirdParty = [];
const packages = new Set(
  Object.keys(bundle.metafile.inputs)
    .filter((name) => name.startsWith("node_modules/"))
    .map((name) => {
      const parts = name.slice("node_modules/".length).split("/");
      return parts[0].startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
    }),
);
for (const name of packages) {
  for (const file of [
    "LICENSE",
    "LICENSE.md",
    "LICENSE.txt",
    "license",
    "license.md",
  ]) {
    try {
      thirdParty.push({
        name,
        notice: await readFile(
          path.join(root, "node_modules", name, file),
          "utf8",
        ),
      });
      break;
    } catch {
      /* try the package's other license filename */
    }
  }
}
const source = await readFile(path.join(root, "src/app/globals.css"), "utf8");
const css = await postcss([
  tailwindcss({
    content: [
      path.join(root, "src/**/*.{ts,tsx}"),
      path.join(root, "preview/**/*.{ts,tsx}"),
    ],
    theme: { extend: {} },
    plugins: [],
  }),
  autoprefixer,
]).process(source, { from: path.join(root, "src/app/globals.css") });
const notice =
  ".html-preview-notice{display:flex;justify-content:space-between;align-items:center;gap:20px;background:#e8f0eb;border:1px solid #d4e2da;border-radius:10px;padding:15px 18px;margin-bottom:28px;color:#557567}.html-preview-notice strong{font-size:12px;display:flex;gap:7px;align-items:center}.html-preview-notice p{font-size:10px;margin-top:5px;line-height:1.8;max-width:700px}.html-preview-notice .btn{font-size:9px}@media(max-width:720px){.html-preview-notice{flex-direction:column;align-items:flex-start;gap:12px;padding:14px}.html-preview-notice p{font-size:10px}}";
const licenseData = JSON.stringify(thirdParty).replace(/</g, "\\u003c");
if (/BRAVE_SEARCH_API_KEY|DEMO_PASSWORD/.test(bundle.outputFiles[0].text))
  throw new Error(
    "Server-only configuration must not be included in the HTML preview.",
  );
const html = `<!doctype html>\n<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; form-action 'none'; base-uri 'none'"><title>partsdesk · Interaktive Browserdemo</title><style>${css.css}\n${notice}</style></head><body><div id="root"></div><noscript>Diese interaktive Vorschau benötigt JavaScript im Browser. Es werden keine Programme installiert und keine externen Dienste geladen.</noscript><script type="application/json" id="third-party-notices">${licenseData}</script><script>${bundle.outputFiles[0].text}</script></body></html>\n`;
await writeFile(path.join(root, "index.html"), html);
console.log(
  `index.html erstellt: ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB, alle Skripte und Stile eingebettet, keine externen Abhängigkeiten zur Laufzeit.`,
);
