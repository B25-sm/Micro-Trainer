import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildStudentId, buildDisplayName } from "../utils/studentIdentity";
import { getAuthToken, setAuthSession } from "../utils/authSession";
import { CAREER_TRACKS } from "../utils/careerTracks";
import BrandMark from "../components/BrandMark";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(
    localStorage.getItem("userName") || ""
  );
  const [initial, setInitial] = useState("");
  const [batch, setBatch] = useState("");
  const [careerTrack, setCareerTrack] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const name = fullName.trim();
    const ini = initial.trim();
    const bat = batch.trim();

    if (!name || !ini || !bat) {
      setError("Please enter Name, Initial, and Batch");
      setLoading(false);
      return;
    }

    if (!careerTrack) {
      setError("Please choose the role you're preparing for");
      setLoading(false);
      return;
    }

    const studentId = buildStudentId(ini, bat);
    if (!studentId) {
      setError("Invalid Initial or Batch");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ name, initial: ini, batch: bat, studentId, careerTrack }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      localStorage.setItem("studentFullName", name);
      localStorage.setItem("studentInitial", ini);
      localStorage.setItem("studentBatch", bat);
      localStorage.setItem("userName", data.displayName || buildDisplayName(name, ini, bat));
      localStorage.setItem("studentId", data.studentId);
      if (data.careerTrack) localStorage.setItem("careerTrack", data.careerTrack);

      setAuthSession({
        token: data.token,
        role: "student",
        studentId: data.studentId,
        profileComplete: true,
        needsProfile: false,
        name: data.displayName,
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Could not save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#202124] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] shadow-sm p-8">
        <BrandMark className="mb-4 h-12 w-12 rounded-xl" alt="MicroTrainer logo" />
        <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-2">Complete your profile</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          You signed in with Google or GitHub. Add your class details so your trainer
          can identify you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#202124] text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial
            </label>
            <input
              type="text"
              value={initial}
              onChange={(e) => setInitial(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#202124] text-gray-900 dark:text-gray-100 uppercase"
              required
              maxLength={20}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch
            </label>
            <input
              type="text"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#202124] text-gray-900 dark:text-gray-100"
              required
              maxLength={40}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What role are you preparing for?
            </label>
            <select
              value={careerTrack}
              onChange={(e) => setCareerTrack(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#202124] text-gray-900 dark:text-gray-100"
              required
            >
              <option value="" disabled>
                Select your track…
              </option>
              {CAREER_TRACKS.map((t) => (
                <option key={t.id} value={t.id} disabled={!t.available}>
                  {t.label}
                  {t.available ? "" : " — Coming soon"}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              We'll tailor your practice, interviews, and course to this role.
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7c3aed] dark:bg-[#a78bfa] text-white dark:text-gray-900 py-3 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
