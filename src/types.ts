export interface ScamReport {
  id: number;
  title: string;
  content: string;
  type: string;
  risk_level: string;
  reports_count: number;
  created_at: string;
}

export interface Alert {
  id: number;
  title: string;
  description: string;
  type: string;
  date: string;
  is_new: boolean;
}

export interface Stats {
  totalScans: number;
  detected: number;
  linksChecked: number;
  reportsCount: number;
}
