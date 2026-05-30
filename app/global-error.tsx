"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors that bubble past the root layout.
 * Must render <html> and <body> because the layout itself may have failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en" dir="ltr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          backgroundColor: "#0b1020",
          color: "#e5e7eb",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            Application error
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: 24, fontSize: 14 }}>
            A critical error prevented the app from loading. Your local data is
            still safe in browser storage.
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "#64748b",
                marginBottom: 24,
                padding: "6px 10px",
                background: "#0f172a",
                borderRadius: 8,
                display: "inline-block",
              }}
            >
              ID: {error.digest}
            </p>
          )}
          <div>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "12px 20px",
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                color: "white",
                border: 0,
                borderRadius: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
