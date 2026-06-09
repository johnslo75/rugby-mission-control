"use client";

import { useEffect } from "react";

// Segment error boundary for the public site — a render/data exception
// shows a branded recovery page instead of the bare Next.js 500.
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[site-error-boundary]", error);
  }, [error]);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <p style={{ fontSize: "3rem", marginBottom: 16 }}>🏉</p>
      <h1 className="font-archivo" style={{ fontWeight: 900, fontSize: "1.4rem", color: "var(--ink)", marginBottom: 12 }}>
        Something went wrong
      </h1>
      <p className="font-archivo-narrow" style={{ color: "var(--muted)", marginBottom: 24 }}>
        That page hit a problem on our end. It&apos;s usually temporary.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={reset}
          className="font-archivo"
          style={{ background: "var(--green, #00a86b)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}
        >
          Try again
        </button>
        <a
          href="/"
          className="font-archivo"
          style={{ background: "#1f1f1f", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700 }}
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
