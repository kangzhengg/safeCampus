import express from "express";
import Database from "better-sqlite3";
import { GoogleGenAI, Type } from "@google/genai";

const db = new Database("safecampus.db");

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    type TEXT,
    risk_level TEXT,
    reports_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY,
    total_scans INTEGER DEFAULT 0,
    detected INTEGER DEFAULT 0,
    links_checked INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    type TEXT,
    date TEXT,
    is_new BOOLEAN DEFAULT 1
  );
`);

// Seed initial stats data
db.prepare("DELETE FROM stats").run();
db.prepare(
  "INSERT INTO stats (id, total_scans, detected, links_checked) VALUES (1, 10, 7, 4)"
).run();

// Seed initial reports (7 cases)
db.prepare("DELETE FROM reports").run();
const insertReport = db.prepare(
  "INSERT INTO reports (title, content, type, risk_level, reports_count) VALUES (?, ?, ?, ?, ?)"
);
insertReport.run(
  "University Account Verification",
  "Your university email will be deactivated in 24 hours. Verify your account now at: http://uni-verify-portal.com/login",
  "Phishing Scam",
  "High Risk",
  45
);
insertReport.run(
  "Remote Data Entry - $500/Day",
  "Work from home! Earn $500/day doing simple data entry. No experience needed. Contact us on WhatsApp at +1-555-0199.",
  "Job Scam",
  "High Risk",
  120
);
insertReport.run(
  "Google Summer Internship 2026",
  "Congratulations! You have been selected for a Google Summer Internship. To confirm your spot, please pay a $50 background check fee.",
  "Internship Scam",
  "Critical",
  89
);
insertReport.run(
  "Global Merit Scholarship Award",
  "Dear student, you have been awarded a $5,000 scholarship! To claim your funds, please pay a $25 processing fee via Zelle.",
  "Scholarship Scam",
  "Critical",
  67
);
insertReport.run(
  "Library Access Renewal Required",
  "Your library access is about to expire. Please log in to the student portal to renew: http://campus-library-auth.net",
  "Phishing Scam",
  "High Risk",
  34
);
insertReport.run(
  "Part-time Virtual Assistant",
  "Looking for a student assistant to help with administrative tasks. $30/hour. Send a copy of your ID to start.",
  "Job Scam",
  "High Risk",
  56
);
insertReport.run(
  "Tech Startup Internship Opportunity",
  "Join our fast-growing AI startup as an intern. Note: You must purchase your own company-approved laptop from our vendor.",
  "Internship Scam",
  "High Risk",
  23
);

// Seed alerts if empty
const alertCount = db
  .prepare("SELECT COUNT(*) as count FROM alerts")
  .get() as { count: number };
if (alertCount.count === 0) {
  const insertAlert = db.prepare(
    "INSERT INTO alerts (title, description, type, date) VALUES (?, ?, ?, ?)"
  );
  insertAlert.run(
    "New Phishing Wave Targeting .edu",
    "Multiple reports of fake university password reset emails. Do not click links in unexpected emails.",
    "Phishing",
    "2026-02-18"
  );
  insertAlert.run(
    "Fake Internship Offers on LinkedIn",
    "Scammers posing as recruiters from Fortune 500 companies. Verify through official career pages.",
    "Job Scam",
    "2026-02-16"
  );
  insertAlert.run(
    "Gift Card Scam Targeting Students",
    "Professor impersonation emails requesting gift card purchases have increased 300% this month.",
    "Impersonation",
    "2026-02-14"
  );
}

const app = express();

app.use(express.json());

// API Routes (mirroring server.ts)
app.get("/api/reports", (req, res) => {
  const reports = db
    .prepare("SELECT * FROM reports ORDER BY created_at DESC")
    .all();
  res.json(reports);
});

app.post("/api/reports", (req, res) => {
  const { title, content, type, risk_level } = req.body;
  const result = db
    .prepare(
      "INSERT INTO reports (title, content, type, risk_level) VALUES (?, ?, ?, ?)"
    )
    .run(title, content, type, risk_level);
  res.json({ id: result.lastInsertRowid });
});

app.get("/api/alerts", (req, res) => {
  const alerts = db
    .prepare("SELECT * FROM alerts ORDER BY date DESC")
    .all();
  res.json(alerts);
});

app.get("/api/stats", (req, res) => {
  const stats = db
    .prepare("SELECT * FROM stats WHERE id = 1")
    .get() as {
    total_scans: number;
    detected: number;
    links_checked: number;
  };
  const reportsCount = db
    .prepare("SELECT COUNT(*) as count FROM reports")
    .get() as { count: number };

  res.json({
    totalScans: stats.total_scans,
    detected: stats.detected,
    linksChecked: stats.links_checked,
    reportsCount: reportsCount.count,
  });
});

app.post("/api/stats/increment", (req, res) => {
  const { type } = req.body as { type: "scan" | "detected" | "link" };

  if (type === "scan") {
    db.prepare(
      "UPDATE stats SET total_scans = total_scans + 1 WHERE id = 1"
    ).run();
  } else if (type === "detected") {
    db.prepare(
      "UPDATE stats SET detected = detected + 1 WHERE id = 1"
    ).run();
  } else if (type === "link") {
    db.prepare(
      "UPDATE stats SET links_checked = links_checked + 1 WHERE id = 1"
    ).run();
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    const systemInstruction = `You are the core detection engine for "SafeCampus AI," an advanced digital safety platform designed to protect university students and fresh graduates from scams, phishing, and fraudulent opportunities.
Your primary task is to analyze user-submitted text messages, emails, job offers, scholarship details, or extracted text from screenshots, and determine the likelihood that it is a scam.
When analyzing, specifically look for these student-targeted red flags:
Unrealistic promises (e.g., "$500/day remote data entry with no experience").
Financial requests (e.g., processing fees for scholarships, paying for job training/equipment upfront).
False urgency (e.g., "Your university account will be deleted in 24 hours").
Suspicious links (e.g., shortened URLs, slight misspellings of official domains like "uni-verify.com" instead of an actual .edu domain).
Unprofessional grammar or unusual contact methods (e.g., recruiters using WhatsApp or Telegram for initial outreach).

