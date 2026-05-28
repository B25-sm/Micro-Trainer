import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildStudentId, buildDisplayName } from "../utils/studentIdentity";
import { getAuthToken, setAuthSession } from "../utils/authSession";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(
    localStorage.getItem("userName") || ""
  );
  const [initial, setInitial] = useState("");
  const [batch, setBatch] = useState("");
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
        body: JSON.stringify({ name, initial: ini, batch: bat, studentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      localStorage.setItem("studentFullName", name);
      localStorage.setItem("studentInitial", ini);
      localStorage.setItem("studentBatch", bat);
      localStorage.setItem("userName", data.displayName || buildDisplayName(name, ini, bat));
      localStorage.setItem("studentId", data.studentId);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete your profile</h1>
        <p className="text-gray-600 text-sm mb-6">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg uppercase"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
              maxLength={40}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
