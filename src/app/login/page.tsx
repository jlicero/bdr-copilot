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

  return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        BDR Copilot
      </h1>
      <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 24 }}>
        Sign in to continue
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button
            onClick={signIn}
            disabled={loading || !email || !password}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "#111",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {loading ? "..." : "Sign in"}
          </button>
          <button
            onClick={signUp}
            disabled={loading || !email || !password}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "#fff",
              color: "#111",
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Sign up
          </button>
        </div>

        {msg && (
          <p
            style={{
              fontSize: 13,
              color: msg.includes("Check") ? "#16a34a" : "#dc2626",
              marginTop: 4,
            }}
          >
            {msg}
          </p>
        )}
      </div>
    </main>
  );
}
