import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAuthSession } from "../utils/authSession";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing sign in…");

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role") || "student";
    const needsProfile = searchParams.get("needsProfile") === "1";

    if (!token) {
      setMessage("Sign in failed. Missing token.");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    setAuthSession({
      token,
      role,
      name: searchParams.get("name") || undefined,
      email: searchParams.get("email") || undefined,
      studentId: searchParams.get("studentId") || undefined,
      profileComplete: !needsProfile,
      needsProfile,
    });

    if (role === "trainer") {
      navigate("/trainer", { replace: true });
    } else if (needsProfile) {
      navigate("/complete-profile", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
