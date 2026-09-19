import fs from "fs";
import path from "path";
import { logger } from "./logger";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

function readEnvFileValue(keyName: string): string {
  try {
    const candidatePaths = [
      path.resolve(process.cwd(), ".env"),
      path.resolve(process.cwd(), "..", ".env"),
      path.resolve(process.cwd(), "..", "..", ".env"),
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        const match = content.match(new RegExp(`^${keyName}=(.*)$`, "m"));
        if (match && match[1].trim()) {
          return match[1].trim().replace(/^['"]|['"]$/g, "");
        }
      }
    }
  } catch {
    // Ignore file read errors
  }
  return "";
}

export function getGeminiApiKeys(): string[] {
  const envVal = readEnvFileValue("GEMINI_API_KEY") || readEnvFileValue("GEMINI_API_KEYS");
  const raw = envVal || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEYS || "";
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

  const model =
    options.model ||
    readEnvFileValue("GEMINI_MODEL") ||
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";
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

  // High-availability, sub-second latency model pool
  const candidateModels = [
    model,
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  let lastError: unknown = null;

  for (const currentModel of candidateModels) {
    const url = `${GEMINI_ENDPOINT}/${encodeURIComponent(currentModel)}:generateContent`;

    for (let i = 0; i < keys.length; i++) {
      const apiKey = keys[i];
      const keyPreview = apiKey.slice(0, 6) + "..." + apiKey.slice(-4);

      for (let attempt = 1; attempt <= 2; attempt++) {
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
              return text;
            }
          } else if (response.status === 429 && attempt === 1) {
            // Rate limit backoff
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          } else {
            const errorText = await response.text().catch(() => "");
            logger.warn(
              { keyIndex: i, model: currentModel, status: response.status, error: errorText.slice(0, 200) },
              "Gemini request unsuccessful; trying next key/model...",
            );
            break;
          }
        } catch (err) {
          lastError = err;
          if (attempt === 1) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
        }
      }
    }
  }

  logger.error({ totalKeys: keys.length, lastError }, "All Gemini API attempts failed.");
  return null;
}
