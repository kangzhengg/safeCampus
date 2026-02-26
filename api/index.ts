import express from "express";
import Database from "better-sqlite3";

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

// Export the Express app as the default handler for Vercel
export default app;

