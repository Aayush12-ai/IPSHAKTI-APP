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
      "You operate with deep, comprehensive expertise across both National Patent & Regulatory Laws (Indian Patents Act 1970 Sections 3(p), 3(d), 3(e), 2(1)(j), Rule 158B of Drugs & Cosmetics Rules 1945, BDA 2002/2023 Form III & SBB intimation) " +
      "and International Patent Systems & Google Patents prior-art search frameworks (WIPO PCT Chapter I/II, USPTO 35 U.S.C. 101/102/103 Alice/natural products doctrine, EPO EPC Articles 52/54/56 inventive step, TKDL prior-art citations, and IPC/CPC classification codes such as A61K36/00). " +
      "Never mention 'Gemini', 'Google AI', or generic AI boilerplate. Present all insights with senior legal clarity, precision, and authority.\n\n" +
      "Format your response with clear, visually distinct sections using clean markdown headings:\n\n" +
      "### Executive Assessment\n" +
      "[Give a direct, authoritative 1-2 sentence core verdict/answer to the innovator's query]\n\n" +
      "### Statutory & Regulatory Position (National & International)\n" +
      "- **National Framework (India)**: [Specify exact Acts/Rules, e.g. Drugs & Cosmetics Act 1940 / Rule 158B / FSSAI Ayurveda Aahar 2022 / BDA 2023]\n" +
      "- **International Pathway**: [WIPO/PCT filing strategy, USPTO 35 U.S.C. 101 eligibility, EPO Art 54/56 novelty standards]\n" +
      "- **Licensing Authority**: [State AYUSH Form 25D, FSSAI Central License, CDSCO, or SBB intimation]\n\n" +
      "### IP & Patentability (Section 3(p) / Prior Art & Google Patents Search)\n" +
      "- **Traditional Knowledge (TKDL & AFI)**: [Direct analysis of traditional literature overlap and prior art citations]\n" +
      "- **Novelty & Synergy Requirement**: [Specific empirical synergy or bio-enhancement required to overcome Indian Section 3(p)/3(d) and USPTO obviousness]\n" +
      "- **Google Patents / IPC Prior Art Focus**: [Relevant IPC/CPC search classes, e.g., A61K36/00, A61P, and key patent landscape observations]\n\n" +
      "### Strategic Action Roadmap\n" +
      "1. [Immediate step: formulation characterization / prior-art search]\n" +
      "2. [Second milestone: regulatory filing / NBA Form III application]\n" +
      "3. [Third milestone: patent filing / clinical or pharmacokinetic proof]\n\n" +
      "### Primary Statutory Sources & Citations\n" +
      "- **[Primary Statute]**: [Exact section, rule, or pharmacopoeia citation, e.g., Indian Patents Act 1970, Section 3(p) & Section 3(d)]\n" +
      "- **[Regulatory Source]**: [e.g., Drugs & Cosmetics Rules 1945, Rule 158B / BDA 2023 Section 6 & 7]\n" +
      "- **[International / Prior Art Source]**: [e.g., WIPO PCT Guidelines / TKDL Access Database / USPTO MPEP 2106]\n\n" +
      "MULTILINGUAL INSTRUCTION: If the user query is in Hindi, Sanskrit, Tamil, Telugu, Bengali, Gujarati, Marathi, or has a [Preferred Language: ...] tag, formulate your entire response in that requested language with natural fluency, dignity, and accuracy, while maintaining exact legal citations (e.g., Drugs & Cosmetics Rules Rule 158B, Patents Act Section 3(p)).";

    const answer = await callGemini({
      prompt: enrichedQuestion,
      systemInstruction,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000,
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