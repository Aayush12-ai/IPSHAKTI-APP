import { Router, type IRouter } from "express";
import {
  MobileChatBody,
  MobileChatResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

router.post("/mobile/chat", async (req, res) => {
  const parsedRequest = MobileChatBody.safeParse(req.body);

  if (!parsedRequest.success) {
    res.status(400).json({ message: "A non-empty question is required." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    req.log.error("Gemini API key is not configured");
    res.status(503).json({ message: "The AI assistant is not configured." });
    return;
  }

  try {
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
                  "You are IP SAKTI, an evidence-grounded assistant for Ayurvedic intellectual property and regulatory questions in India. " +
                  "Give practical, concise guidance. Distinguish general information from legal advice, flag uncertainty, and recommend verification with qualified professionals when appropriate. " +
                  "Do not invent statutes, cases, sources, or citations. Answer the user's question directly.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: parsedRequest.data.question.trim() }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 800,
          },
        }),
      },
    );

    if (!upstreamResponse.ok) {
      const providerError = (await upstreamResponse.json().catch(() => null)) as {
        error?: { status?: unknown; message?: unknown };
      } | null;
      req.log.error(
        {
          status: upstreamResponse.status,
          providerStatus:
            typeof providerError?.error?.status === "string"
              ? providerError.error.status
              : undefined,
          providerMessage:
            typeof providerError?.error?.message === "string"
              ? providerError.error.message
              : undefined,
        },
        "Gemini request failed",
      );
      res.status(502).json({ message: "The AI assistant is temporarily unavailable." });
      return;
    }

    const data = (await upstreamResponse.json()) as GeminiResponse;
    const answer = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!answer) {
      req.log.error("Gemini returned no answer");
      res.status(502).json({ message: "The AI assistant returned no answer." });
      return;
    }

    const response = MobileChatResponse.parse({ answer });
    res.json(response);
  } catch (error) {
    req.log.error({ err: error }, "Unexpected Gemini request error");
    res.status(502).json({ message: "The AI assistant is temporarily unavailable." });
  }
});

export default router;