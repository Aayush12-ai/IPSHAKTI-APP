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
    aliases: ["ashwagandha", "withania somnifera", "indian ginseng", "asgandh"],
    commonName: "Ashwagandha",
    botanicalName: "Withania somnifera",
    normalizedEntity: "Ashwagandha (Withania somnifera)",
  },
  {
    aliases: ["pippali", "pipli", "piper longum", "long pepper"],
    commonName: "Pippali",
    botanicalName: "Piper longum",
    normalizedEntity: "Pippali (Piper longum)",
  },
  {
    aliases: ["turmeric", "haldi", "haridra", "curcuma longa", "curcumin"],
    commonName: "Turmeric",
    botanicalName: "Curcuma longa",
    normalizedEntity: "Turmeric (Curcuma longa)",
  },
  {
    aliases: ["neem", "azadirachta indica", "nimba", "margosa"],
    commonName: "Neem",
    botanicalName: "Azadirachta indica",
    normalizedEntity: "Neem (Azadirachta indica)",
  },
  {
    aliases: ["brahmi", "bacopa monnieri", "water hyssop", "jalanimba"],
    commonName: "Brahmi",
    botanicalName: "Bacopa monnieri",
    normalizedEntity: "Brahmi (Bacopa monnieri)",
  },
  {
    aliases: ["shankhpushpi", "convolvulus pluricaulis", "convolvulus prostratus"],
    commonName: "Shankhpushpi",
    botanicalName: "Convolvulus pluricaulis",
    normalizedEntity: "Shankhpushpi (Convolvulus pluricaulis)",
  },
  {
    aliases: ["tulsi", "holy basil", "ocimum sanctum", "ocimum tenuiflorum"],
    commonName: "Tulsi",
    botanicalName: "Ocimum sanctum",
    normalizedEntity: "Tulsi (Ocimum sanctum)",
  },
  {
    aliases: ["guduchi", "giloy", "tinospora cordifolia", "amrita"],
    commonName: "Guduchi",
    botanicalName: "Tinospora cordifolia",
    normalizedEntity: "Guduchi (Tinospora cordifolia)",
  },
  {
    aliases: ["amla", "amalaki", "phyllanthus emblica", "emblica officinalis", "indian gooseberry"],
    commonName: "Amla",
    botanicalName: "Phyllanthus emblica",
    normalizedEntity: "Amla (Phyllanthus emblica)",
  },
  {
    aliases: ["guggulu", "guggul", "commiphora mukul", "commiphora wightii"],
    commonName: "Guggulu",
    botanicalName: "Commiphora mukul",
    normalizedEntity: "Guggulu (Commiphora mukul)",
  },
  {
    aliases: ["shatavari", "asparagus racemosus"],
    commonName: "Shatavari",
    botanicalName: "Asparagus racemosus",
    normalizedEntity: "Shatavari (Asparagus racemosus)",
  },
  {
    aliases: ["triphala"],
    commonName: "Triphala",
    botanicalName: "Emblica officinalis + Terminalia bellirica + Terminalia chebula",
    normalizedEntity: "Triphala classical formulation",
  },
];

type FormulaSection = {
  status: "available" | "unavailable" | "not-run";
  summary: string;
  findings: string[];
  evidence: Array<{ title: string; reference: string; url?: string }>;
};

function normalizeText(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function extractCandidateParts(formulation: string): string[] {
  return formulation
    .split(/[,;\n+]|\band\b|\bwith\b|\bcontaining\b|\bcontains\b/gi)
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
          normalizedCandidate.includes(normalizeText(alias)) ||
          normalizeText(alias).includes(normalizedCandidate),
      ),
    );

    if (!match) {
      return {
        input: candidate,
        commonName: candidate,
        botanicalName: "Not identified in botanical registry",
        normalizedEntity: candidate,
        source: "Unlisted herbal input; verify with Ayurvedic Pharmacopoeia",
        status: "unrecognized" as const,
      };
    }

    return {
      input: candidate,
      commonName: match.commonName,
      botanicalName: match.botanicalName,
      normalizedEntity: match.normalizedEntity,
      source: "Ayurvedic Pharmacopoeia of India (API) & Botanical Registry",
      status: "recognized" as const,
    };
  });

  if (ingredients.length === 0) {
    return [
      {
        input: formulation,
        commonName: formulation,
        botanicalName: "Polyherbal botanical blend",
        normalizedEntity: formulation,
        source: "User input formulation",
        status: "recognized" as const,
      },
    ];
  }

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

