import Database from "better-sqlite3";
import os from "os";
import path from "path";

let dbSingleton: Database.Database | null = null;
let seeded = false;

function getDbFilePath() {
  // Vercel serverless filesystem is read-only except /tmp
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "safecampus.db");
  }
  return "safecampus.db";
}

function initSchema(db: Database.Database) {
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
}

function seedIfEmpty(db: Database.Database) {
  // Stats row
  const hasStats = db
    .prepare("SELECT COUNT(*) as count FROM stats WHERE id = 1")
    .get() as { count: number };
  if (hasStats.count === 0) {
    db.prepare(
      "INSERT INTO stats (id, total_scans, detected, links_checked) VALUES (1, 10, 7, 4)"
    ).run();
  }

  // Reports (seed only if empty)
  const reportCount = db
    .prepare("SELECT COUNT(*) as count FROM reports")
    .get() as { count: number };
  if (reportCount.count === 0) {
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
  }

  // Alerts (seed only if empty)
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
}

export function getDb() {
  if (!dbSingleton) {
    dbSingleton = new Database(getDbFilePath());
    initSchema(dbSingleton);
  }
  if (!seeded) {
    seedIfEmpty(dbSingleton);
    seeded = true;
  }
  return dbSingleton;
}

