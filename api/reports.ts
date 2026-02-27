import { getDb } from "../serverlib/db";

export default function handler(req: any, res: any) {
  const db = getDb();

  if (req.method === "GET") {
    const reports = db
      .prepare("SELECT * FROM reports ORDER BY created_at DESC")
      .all();
    return res.json(reports);
  }

  if (req.method === "POST") {
    const { title, content, type, risk_level } = (req.body || {}) as {
      title?: string;
      content?: string;
      type?: string;
      risk_level?: string;
    };

    if (!title || !content || !type || !risk_level) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = db
      .prepare(
        "INSERT INTO reports (title, content, type, risk_level) VALUES (?, ?, ?, ?)"
      )
      .run(title, content, type, risk_level);

    return res.json({ id: result.lastInsertRowid });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

