import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Hostname-based split between the marketing site and the product.
 *
 *   aidrivex.agency  (+ www)   →  ONLY the landing page + conversion funnel
 *                                 (/, /landing, /checkout, /privacy, /terms)
 *   app.aidrivex.agency        →  the full APP (chat at /, diagnostics,
 *                                 wallet, emergency, settings)
 *
 * On the marketing domain, any app-only section redirects to the app
 * subdomain, so visitors and search engines see a clean separation.
 * On the app subdomain, the marketing /landing bounces back to the root
 * domain.
 */

// App-only sections. The chat lives at "/" and is handled by the root rule.
const APP_PREFIXES = ["/diagnostics", "/wallet", "/emergency", "/settings"];

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const isAppHost = host.startsWith("app.");
  const url = request.nextUrl;
  const path = url.pathname;

  // Base domain with any app./www. prefix stripped (e.g. "aidrivex.agency").
  const baseHost = host.replace(/^app\./, "").replace(/^www\./, "");

  if (isAppHost) {
    // ---- App subdomain: serves the full product ----
    // The marketing landing belongs on the root domain — send it home.
    if (path === "/landing") {
      return NextResponse.redirect(`https://${baseHost}/`);
    }
    return NextResponse.next();
  }

  // ---- Marketing domain (aidrivex.agency / www) ----

  // Root path shows the landing page (URL stays as the bare domain).
  if (path === "/") {
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = "/landing";
    return NextResponse.rewrite(rewriteUrl);
  }

  // App-only sections → move the visitor to the app subdomain.
  const isAppRoute = APP_PREFIXES.some(
    (p) => path === p || path.startsWith(p + "/")
  );
  if (isAppRoute) {
    return NextResponse.redirect(
      `https://app.${baseHost}${path}${url.search}`
    );
  }

  // Everything else on the marketing domain (landing, checkout, legal pages)
  // is served as-is.
  return NextResponse.next();
}

export const config = {
  // Run on all routes EXCEPT static assets, images, and API endpoints so the
  // redirect logic never interferes with Next internals or the Stripe webhook.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|robots.txt|sitemap.xml|manifest.webmanifest|icons|screenshots|api|logo.png|white.png|founder.jpg|apple-touch-icon.png|icon.svg|sw.js|\\.well-known).*)",
  ],
};
