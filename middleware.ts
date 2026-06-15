import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Hostname-based routing.
 *
 *   aidrivex.agency / www.aidrivex.agency  →  marketing LANDING page at "/"
 *   app.aidrivex.agency                    →  the APP (chat) at "/"
 *
 * Only the root path is intercepted. Every other route (/diagnostics,
 * /wallet, /checkout, /landing, static assets, API) is served unchanged,
 * so deep links keep working on both hosts.
 */
export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const isAppHost = host.startsWith("app.");

  // On the marketing domain, the root path shows the landing page.
  if (!isAppHost) {
    const url = request.nextUrl.clone();
    url.pathname = "/landing";
    return NextResponse.rewrite(url);
  }

  // On the app subdomain, "/" serves the chat (app) — no rewrite.
  return NextResponse.next();
}

export const config = {
  // Run only on the exact root path.
  matcher: ["/"],
};