OUTPUT FORMAT:
You must respond STRICTLY in valid JSON format. Do not include any conversational text, markdown formatting blocks (like \`\`\`json), or greetings. Only output the raw JSON object with the following exact structure:
{
  "scam_probability": <integer between 0 and 100 representing the likelihood of a scam>,
  "risk_level": "<string: must be exactly 'Safe', 'Medium Risk', 'High Risk', or 'Critical'>",
  "scam_type": "<string: must be exactly 'Phishing Scam', 'Job Scam', 'Internship Scam', or 'Scholarship Scam'>",
  "explanation": [
    "<string: Clear, concise bullet point explaining the first red flag detected>",
    "<string: Clear, concise bullet point explaining the second red flag detected>"
  ],
  "highlighted_keywords": [
    "<string: specific suspicious words or phrases found in the text, e.g., 'processing fee', 'click here now'>"
  ],
  "safety_recommendation": "<string: One actionable piece of advice, e.g., 'Do not click the link. Verify directly with the university IT desk.'>"
}`;

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
      model,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scam_probability: { type: Type.INTEGER },
            risk_level: { type: Type.STRING },
            scam_type: { type: Type.STRING },
            explanation: { type: Type.ARRAY, items: { type: Type.STRING } },
            highlighted_keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            safety_recommendation: { type: Type.STRING },
          },
          required: [
            "scam_probability",
            "risk_level",
            "scam_type",
            "explanation",
            "highlighted_keywords",
            "safety_recommendation",
          ],
        },
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are the "SafeCampus AI Advisor," a friendly, highly knowledgeable, and protective cybersecurity assistant designed specifically for university students, interns, and fresh graduates.
Your goal is to answer questions about digital safety, help students spot phishing emails, evaluate suspicious links, and provide advice on avoiding common campus and early-career scams.
PERSONA & TONE:
Empathetic and approachable: Students might be panicked if they think they clicked a bad link. Be calm and reassuring.
Educational but concise: Explain why something is dangerous, but keep it brief enough to read on a mobile phone screen. Do not use overly complex technical jargon.
Objective and cautious: If a user asks if a specific unknown link or company is safe, advise caution. Tell them what signs to look for rather than guaranteeing 100% safety.
CORE DIRECTIVES:
If a user pastes a suspicious message or email, break it down for them. Point out the red flags (urgency, weird sender address, requests for money via Zelle/crypto/gift cards).
If a user asks about a job or internship offer, remind them of the golden rule: "Legitimate employers will NEVER ask you to pay for your own equipment, training, or background checks upfront."
If a user asks about a scholarship, remind them that real scholarships do not require "application fees" or "processing taxes."
If a user asks what to do after falling for a scam, provide immediate actionable steps (e.g., freeze bank accounts, change passwords, contact campus IT, report to local authorities).
Never hallucinate domain reputations. If you are unsure about a specific URL, tell the user to use a tool like VirusTotal or Google Safe Browsing, and advise them not to click it until verified.`,
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

// Export the Express app as the default handler for Vercel
export default app;

