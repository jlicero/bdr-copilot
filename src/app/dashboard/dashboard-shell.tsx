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
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 600,
        border: "1px solid var(--border-strong)",
        borderRadius: 4,
        cursor: "pointer",
        background: lang === l ? "var(--foreground)" : "transparent",
        color: lang === l ? "var(--background)" : "var(--foreground)",
        transition: "background 0.15s, color 0.15s",
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
    <main style={{ maxWidth: 600, margin: "80px auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>{t.dashboard}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LangToggle />
          <SignOutButton />
        </div>
      </div>

      <div
        style={{
          padding: 20,
          border: "1px solid var(--border)",
          borderRadius: 8,
        }}
      >
        <p style={{ fontSize: 14, opacity: 0.5, marginBottom: 4 }}>
          {t.signedInAs}
        </p>
        <p style={{ fontSize: 16, fontWeight: 500 }}>{email}</p>
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
