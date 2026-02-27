import { getGeminiClient, getAnalyzeConfig } from "../serverlib/gemini";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, imageBase64 } = (req.body || {}) as {
      text?: string;
      imageBase64?: string;
    };

    if (!text && !imageBase64) {
      return res.status(400).json({ error: "Text or image is required" });
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
        responseMimeType: "application/json",
        responseSchema: cfg.responseSchema as any,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "Failed";
    return res.status(500).json({ error: msg });
  }
}

