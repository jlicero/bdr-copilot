"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "es";

const STORAGE_KEY = "bdr-copilot-lang";

/* ------------------------------------------------------------------ */
/*  Translation dictionary                                             */
/* ------------------------------------------------------------------ */

const translations = {
  en: {
    dashboard: "Dashboard",
    signedInAs: "Signed in as",
    signOut: "Sign out",
    leadScoring: "Lead Scoring",
    evaluate: "Evaluate",
    evaluating: "Evaluating\u2026",
    somethingWentWrong: "Something went wrong",

    // Score result
    scoreBreakdown: "Score Breakdown",
    reasons: "Reasons",
    redFlags: "Red Flags",
    unknowns: "Unknowns",
    discoveryQuestions: "Discovery Questions",
    nextBestActions: "Next Best Actions",

    // Breakdown labels
    fit: "Fit",
    need: "Need",
    authority: "Authority",
    timing: "Timing",
    strategic: "Strategic",

    // Hints
    reEvaluateHint: "Re-evaluate to regenerate content in the selected language.",

    // Stage labels
    QUALIFIED: "Qualified",
    EMERGING: "Emerging",
    NOT_QUALIFIED: "Not Qualified",
  },
  es: {
    dashboard: "Panel",
    signedInAs: "Sesión iniciada como",
    signOut: "Cerrar sesión",
    leadScoring: "Puntuación de prospectos",
    evaluate: "Evaluar",
    evaluating: "Evaluando\u2026",
    somethingWentWrong: "Algo salió mal",

    // Score result
    scoreBreakdown: "Desglose de puntuación",
    reasons: "Razones",
    redFlags: "Señales de alerta",
    unknowns: "Desconocidos",
    discoveryQuestions: "Preguntas de descubrimiento",
    nextBestActions: "Próximos pasos recomendados",

    // Breakdown labels
    fit: "Ajuste",
    need: "Necesidad",
    authority: "Autoridad",
    timing: "Oportunidad",
    strategic: "Estratégico",

    // Hints
    reEvaluateHint: "Vuelve a evaluar para generar el contenido en el idioma seleccionado.",

    // Stage labels
    QUALIFIED: "Calificado",
    EMERGING: "En desarrollo",
    NOT_QUALIFIED: "No calificado",
  },
} as const;

export type Translations = { [K in keyof (typeof translations)["en"]]: string };

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLang(): Lang {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") return stored;
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
