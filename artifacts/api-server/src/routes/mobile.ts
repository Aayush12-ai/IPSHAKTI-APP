import { Router, type IRouter } from "express";
import {
  MobileChatBody,
  MobileChatResponse,
} from "@workspace/api-zod";
import {
  createResearchProject,
  findResearchProject,
  getMostRecentProject,
  getOrCreateResearchSession,
  getOrCreateResearchUser,
  getResearchContext,
  saveResearchHistory,
} from "../lib/research-store";
import { callGemini, getGeminiApiKeys } from "../lib/gemini";

const router: IRouter = Router();

router.post("/mobile/chat", async (req, res) => {
  const parsedRequest = MobileChatBody.safeParse(req.body);

  if (!parsedRequest.success) {
    res.status(400).json({ message: "A non-empty question is required." });
    return;
  }

  const apiKeys = getGeminiApiKeys();
  if (apiKeys.length === 0) {
    req.log.error("No Gemini API keys configured");
    res.status(503).json({ message: "The AI assistant is not configured." });
    return;
  }

  try {
    const user = await getOrCreateResearchUser(parsedRequest.data.clientId);
    let project = parsedRequest.data.projectId
      ? await findResearchProject(parsedRequest.data.projectId, user.id)
      : await getMostRecentProject(user.id);

    if (!project) {
      project = await createResearchProject(
        user.id,
        "My Ayurvedic IP research",
        "Created from Ask AI. Continue this research from My Research.",
      );
    }

    const session = await getOrCreateResearchSession(
      project.id,
      parsedRequest.data.sessionId,
    );
    const context = await getResearchContext(project.id);
    const memoryContext = context.memories
      .map(
        (memory) =>
          `- ${memory.title}: ${memory.finding}\n  Entities: ${memory.entities.join(", ")}`,
      )
      .join("\n");
    const historyContext = context.history
      .map((item) => `- Question: ${item.question}\n  Answer: ${item.answer}`)
      .join("\n");
    const enrichedQuestion = [
      `Active research project: ${project.name}`,
      project.description ? `Project description: ${project.description}` : "",
      memoryContext ? `Saved research memory:\n${memoryContext}` : "",
      historyContext ? `Recent research history:\n${historyContext}` : "",
      `Current question: ${parsedRequest.data.question.trim()}`,
    ]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 24000);

    const systemInstruction =
      "You are IP-SAKTI, Senior Patent Counsel & Ayurvedic Regulatory Intelligence Authority. " +
      "You possess deep, authoritative mastery over both:\n" +
      "1. National Laws: Indian Patents Act 1970 (Section 2(1)(j) novelty/inventive step/industrial applicability, Section 3(p) traditional knowledge, Section 3(d) enhanced efficacy, Section 3(e) mere admixture, Section 48 rights of patentees), Drugs & Cosmetics Act 1940 & Rules 1945 (Rule 158B licensing for classical vs proprietary ASU drugs), FSSAI Ayurveda Aahar Regulations 2022, and Biological Diversity Act 2002/2023 (Form III NBA approval & SBB intimation).\n" +
      "2. International Patent Systems & Google Patents: WTO TRIPS Agreement (Articles 27 & 33, 20-year term), WIPO Patent Cooperation Treaty (PCT Chapter I/II & Article 33), Paris Convention (Article 4 priority rights), USPTO (35 U.S.C. §§ 101, 102, 103, Alice/natural product patent eligibility, MPEP 2106), European Patent Convention (EPC Articles 52, 54, 56 inventive step), TKDL prior-art citations, and IPC/CPC classification codes (e.g., A61K36/00 botanical preparations, A61P therapeutic indications).\n\n" +
      "Never mention 'Gemini', 'Google AI', or generic AI boilerplate. Present all insights with senior legal authority, precision, and clarity.\n\n" +
      "FORMATTING & BOLDING RULES:\n" +
      "- Use **bold text** generously for all critical terms, statutory sections (e.g., **Section 3(p)**, **Rule 158B**, **Form III**), numerical criteria (e.g., **20-year term**, **IC50 values**, **synergy ratio**), deadlines, and key legal conclusions so the reader can immediately scan essential takeaways.\n\n" +
      "CONTEXT-PROPORTIONAL LENGTH & DOMAIN GUIDELINES:\n" +
      "- For simple greetings (e.g., 'Hi', 'Hello', 'Namaste'): Respond with a brief (2-3 sentences), warm, professional introduction as **IP-SAKTI**, noting your specific legal scope in patentability assessments, Rule 158B licensing, and TKDL prior-art search, inviting the user to present their formulation or legal question.\n" +
      "- For completely random, off-topic, or non-legal queries: Politely state that IP-SAKTI is specialized exclusively in **Patent Law**, **Ayurvedic / ASU Regulatory Licensing**, **Biodiversity Clearance (NBA)**, and **Prior-Art Search**, and guide them on how to formulate an IP/regulatory inquiry.\n" +
      "- For conceptual / general patent questions (e.g., 'What is a patent?', 'Difference between patent and copyright'): Provide a clear, medium-length, structured explanation with **bold anchors** covering statutory definition, 3 core criteria (Novelty, Inventive Step, Industrial Utility), and statutory references.\n" +
      "- For complex formulation or regulatory inquiries (e.g., polyherbal synergy, Section 3(p) objections, clinical trial waivers): Deliver a full, rigorous multi-section assessment:\n" +
      "  ### Executive Assessment\n" +
      "  ### Statutory & Regulatory Position (National & International)\n" +
      "  ### IP & Patentability (Section 3(p) / Prior Art & Google Patents Search)\n" +
      "  ### Strategic Action Roadmap\n" +
      "  ### Primary Statutory Sources & Citations\n\n" +
      "MANDATORY CITATION REQUIREMENT:\n" +
      "For all informative and regulatory answers, conclude with the dedicated section:\n" +
      "### Primary Statutory Sources & Citations\n" +
      "- **[Source Name/Act]**: [Specific Section/Rule/Article]\n" +
      "- **[Regulatory/International Treaty]**: [e.g. WIPO PCT / Drugs & Cosmetics Rules 1945 Rule 158B / 35 U.S.C.]\n" +
      "- **[Prior Art / Classification Source]**: [e.g. Google Patents / TKDL (IPC: A61K36/00)]\n\n" +
      "MULTILINGUAL INSTRUCTION: If the user query is in Hindi, Sanskrit, Tamil, Telugu, Bengali, Gujarati, Marathi, or has a [Preferred Language: ...] tag, formulate your entire response in that requested language with natural fluency, dignity, and accuracy, while maintaining exact legal citations (e.g., Drugs & Cosmetics Rules Rule 158B, Patents Act Section 3(p)).";

    const answer = await callGemini({
      prompt: enrichedQuestion,
      systemInstruction,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1500,
      },
    });

    if (!answer) {
      req.log.error("Gemini returned no answer or all keys failed");
      res.status(502).json({ message: "The AI assistant is temporarily unavailable." });
      return;
    }

    const history = await saveResearchHistory(
      project.id,
      session.id,
      parsedRequest.data.question.trim(),
      answer,
    );
    const response = MobileChatResponse.parse({
      answer,
      projectId: project.id,
      sessionId: session.id,
      historyId: history.id,
    });
    res.json(response);
  } catch (error) {
    req.log.error({ err: error }, "Unexpected Gemini request error");
    res.status(502).json({ message: "The AI assistant is temporarily unavailable." });
  }
});

export default router;