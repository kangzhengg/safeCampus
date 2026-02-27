export default function handler(_req: any, res: any) {
  return res.json({
    ok: true,
    vercel: Boolean(process.env.VERCEL),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    node: process.version,
  });
}

