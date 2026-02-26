import { useState, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  Shield, 
  Database as DbIcon, 
  MessageSquare, 
  BookOpen, 
  AlertTriangle, 
  Scan, 
  Link as LinkIcon, 
  User, 
  ChevronRight, 
  Search,
  ArrowRight,
  Upload,
  CheckCircle2,
  XCircle,
  Info,
  X
} from "lucide-react";
import { analyzeContent, getChatResponse, ScamAnalysis } from "./services/geminiService";
import { ScamReport, Alert, Stats } from "./types";

// --- Components ---

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "scan", icon: Scan, label: "Scan" },
    { id: "database", icon: DbIcon, label: "Database" },
    { id: "chat", icon: MessageSquare, label: "AI Chat" },
    { id: "learn", icon: BookOpen, label: "Learn" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1117] border-t border-gray-800 px-4 py-2 pb-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === tab.id ? "text-[#00D1FF]" : "text-gray-500"
            }`}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// --- Screens ---

const HomeScreen = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetch("/api/stats").then(res => res.json()).then(setStats);
    fetch("/api/alerts").then(res => res.json()).then(setAlerts);
  }, []);

  return (
    <div className="pb-24 pt-6 px-4 space-y-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">SafeCampus</h1>
          <p className="text-gray-400 text-sm">AI Scam Protection</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 flex items-center justify-center border border-[#00D1FF]/20">
          <Shield className="text-[#00D1FF]" size={20} />
        </div>
      </div>

      {/* Hero Protection Status */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-[#00FF94]">
            <div className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse" />
            <span className="text-sm font-semibold uppercase tracking-wider">Protection Active</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            AI-powered scam detection ready to analyze suspicious messages, links, and senders.
          </p>
          <button 
            onClick={() => setActiveTab("scan")}
            className="w-full bg-[#00D1FF] text-[#0F1117] font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00B8E6] transition-colors"
          >
            <Scan size={18} />
            Start Scanning
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Shield size={120} className="text-white" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Scans", value: stats?.totalScans || 0, icon: Scan },
          { label: "Detected", value: stats?.detected || 0, icon: AlertTriangle, color: "text-red-500" },
          { label: "Links", value: stats?.linksChecked || 0, icon: LinkIcon },
          { label: "Reports", value: stats?.reportsCount || 0, icon: User },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-3 border border-gray-800 flex flex-col items-center gap-1">
            <stat.icon size={14} className={stat.color || "text-[#00D1FF]"} />
            <span className="text-lg font-bold text-white">{stat.value}</span>
            <span className="text-[10px] text-gray-500 uppercase font-semibold">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Quick Actions</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "scan", label: "Analyze Text", desc: "Scan messages", icon: Scan },
            { id: "link", label: "Check Link", desc: "Verify URLs", icon: LinkIcon },
            { id: "sender", label: "Check Sender", desc: "Verify identity", icon: User },
          ].map((action, i) => (
            <button 
              key={i}
              onClick={() => setActiveTab("scan")}
              className="min-w-[140px] bg-gray-900 rounded-2xl p-4 border border-gray-800 text-left space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                <action.icon className="text-[#00D1FF]" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{action.label}</p>
                <p className="text-[10px] text-gray-500">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Alerts */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Recent Alerts</h2>
          <button className="text-[#00D1FF] text-xs font-semibold flex items-center gap-1">
            See all <ChevronRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex gap-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50" />
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-400" size={20} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                  {alert.is_new && (
                    <span className="bg-[#00FF94] text-[#0F1117] text-[8px] font-black px-1.5 py-0.5 rounded uppercase">New</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">{alert.description}</p>
                <p className="text-[10px] text-gray-500">{alert.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Threat */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-yellow-500">
          <ChevronRight size={18} className="rotate-[-45deg]" />
          <h2 className="text-lg font-bold text-white">Trending Threat</h2>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-[#0F1117] rounded-3xl p-6 border border-yellow-500/20 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-yellow-500">Fake Internship Offers</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              300% increase in reports this month. Scammers are targeting students on LinkedIn with fake Fortune 500 company internships.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-white">456</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold">Reports</p>
            </div>
            <div className="text-center border-x border-gray-800">
              <p className="text-xl font-bold text-white">12</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold">Universities</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-500">High</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold">Severity</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ScanScreen = () => {
  const [activeMode, setActiveMode] = useState<"message" | "link" | "sender">("message");
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScamAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!input && !image) return;
    setIsAnalyzing(true);
    try {
      // Increment total scans
      fetch("/api/stats/increment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "scan" })
      });

      // Increment links checked if in link mode
      if (activeMode === "link") {
        fetch("/api/stats/increment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "link" })
        });
      }

      const analysis = await analyzeContent(input, image || undefined);
      setResult(analysis);

      // If High Risk or Critical, increment detected and save to database
      if (analysis.risk_level === "High Risk" || analysis.risk_level === "Critical") {
        fetch("/api/stats/increment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "detected" })
        });

        // Save to database
        fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Detected ${analysis.scam_type}`,
            content: input || "Image Scan",
            type: analysis.scam_type,
            risk_level: analysis.risk_level
          })
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 space-y-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white">Scan & Analyze</h1>

      {/* Mode Selector */}
      <div className="flex bg-gray-900 rounded-2xl p-1 border border-gray-800">
        {(["message", "link", "sender"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setActiveMode(mode);
              setResult(null);
            }}
            className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeMode === mode ? "bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20" : "text-gray-500"
            }`}
          >
            {mode === "message" && <MessageSquare size={18} />}
            {mode === "link" && <LinkIcon size={18} />}
            {mode === "sender" && <User size={18} />}
            <span className="text-[10px] font-bold capitalize">{mode}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Scan size={16} />
                <span className="text-sm font-bold">Paste {activeMode === "message" ? "Message" : activeMode === "link" ? "Link" : "Sender"}</span>
              </div>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Paste suspicious ${activeMode}, email, job offer, or scholarship offer here...`}
                  className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 text-white text-sm min-h-[160px] focus:outline-none focus:border-[#00D1FF]/50 transition-colors"
                />
                {activeMode === "message" && (
                  <label className="absolute bottom-4 right-4 cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <div className={`p-2 rounded-lg ${image ? "bg-[#00FF94]/20 text-[#00FF94]" : "bg-gray-800 text-gray-400"}`}>
                      <Upload size={18} />
                    </div>
                  </label>
                )}
              </div>
              {image && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-700">
                  <img src={image} className="w-full h-full object-cover" alt="Upload" />
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"
                  >
                    <XCircle size={14} className="text-white" />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!input && !image)}
              className="w-full bg-[#00D1FF] disabled:opacity-50 text-[#0F1117] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#00D1FF]/10"
            >
              {isAnalyzing ? (
                <div className="w-5 h-5 border-2 border-[#0F1117] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield size={20} />
                  Analyze with AI
                </>
              )}
            </button>

            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white">What to scan</h3>
              <ul className="space-y-3">
                {[
                  "WhatsApp or Telegram messages from unknown senders",
                  "Job offers that seem too good to be true",
                  "Scholarship emails asking for payment",
                  "Links from unfamiliar sources",
                  "Emails from non-official domains",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-xs text-gray-500">
                    <AlertTriangle size={14} className="text-yellow-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Result Header */}
            <div className={`rounded-3xl p-8 text-center space-y-4 border ${
              result.risk_level === 'Safe' ? "bg-green-500/10 border-green-500/20" :
              result.risk_level === 'Medium Risk' ? "bg-yellow-500/10 border-yellow-500/20" :
              "bg-red-500/10 border-red-500/20"
            }`}>
              <div className="flex justify-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  result.risk_level === 'Safe' ? "bg-green-500/20 text-green-400" :
                  result.risk_level === 'Medium Risk' ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {result.risk_level === 'Safe' ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-black text-white">{result.scam_probability}%</p>
                <p className={`text-sm font-bold uppercase tracking-widest ${
                  result.risk_level === 'Safe' ? "text-green-400" :
                  result.risk_level === 'Medium Risk' ? "text-yellow-400" :
                  "text-red-400"
                }`}>{result.risk_level}</p>
              </div>
              <div className="bg-white/5 rounded-full px-4 py-1 inline-block">
                <p className="text-xs font-bold text-gray-300">{result.scam_type}</p>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info size={16} className="text-[#00D1FF]" />
                Why is this suspicious?
              </h3>
              <ul className="space-y-3">
                {result.explanation.map((point, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] shrink-0 mt-1.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety Recommendation */}
            <div className="bg-[#00D1FF]/10 rounded-2xl p-6 border border-[#00D1FF]/20 space-y-3">
              <h3 className="text-sm font-bold text-[#00D1FF]">Safety Recommendation</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{result.safety_recommendation}</p>
            </div>

            <button
              onClick={() => {
                setResult(null);
                setInput("");
                setImage(null);
              }}
              className="w-full bg-gray-800 text-white font-bold py-4 rounded-2xl border border-gray-700"
            >
              Analyze Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DatabaseScreen = () => {
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState<ScamReport | null>(null);

  useEffect(() => {
    fetch("/api/reports").then(res => res.json()).then(setReports);
  }, []);

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || r.type.includes(filter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="pb-24 pt-6 px-4 space-y-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white">Scam Database</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search scams, keywords, tags..."
          className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#00D1FF]/50"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {["All", "Phishing Scam", "Job Scam", "Internship Scam", "Scholarship Scam"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === f ? "bg-[#00D1FF] text-[#0F1117]" : "bg-gray-900 text-gray-500 border border-gray-800"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{filteredReports.length} scam reports</p>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report)}
            className="w-full text-left bg-gray-900 rounded-2xl p-5 border border-gray-800 space-y-4 hover:border-[#00D1FF]/30 transition-colors"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-bold text-white max-w-[70%]">{report.title}</h3>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                report.risk_level === 'Critical' ? "bg-red-500/20 text-red-600" : "bg-orange-500/20 text-orange-600"
              }`}>
                {report.risk_level}
              </span>
            </div>
            <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{report.content}</p>
            <div className="flex justify-between items-center pt-2 border-t border-gray-800">
              <span className="bg-gray-800 text-gray-400 text-[10px] font-bold px-2 py-1 rounded">{report.type}</span>
              <span className="text-[10px] text-gray-500 font-bold">{report.reports_count} reports</span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[60] flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-[#0F1117] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#00D1FF] font-black uppercase tracking-widest">{selectedReport.type}</span>
                  <h2 className="text-xl font-bold text-white">{selectedReport.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 bg-gray-800 rounded-xl text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className={`p-4 rounded-2xl border ${
                selectedReport.risk_level === 'Critical' ? "bg-red-500/10 border-red-500/20" : "bg-orange-500/10 border-orange-500/20"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={selectedReport.risk_level === 'Critical' ? "text-red-500" : "text-orange-500"} size={18} />
                  <span className={`text-sm font-bold ${selectedReport.risk_level === 'Critical' ? "text-red-500" : "text-orange-500"}`}>
                    {selectedReport.risk_level} Risk Detected
                  </span>
                </div>
                <p className="text-xs text-gray-400">This case has been reported {selectedReport.reports_count} times by the community.</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">Scam Content</h3>
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{selectedReport.content}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">Report Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Date Reported</p>
                    <p className="text-xs font-bold text-white">{new Date(selectedReport.created_at || "").toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-3 border border-gray-800">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Source</p>
                    <p className="text-xs font-bold text-white">Community Report</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="w-full bg-[#00D1FF] text-[#0F1117] font-bold py-4 rounded-2xl"
              >
                Close Case
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChatScreen = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await getChatResponse(history, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response || "Sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 flex flex-col h-screen max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">AI Scam Advisor</h1>

      <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
            <div className="w-16 h-16 rounded-3xl bg-[#00D1FF]/10 flex items-center justify-center border border-[#00D1FF]/20">
              <MessageSquare className="text-[#00D1FF]" size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">SafeCampus AI Advisor</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Ask me anything about scams, suspicious messages, or digital safety. I can help you identify threats and stay protected.
              </p>
            </div>
            <div className="w-full space-y-3">
              {[
                "Is this internship offer legitimate?",
                "How do I spot a phishing email?",
                "What makes a link suspicious?",
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 px-4 text-xs text-gray-400 text-left hover:border-[#00D1FF]/30 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#00D1FF] text-[#0F1117] font-medium rounded-tr-none' 
                : 'bg-gray-900 text-gray-300 border border-gray-800 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about scams or paste suspicious content..."
            className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-4 pr-14 text-white text-sm focus:outline-none focus:border-[#00D1FF]/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#00D1FF]/10 flex items-center justify-center text-[#00D1FF] disabled:opacity-50"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const LearnScreen = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Links & URLs", "Job Safety", "Email Safety"];

  const guides = [
    {
      title: "Verify Before You Click",
      category: "Links & URLs",
      icon: LinkIcon,
      content: "Always check URLs before clicking. Hover over links to see the real destination. Look for misspellings like 'g00gle.com' instead of 'google.com'."
    },
    {
      title: "No Legit Job Asks for Payment",
      category: "Job Safety",
      icon: Shield,
      content: "Real employers never ask you to pay for training, equipment, or processing fees. If they send you a check to buy equipment, it's a scam."
    },
    {
      title: "Check Email Domains Carefully",
      category: "Email Safety",
      icon: MessageSquare,
      content: "Legitimate organizations use official domains (e.g., @university.edu), not Gmail or Yahoo. Be wary of 'hr-university@gmail.com'."
    },
    {
      title: "Urgency is a Red Flag",
      category: "All",
      icon: AlertTriangle,
      content: "Scammers use fear to make you act fast. 'Your account will be deleted in 1 hour' is a classic tactic to stop you from thinking clearly."
    }
  ];

  const filteredGuides = activeCategory === "All" ? guides : guides.filter(g => g.category === activeCategory);

  return (
    <div className="pb-24 pt-6 px-4 space-y-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white">Safety Center</h1>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === c ? "bg-[#00D1FF] text-[#0F1117]" : "bg-gray-900 text-gray-500 border border-gray-800"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Hero */}
      <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#00D1FF]/10 flex items-center justify-center border border-[#00D1FF]/20 mx-auto">
          <BookOpen className="text-[#00D1FF]" size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Safety Education Center</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Learn how to identify and avoid common scams targeting students. Knowledge is your best defense.
          </p>
        </div>
      </div>

      {/* Guides */}
      <div className="space-y-4">
        {filteredGuides.map((guide, i) => (
          <div key={i} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                <guide.icon className="text-[#00D1FF]" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{guide.title}</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{guide.category}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{guide.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-[#0F1117] text-white font-sans selection:bg-[#00D1FF]/30">
      <main className="relative">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HomeScreen setActiveTab={setActiveTab} />
            </motion.div>
          )}
          {activeTab === "scan" && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScanScreen />
            </motion.div>
          )}
          {activeTab === "database" && (
            <motion.div key="database" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DatabaseScreen />
            </motion.div>
          )}
          {activeTab === "chat" && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ChatScreen />
            </motion.div>
          )}
          {activeTab === "learn" && (
            <motion.div key="learn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LearnScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
