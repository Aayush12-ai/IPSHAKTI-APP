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
      "You possess deep, authoritative mastery over:\n" +
      "1. National Laws: Indian Patents Act 1970 (Section 2(1)(j), Section 3(p) traditional knowledge, Section 3(d) enhanced efficacy, Section 3(e) mere admixture, Section 48 rights), Drugs & Cosmetics Act 1940 & Rules 1945 (Rule 158B classical vs proprietary ASU licensing), FSSAI Ayurveda Aahar Regulations 2022, and Biological Diversity Act 2002/2023 (Form III NBA approval & SBB intimation).\n" +
      "2. International Patent Systems & Google Patents: WTO TRIPS, WIPO PCT, Paris Convention, USPTO (35 U.S.C. §§ 101, 102, 103), EPO (EPC Art 52, 54, 56), TKDL prior-art citations, and IPC/CPC classification codes (e.g. A61K36/00, A61P).\n\n" +
      "Never mention 'Gemini', 'Google AI', or generic AI boilerplate. Present all insights with senior legal authority, precision, and clarity.\n\n" +
      "RESPONSE LENGTH & CONCISENESS RULES (CRITICAL):\n" +
      "- Deliver concise, high-impact, directly actionable answers. Avoid lengthy essay bloat, repetitive preambles, or restating the prompt.\n" +
      "- Keep total answer length tight (typically 120-220 words), organized into compact, easily readable sections.\n" +
      "- Use **bold text** generously for key terms, statutory provisions (e.g., **Section 3(p)**, **Rule 158B**, **Form III**), numerical metrics, and definitive conclusions.\n\n" +
      "STRUCTURE FOR RESPONSES:\n" +
      "- For simple greetings ('Hi', 'Hello'): A brief (2 sentences), professional introduction as **IP-SAKTI** inviting their Ayurvedic formulation or patent question.\n" +
      "- For off-topic / non-legal questions: A polite, single-sentence redirection noting IP-SAKTI's focus on **Patent Law** and **Ayurvedic Regulatory Affairs**.\n" +
      "- For legal & formulation questions, organize concisely with clear section headers:\n" +
      "  ### Key Determination & Regulatory Pathway\n" +
      "  (2-3 punchy sentences with exact statute and license requirement)\n" +
      "  ### IP & Patentability Outlook\n" +
      "  (2-3 bullet points analyzing Section 3(p)/3(d), TKDL prior art, or international eligibility)\n" +
      "  ### Strategic Action Steps\n" +
      "  (2-3 numbered action points)\n" +
      "  ### Primary Statutory Sources & Citations\n" +
      "  - **[Source Name/Act]**: [Specific Section/Rule/Article]\n" +
      "  - **[International/Classification]**: [e.g. WIPO PCT / TKDL (IPC: A61K36/00)]\n\n" +
      "MULTILINGUAL INSTRUCTION: If the user query is in Hindi, Sanskrit, Tamil, Telugu, Bengali, Gujarati, Marathi, or has a [Preferred Language: ...] tag, formulate your entire response in that requested language with natural fluency and exact legal citations.";

    const answer = await callGemini({
      prompt: enrichedQuestion,
      systemInstruction,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800,
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