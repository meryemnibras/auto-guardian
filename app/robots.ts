import type { MetadataRoute } from "next";

/**
 * Allow indexing of marketing routes; keep private app routes out of search.
 * If you ever ship behind auth, switch to "disallow: '/'".
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/landing", "/privacy", "/terms"],
        disallow: [
          "/api/",
          "/ai-test",
          "/diagnostics",
          "/wallet",
          "/emergency",
          "/settings",
        ],
      },
    ],
  };
}
