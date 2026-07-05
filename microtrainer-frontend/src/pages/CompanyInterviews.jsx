import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, ChevronRight, History, Search, Target } from "lucide-react";
import { companyInterviewAPI } from "../api/companyInterview";
import { getStudentId } from "../utils/studentAuth";
import { pageShell, headingPage, textMuted, card } from "../lib/ui";

function eligibilityBadge(entry) {
  if (entry?.eligible) {
    return { label: "Eligible", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800" };
  }
  if (entry?.eligibilityStatus === "near_eligible") {
    return { label: "Not yet", className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800" };
  }
  return { label: "Not eligible", className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800" };
}

export default function CompanyInterviews() {
  const navigate = useNavigate();
  const studentId = getStudentId();
  const [companies, setCompanies] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.tagline || "").toLowerCase().includes(q)
    );
  }, [companies, search]);

  const lastAttemptByCompany = useMemo(() => {
    const map = {};
    history.forEach((h) => {
      const key = h.companyId || h.companyName;
      if (!key) return;
      if (!map[key] || new Date(h.createdAt) > new Date(map[key].createdAt)) {
        map[key] = h;
      }
    });
    return map;
  }, [history]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [compRes, histRes] = await Promise.all([
          companyInterviewAPI.getCompanies(),
          studentId
            ? companyInterviewAPI.getHistory(studentId).catch(() => ({ data: { history: [] } }))
            : Promise.resolve({ data: { history: [] } }),
        ]);
        setCompanies(compRes.data.companies || []);
        setHistory(histRes.data.history || []);
      } catch (err) {
        setError(err?.error || err?.message || "Failed to load company interviews.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-[50vh] ${pageShell}`}>
        <p className={textMuted}>Loading company interviews...</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${pageShell}`}>
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-6 w-6 text-[#7c3aed] dark:text-[#a78bfa]" strokeWidth={1.75} />
            <h1 className={headingPage}>Company Interviews</h1>
          </div>
          <p className={`${textMuted} max-w-2xl`}>
            Take a company mock — we decide if you are <strong>eligible to attend the real interview</strong>.
            Mocks are slightly harder than the actual round so passing here means you are ready.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {companies.length} companies · {companies.reduce((n, c) => n + (c.questionCount || 0), 0)} past questions loaded
          </p>
        </header>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#292a2d] text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
          />
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mb-6 rounded-lg border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 px-4 py-3 text-sm text-blue-900 dark:text-blue-100 flex gap-2">
          <Target className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Questions from real past interviews — rephrased ~15–20% harder. After the mock you get a clear{" "}
            <strong>Eligible / Not eligible</strong> decision for the real company interview.
          </span>
        </div>

        {history.length > 0 && (
          <div className={`${card} p-4 mb-6`}>
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Recent mocks</p>
            </div>
            <ul className="space-y-2">
              {history.slice(0, 5).map((h) => {
                const badge = eligibilityBadge(h);
                return (
                <li
                  key={h.id}
                  className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#202124]/80"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {h.companyName} · {h.averageScore}/10
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.className}`}>
                    {badge.label}
                  </span>
                </li>
              );})}
            </ul>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((c) => {
            const last = lastAttemptByCompany[c.id];
            const lastBadge = last ? eligibilityBadge(last) : null;
            return (
            <motion.button
              key={c.id}
              type="button"
              whileHover={{ y: -2 }}
              onClick={() => navigate(`/company-interviews/${c.id}`)}
              className={`${card} p-5 text-left hover:border-blue-200 dark:hover:border-blue-800 transition-colors group`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{c.name}</h2>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {lastBadge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${lastBadge.className}`}>
                      {lastBadge.label}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                </div>
              </div>
              <p className="text-xs font-medium text-[#7c3aed] dark:text-[#a78bfa] mb-1">{c.role}</p>
              <p className={`${textMuted} text-sm mb-3 line-clamp-2`}>{c.tagline}</p>
              <div className="flex flex-wrap gap-1.5">
                {(c.topics || []).slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                {c.questionCount} questions in bank · mock uses {c.defaultQuestionCount} · eligible at {c.fitThresholds?.strong}/10
              </p>
            </motion.button>
          );})}
        </div>

        {!filteredCompanies.length && companies.length > 0 && (
          <p className={textMuted}>No companies match &quot;{search}&quot;.</p>
        )}

        {!companies.length && !error && (
          <p className={textMuted}>No companies loaded yet. Add questions to the company bank.</p>
        )}
      </div>
    </div>
  );
}
