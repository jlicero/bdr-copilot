"use client";

import { useLanguage, type Translations } from "@/lib/i18n";

interface ScoreBreakdown {
  fit: number;
  need: number;
  authority: number;
  timing: number;
  strategic: number;
}

export interface ScoreData {
  overall_score: number;
  stage: "QUALIFIED" | "EMERGING" | "NOT_QUALIFIED";
  score_breakdown: ScoreBreakdown;
  reasons: string[];
  unknowns: string[];
  red_flags: string[];
  discovery_questions: string[];
  next_best_actions: string[];
}

const breakdownKeys: { key: keyof ScoreBreakdown; tKey: keyof Translations; max: number }[] = [
  { key: "fit", tKey: "fit", max: 25 },
  { key: "need", tKey: "need", max: 25 },
  { key: "authority", tKey: "authority", max: 20 },
  { key: "timing", tKey: "timing", max: 20 },
  { key: "strategic", tKey: "strategic", max: 10 },
];

const stageBadgeStyle: Record<string, { bg: string; color: string; border: string }> = {
  QUALIFIED: {
    bg: "var(--badge-green-bg)",
    color: "var(--badge-green-text)",
    border: "rgba(89, 247, 189, 0.2)",
  },
  EMERGING: {
    bg: "var(--badge-yellow-bg)",
    color: "var(--badge-yellow-text)",
    border: "rgba(250, 204, 21, 0.2)",
  },
  NOT_QUALIFIED: {
    bg: "var(--badge-red-bg)",
    color: "var(--badge-red-text)",
    border: "rgba(239, 68, 68, 0.2)",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
          marginBottom: 10,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.8, color: "var(--foreground-secondary)" }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 2 }}>{item}</li>
      ))}
    </ul>
  );
}

export default function ScoreResult({ data }: { data: ScoreData }) {
  const { t } = useLanguage();

  const badgeColors = stageBadgeStyle[data.stage] ?? stageBadgeStyle.NOT_QUALIFIED;
  const stageLabel = t[data.stage];

  return (
    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Score + Badge header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "20px 0 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1,
            background: "linear-gradient(135deg, var(--sumz-purple), var(--sumz-green))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {data.overall_score}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>/ 100</span>
          <span
            style={{
              display: "inline-block",
              padding: "3px 12px",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 9999,
              background: badgeColors.bg,
              color: badgeColors.color,
              border: `1px solid ${badgeColors.border}`,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            {stageLabel}
          </span>
        </div>
      </div>

      {/* Score Breakdown */}
      <Section title={t.scoreBreakdown}>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {breakdownKeys.map(({ key, tKey, max }, i) => {
            const value = data.score_breakdown?.[key] ?? 0;
            const pct = max > 0 ? (value / max) * 100 : 0;

            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 14px",
                  fontSize: 13,
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  background: i % 2 === 0 ? "var(--surface-alt)" : "transparent",
                }}
              >
                <span style={{ width: 85, fontWeight: 600, fontSize: 12, color: "var(--foreground-secondary)" }}>
                  {t[tKey]}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background: "var(--bar-bg)",
                    marginRight: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      borderRadius: 3,
                      background: pct >= 70
                        ? "var(--bar-fill-alt)"
                        : "var(--bar-fill)",
                      transition: "width 0.4s ease-out",
                    }}
                  />
                </div>
                <span
                  style={{
                    width: 50,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--foreground-secondary)",
                  }}
                >
                  {value}/{max}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Reasons */}
      {data.reasons?.length > 0 && (
        <Section title={t.reasons}>
          <BulletList items={data.reasons} />
        </Section>
      )}

      {/* Red Flags */}
      {data.red_flags?.length > 0 && (
        <Section title={t.redFlags}>
          <BulletList items={data.red_flags} />
        </Section>
      )}

      {/* Unknowns */}
      {data.unknowns?.length > 0 && (
        <Section title={t.unknowns}>
          <BulletList items={data.unknowns} />
        </Section>
      )}

      {/* Discovery Questions */}
      {data.discovery_questions?.length > 0 && (
        <Section title={t.discoveryQuestions}>
          <BulletList items={data.discovery_questions} />
        </Section>
      )}

      {/* Next Best Actions */}
      {data.next_best_actions?.length > 0 && (
        <Section title={t.nextBestActions}>
          <BulletList items={data.next_best_actions} />
        </Section>
      )}
    </div>
  );
}
