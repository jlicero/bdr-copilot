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
        padding: 20,
        border: "1px solid var(--border)",
        borderRadius: 8,
        marginTop: 24,
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
        {t.leadScoring}
      </h2>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        style={{
          width: "100%",
          fontFamily: "monospace",
          fontSize: 13,
          padding: 12,
          border: "1px solid var(--border-strong)",
          borderRadius: 6,
          resize: "vertical",
          boxSizing: "border-box",
          background: "var(--input-bg)",
          color: "var(--foreground)",
        }}
      />

      <button
        onClick={handleEvaluate}
        disabled={loading}
        style={{
          marginTop: 12,
          padding: "8px 20px",
          fontSize: 14,
          fontWeight: 500,
          background: loading ? "var(--btn-bg-disabled)" : "var(--btn-bg)",
          color: loading ? "#fff" : "var(--background)",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? t.evaluating : t.evaluate}
      </button>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "var(--error-bg)",
            color: "var(--error-text)",
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {langChanged && !result && !loading && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          {t.reEvaluateHint}
        </div>
      )}

      {result && <ScoreResult data={result} />}
    </div>
  );
}
