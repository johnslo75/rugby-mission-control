"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/hub";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 380,
        background: "#111a11",
        border: "1px solid #1e2d1e",
        borderRadius: 16,
        padding: "40px 36px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Image
            src="/logo.jpg"
            alt="Rugby Radar"
            width={64}
            height={64}
            style={{ borderRadius: "50%", border: "2px solid #00a86b", marginBottom: 16 }}
          />
          <p style={{ color: "#00a86b", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
            Mission Control
          </p>
          <h1 style={{ color: "#f0f0f0", fontSize: 22, fontWeight: 800, margin: "6px 0 0" }}>
            Sign in
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", color: "#888", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                width: "100%",
                background: "#0d160d",
                border: "1px solid #2a3a2a",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#f0f0f0",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "#888", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                width: "100%",
                background: "#0d160d",
                border: "1px solid #2a3a2a",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#f0f0f0",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p style={{
              color: "#ef4444",
              fontSize: 13,
              background: "#1a0a0a",
              border: "1px solid #3a1a1a",
              borderRadius: 8,
              padding: "10px 14px",
              margin: 0,
            }}>
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#0a1f35" : "#00a86b",
              color: loading ? "#4a7a4a" : "#000",
              border: "none",
              borderRadius: 8,
              padding: "12px",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4,
              transition: "background 0.2s",
            }}
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#444", fontSize: 12, marginTop: 24, marginBottom: 0 }}>
          Rugby Radar — Mission Control
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
