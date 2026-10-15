import { NextResponse, type NextRequest } from "next/server";
import { demoAccess } from "@/lib/demo-auth";
export function proxy(request: NextRequest) {
  // A data-free health check is the only public route. Everything else, including
  // files and API requests, requires authentication on the hosted demo.
  if (
    request.nextUrl.pathname === "/api/health" &&
    ["GET", "HEAD"].includes(request.method)
  )
    return NextResponse.next();
  const access = demoAccess(request.headers.get("authorization"));
  if (access === "unconfigured")
    return new NextResponse("Der Website-Zugang ist noch nicht eingerichtet.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  if (access === "denied")
    return new NextResponse("Bitte mit dem Demo-Zugang anmelden.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="partsdesk", charset="UTF-8"',
        "Cache-Control": "no-store",
      },
    });
  const response = NextResponse.next();
  if (access === "allowed")
    response.headers.set("Cache-Control", "private, no-store");
  return response;
}
