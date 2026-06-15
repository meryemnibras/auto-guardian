/**
 * Digital Asset Links endpoint used by the Trusted Web Activity in the
 * Android app to verify that this domain authorizes the Play Store
 * package to launch full-screen without a URL bar.
 *
 * The actual fingerprint string is read from the env var
 * `TWA_SHA256_FINGERPRINT` so the secret signing key never lives in git.
 *
 * Generate the fingerprint after running `bubblewrap init` with:
 *   keytool -list -v -keystore ./android.keystore -alias android | \
 *     grep "SHA256:" | awk '{print $2}'
 *
 * Then add to Vercel env:
 *   TWA_SHA256_FINGERPRINT  "AB:CD:..."
 *   TWA_PACKAGE_NAME        "ai.drivex.app"
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const fingerprint = process.env.TWA_SHA256_FINGERPRINT;
  const packageName = process.env.TWA_PACKAGE_NAME || "ai.drivex.app";

  // When no fingerprint is configured yet, return an empty array — still
  // valid JSON, so Play Store / TWA verification simply reports "not yet
  // linked" instead of crashing.
  if (!fingerprint) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: packageName,
          sha256_cert_fingerprints: [fingerprint],
        },
      },
    ],
    {
      headers: {
        "Content-Type": "application/json",
        // Play Store re-verifies daily. 1-hour cache balances freshness with load.
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
