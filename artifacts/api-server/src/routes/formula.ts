import { Router, type IRouter } from "express";
import {
  MobileFormulaAnalysisBody,
  MobileFormulaAnalysisResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const INSUFFICIENT_EVIDENCE = "Insufficient evidence available.";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

type KnownIngredient = {
  aliases: string[];
  commonName: string;
  botanicalName: string;
  normalizedEntity: string;
};

const KNOWN_INGREDIENTS: KnownIngredient[] = [
  {
    aliases: ["ashwagandha", "withania somnifera"],
    commonName: "Ashwagandha",
    botanicalName: "Withania somnifera",
    normalizedEntity: "Ashwagandha (Withania somnifera)",
  },
  {
    aliases: ["pippali", "pipli", "piper longum"],
    commonName: "Pippali",
    botanicalName: "Piper longum",
    normalizedEntity: "Pippali (Piper longum)",
  },
  {
    aliases: ["turmeric", "haldi", "haridra", "curcuma longa"],
    commonName: "Turmeric",
    botanicalName: "Curcuma longa",
    normalizedEntity: "Turmeric (Curcuma longa)",
  },
  {
    aliases: ["neem", "azadirachta indica"],
    commonName: "Neem",
    botanicalName: "Azadirachta indica",
    normalizedEntity: "Neem (Azadirachta indica)",
  },
];

type FormulaSection = {
  status: "available" | "unavailable" | "not-run";
  summary: string;
  findings: string[];
  evidence: Array<{ title: string; reference: string }>;
};

function normalizeText(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function extractCandidateParts(formulation: string): string[] {
  return formulation
    .split(/[,;\n]|\band\b|\bwith\b|\bcontaining\b|\bcontains\b/gi)
    .map((part) =>
      part
        .replace(
          /\b(formulation|formula|extract|powder|tablet|tablets|capsule|capsules|sustained|release|standardized|of|in|a|an|the)\b/gi,
          " ",
        )
        .replace(/[^\p{L}\p{N}\s]+/gu, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

function extractIngredients(formulation: string) {
  const candidates = extractCandidateParts(formulation);
  const ingredients = candidates.map((candidate) => {
    const normalizedCandidate = normalizeText(candidate);
    const match = KNOWN_INGREDIENTS.find((ingredient) =>
      ingredient.aliases.some(
        (alias) =>
          normalizedCandidate === normalizeText(alias) ||
          normalizedCandidate.includes(normalizeText(alias)),
      ),
    );

    if (!match) {
      return {
        input: candidate,
        commonName: candidate,
        botanicalName: "Not identified",
        normalizedEntity: "Not identified",
        source: "No matching normalization record",
        status: "unrecognized" as const,
      };
    }

    return {
      input: candidate,
      commonName: match.commonName,
      botanicalName: match.botanicalName,
      normalizedEntity: match.normalizedEntity,
      source: "IP-SAKTI normalization dictionary; external evidence not attached",
      status: "recognized" as const,
    };
  });

  return Array.from(
    new Map(
      ingredients.map((ingredient, index) => [
        ingredient.status === "recognized"
          ? ingredient.normalizedEntity
          : `${ingredient.normalizedEntity}-${index}`,
        ingredient,
      ]),
    ).values(),
  );
}

function unavailableSection(status: "unavailable" | "not-run"): FormulaSection {
  return {
    status,
    summary: INSUFFICIENT_EVIDENCE,
    findings: [INSUFFICIENT_EVIDENCE],
    evidence: [],
  };
}

function buildRepresentation(
  ingredients: ReturnType<typeof extractIngredients>,
  formulation: string,
) {
  const entities = ingredients
    .filter((ingredient) => ingredient.status === "recognized")
    .map((ingredient) => ingredient.normalizedEntity);
  const dosageForms = Array.from(
    formulation.matchAll(
      /\b(tablet|tablets|capsule|capsules|powder|extract|oil|cream|balm|syrup)\b/gi,
    ),
    (match) => match[1].toLocaleLowerCase(),
  ).filter((term, index, values) => values.indexOf(term) === index);
  return [
    entities.length
      ? `Recognized entities: ${entities.join("; ")}.`
      : "Recognized entities: none.",
    dosageForms.length
      ? `Dosage/formulation terms: ${dosageForms.join(", ")}.`
      : "Dosage/formulation term: not identified.",
    "Amounts, ratios, preparation method, and claims were not inferred from the input.",
  ].join(" ");
}

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

async function explainWithGemini(
  formulation: string,
  representation: string,
  ingredients: ReturnType<typeof extractIngredients>,
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = [
      "Explain this formulation analysis in concise plain language.",
      "You may only restate the recognized normalization records and the explicit evidence availability states.",
      "Do not add botanical facts, patent numbers, legal conclusions, regulatory claims, citations, or search results.",
      "If a section says Insufficient evidence available, say that plainly.",
      `Formulation: ${formulation}`,
      `Representation: ${representation}`,
      `Ingredients: ${ingredients.map((ingredient) => `${ingredient.commonName} — ${ingredient.botanicalName}`).join("; ")}`,
    ].join("\n");

    const response = await fetch(
      `${GEMINI_ENDPOINT}/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text:
                "You are IP SAKTI. Stay evidence-grounded. Never invent sources or legal conclusions. Explain only the provided structured data.",
            }],
          },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
        }),
      },
    );

    if (!response.ok) return null;
    const data = (await response.json()) as GeminiResponse;
    return data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() || null;
  } catch {
    return null;
  }
}

router.post("/mobile/formula-analysis", async (req, res) => {
  const parsedRequest = MobileFormulaAnalysisBody.safeParse(req.body);
  if (!parsedRequest.success) {
    res.status(400).json({ message: "A non-empty formulation is required." });
    return;
  }

  const { formulation, action } = parsedRequest.data;
  const ingredients = extractIngredients(formulation.trim());
  const representation = buildRepresentation(ingredients, formulation.trim());
  const shouldRunFull = action === "full";
  const shouldRunPriorArt = shouldRunFull || action === "prior-art";
  const shouldRunAbsTk = shouldRunFull || action === "abs-tk";

  try {
    const explanation = await explainWithGemini(formulation.trim(), representation, ingredients);
    res.json(
      MobileFormulaAnalysisResponse.parse({
        formulation: formulation.trim(),
        representation,
        ingredients,
        patent: unavailableSection(shouldRunPriorArt ? "unavailable" : "not-run"),
        priorArt: unavailableSection(shouldRunPriorArt ? "unavailable" : "not-run"),
        traditionalKnowledge: unavailableSection(shouldRunAbsTk ? "unavailable" : "not-run"),
        abs: unavailableSection(shouldRunAbsTk ? "unavailable" : "not-run"),
        regulatory: unavailableSection(shouldRunFull ? "unavailable" : "not-run"),
        explanation: explanation ?? INSUFFICIENT_EVIDENCE,
        explanationStatus: explanation ? "available" : "unavailable",
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Formula analysis failed");
    res.status(502).json({ message: "The formulation analysis is temporarily unavailable." });
  }
});

export default router;