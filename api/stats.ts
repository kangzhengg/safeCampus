import { getDb } from "../serverlib/db";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = getDb();
  const stats = db.prepare("SELECT * FROM stats WHERE id = 1").get() as {
    total_scans: number;
    detected: number;
    links_checked: number;
  };
  const reportsCount = db
    .prepare("SELECT COUNT(*) as count FROM reports")
    .get() as { count: number };

  return res.json({
    totalScans: stats?.total_scans ?? 0,
    detected: stats?.detected ?? 0,
    linksChecked: stats?.links_checked ?? 0,
    reportsCount: reportsCount.count,
  });
}

