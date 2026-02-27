import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { getDb } from "./serverlib/db";
import { getAnalyzeConfig, getChatSystemInstruction, getGeminiClient } from "./serverlib/gemini";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = getDb();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/reports", (req, res) => {
    const reports = db.prepare("SELECT * FROM reports ORDER BY created_at DESC").all();
    res.json(reports);
  });

  app.post("/api/reports", (req, res) => {
    const { title, content, type, risk_level } = req.body;
    const result = db.prepare("INSERT INTO reports (title, content, type, risk_level) VALUES (?, ?, ?, ?)").run(title, content, type, risk_level);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/alerts", (req, res) => {
    const alerts = db.prepare("SELECT * FROM alerts ORDER BY date DESC").all();
    res.json(alerts);
  });

  app.get("/api/stats", (req, res) => {
    const stats = db.prepare("SELECT * FROM stats WHERE id = 1").get() as { total_scans: number, detected: number, links_checked: number };
    const reportsCount = db.prepare("SELECT COUNT(*) as count FROM reports").get() as { count: number };
    res.json({ 
      totalScans: stats.total_scans, 
      detected: stats.detected, 
      linksChecked: stats.links_checked, 
      reportsCount: reportsCount.count 
    });
  });

  app.post("/api/stats/increment", (req, res) => {
    const { type } = req.body;
    if (type === "scan") {
      db.prepare("UPDATE stats SET total_scans = total_scans + 1 WHERE id = 1").run();
    } else if (type === "detected") {
      db.prepare("UPDATE stats SET detected = detected + 1 WHERE id = 1").run();
    } else if (type === "link") {
      db.prepare("UPDATE stats SET links_checked = links_checked + 1 WHERE id = 1").run();
    }
    res.json({ success: true });
  });

  // AI Analyze endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { text, imageBase64 } = req.body as {
        text: string;
        imageBase64?: string;
      };

      if (!text && !imageBase64) {
        return res.status(400).json({ error: "Text or image is required" });
      }

      const ai = getGeminiClient();
      const cfg = getAnalyzeConfig();

      const parts: any[] = [{ text }];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: (imageBase64 as string).split(",")[1] || imageBase64,
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
      res.json(parsed);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to analyze content" });
    }
  });

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message } = req.body as {
        history: { role: "user" | "model"; parts: { text: string }[] }[];
        message: string;
      };

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getGeminiClient();

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: getChatSystemInstruction(),
        },
        history,
      });

      const result = await chat.sendMessage({ message });
      res.json({ reply: result.text });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to get chat response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
