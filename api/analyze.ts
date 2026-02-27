import { getGeminiClient, getAnalyzeConfig } from "../serverlib/gemini";
import { jsonError, readJsonBody } from "../serverlib/http";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return jsonError(res, 405, "Method not allowed");
  }

  try {
    const { text, imageBase64 } = await readJsonBody<{
      text?: string;
      imageBase64?: string;
    }>(req);

    if (!text && !imageBase64) {
      return jsonError(res, 400, "Text or image is required");
    }

    const ai = getGeminiClient();
    const cfg = getAnalyzeConfig();

    const parts: any[] = [{ text: text ?? "" }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(",")[1] || imageBase64,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: cfg.model,
      contents: { parts },
      config: {
        systemInstruction: cfg.systemInstruction,
        // Avoid strict schema in serverless; we'll parse JSON ourselves.
      },
    });

    const raw = (response.text || "").trim();
    // Try strict JSON parse first, else extract first JSON object from text.
    const jsonText =
      raw.startsWith("{") && raw.endsWith("}")
        ? raw
        : raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);

    const parsed = JSON.parse(jsonText || "{}");
    return res.json(parsed);
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "Failed";
    return jsonError(res, 500, msg);
  }
}

