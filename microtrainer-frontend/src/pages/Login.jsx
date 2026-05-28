/**
 * Sign-in: Google or GitHub only.
 * Students complete Name + Initial + Batch on the next screen.
 * Trainers are recognized by authorized email on the server.
 */

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { setAuthSession } from "../utils/authSession";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function Login() {
  const [error, setError] = useState("");
  const [oauthLoading, setOauthLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlError = searchParams.get("error");

  function finishOAuthLogin(data) {
    const needsProfile = setAuthSession({
      token: data.token,
      role: data.role,
      name: data.name,
      email: data.email,
      studentId: data.studentId,
      profileComplete: data.profileComplete,
      needsProfile: data.needsProfile,
      provider: data.provider,
    });

    if (data.role === "trainer") {
      navigate("/trainer");
    } else if (needsProfile) {
      navigate("/complete-profile");
    } else {
      navigate("/dashboard");
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError("");
    setOauthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google sign-in failed");
      finishOAuthLogin(data);
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setOauthLoading(false);
    }
  }

  function handleGitHubLogin() {
    window.location.href = `${API_BASE}/auth/github`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MicroTrainer</h1>
          <p className="text-gray-600 text-sm">
            Sign in with Google or GitHub to continue
          </p>
        </div>

        {(error || urlError) && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error || decodeURIComponent(urlError)}
          </div>
        )}

        <div className="space-y-3">
          {GOOGLE_CLIENT_ID ? (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in was cancelled or failed")}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="320"
              />
            </div>
          ) : (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Add VITE_GOOGLE_CLIENT_ID to the frontend .env (see OAUTH_SETUP.md).
            </p>
          )}

          <button
            type="button"
            onClick={handleGitHubLogin}
            disabled={oauthLoading}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg font-medium text-gray-800 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Continue with GitHub
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500 leading-relaxed">
          Students will enter <strong>Name</strong>, <strong>Initial</strong>, and{" "}
          <strong>Batch</strong> after their first sign-in. Trainer access is only
          for authorized accounts.
        </p>
      </div>
    </div>
  );
}
