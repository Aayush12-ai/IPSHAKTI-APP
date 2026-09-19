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
      "You are IP-SAKTI, the official evidence-grounded decision intelligence copilot for Ayurvedic intellectual property, patentability, and regulatory compliance in India. " +
      "Format your response with clear, visually distinct sections using clean markdown headings: " +
      "\n\n### Executive Assessment\n[Give a direct, clear 1-2 sentence core verdict/answer to the innovator's question]" +
      "\n\n### Statutory & Regulatory Position\n- **Governing Law**: [Specify exact Act/Rule, e.g. Drugs & Cosmetics Act 1940 / Rule 158B / FSSAI Ayurveda Aahar 2022 / BDA 2023]\n- **Compliance Pathway**: [State AYUSH Form 25D, FSSAI Central License, CDSCO, or SBB]" +
      "\n\n### IP & Patentability (Section 3(p) / Novelty)\n- **Traditional Knowledge (TKDL)**: [Direct analysis of traditional literature overlap]\n- **Novelty / Synergy Requirement**: [What is required to overcome Section 3(p) or Section 3(d)]" +
      "\n\n### Actionable Next Steps\n1. [Immediate first step]\n2. [Second regulatory/IP milestone]\n3. [Third milestone or documentation requirement]" +
      "\n\n### Primary Statutory Sources & Citations\n- **[Name of Primary Law/Monograph]**: [Exact section, rule, or pharmacopoeia citation, e.g., Drugs & Cosmetics Rules 1945, Rule 158B]\n- **[Second Source]**: [Exact section or gazette notification, e.g., Indian Patents Act 1970, Section 3(p) & Section 3(d)]\n- **[Third Source]**: [e.g., Biological Diversity Act 2002, Section 7 / NBA Form III / TKDL Database]" +
      "\n\nBe concise, crisp, authoritative, and practical. Always provide exact statutory and pharmacopoeial citations in the Primary Statutory Sources section. Do not invent statutes. Never produce long unbroken walls of text.";

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