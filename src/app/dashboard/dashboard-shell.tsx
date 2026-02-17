"use client";

import { LanguageProvider, useLanguage, type Lang } from "@/lib/i18n";
import SignOutButton from "./sign-out-button";
import LeadScorer from "./lead-scorer";

/* ------------------------------------------------------------------ */
/*  Language toggle                                                    */
/* ------------------------------------------------------------------ */

function LangToggle() {
  const { lang, setLang } = useLanguage();

  const btn = (l: Lang, label: string) => (
    <button
      onClick={() => setLang(l)}
      style={{
        padding: "4px 12px",
        fontSize: 12,
        fontWeight: 600,
        border: lang === l ? "1px solid var(--sumz-green)" : "1px solid var(--border-strong)",
        borderRadius: 6,
        cursor: "pointer",
        background: lang === l ? "var(--sumz-green-dim)" : "transparent",
        color: lang === l ? "var(--sumz-green)" : "var(--text-muted)",
        transition: "all 0.15s",
        letterSpacing: "0.03em",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {btn("en", "EN")}
      {btn("es", "ES")}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inner shell (needs context)                                        */
/* ------------------------------------------------------------------ */

function ShellContent({ email }: { email: string }) {
  const { t } = useLanguage();

  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "32px 24px 64px",
        minHeight: "100vh",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "linear-gradient(135deg, var(--sumz-purple), var(--sumz-green))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            S
          </div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            {t.dashboard}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LangToggle />
          <SignOutButton />
        </div>
      </div>

      {/* User card */}
      <div
        style={{
          padding: "16px 20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--card-radius)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--text-muted)",
            marginBottom: 4,
          }}
        >
          {t.signedInAs}
        </p>
        <p style={{ fontSize: 15, fontWeight: 500 }}>{email}</p>
      </div>

      <LeadScorer />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported wrapper (provides context)                                */
/* ------------------------------------------------------------------ */

export default function DashboardShell({ email }: { email: string }) {
  return (
    <LanguageProvider>
      <ShellContent email={email} />
    </LanguageProvider>
  );
}
