import { Router, type IRouter } from "express";
import {
  MobileAbsCheckBody,
  MobileAbsCheckResponse,
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

const router: IRouter = Router();

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

type AbsPayload = {
  absStatus: string;
  statusTitle: string;
  confidence: string;
  summary: string;
  statutorySections: string[];
  benefitSharingEstimate: string;
  approvalForms: string[];
  keyObligations: string[];
  exemptionsApplicable: string[];
  patentClearanceAdvice: string;
  stepByStepRoadmap: string[];
  evidenceSources: Array<{
    title: string;
    section: string;
    description: string;
  }>;
};

function evaluateAbsObligations(data: {
  entityType: string;
  bioResources: string;
  sourcingType: string;
  activityType: string;
  jurisdiction?: string;
}): AbsPayload {
  const entity = data.entityType.toLowerCase();
  const sourcing = data.sourcingType.toLowerCase();
  const activity = data.activityType.toLowerCase();
  const bio = data.bioResources.toLowerCase();

  const isForeign = entity.includes("foreign");
  const isVaidya = entity.includes("vaidya") || entity.includes("healer") || entity.includes("practitioner");
  const isIndianCompany = entity.includes("indian-company") || entity.includes("company");
  const isIndianIndividual = entity.includes("individual");

  const isPatent = activity.includes("patent") || activity.includes("ipr");
  const isCommercial = activity.includes("commercial");
  const isExport = activity.includes("export");
  const isResearch = activity.includes("research");

  const isCultivated = sourcing.includes("cultivated");
  const isNtc = sourcing.includes("normally-traded") || sourcing.includes("commodity");
  const isWild = sourcing.includes("wild");
  const isImported = sourcing.includes("imported");

  // Rule 1: Patent / IPR Application
  if (isPatent) {
    return {
      absStatus: "NBA_APPROVAL_REQUIRED",
      statusTitle: "National Biodiversity Authority (NBA) Prior Approval Required (Form III)",
      confidence: "High",
      summary:
        "Under Section 6 of the Biological Diversity Act, 2002, applying for an Intellectual Property Right (patent) in or outside India based on Indian biological resources requires mandatory Form III clearance from the NBA before the patent is granted.",
      statutorySections: [
        "Biological Diversity Act, 2002 — Section 6(1) (IPR Application)",
        "Biological Diversity Rules, 2004 — Rule 18 (Application for IPR)",
        "Guidelines on Access and Benefit Sharing, 2014 — Regulation 8",
      ],
      benefitSharingEstimate:
        "Benefit sharing fee of 0.2% to 0.5% of commercial sales or 2.0% to 5.0% of royalty/licensing fee upon commercialization.",
      approvalForms: ["NBA Form III (Application for seeking IPR approval)"],
      keyObligations: [
        "Submit Form III application to the National Biodiversity Authority before the patent is granted",
        "Disclose geographic origin and source of biological material in the patent specification as per Section 10(4)(d)(ii) of the Indian Patents Act",
        "Sign the mandatory Benefit Sharing Agreement with NBA prior to commercial exploitation",
      ],
      exemptionsApplicable: [
        "No exemption applies for patent/IPR filings regardless of whether the applicant is an Indian citizen or company",
      ],
      patentClearanceAdvice:
        "You may file the provisional/complete patent application first at the Indian Patent Office, but you MUST file Form III with the NBA immediately and receive approval before the patent grant order is issued.",
      stepByStepRoadmap: [
        "Step 1: Document precise botanical names, parts used, and village/district source location.",
        "Step 2: Submit Form III online via the NBA ABS e-filing portal (absefiling.nic.in).",
        "Step 3: Respond to NBA Expert Committee queries and agree to standard benefit sharing terms.",
        "Step 4: Receive NBA clearance certificate and submit a certified copy to the Patent Controller.",
      ],
      evidenceSources: [
        {
          title: "Biological Diversity Act, 2002",
          section: "Section 6",
          description: "Prior approval of National Biodiversity Authority for intellectual property rights application",
        },
        {
          title: "Patents Act, 1970",
          section: "Section 10(4)(d)(ii)",
          description: "Mandatory disclosure of source and geographical origin of biological material in patent specifications",
        },
      ],
    };
  }

  // Rule 2: Foreign Entity or Foreign Participation / Equity
  if (isForeign) {
    return {
      absStatus: "NBA_APPROVAL_REQUIRED",
      statusTitle: "NBA Form I Prior Approval Required (Section 3)",
      confidence: "High",
      summary:
        "Foreign entities, foreign citizens, or Indian entities having non-Indian participation in share capital or management must obtain prior approval from the National Biodiversity Authority under Section 3 before accessing any Indian biological resource.",
      statutorySections: [
        "Biological Diversity Act, 2002 — Section 3 (Access to Biological Resources by Non-Indians)",
        "Biological Diversity (Amendment) Act, 2023 — Section 3 Revision",
        "Guidelines on Access and Benefit Sharing, 2014 — Regulation 2 & 3",
      ],
      benefitSharingEstimate:
        "Upfront access fee + 0.1% to 0.5% of ex-factory sale price (or 3.0% to 5.0% of purchase price of bio-resource).",
      approvalForms: ["NBA Form I (Access to biological resources for commercial/research use)"],
      keyObligations: [
        "Apply to NBA via Form I before procuring or processing any Indian raw herbal material",
        "Obtain Prior Informed Consent (PIC) and execute Mutually Agreed Terms (MAT) with the NBA",
        "Deposit prescribed benefit-sharing levy into the National Biodiversity Fund",
      ],
      exemptionsApplicable: [
        "Normally Traded Commodities (NTC) under Section 40 (only if traded purely as commercial commodities and not for R&D/IP)",
      ],
      patentClearanceAdvice:
        "Foreign entities face strict scrutiny. Ensure Form I approval is active before initiating formulation manufacturing or filing derivative IP.",
      stepByStepRoadmap: [
        "Step 1: Register on the NBA ABS portal as a Section 3 applicant.",
        "Step 2: Submit Form I with full bio-resource quantity projections and supplier traceability.",
        "Step 3: Execute the Benefit Sharing Agreement with NBA.",
        "Step 4: Maintain batch procurement logs for annual compliance audits.",
      ],
      evidenceSources: [
        {
          title: "Biological Diversity Act, 2002",
          section: "Section 3",
          description: "Certain persons and corporations not to undertake biodiversity-related activities without NBA approval",
        },
        {
          title: "NBA ABS Guidelines, 2014",
          section: "Regulations 2-4",
          description: "Computation formulas for access and benefit sharing obligations",
        },
      ],
    };
  }

  // Rule 3: Registered AYUSH Healer / Vaidya Exemption
  if (isVaidya && !isPatent) {
    return {
      absStatus: "EXEMPT",
      statusTitle: "Exempt — Registered AYUSH Practitioner (Section 7 Proviso)",
      confidence: "High",
      summary:
        "Registered Ayurvedic practitioners, Vaidyas, Hakims, and local traditional healers who practice and prepare Ayurvedic formulations for their patients are fully EXEMPT from SBB prior intimation and ABS levies.",
      statutorySections: [
        "Biological Diversity Act, 2002 — Section 7 Proviso",
        "Biological Diversity (Amendment) Act, 2023 — Section 7(2) Codified AYUSH Exemption",
      ],
      benefitSharingEstimate: "Exempt — No benefit sharing fee payable (0%).",
      approvalForms: ["No NBA / SBB approval form required for clinical practice formulations"],
      keyObligations: [
        "Maintain proof of state or national AYUSH board registration as a qualified practitioner",
        "Ensure formulations are prepared for patient dispensation in direct clinical practice",
      ],
      exemptionsApplicable: [
        "AYUSH Practitioner Statutory Exemption under Section 7 proviso",
        "Codified traditional medical knowledge exemption under the 2023 Amendment Act",
      ],
      patentClearanceAdvice:
        "The exemption applies to traditional medical practice and formulation dispensation. If you decide to file a patent or industrial mass-scale manufacturing license, ABS obligations will be triggered.",
      stepByStepRoadmap: [
        "Step 1: Verify that state Ayurvedic council registration is current.",
        "Step 2: Procure authentic raw botanicals with quality certificates of analysis (COA).",
        "Step 3: Keep dispensing records in clinical practice logs.",
      ],
      evidenceSources: [
        {
          title: "Biological Diversity (Amendment) Act, 2023",
          section: "Section 7 Proviso",
          description: "Statutory exemption for registered AYUSH practitioners and codified traditional knowledge",
        },
      ],
    };
  }

  // Rule 4: Normally Traded Commodities (NTC) under Section 40
  if (isNtc && !isPatent) {
    return {
      absStatus: "EXEMPT",
      statusTitle: "Exempt — Normally Traded Commodity (Section 40)",
      confidence: "High",
      summary:
        "The raw biological resource is notified under Section 40 of the Biological Diversity Act as a Normally Traded Commodity (NTC) traded through commercial mandis for general trade and manufacturing.",
      statutorySections: [
        "Biological Diversity Act, 2002 — Section 40 (Notification of Normally Traded Commodities)",
        "Ministry of Environment, Forest and Climate Change Gazette Notification S.O. 1352(E)",
      ],
      benefitSharingEstimate: "Exempt — Zero ABS fee under Section 40 notification.",
      approvalForms: ["No ABS approval form required for notified NTC materials"],
      keyObligations: [
        "Procure materials through regular commercial agricultural commodity channels / mandis with GST invoices",
        "Do not conduct non-commodity extraction for novel IP filings without Form III",
      ],
      exemptionsApplicable: [
        "Section 40 NTC Exemption (over 400+ notified Indian agricultural and medicinal plant species)",
      ],
      patentClearanceAdvice:
        "NTC exemption only covers commercial trade and classical manufacturing. Using the plant for patent-seeking research removes the exemption.",
      stepByStepRoadmap: [
        "Step 1: Verify the botanical name against the 400+ notified Section 40 NTC list.",
        "Step 2: Maintain mandi purchase receipts and GST invoices proving commodity sourcing.",
      ],
      evidenceSources: [
        {
          title: "Biological Diversity Act, 2002",
          section: "Section 40",
          description: "Power of Central Government to exempt certain biological resources as normally traded commodities",
        },
      ],
    };
  }

  // Rule 5: Cultivated Bio-resources (Indian Entity)
  if (isCultivated && !isPatent) {
    return {
      absStatus: "EXEMPT",
      statusTitle: "Exempt / Streamlined — Cultivated Medicinal Plants (2023 Amendment)",
      confidence: "High",
      summary:
        "Under the Biological Diversity (Amendment) Act 2023, cultivated medicinal plants sourced with traceability from registered farmers or agricultural land are exempt from SBB ABS levies.",
      statutorySections: [
        "Biological Diversity (Amendment) Act, 2023 — Cultivated Bio-resource Exemption",
        "National Medicinal Plants Board (NMPB) Good Agricultural and Collection Practices (GACP)",
      ],
      benefitSharingEstimate: "Exempt from ABS benefit sharing levies with valid cultivation certificates.",
      approvalForms: ["Cultivation Origin / Traceability Certificate (from farmer / district agriculture office)"],
      keyObligations: [
        "Maintain certificate of cultivation from the farmer or State Agriculture / Forest department",
        "Preserve land revenue / farmer purchase invoices demonstrating cultivated origin rather than wild collection",
      ],
      exemptionsApplicable: [
        "2023 Biodiversity Amendment Act Cultivated Produce Exemption",
      ],
      patentClearanceAdvice:
        "Even for cultivated plants, Section 6 patent filings still require NBA Form III clearance.",
      stepByStepRoadmap: [
        "Step 1: Secure farmer cultivation agreement or mandi cultivation traceability documents.",
        "Step 2: Maintain Good Agricultural and Collection Practices (GACP) records.",
        "Step 3: Present cultivation origin certificate during State AYUSH GMP inspections.",
      ],
      evidenceSources: [
        {
          title: "Biological Diversity (Amendment) Act, 2023",
          section: "Section 7 Amendment",
          description: "Exemption for cultivated medicinal plants from State Biodiversity Board prior intimation",
        },
      ],
    };
  }

  // Rule 6: Indian Company / Entity Commercializing Wild Bio-resources
  return {
    absStatus: "SBB_INTIMATION_REQUIRED",
    statusTitle: "State Biodiversity Board (SBB) Prior Intimation Required (Section 7)",
    confidence: "High",
    summary:
      "As an Indian commercial entity accessing wild-harvested biological resources in India for commercial manufacturing, you must submit prior intimation to the concerned State Biodiversity Board (SBB) under Section 7 of the BDA 2002.",
    statutorySections: [
      "Biological Diversity Act, 2002 — Section 7 (Prior Intimation to State Biodiversity Board)",
      "State Biodiversity Rules (e.g. Maharashtra, Kerala, MP State Biodiversity Rules)",
      "Guidelines on Access and Benefit Sharing, 2014 — Regulation 3 & 4",
    ],
    benefitSharingEstimate:
      "0.1% to 0.3% of ex-factory gross sales (0.1% for sales up to ₹1 Crore, 0.2% for ₹1–3 Crore, 0.3% for > ₹3 Crore) or 3.0%–5.0% of purchase price of the bio-resource.",
    approvalForms: ["Form I (SBB Prior Intimation for Commercial Utilization)"],
    keyObligations: [
      "File Form I prior intimation with the State Biodiversity Board in the state where bio-resources are collected",
      "Pay annual benefit sharing fee based on ex-factory sales to the State Biodiversity Fund",
      "Ensure sustainable harvesting compliance in coordination with local Biodiversity Management Committees (BMCs)",
    ],
    exemptionsApplicable: [
      "Exemption applies only if materials are certified as cultivated or covered under Section 40 NTC notification",
    ],
    patentClearanceAdvice:
      "SBB intimation covers commercial manufacturing. If you file a patent based on this formulation, you will additionally need NBA Form III clearance.",
    stepByStepRoadmap: [
      "Step 1: Identify the State Biodiversity Board(s) governing your harvesting districts.",
      "Step 2: Submit Form I intimation with estimated annual raw botanical requirements.",
      "Step 3: Execute the Benefit Sharing Agreement with the SBB.",
      "Step 4: Deposit the benefit sharing fee annually based on ex-factory turnover.",
    ],
    evidenceSources: [
      {
        title: "Biological Diversity Act, 2002",
        section: "Section 7",
        description: "Prior intimation to State Biodiversity Board for commercial utilization of biological resources by Indian entities",
      },
      {
        title: "Guidelines on Access and Benefit Sharing, 2014",
        section: "Regulations 3-5",
        description: "Standard percentage rates for benefit sharing payable to State Biodiversity Boards",
      },
    ],
  };
}

async function callGeminiAbsCheck(
  data: {
    entityType: string;
    bioResources: string;
    sourcingType: string;
    activityType: string;
    jurisdiction?: string;
  },
  fallback: AbsPayload,
): Promise<AbsPayload> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback;

  try {
    const prompt = [
      "Perform a high-accuracy Access and Benefit Sharing (ABS) legal and regulatory check under the Indian Biological Diversity Act 2002 and 2023 Amendments.",
      "Input Data:",
      `- Entity Type: ${data.entityType}`,
      `- Biological Resources / Herbs: ${data.bioResources}`,
      `- Sourcing Type: ${data.sourcingType}`,
      `- Activity Type: ${data.activityType}`,
      `- Jurisdiction: ${data.jurisdiction ?? "India"}`,
      "",
      "Provide a structured JSON response matching this exact schema:",
      "{",
      '  "absStatus": "string (EXEMPT | SBB_INTIMATION_REQUIRED | NBA_APPROVAL_REQUIRED | PROHIBITED_OR_RESTRICTED)",',
      '  "statusTitle": "string",',
      '  "confidence": "string (High | Moderate)",',
      '  "summary": "string (2-3 sentence precise legal finding)",',
      '  "statutorySections": ["string"],',
      '  "benefitSharingEstimate": "string",',
      '  "approvalForms": ["string"],',
      '  "keyObligations": ["string"],',
      '  "exemptionsApplicable": ["string"],',
      '  "patentClearanceAdvice": "string",',
      '  "stepByStepRoadmap": ["string"],',
      '  "evidenceSources": [',
      '    { "title": "string", "section": "string", "description": "string" }',
      "  ]",
      "}",
      "Return only valid raw JSON without markdown formatting.",
    ].join("\n");

    const upstreamResponse = await fetch(
      `${GEMINI_ENDPOINT}/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  "You are IP SAKTI's Biodiversity & ABS Compliance Specialist. " +
                  "Ground all answers in the Biological Diversity Act 2002, 2023 Amendment, Section 3/6/7/24/40, NBA Regulations 2014, and Nagoya Protocol. " +
                  "Distinguish clearly between foreign entity Section 3 approvals, Indian company Section 7 SBB intimations, Section 6 Form III patent clearances, and AYUSH healer Section 7 exemptions.",
              },
            ],
          },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1200,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!upstreamResponse.ok) return fallback;

    const resJson = (await upstreamResponse.json()) as GeminiResponse;
    const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!rawText) return fallback;

    const parsed = JSON.parse(rawText) as AbsPayload;
    if (parsed.absStatus && parsed.statutorySections && parsed.approvalForms) {
      return parsed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

router.post("/mobile/abs-check", async (req, res) => {
  const parsedRequest = MobileAbsCheckBody.safeParse(req.body);
  if (!parsedRequest.success) {
    res.status(400).json({ message: "Entity type, bio-resources, sourcing type, and activity type are required." });
    return;
  }

  const { entityType, bioResources, sourcingType, activityType, jurisdiction, clientId, projectId } =
    parsedRequest.data;

  try {
    const fallbackResult = evaluateAbsObligations({
      entityType,
      bioResources,
      sourcingType,
      activityType,
      jurisdiction,
    });

    const finalResult = await callGeminiAbsCheck(
      {
        entityType,
        bioResources,
        sourcingType,
        activityType,
        jurisdiction,
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
            `ABS Check: ${bioResources.slice(0, 40)}`,
            `Biodiversity compliance assessment for ${bioResources} (${finalResult.absStatus})`,
          );
        }

        const session = await getOrCreateResearchSession(project.id);
        await saveResearchHistory(
          project.id,
          session.id,
          `ABS Assessment: ${bioResources} (${entityType}, ${sourcingType}, ${activityType})`,
          `Status: ${finalResult.absStatus} - ${finalResult.statusTitle}\nSummary: ${finalResult.summary}\nBenefit Sharing: ${finalResult.benefitSharingEstimate}`,
        );

        await saveResearchMemory(
          project.id,
          `ABS Finding: ${bioResources.slice(0, 50)}`,
          `${finalResult.statusTitle}: ${finalResult.summary}`,
          bioResources.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean),
          finalResult.evidenceSources.map((s) => ({ title: s.title, reference: s.section })),
        );
      } catch (err) {
        req.log.warn({ err }, "Could not record ABS check in research store");
      }
    }

    const validatedResponse = MobileAbsCheckResponse.parse(finalResult);
    res.json(validatedResponse);
  } catch (error) {
    req.log.error({ err: error }, "ABS check failed");
    res.status(502).json({ message: "The ABS assessment service is temporarily unavailable." });
  }
});

export default router;
