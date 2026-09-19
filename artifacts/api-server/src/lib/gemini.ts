import { logger } from "./logger";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export function getGeminiApiKeys(): string[] {
  const raw = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEYS || "";
  if (!raw.trim()) return [];

  // Split by ||, comma, semicolon, or newline
  return raw
    .split(/\|\||,|;|\n/)
    .map((k) => k.trim().replace(/^['"]|['"]$/g, ""))
    .filter((k) => k.length > 5);
}

export type GeminiRequestOptions = {
  prompt?: string;
  contents?: Array<{ role?: string; parts: Array<{ text: string }> }>;
  systemInstruction?: string;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
  model?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export async function callGemini(options: GeminiRequestOptions): Promise<string | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    logger.warn("No valid GEMINI_API_KEY configured.");
    return null;
  }

  const model = options.model ?? process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
  const url = `${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:generateContent`;

  const requestBody: Record<string, unknown> = {
    contents: options.contents ?? [
      {
        role: "user",
        parts: [{ text: options.prompt ?? "" }],
      },
    ],
    generationConfig: options.generationConfig ?? {
      temperature: 0.1,
      maxOutputTokens: 1000,
    },
  };

  if (options.systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  let lastError: unknown = null;

  // Try each API key in order (Key 1 -> Fallback Key 2 -> ...)
  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    const keyPreview = apiKey.slice(0, 6) + "..." + apiKey.slice(-4);

    try {
      const response = await fetch(`${url}?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = (await response.json()) as GeminiResponse;
        const text = data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("")
          .trim();

        if (text) {
          if (i > 0) {
            logger.info({ keyIndex: i, keyPreview }, "Gemini fallback key succeeded");
          }
          return text;
        }
      } else {
        const errorText = await response.text().catch(() => "");
        logger.warn(
          { keyIndex: i, keyPreview, status: response.status, error: errorText.slice(0, 200) },
          "Gemini key failed or rate-limited; attempting fallback to next key...",
        );
      }
    } catch (err) {
      lastError = err;
      logger.warn({ keyIndex: i, keyPreview, err }, "Network error on Gemini key, trying next key...");
    }
  }

  logger.error({ totalKeys: keys.length, lastError }, "All Gemini API keys failed or exhausted.");
  return null;
}
