import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CategoryModal from "../components/personalSchedule/CategoryModal";
import ScheduleDiagnostic from "../components/personalSchedule/ScheduleDiagnostic";
import SchedulePlanView from "../components/personalSchedule/SchedulePlanView";
import { personalScheduleAPI } from "../api/personalSchedule";
import { getStudentId } from "../utils/studentAuth";
import { useScheduleReminders } from "../hooks/useScheduleReminders";
import {
  pageShell,
  headingSection,
  textMuted,
  btnPrimary,
  btnSecondary,
  card,
  chipButtonSm,
} from "../lib/ui";

export default function PersonalSchedule() {
  const navigate = useNavigate();
  const studentId = getStudentId();
  const [categories, setCategories] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [techOptions, setTechOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [selectedTechs, setSelectedTechs] = useState([]);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [generating, setGenerating] = useState(false);

  const [diagnosticMeta, setDiagnosticMeta] = useState(null);

  const { banner } = useScheduleReminders(studentId, {
    enabled: schedule?.status === "active",
  });

  const loadSchedule = useCallback(async () => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    try {
      const [catRes, schedRes] = await Promise.all([
        personalScheduleAPI.getCategories(),
        personalScheduleAPI.getSchedule(studentId),
      ]);
      setCategories(catRes.data.categories || []);
      const s = schedRes.data.schedule;
      setSchedule(s);

      if (!s?.category) {
        setShowCategoryModal(true);
      } else if (s.category) {
        const techRes = await personalScheduleAPI.getTechOptions(s.category);
        setTechOptions(techRes.data.technologies || []);
      }

      if (s?.declaredSkills?.length) {
        setSelectedTechs(s.declaredSkills.map((d) => d.technology));
        setHoursPerDay(s.hoursPerDay || 2);
      }

      if (s?.currentDiagnostic) {
        setDiagnosticMeta(s.currentDiagnostic);
      } else if (s?.diagnosticQueue?.length) {
        const tech = s.diagnosticQueue[0];
        setDiagnosticMeta({
          technology: tech,
          interviewSubject: tech,
          remaining: s.diagnosticQueue.length,
        });
      } else {
        setDiagnosticMeta(null);
      }
    } catch (err) {
      setError(err?.error || err?.message || "Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const handleCategorySelect = async (categoryId) => {
    setShowCategoryModal(false);
    setLoading(true);
    setError("");
    try {
      const res = await personalScheduleAPI.setCategory(studentId, categoryId);
      setSchedule(res.data.schedule);
      setTechOptions(res.data.techOptions || []);
    } catch (err) {
      setError(err?.error || "Could not save category.");
      setShowCategoryModal(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleTech = (tech) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleSaveSkills = async () => {
    if (selectedTechs.length === 0) {
      setError("Select at least one technology you already know.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await personalScheduleAPI.setSkills(studentId, {
        declaredSkills: selectedTechs.map((technology) => ({
          technology,
          selfRating: "intermediate",
        })),
        hoursPerDay,
      });
      setSchedule(res.data.schedule);
      const cfg = res.data.diagnosticConfig;
      if (cfg?.currentTechnology) {
        setDiagnosticMeta({
          technology: cfg.currentTechnology,
          interviewSubject: cfg.interviewSubject,
          remaining: cfg.remaining,
        });
      }
    } catch (err) {
      setError(err?.error || "Could not save skills.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnosticComplete = async () => {
    await loadSchedule();
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await personalScheduleAPI.generatePlan(studentId);
      setSchedule(res.data.schedule);
      setDiagnosticMeta(null);
    } catch (err) {
      setError(err?.error || "Could not generate plan.");
    } finally {
      setGenerating(false);
    }
  };

  if (!studentId) {
    return (
      <div className={pageShell}>
        <main className="max-w-lg mx-auto px-6 py-16 text-center">
          <p className={textMuted}>Sign in and complete your profile to use Personal Schedule.</p>
          <button type="button" className={`${btnPrimary} mt-4`} onClick={() => navigate("/login")}>
            Sign in
          </button>
        </main>
      </div>
    );
  }

  const step = schedule?.step || "category";
  const activePlan = schedule?.status === "active" && schedule?.plan;

  return (
    <div className={`flex flex-col min-h-screen ${pageShell}`}>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={`${headingSection} text-2xl mb-1`}>Personal Schedule</h1>
          <p className={`${textMuted} mb-6`}>
            Tell us what you know, prove it in a quick skill check, and get a day-by-day
            interview prep plan.
          </p>

          {banner && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm ${
                banner.type === "warning"
                  ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100"
                  : banner.type === "success"
                  ? "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100"
                  : "bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100"
              }`}
            >
              <strong>{banner.title}</strong>
              <p className="mt-1 opacity-90">{banner.message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {loading && !schedule ? (
            <p className={textMuted}>Loading…</p>
          ) : activePlan ? (
            <SchedulePlanView
              studentId={studentId}
              schedule={schedule}
              onRefresh={loadSchedule}
            />
          ) : (
            <>
              <CategoryModal
                open={showCategoryModal}
                categories={categories}
                onSelect={handleCategorySelect}
              />

              {schedule?.category && !showCategoryModal && (
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                  <span className="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
                    {schedule.categoryLabel || schedule.category}
                  </span>
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
                    onClick={() => setShowCategoryModal(true)}
                  >
                    Change track
                  </button>
                </div>
              )}

              {(step === "skills" || step === "category") && schedule?.category && !diagnosticMeta && (
                <div className={`${card} p-6 space-y-6`}>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      What do you already know?
                    </h2>
                    <p className={`${textMuted} text-sm mb-4`}>
                      Select technologies you're comfortable with. We'll interview you on each
                      to calibrate your plan.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {techOptions.map((tech) => (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleTech(tech)}
                          className={`${chipButtonSm} ${
                            selectedTechs.includes(tech)
                              ? "border-blue-400 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200"
                              : ""
                          }`}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Study hours per day
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(Number(e.target.value))}
                      className="w-full"
                    />
                    <p className={`${textMuted} text-sm mt-1`}>{hoursPerDay} hours / day</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSkills}
                    disabled={loading || selectedTechs.length === 0}
                    className={btnPrimary}
                  >
                    Continue to skill check
                  </button>
                </div>
              )}

              {(step === "diagnostic" || diagnosticMeta) && diagnosticMeta && (
                <ScheduleDiagnostic
                  studentId={studentId}
                  technology={diagnosticMeta.technology}
                  interviewSubject={diagnosticMeta.interviewSubject}
                  remaining={diagnosticMeta.remaining}
                  onComplete={handleDiagnosticComplete}
                  onError={(msg) => setError(msg)}
                />
              )}

              {(step === "generate" || step === "ready_to_generate") && !diagnosticMeta && (
                <div className={`${card} p-6 text-center space-y-4`}>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Skill check complete
                  </h2>
                  <p className={textMuted}>
                    Based on your assessments, we'll build a realistic day-by-day plan for your{" "}
                    {schedule?.categoryLabel} interview.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm">
                    {Object.entries(schedule?.diagnostics || {}).map(([tech, d]) => (
                      <span
                        key={tech}
                        className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800"
                      >
                        {tech}: {d.averageScore}/10
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className={btnPrimary}
                  >
                    {generating ? "Building your plan…" : "Generate my Personal Schedule"}
                  </button>
                </div>
              )}
            </>
          )}

          <div className="mt-8 flex gap-3">
            <button type="button" className={btnSecondary} onClick={() => navigate("/learn")}>
              Practice in Learn
            </button>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => navigate("/settings/notifications")}
            >
              Notification settings
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
