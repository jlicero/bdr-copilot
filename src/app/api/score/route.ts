import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "[score] ANTHROPIC_API_KEY is not set — the /api/score endpoint will fail."
  );
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Strip markdown fences and extract the first JSON object from text. */
function extractJSON(raw: string): unknown {
  // Remove ```json ... ``` or ``` ... ``` wrappers
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const cleaned = (fenced ? fenced[1] : raw).trim();

  // Find the first { … } block (handles leading/trailing prose)
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      `Claude response contained no JSON object. Raw text: ${raw.slice(0, 300)}`
    );
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

// Common English stopwords that should NOT appear when ui_language="es"
const EN_STOPWORDS = /\b(the|and|is|are|this|that|with|for|but|have|has|was|were|will|would|should|could|their|there|from|about|which|these|those|been|also|they|than|more|into|some|such|when|what|each|very|does|because|between|through|however|without|whether|although|therefore|during|while|within|based|likely|strong|weak|lack|indicates|suggests|potential|company|information|provided|limited)\b/gi;

// Common Spanish stopwords that should NOT appear when ui_language="en"
const ES_STOPWORDS = /\b(el|la|los|las|que|para|con|sin|por|una|del|como|pero|sobre|esta|este|entre|puede|tiene|han|sido|son|desde|siendo|aunque|hacia|según|además|también|cada|debe|porque|durante|mediante|cualquier|posible|indica|sugiere|empresa|información|limitada|proporcionada)\b/gi;

const TEXT_FIELDS_TO_CHECK = [
  "reasons",
  "unknowns",
  "red_flags",
  "discovery_questions",
  "next_best_actions",
] as const;

/**
 * Checks if text fields appear to be in the wrong language.
 * Returns true if language looks wrong.
 */