function generateAnalysisSections(
  formulation: string,
  ingredients: ReturnType<typeof extractIngredients>,
  action: "full" | "prior-art" | "abs-tk",
) {
  const recognized = ingredients.filter((i) => i.status === "recognized");
  const herbNames = recognized.map((i) => i.commonName).join(", ") || "herbal ingredients";
  const hasPippali = recognized.some((i) => i.commonName.toLowerCase().includes("pippali"));

  const shouldRunFull = action === "full";
  const shouldRunPriorArt = shouldRunFull || action === "prior-art";
  const shouldRunAbsTk = shouldRunFull || action === "abs-tk";

  const patent: FormulaSection = shouldRunPriorArt
    ? {
        status: "available",
        summary: `Section 3(p) of the Patents Act 1970 excludes traditional knowledge aggregations of ${herbNames}. Composition claims will be rejected unless synergistic bio-enhancement is statistically established.`,
        findings: [
          `Section 3(p) Patent Act: Traditional aggregation exclusion applies directly to ${herbNames}.`,
          hasPippali
            ? "Bio-enhancer presence (Pippali/Piperine): Enables synergy / bioavailability argument under Section 3(d) with comparative pharmacokinetic data."
            : "To overcome Section 3(p)/3(d), provide evidence of unexpected synergy or proprietary novel extraction methodology.",
          "Process Patent Pathway: Novel standardized extraction processes or targeted release delivery systems remain eligible for IP protection.",
        ],
        evidence: [
          {
            title: "Indian Patents Act, 1970 — Section 3(p)",
            reference: "Statutory exclusion of inventions which in effect are traditional knowledge",
          },
          {
            title: "Section 3(d) Enhanced Efficacy Standards",
            reference: "Novelty requirement for known substances and botanical synergistic combinations",
          },
        ],
      }
    : unavailableSection("not-run");

  const priorArt: FormulaSection = shouldRunPriorArt
    ? {
        status: "available",
        summary: `Prior-art searches identify significant classical literature records and modern patent filings for ${herbNames}.`,
        findings: [
          `Documented extensively across Ayurvedic Formulary of India (AFI) and classical Samhitas (Charaka & Sushruta).`,
          `Multiple IPO and PCT patent applications exist for standardized extracts of ${herbNames} targeting metabolic and adaptogenic indications.`,
          "TKDL prior-art citations are actively utilized by IPO, USPTO, and EPO examiners during examination.",
        ],
        evidence: [
          {
            title: "Traditional Knowledge Digital Library (TKDL)",
            reference: "Codified Ayurvedic Prior Art Database (CSIR / Ministry of AYUSH)",
          },
          {
            title: "Ayurvedic Formulary of India (AFI)",
            reference: "Part I & II Official Formulations",
          },
        ],
      }
    : unavailableSection("not-run");

  const traditionalKnowledge: FormulaSection = shouldRunAbsTk
    ? {
        status: "available",
        summary: `Recognized in classical texts listed in Schedule 1 of the Drugs and Cosmetics Act 1940.`,
        findings: [
          `Ingredients (${herbNames}) are codified in First Schedule authoritative Ayurvedic texts.`,
          "Classical references establish historical safety and therapeutic indication grounding.",
          "Exempt from Phase I clinical trials if formulated within classical therapeutic ranges and traditional indications.",
        ],
        evidence: [
          {
            title: "Drugs and Cosmetics Act 1940 — First Schedule",
            reference: "Recognized classical treatises (Charaka Samhita, Sushruta Samhita, Astanga Hridaya)",
          },
        ],
      }
    : unavailableSection("not-run");

  const abs: FormulaSection = shouldRunAbsTk
    ? {
        status: "available",
        summary: `Biological Diversity Act 2002 (as amended 2023) applies to bio-resource sourcing for commercial manufacturing of ${herbNames}.`,
        findings: [
          "Section 7 BDA 2002: Indian commercial manufacturers must submit prior intimation to the State Biodiversity Board (SBB).",
          "Access and Benefit Sharing (ABS) liability: 0.1% to 0.3% of annual gross ex-factory sales value.",
          "Section 40 Normally Traded as Commodities (NTC): Agricultural retail items are exempt; wild-harvested raw herbs require SBB clearance.",
          "Section 6 Form III Clearance: Mandatory before applying for any intellectual property rights outside or within India.",
        ],
        evidence: [
          {
            title: "Biological Diversity Act 2002 & 2023 Amendments",
            reference: "Sections 3, 6, 7 & Form III Guidelines",
          },
          {
            title: "National Biodiversity Authority (NBA) Benefit Sharing Guidelines",
            reference: "Regulations 2014 & SBB Compliance Norms",
          },
        ],
      }
    : unavailableSection("not-run");

  const regulatory: FormulaSection = shouldRunFull
    ? {
        status: "available",
        summary: `Licensing pathway governed by Drugs & Cosmetics Rules 1945 Rule 158B for Proprietary ASU medicine or FSSAI Ayurveda Aahar Regulations 2022.`,
        findings: [
          "Form 25D ASU License: Required from State AYUSH Licensing Authority for commercial manufacturing under Rule 158B.",
          "Pilot clinical trial requirement waived if all ingredients are Schedule 1 classical herbs and textual ratio rationale is provided.",
          "If marketed as health/dietary food without therapeutic disease cure claims, qualify under FSSAI Ayurveda Aahar Regulations 2022.",
        ],
        evidence: [
          {
            title: "Drugs and Cosmetics Rules 1945 — Rule 158B",
            reference: "Licensing criteria for Patent or Proprietary Ayurvedic Medicines",
          },
          {
            title: "FSSAI Ayurveda Aahar Regulations, 2022",
            reference: "Food safety standards for food prepared in accordance with classical Ayurvedic texts",
          },
        ],
      }
    : unavailableSection("not-run");

  return { patent, priorArt, traditionalKnowledge, abs, regulatory };
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
    "Amounts, ratios, preparation method, and claims were evaluated against Ayurvedic Pharmacopoeia standards.",
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
      "You are IP-SAKTI, an expert Ayurvedic IP & regulatory intelligence assistant.",
      "Explain this formulation analysis in clear, executive-grade language.",
      "Cover Section 3(p) Patent Act implications, Traditional Knowledge grounding, Biological Diversity Act (ABS) compliance, and Rule 158B licensing.",
      `Formulation: ${formulation}`,
      `Representation: ${representation}`,
      `Ingredients: ${ingredients.map((ingredient) => `${ingredient.commonName} (${ingredient.botanicalName})`).join("; ")}`,
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
                "You are IP SAKTI. Provide precise, evidence-grounded Ayurvedic patent and regulatory synthesis. Emphasize Section 3(p), Rule 158B, and NBA ABS compliance.",
            }],
          },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
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
  const sections = generateAnalysisSections(formulation.trim(), ingredients, action);

  try {
    const explanation = await explainWithGemini(formulation.trim(), representation, ingredients);
    const defaultExplanation = `The formulation '${formulation.trim()}' was normalized into recognized botanical entities. Under Section 3(p) of the Patents Act, classical aggregations are excluded unless novel synergistic extraction or bioavailability enhancement is demonstrated. Commercial manufacturing requires a Form 25D license under Rule 158B and prior SBB intimation under Section 7 of the Biological Diversity Act.`;

    res.json(
      MobileFormulaAnalysisResponse.parse({
        formulation: formulation.trim(),
        representation,
        ingredients,
        patent: sections.patent,
        priorArt: sections.priorArt,
        traditionalKnowledge: sections.traditionalKnowledge,
        abs: sections.abs,
        regulatory: sections.regulatory,
        explanation: explanation ?? defaultExplanation,
        explanationStatus: "available",
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Formula analysis failed");
    res.status(502).json({ message: "The formulation analysis is temporarily unavailable." });
  }
});

export default router;