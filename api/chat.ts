import { getGeminiClient, getChatSystemInstruction } from "../serverlib/gemini";
import { jsonError, readJsonBody } from "../serverlib/http";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return jsonError(res, 405, "Method not allowed");
  }

  try {
    const { history, message } = await readJsonBody<{
      history?: { role: "user" | "model"; parts: { text: string }[] }[];
      message?: string;
    }>(req);

    if (!message) {
      return jsonError(res, 400, "Message is required");
    }

    const ai = getGeminiClient();
    const chat = ai.chats.create({
      // Use the original preview chat model
      model: "gemini-3-flash-preview",
      config: { systemInstruction: getChatSystemInstruction() },
      history: history || [],
    });

    const result = await chat.sendMessage({ message });
    return res.json({ reply: result.text || "" });
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : "Failed";
    return jsonError(res, 500, msg);
  }
}

