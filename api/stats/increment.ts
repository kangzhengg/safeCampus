import { getDb } from "../../serverlib/db";

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type } = (req.body || {}) as { type?: "scan" | "detected" | "link" };
  if (!type) {
    return res.status(400).json({ error: "type is required" });
  }

  const db = getDb();

  if (type === "scan") {
    db.prepare("UPDATE stats SET total_scans = total_scans + 1 WHERE id = 1")
      .run();
  } else if (type === "detected") {
    db.prepare("UPDATE stats SET detected = detected + 1 WHERE id = 1").run();
  } else if (type === "link") {
    db.prepare(
      "UPDATE stats SET links_checked = links_checked + 1 WHERE id = 1"
    ).run();
  } else {
    return res.status(400).json({ error: "invalid type" });
  }

  return res.json({ success: true });
}

