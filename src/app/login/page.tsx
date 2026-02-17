"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const signUp = async () => {
    setLoading(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message);
    setMsg("Check your email to confirm your account.");
  };

  const signIn = async () => {
    setLoading(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) return setMsg(error.message);
    router.push("/dashboard");
    router.refresh();
  };

  const isSuccess = msg?.includes("Check");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--background-raised)",
          border: "1px solid var(--border)",
          borderRadius: "var(--card-radius)",
          boxShadow: "var(--card-shadow)",
          padding: "40px 32px",
        }}
      >
        {/* Brand header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, var(--sumz-purple), var(--sumz-green))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              S
            </div>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Sumz
            </span>
          </div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            BDR Copilot
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
            }}
          >
            Sign in to continue
          </p>
        </div>

        {/* Form */}
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--foreground-secondary)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              type="email"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--input-border)",
                borderRadius: 8,
                fontSize: 14,
                background: "var(--input-bg)",
                color: "var(--foreground)",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--input-focus)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--input-border)")}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--foreground-secondary)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              type="password"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid var(--input-border)",
                borderRadius: 8,
                fontSize: 14,
                background: "var(--input-bg)",
                color: "var(--foreground)",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--input-focus)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--input-border)")}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button
              onClick={signIn}
              disabled={loading || !email || !password}
              style={{
                flex: 1,
                padding: "11px 0",
                background: loading || !email || !password
                  ? "var(--btn-disabled-bg)"
                  : "var(--btn-primary-bg)",
                color: loading || !email || !password
                  ? "var(--btn-disabled-text)"
                  : "var(--btn-primary-text)",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading || !email || !password ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {loading ? "..." : "Sign in"}
            </button>
            <button
              onClick={signUp}
              disabled={loading || !email || !password}
              style={{
                flex: 1,
                padding: "11px 0",
                background: "var(--btn-secondary-bg)",
                color: loading || !email || !password
                  ? "var(--btn-disabled-text)"
                  : "var(--btn-secondary-text)",
                border: `1px solid ${
                  loading || !email || !password
                    ? "var(--border)"
                    : "var(--btn-secondary-border)"
                }`,
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading || !email || !password ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              Sign up
            </button>
          </div>

          {msg && (
            <p
              style={{
                fontSize: 13,
                padding: "10px 14px",
                borderRadius: 8,
                marginTop: 2,
                background: isSuccess ? "var(--badge-green-bg)" : "var(--error-bg)",
                color: isSuccess ? "var(--badge-green-text)" : "var(--error-text)",
              }}
            >
              {msg}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
