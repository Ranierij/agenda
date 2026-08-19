import { env } from "../config/env.js";

function extractText(data) {
  if (typeof data?.output_text === "string") return data.output_text;
  if (typeof data?.text === "string") return data.text;

  const candidateText = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("");

  return candidateText || "";
}

export class GeminiClient {
  async generateJson({ prompt, schema }) {
    if (!env.geminiApiKey) {
      throw new Error("GEMINI_API_KEY nao configurada.");
    }

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.geminiApiKey,
      },
      body: JSON.stringify({
        model: env.geminiModel,
        input: prompt,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gemini API ${response.status}: ${text}`);
    }

    const data = await response.json();
    const text = extractText(data);
    if (!text) throw new Error("Gemini retornou uma resposta vazia.");

    return JSON.parse(text);
  }
}
