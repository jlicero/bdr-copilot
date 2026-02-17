"use client";

import { useState, useEffect, useRef } from "react";
import ScoreResult, { type ScoreData } from "./score-result";
import { useLanguage } from "@/lib/i18n";

const sampleLead = JSON.stringify(
  {
    name: "Jane Smith",
    title: "VP of Engineering",
    company: "Acme Corp",
    employees: 500,
    industry: "SaaS",
    recentActivity: "Visited pricing page 3 times this week",
  },
  null,
  2
);

export default function LeadScorer() {
  const { lang, t } = useLanguage();
  const [input, setInput] = useState(sampleLead);
  const [result, setResult] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [langChanged, setLangChanged] = useState(false);
  const prevLang = useRef(lang);

  // Clear stale results when language changes
  useEffect(() => {
    if (prevLang.current !== lang) {
      prevLang.current = lang;
      if (result) {
        setResult(null);
        setLangChanged(true);
      }
    }
  }, [lang, result]);

  async function handleEvaluate() {
    setError(null);
    setResult(null);
    setLangChanged(false);
    setLoading(true);

    try {
      const leadData = JSON.parse(input);
      // Spread leadData first so ui_language always wins
      const requestBody = { ...leadData, ui_language: lang };
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: "24px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--card-radius)",
        boxShadow: "var(--card-shadow)",
        marginTop: 24,
      }}
    >
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 16,
          letterSpacing: "-0.01em",
        }}
      >
        {t.leadScoring}
      </h2>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        style={{
          width: "100%",
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          fontSize: 13,
          lineHeight: 1.6,
          padding: 14,
          border: "1px solid var(--input-border)",
          borderRadius: 8,
          resize: "vertical",
          boxSizing: "border-box",
          background: "var(--input-bg)",
          color: "var(--foreground)",
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--input-focus)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--input-border)")}
      />

      <button
        onClick={handleEvaluate}
        disabled={loading}
        style={{
          marginTop: 14,
          padding: "10px 28px",
          fontSize: 14,
          fontWeight: 600,
          background: loading ? "var(--btn-disabled-bg)" : "var(--btn-primary-bg)",
          color: loading ? "var(--btn-disabled-text)" : "var(--btn-primary-text)",
          border: "none",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          letterSpacing: "0.01em",
        }}
      >
        {loading ? t.evaluating : t.evaluate}
      </button>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "var(--error-bg)",
            color: "var(--error-text)",
            borderRadius: 8,
            fontSize: 13,
            border: "1px solid rgba(239, 68, 68, 0.15)",
          }}
        >
          {error}
        </div>
      )}

      {langChanged && !result && !loading && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "var(--sumz-purple-dim)",
            border: "1px solid rgba(63, 31, 232, 0.2)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--foreground-secondary)",
          }}
        >
          {t.reEvaluateHint}
        </div>
      )}

      {result && <ScoreResult data={result} />}
    </div>
  );
}
