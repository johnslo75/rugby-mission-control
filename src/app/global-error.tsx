"use client";

import { useEffect } from "react";

// Last-resort boundary — catches errors in the root layout itself,
// so it must render its own <html> and <body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global-error-boundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "3rem", marginBottom: 16 }}>🏉</p>
          <h1 style={{ fontSize: "1.4rem", marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: "#666", marginBottom: 24 }}>Rugby Radar hit a problem. It&apos;s usually temporary.</p>
          <button
            onClick={reset}
            style={{ background: "#00a86b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
