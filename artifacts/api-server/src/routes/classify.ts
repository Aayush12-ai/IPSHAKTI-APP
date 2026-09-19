import { Router, type IRouter } from "express";
import {
  MobileClassifyBody,
  MobileClassifyResponse,
} from "@workspace/api-zod";
import {
  createResearchProject,
  findResearchProject,
  getMostRecentProject,
  getOrCreateResearchSession,
  getOrCreateResearchUser,
  saveResearchHistory,
  saveResearchMemory,
} from "../lib/research-store";
import { callGemini } from "../lib/gemini";

const router: IRouter = Router();

type ClassificationPayload = {
  category: string;
  categoryCode: string;
  confidence: string;
  confidenceScore: number;
  summary: string;
  statutoryBasis: string;
  regulatoryPathway: {
    authority: string;
    licenseType: string;
    trialRequirements: string[];
    standardsRef: string;
  };
  ipAndTkdlRisks: {
    patentability: string;
    tkdlOverlap: string;
    keyRisks: string[];
  };
  recommendedActions: string[];
  evidenceSources: Array<{
    title: string;
    section: string;
    description: string;
  }>;
};

// Domain knowledge classification rule engine
function evaluateRegulatoryClassification(data: {
  productName: string;
  ingredients: string;
  dosageForm?: string;
  preparationMethod?: string;
  intendedUse?: string;
  claims?: string;
  targetMarket?: string;
}): ClassificationPayload {
  const text = `${data.productName} ${data.ingredients} ${data.dosageForm ?? ""} ${data.preparationMethod ?? ""} ${data.intendedUse ?? ""} ${data.claims ?? ""}`.toLowerCase();
  const method = (data.preparationMethod ?? "").toLowerCase();
  const claims = (data.claims ?? "").toLowerCase();
  const use = (data.intendedUse ?? "").toLowerCase();
  const form = (data.dosageForm ?? "").toLowerCase();

  const isClassical =
    method.includes("classical") ||
    method.includes("shastriya") ||
    method.includes("afi") ||
    text.includes("charaka") ||
    text.includes("sushruta") ||
    text.includes("sharangadhara") ||
    text.includes("bhasma") ||
    text.includes("arishta") ||
    text.includes("asava") ||
    text.includes("avaleha") ||
    text.includes("taila") ||
    text.includes("ghrita");

  const isCosmetic =
    form.includes("cream") ||
    form.includes("lotion") ||
    form.includes("serum") ||
    form.includes("balm") ||
    form.includes("oil") ||
    form.includes("wash") ||
    use.includes("skin") ||
    use.includes("hair") ||
    use.includes("cosmetic") ||
    use.includes("complexion") ||
    claims.includes("radiant") ||
    claims.includes("glow") ||
    claims.includes("anti-aging");

  const isFoodOrDietary =
    use.includes("food") ||
    use.includes("diet") ||
    use.includes("nutrition") ||
    use.includes("beverage") ||
    use.includes("tea") ||
    use.includes("latte") ||
    use.includes("snack") ||
    claims.includes("general wellness") ||
    claims.includes("daily nutrition") ||
    text.includes("aahar") ||
    text.includes("supplement");

  const isPhytopharmaceutical =
    method.includes("purified fraction") ||
    method.includes("chromatographic") ||
    method.includes("isolated") ||
    claims.includes("new drug") ||
    claims.includes("isolated bio-active");

  const isProprietaryNovel =
    method.includes("standardized extract") ||
    method.includes("hydro-alcoholic") ||
    method.includes("sustained release") ||
    method.includes("liposomal") ||
    method.includes("nano") ||
    method.includes("modern") ||
    form.includes("capsule") ||
    form.includes("tablet") ||
    form.includes("effervescent");

  // Determine regulatory pathway
  if (isPhytopharmaceutical) {
    return {
      category: "Phytopharmaceutical Drug",
      categoryCode: "phytopharmaceutical",
      confidence: "High",
      confidenceScore: 92,
      summary:
        "Standardized and purified fraction of botanical origin defined under Rule 122E of the Drugs & Cosmetics Rules for formal drug registration.",
      statutoryBasis: "Drugs and Cosmetics Rules, 1945 — Rule 122E (Phytopharmaceutical Drugs)",
      regulatoryPathway: {
        authority: "Central Drugs Standard Control Organisation (CDSCO)",
        licenseType: "Form 44 / Phytopharmaceutical New Drug Approval",
        trialRequirements: [
          "Non-clinical toxicology & animal pharmacology studies",
          "Phase I to Phase III clinical trials as per Schedule Y / CT Rules 2019",
          "Minimum 4 bioactive or phytochemical marker characterization",
        ],
        standardsRef: "Indian Pharmacopoeia (IP) Monograph / Botanical Fingerprint",
      },
      ipAndTkdlRisks: {
        patentability: "High potential for composition-of-matter (specific fraction) and process patents.",
        tkdlOverlap: "May overcome Section 3(p) if significant purification, novel synergistic ratio, or unexpected efficacy is proven.",
        keyRisks: [
          "Stringent clinical trial burden comparable to synthetic pharmaceuticals",
          "Need for validated chemical markers and batch-to-batch repeatability",
        ],
      },
      recommendedActions: [
        "Conduct complete phytochemical profiling and multi-marker HPLC standardization",
        "Prepare Investigational New Drug (IND) dossier for CDSCO Subject Expert Committee (SEC)",
        "Obtain Form III NBA clearance prior to filing international patent applications",
      ],
      evidenceSources: [
        {
          title: "Drugs and Cosmetics Rules, 1945",
          section: "Rule 122E",
          description: "Regulatory definitions and approval standards for Phytopharmaceutical drugs in India",
        },
        {
          title: "CDSCO Guidance on Phytopharmaceuticals",
          section: "Gazette Notification G.S.R. 918(E)",
          description: "Checklist for chemistry, manufacturing, and clinical trial evidence",
        },
      ],
    };
  }

  if (isFoodOrDietary && !claims.includes("cure") && !claims.includes("treat disease")) {
    return {
      category: "Ayurveda Aahar (FSSAI Regulated)",
      categoryCode: "ayurveda-aahar",
      confidence: "High",
      confidenceScore: 89,
      summary:
        "Food or dietary supplement prepared in accordance with recipes or ingredients specified in authoritative Ayurvedic books for dietary/wellness use.",
      statutoryBasis: "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022",
      regulatoryPathway: {
        authority: "Food Safety and Standards Authority of India (FSSAI)",
        licenseType: "FSSAI Central / State Manufacturing License (Ayurveda Aahar Category)",
        trialRequirements: [
          "Heavy metals, pesticide residues, and aflatoxin contaminant testing",
          "Evidence of inclusion in Schedule A authoritative books",
          "No synthetic vitamins/minerals fortification permitted",
        ],
        standardsRef: "FSSAI Ayurveda Aahar Schedule A & Food Safety Standards",
      },
      ipAndTkdlRisks: {
        patentability: "Generally non-patentable under Section 3(p) as traditional knowledge formulation.",
        tkdlOverlap: "High overlap with traditional food recipes and dietary rasayanas.",
        keyRisks: [
          "Strict prohibition against therapeutic or disease-curing medicinal claims on packaging",
          "Mandatory display of the official Ayurveda Aahar logo and advisory statements",
        ],
      },
      recommendedActions: [
        "Align product labelling with FSSAI Ayurveda Aahar Regulations 2022",
        "Ensure all ingredients originate from authoritative books in Schedule A",
        "Apply for FSSAI endorsement with contaminant testing reports (NABL accredited)",
      ],
      evidenceSources: [
        {
          title: "Food Safety and Standards (Ayurveda Aahar) Regulations, 2022",
          section: "Regulation 3 & 4",
          description: "Standards and permitted ingredients for Ayurveda Aahar products in India",
        },
        {
          title: "Patents Act, 1970",
          section: "Section 3(p)",
          description: "Exclusion of traditional knowledge and known food preparations from patentability",
        },
      ],
    };
  }

  if (isCosmetic) {
    return {
      category: "Ayurvedic Cosmetic (ASU Topical)",
      categoryCode: "ayurvedic-cosmetic",
      confidence: "High",
      confidenceScore: 88,
      summary:
        "Topical Ayurvedic preparation manufactured using ASU ingredients intended for cleansing, beautifying, or enhancing physical appearance.",
      statutoryBasis: "Drugs and Cosmetics Act, 1940 — Section 3(aa) & Form 32 License",
      regulatoryPathway: {
        authority: "State AYUSH Licensing Authority / Drug Controller",
        licenseType: "Form 32 ASU Cosmetic Manufacturing License",
        trialRequirements: [
          "Skin irritation and patch testing safety documentation",
          "Microbial contamination and heavy metal limits compliance",
          "Finished product shelf-life and stability data",
        ],
        standardsRef: "Ayurvedic Pharmacopoeia of India (API) Part I & II",
      },
      ipAndTkdlRisks: {
        patentability: "Novel cosmetic delivery systems (e.g. micro-emulsions, herbal matrices) can be patented.",
        tkdlOverlap: "Direct topical herbs (e.g. Neem, Turmeric, Kumkumadi) are documented in TKDL.",
        keyRisks: [
          "Cannot claim treatment of skin diseases (e.g. eczema, psoriasis) without a full drug license",
          "Must clearly distinguish cosmetic aesthetics from therapeutic efficacy",
        ],
      },
      recommendedActions: [
        "Verify that all herbal extracts are documented in authoritative ASU texts",
        "Conduct skin safety and microbial bio-burden analysis",
        "Submit Form 32 dossier to the State AYUSH Licensing Authority",
      ],
      evidenceSources: [
        {
          title: "Drugs and Cosmetics Act, 1940",
          section: "Section 3(aa)",
          description: "Definition of cosmetics and topical preparations",
        },
        {
          title: "Drugs and Cosmetics Rules, 1945",
          section: "Schedule M-II",
          description: "Good Manufacturing Practices (GMP) for cosmetic preparations",
        },
      ],
    };
  }

  if (isClassical && !isProprietaryNovel) {
    return {
      category: "Classical Ayurvedic Medicine (Schedule 1 ASU)",
      categoryCode: "classical-asu",
      confidence: "High",
      confidenceScore: 95,
      summary:
        "Shastriya formulation manufactured strictly in accordance with authoritative classical texts listed in the First Schedule of the Drugs & Cosmetics Act, 1940.",
      statutoryBasis: "Drugs and Cosmetics Act, 1940 — Section 3(a) (Classical ASU)",
      regulatoryPathway: {
        authority: "State AYUSH Licensing Authority",
        licenseType: "Form 25D ASU Manufacturing License",
        trialRequirements: [
          "Textual citation from First Schedule authoritative books (e.g. AFI, Charaka, Sushruta)",
          "No independent clinical safety trial required under Rule 158B for exact classical compositions",
          "Heavy metals, microbial load, and physicochemical standardization tests",
        ],
        standardsRef: "Ayurvedic Pharmacopoeia of India (API) & Ayurvedic Formulary of India (AFI)",
      },
      ipAndTkdlRisks: {
        patentability: "Strictly non-patentable under Section 3(p) as traditional knowledge.",
        tkdlOverlap: "100% overlap with prior-art documented in the Traditional Knowledge Digital Library (TKDL).",
        keyRisks: [
          "Cannot claim exclusive patent rights or brand proprietary monopoly over the classical recipe",
          "Must adhere strictly to standard classical manufacturing processes without unauthorized additives",
        ],
      },
      recommendedActions: [
        "Cite the exact authoritative text edition, chapter, and shloka in your license application",
        "Implement Ayurvedic GMP (Schedule T) compliance in manufacturing",
        "Establish brand differentiation through trademark registration rather than patent filings",
      ],
      evidenceSources: [
        {
          title: "Drugs and Cosmetics Act, 1940",
          section: "First Schedule & Section 3(a)",
          description: "Authoritative texts for classical Ayurvedic, Siddha, and Unani medicines",
        },
        {
          title: "Indian Patent Act, 1970",
          section: "Section 3(p)",
          description: "Inventions relating to traditional knowledge are not patentable",
        },
      ],
    };
  }

  // Default: Proprietary Ayurvedic Medicine
  return {
    category: "Proprietary Ayurvedic Medicine (ASU Patent & Proprietary)",
    categoryCode: "proprietary-asu",
    confidence: "High",
    confidenceScore: 91,
    summary:
      "Formulation containing ingredients mentioned in authoritative Ayurvedic texts, but whose specific recipe, dosage form, or standardized extract ratio is proprietary.",
    statutoryBasis: "Drugs and Cosmetics Act, 1940 — Section 3(h) & Rule 158B",
    regulatoryPathway: {
      authority: "State AYUSH Licensing Authority",
      licenseType: "Form 25D ASU Patent & Proprietary Manufacturing License",
      trialRequirements: [
        "Safety and efficacy proof under Rule 158B (textual correlation or pilot clinical trials)",
        "Accelerated and real-time stability studies",
        "Standardization of raw botanicals as per Ayurvedic Pharmacopoeia of India (API)",
      ],
      standardsRef: "Ayurvedic Pharmacopoeia of India (API) & Rule 158B Evidence Guidelines",
    },
    ipAndTkdlRisks: {
      patentability: "Patentable only if unexpected therapeutic synergy (Section 3(d)) or a novel extraction/delivery process is established.",
      tkdlOverlap: "Individual ingredients exist in TKDL; combination novelty must be substantiated.",
      keyRisks: [
        "Section 3(p) objections by Indian Patent Office (IPO) regarding traditional knowledge aggregation",
        "Rule 158B proof of safety required if novel excipients or high-ratio extracts are used",
      ],
    },
    recommendedActions: [
      "Prepare Rule 158B evidence dossier documenting rationale and safety for each active botanical",
      "Perform combination synergy assays (e.g. isobologram) before filing any patent application",
      "Apply for Form 25D ASU license with State AYUSH Licensing Authority",
    ],
    evidenceSources: [
      {
        title: "Drugs and Cosmetics Rules, 1945",
        section: "Rule 158B",
        description: "Evidence required for licensing of Patent or Proprietary ASU medicines",
      },
      {
        title: "Indian Patent Act, 1970",
        section: "Section 3(d) and Section 3(p)",
        description: "Statutory hurdles for Ayurvedic proprietary formulations and efficacy enhancement",
      },
    ],
  };
}