function isWrongLanguage(
  parsed: Record<string, any>,
  expectedLang: "en" | "es"
): boolean {
  const textFields: string[] = [];
  for (const field of TEXT_FIELDS_TO_CHECK) {
    textFields.push(...(parsed[field] ?? []));
  }

  const combined = textFields.join(" ");
  if (!combined) return false;

  const pattern = expectedLang === "es" ? EN_STOPWORDS : ES_STOPWORDS;
  // Reset lastIndex for global regex
  pattern.lastIndex = 0;
  const matches = combined.match(pattern);
  const hitCount = matches ? matches.length : 0;
  const wordCount = combined.split(/\s+/).length;
  const ratio = wordCount > 0 ? hitCount / wordCount : 0;

  console.log(
    `[score] lang-check (expected=${expectedLang}): ${hitCount} wrong-lang hits in ${wordCount} words (ratio=${ratio.toFixed(3)})`
  );

  // If more than 5% of words are wrong-language stopwords, flag it
  return ratio > 0.05;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Separate ui_language from lead data
    const { ui_language, ...lead } = body;
    const lang: "en" | "es" = ui_language === "es" ? "es" : "en";

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("[score] ANTHROPIC_API_KEY is missing at request time.");
      return Response.json(
        { error: "Server misconfiguration", detail: "ANTHROPIC_API_KEY is not set." },
        { status: 500 }
      );
    }

    console.log(`[score] ui_language=${lang}`);

    const languageInstruction =
      lang === "es"
        ? `
IDIOMA — REQUISITO ESTRICTO E INNEGOCIABLE:
Todos los valores de texto en "reasons", "unknowns", "red_flags", "discovery_questions" y "next_best_actions" DEBEN estar escritos COMPLETAMENTE en español.
NO uses NINGUNA palabra en inglés. Ni una sola. Sin mezcla de idiomas.
Escribe cada oración, cada frase, cada palabra de contenido en español.
Los ÚNICOS valores que permanecen en inglés son: las claves JSON ("reasons", "unknowns", etc.) y los valores de stage ("QUALIFIED", "EMERGING", "NOT_QUALIFIED").
Si no puedes cumplir, devuelve arrays vacíos.`
        : `
LANGUAGE — STRICT, NON-NEGOTIABLE REQUIREMENT:
All text values in "reasons", "unknowns", "red_flags", "discovery_questions", and "next_best_actions" MUST be written ENTIRELY in English.
Do NOT use any Spanish or other non-English words. No mixed language.
Write every sentence, every phrase, every content word in English.
The ONLY values that stay in English are also: JSON keys and stage values ("QUALIFIED", "EMERGING", "NOT_QUALIFIED").
If you cannot comply, return empty arrays.`;

    const baseSystem = `
You are a senior B2B enterprise sales strategist for a data & AI consulting firm (Sumz).
Evaluate whether a prospect is a high-quality opportunity.

Rules:
- Use only provided data. Penalize missing info.
- Avoid optimism bias.
- Return VALID JSON ONLY (no markdown, no extra text).

Scoring (total 100):
FIT 25, NEED 25, AUTHORITY 20, TIMING 20, STRATEGIC 10

Stage:
>=75 QUALIFIED
50-74 EMERGING
<50 NOT_QUALIFIED

If authority AND timing are critically weak, set NOT_QUALIFIED regardless of score.
${languageInstruction}`.trim();

    const userPayload = {
      lead,
      output_schema: {
        overall_score: "number (0-100)",
        stage: '"QUALIFIED" | "EMERGING" | "NOT_QUALIFIED"',
        score_breakdown: {
          fit: "number (0-25)",
          need: "number (0-25)",
          authority: "number (0-20)",
          timing: "number (0-20)",
          strategic: "number (0-10)",
        },
        reasons: "string[]",
        unknowns: "string[]",
        red_flags: "string[]",
        discovery_questions: "string[]",
        next_best_actions: "string[]",
      },
    };

    const models = [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ];

    /** Call Claude with a given system prompt and return parsed JSON */
    async function callAndParse(systemPrompt: string): Promise<{
      parsed: Record<string, any>;
      usedModel: string;
    }> {
      const messagesPayload = [
        {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: `Input lead data (JSON):\n${JSON.stringify(userPayload, null, 2)}\n\nReturn ONLY valid JSON matching the schema.`,
            },
          ],
        },
      ];

      let msg: Anthropic.Messages.Message | undefined;
      let usedModel = "";

      for (const model of models) {
        try {
          msg = await client.messages.create({
            model,
            max_tokens: 900,
            temperature: 0.2,
            system: systemPrompt,
            messages: messagesPayload,
          });
          usedModel = model;
          break;
        } catch (e: any) {
          console.warn(
            `[score] Model "${model}" failed: ${e?.message ?? e}. Trying next…`
          );
        }
      }

      if (!msg) {
        throw new Error("All models failed");
      }

      console.log(`[score] Used model: ${usedModel}`);

      const text = msg.content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n")
        .trim();

      return { parsed: extractJSON(text) as Record<string, any>, usedModel };
    }

    // --- First attempt ---
    let { parsed, usedModel } = await callAndParse(baseSystem);
    let contentLanguage: "en" | "es" = lang;

    // --- Language heuristic check + translate-only fallback ---
    if (isWrongLanguage(parsed, lang)) {
      console.warn(
        `[score] Wrong language detected (expected=${lang}). Running translation-only fallback…`
      );

      const targetLabel = lang === "es" ? "Spanish" : "English";
      const translateSystem = `You are a professional translator. Translate the JSON text arrays below into ${targetLabel}.
Rules:
- Translate ONLY the string values inside these arrays: "reasons", "unknowns", "red_flags", "discovery_questions", "next_best_actions".
- Keep the same number of items in each array.
- Do NOT change "overall_score", "score_breakdown", or "stage".
- Return VALID JSON ONLY (no markdown, no extra text).
- Every translated string must be entirely in ${targetLabel}. No mixed language.`;

      const translatePayload = {
        reasons: parsed.reasons ?? [],
        unknowns: parsed.unknowns ?? [],
        red_flags: parsed.red_flags ?? [],
        discovery_questions: parsed.discovery_questions ?? [],
        next_best_actions: parsed.next_best_actions ?? [],
      };

      try {
        const translateMessages = [
          {
            role: "user" as const,
            content: [
              {
                type: "text" as const,
                text: `Translate these arrays to ${targetLabel}. Return ONLY valid JSON.\n\n${JSON.stringify(translatePayload, null, 2)}`,
              },
            ],
          },
        ];

        let translateMsg: Anthropic.Messages.Message | undefined;
        for (const model of models) {
          try {
            translateMsg = await client.messages.create({
              model,
              max_tokens: 900,
              temperature: 0,
              system: translateSystem,
              messages: translateMessages,
            });
            break;
          } catch (e: any) {
            console.warn(`[score] Translation model "${model}" failed: ${e?.message ?? e}`);
          }
        }

        if (translateMsg) {
          const translateText = translateMsg.content
            .filter((c: any) => c.type === "text")
            .map((c: any) => c.text)
            .join("\n")
            .trim();

          const translated = extractJSON(translateText) as Record<string, any>;

          // Merge translated text fields into parsed, keeping scores/stage intact
          for (const field of TEXT_FIELDS_TO_CHECK) {
            if (Array.isArray(translated[field]) && translated[field].length > 0) {
              parsed[field] = translated[field];
            }
          }

          contentLanguage = lang;
          console.log(`[score] Translation fallback complete.`);
        }
      } catch (e: any) {
        console.warn(`[score] Translation fallback failed: ${e?.message ?? e}. Returning original.`);
        // contentLanguage stays as detected wrong language
        contentLanguage = lang === "es" ? "en" : "es";
      }
    }

    // --- Normalize scores ---
    const bd = parsed.score_breakdown || {};
    const fit = clamp(Number(bd.fit ?? 0), 0, 25);
    const need = clamp(Number(bd.need ?? 0), 0, 25);
    const authority = clamp(Number(bd.authority ?? 0), 0, 20);
    const timing = clamp(Number(bd.timing ?? 0), 0, 20);
    const strategic = clamp(Number(bd.strategic ?? 0), 0, 10);

    const overall = clamp(
      Number(parsed.overall_score ?? fit + need + authority + timing + strategic),
      0,
      100
    );

    const stage =
      overall >= 75 ? "QUALIFIED" : overall >= 50 ? "EMERGING" : "NOT_QUALIFIED";

    return Response.json({
      ...parsed,
      overall_score: overall,
      stage,
      score_breakdown: { fit, need, authority, timing, strategic },
      content_language: contentLanguage,
    });
  } catch (err: any) {
    console.error("[score] POST /api/score failed:");
    console.error("  message:", err?.message ?? String(err));
    console.error("  stack:", err?.stack ?? "(no stack)");

    return Response.json(
      { error: "Failed to score lead", detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
