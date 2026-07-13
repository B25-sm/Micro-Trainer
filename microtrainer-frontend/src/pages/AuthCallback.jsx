import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAuthSession } from "../utils/authSession";
import BrandMark from "../components/BrandMark";

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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#202124]">
      <BrandMark className="h-14 w-14 animate-pulse rounded-xl" alt="MicroTrainer logo" />
      <p className="text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  );
}