async function callGeminiClassification(
  data: {
    productName: string;
    ingredients: string;
    dosageForm?: string;
    preparationMethod?: string;
    intendedUse?: string;
    claims?: string;
    targetMarket?: string;
  },
  fallback: ClassificationPayload,
): Promise<ClassificationPayload> {
  try {
    const prompt = [
      "Perform a comprehensive regulatory and intellectual property classification for the following Ayurvedic / Herbal innovation under both National (Indian) and International legal standards.",
      "Input Data:",
      `- Product Name: ${data.productName}`,
      `- Ingredients: ${data.ingredients}`,
      `- Dosage Form: ${data.dosageForm ?? "Not specified"}`,
      `- Preparation / Extraction Method: ${data.preparationMethod ?? "Not specified"}`,
      `- Intended Use: ${data.intendedUse ?? "Not specified"}`,
      `- Claims: ${data.claims ?? "Not specified"}`,
      `- Target Market: ${data.targetMarket ?? "India (AYUSH / FSSAI) & Global (WIPO / US / EU)"}`,
      "",
      "Required Analysis Depth:",
      "1. Determine exact statutory category under Drugs & Cosmetics Rules 1945 (Classical ASU vs Proprietary Rule 158B vs Phytopharmaceutical Rule 122E vs FSSAI Ayurveda Aahar 2022 vs Cosmetic).",
      "2. Provide concrete regulatory licensing pathway (State AYUSH Form 25D, CDSCO Form 44, Central FSSAI License, or SBB intimation).",
      "3. Evaluate Patentability & Section 3(p)/3(d) hurdles, Traditional Knowledge (TKDL) citations, and international patent eligibility (USPTO 35 U.S.C. 101/103 / EPO EPC Art 52/54/56 / Google Patents prior-art classification IPC A61K36/00).",
      "4. Specify exact trial/safety documentation required, clear actionable recommendations, and statutory evidence citations.",
      "",
      "Return a strict JSON object matching this schema exactly without markdown formatting:",
      "{",
      '  "category": "string (e.g. Proprietary Ayurvedic Medicine | Classical Ayurvedic Medicine | Ayurveda Aahar | Phytopharmaceutical Drug | Ayurvedic Cosmetic)",',
      '  "categoryCode": "string (proprietary-asu | classical-asu | ayurveda-aahar | phytopharmaceutical | ayurvedic-cosmetic)",',
      '  "confidence": "string (High | Moderate | Low)",',
      '  "confidenceScore": number (0-100),',
      '  "summary": "string (authoritative 2-sentence regulatory determination)",',
      '  "statutoryBasis": "string (exact primary statute, section, and rule)",',
      '  "regulatoryPathway": {',
      '    "authority": "string (e.g. State AYUSH Licensing Authority / CDSCO / FSSAI)",',
      '    "licenseType": "string (e.g. Form 25D ASU License / Form 44 / FSSAI Central License)",',
      '    "trialRequirements": ["string"],',
      '    "standardsRef": "string"',
      "  },",
      '  "ipAndTkdlRisks": {',
      '    "patentability": "string (detailed Section 3(p)/3(d) & international patent eligibility evaluation)",',
      '    "tkdlOverlap": "string (prior art and TKDL database status)",',
      '    "keyRisks": ["string"]',
      "  },",
      '  "recommendedActions": ["string"],',
      '  "evidenceSources": [',
      '    { "title": "string", "section": "string", "description": "string" }',
      "  ]",
      "}",
    ].join("\n");

    const systemInstruction =
      "You are IP-SAKTI, Senior Patent Counsel and Ayurvedic Regulatory Intelligence Specialist. " +
      "You operate with deep, comprehensive expertise in the Drugs & Cosmetics Act 1940, Rule 158B, Rule 122E, FSSAI Ayurveda Aahar Regulations 2022, Biological Diversity Act 2002/2023, Indian Patents Act 1970 (Section 3(p), 3(d), 3(e), 2(1)(j)), and International Patent Law (WIPO PCT, USPTO 35 U.S.C. 101/102/103, EPO EPC Art 52/54/56, and Google Patents prior-art classification IPC A61K36/00). " +
      "Never mention 'Gemini' or generic AI disclaimers. Return only valid JSON.";

    const rawText = await callGemini({
      prompt,
      systemInstruction,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1400,
        responseMimeType: "application/json",
      },
    });

    if (!rawText) return fallback;

    const cleanedText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleanedText) as ClassificationPayload;
    if (parsed.category && parsed.regulatoryPathway && parsed.ipAndTkdlRisks) {
      return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

router.post("/mobile/classify", async (req, res) => {
  const parsedRequest = MobileClassifyBody.safeParse(req.body);
  if (!parsedRequest.success) {
    res.status(400).json({ message: "Product name and ingredients are required for classification." });
    return;
  }

  const { productName, ingredients, dosageForm, preparationMethod, intendedUse, claims, targetMarket, clientId, projectId } =
    parsedRequest.data;

  try {
    const fallbackResult = evaluateRegulatoryClassification({
      productName,
      ingredients,
      dosageForm,
      preparationMethod,
      intendedUse,
      claims,
      targetMarket,
    });

    const finalResult = await callGeminiClassification(
      {
        productName,
        ingredients,
        dosageForm,
        preparationMethod,
        intendedUse,
        claims,
        targetMarket,
      },
      fallbackResult,
    );

    // Save to research memory if clientId is supplied
    if (clientId) {
      try {
        const user = await getOrCreateResearchUser(clientId);
        let project = projectId
          ? await findResearchProject(projectId, user.id)
          : await getMostRecentProject(user.id);

        if (!project) {
          project = await createResearchProject(
            user.id,
            productName,
            `Product classification for ${productName} (${finalResult.category})`,
          );
        }

        const session = await getOrCreateResearchSession(project.id);
        await saveResearchHistory(
          project.id,
          session.id,
          `Classify: ${productName} (${ingredients})`,
          `Category: ${finalResult.category}\nStatutory Basis: ${finalResult.statutoryBasis}\nSummary: ${finalResult.summary}`,
        );

        await saveResearchMemory(
          project.id,
          `Classification: ${productName}`,
          `${finalResult.category}: ${finalResult.summary}`,
          ingredients.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean),
          finalResult.evidenceSources.map((s) => ({ title: s.title, reference: s.section })),
        );
      } catch (err) {
        req.log.warn({ err }, "Could not record classification in research store");
      }
    }

    const validatedResponse = MobileClassifyResponse.parse(finalResult);
    res.json(validatedResponse);
  } catch (error) {
    req.log.error({ err: error }, "Product classification failed");
    res.status(502).json({ message: "The product classification service is temporarily unavailable." });
  }
});

export default router;
