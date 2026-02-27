import { getDb } from "../serverlib/db";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = getDb();
  const alerts = db.prepare("SELECT * FROM alerts ORDER BY date DESC").all();
  return res.json(alerts);
}

