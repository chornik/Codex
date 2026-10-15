import { NextResponse } from "next/server";
import { ZodError } from "zod";
class OriginError extends Error {}
export function fail(error: unknown) {
  if (error instanceof OriginError)
    return NextResponse.json(
      { error: "Fremder Ursprung ist nicht erlaubt." },
      { status: 403 },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: error.issues.map((i) => i.message).join(" ") },
      { status: 400 },
    );
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { error: "Ungültige JSON-Eingabe." },
      { status: 400 },
    );
  console.error(
    "[PartsDesk]",
    error instanceof Error ? error.name : "Unknown error",
  );
  return NextResponse.json(
    {
      error:
        "Die Aktion konnte nicht abgeschlossen werden. Bitte Eingaben prüfen und erneut versuchen.",
    },
    { status: 500 },
  );
}
export const missing = () =>
  NextResponse.json({ error: "Eintrag nicht gefunden." }, { status: 404 });
// Local MVP is deliberately same-origin; reject browser mutations from other sites.
export function checkOrigin(request: Request) {
  const url = new URL(request.url);
  // Next may normalize the internal URL to localhost. The HTTP Host preserves
  // the actual browser destination, including 127.0.0.1 and the port.
  const host = request.headers.get("host") || url.host;
  let destination: URL;
  try {
    destination = new URL(`${url.protocol}//${host}`);
  } catch {
    throw new OriginError();
  }
  const origin = request.headers.get("origin");
  const local = ["127.0.0.1", "localhost", "[::1]"].includes(
    destination.hostname,
  );
  const configured = process.env.APP_ORIGIN;
  if (configured) {
    let external: URL;
    try {
      external = new URL(configured);
    } catch {
      throw new OriginError();
    }
    if (
      external.protocol !== "https:" ||
      external.pathname !== "/" ||
      external.search ||
      external.hash ||
      external.username ||
      external.password
    )
      throw new OriginError();
    // Trust one explicit HTTPS origin, never arbitrary forwarded headers or a
    // wildcard of other Codespaces users. Local Host rewriting by the gateway is allowed.
    if (
      (destination.host === external.host || local) &&
      origin === external.origin
    )
      return;
    if (destination.host === external.host && !origin) return;
  }
  if (!local || (origin && origin !== destination.origin))
    throw new OriginError();
}
