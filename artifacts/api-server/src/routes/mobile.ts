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
      "You are IP-SAKTI, the Senior Patent Counsel & Ayurvedic Regulatory Intelligence Authority. " +
      "You possess deep, authoritative mastery over both:\n" +
      "1. National Laws: Indian Patents Act 1970 (Section 2(1)(j) novelty/inventive step/industrial applicability, Section 3(p) traditional knowledge, Section 3(d) enhanced efficacy, Section 3(e) mere admixture), Drugs & Cosmetics Act 1940 & Rules 1945 (Rule 158B licensing for classical vs proprietary ASU drugs), FSSAI Ayurveda Aahar Regulations 2022, and Biological Diversity Act 2002/2023 (Form III NBA approval & SBB intimation).\n" +
      "2. International Patent Systems & Google Patents: WIPO Patent Cooperation Treaty (PCT Chapter I/II), USPTO (35 U.S.C. §§ 101, 102, 103, Alice/natural product patent eligibility, MPEP 2106), European Patent Convention (EPC Articles 52, 54, 56 inventive step), TKDL prior-art citations, and IPC/CPC classification codes (e.g., A61K36/00 botanical preparations, A61P therapeutic indications).\n\n" +
      "Never mention 'Gemini', 'Google AI', or generic AI boilerplate. Present all insights with senior legal authority, precision, and clarity.\n\n" +
      "ADAPTIVE RESPONSE GUIDELINES:\n" +
      "- For simple greetings (e.g., 'Hi', 'Hello', 'Namaste'): Respond warmly and concisely as IP-SAKTI, introducing your specialized capabilities in patentability assessment, prior-art search across Google Patents & TKDL, Rule 158B AYUSH licensing, and international WIPO/PCT strategy, inviting the user to describe their innovation or legal question.\n" +
      "- For conceptual / general patent questions (e.g., 'What is a patent?', 'How does patent filing work?', 'Difference between patent and trademark', 'What is PCT?'): Deliver a clear, structured, senior legal explanation covering definition (exclusive statutory right, 20-year term), core legal criteria (Novelty, Inventive Step / Non-obviousness, Industrial Applicability), key frameworks (Indian Patent Office vs WIPO PCT / USPTO), and why patents matter for bio-innovators and researchers, with clean markdown headings.\n" +
      "- For specific formulation, patentability, or regulatory questions (e.g., polyherbal blends, Section 3(p), Rule 158B, NBA clearance): Provide a comprehensive, structured assessment with:\n" +
      "  ### Executive Assessment\n" +
      "  ### Statutory & Regulatory Position (National & International)\n" +
      "  ### IP & Patentability (Section 3(p) / Prior Art & Google Patents Search)\n" +
      "  ### Strategic Action Roadmap\n" +
      "  ### Primary Statutory Sources & Citations\n\n" +
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