import { useEffect, useState } from "react";
import { getCertificateEligibility } from "../api";
import SyncRequiredBanner from "../components/SyncRequiredBanner";
import { getStudentId } from "../utils/studentAuth";

export default function Certificates() {
  const studentId = getStudentId();
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    getCertificateEligibility(studentId)
      .then((res) => setEligibility(res.data))
      .catch((error) => {
        console.error("Certificate eligibility error:", error);
        setEligibility({
          eligible: false,
          reason: "Could not verify certificate eligibility.",
        });
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const eligible = Boolean(eligibility?.eligible);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
          <p className="mt-2 text-gray-600">
            Certificates are official only when your progress is synced for trainer verification.
          </p>
        </div>

        {studentId && <SyncRequiredBanner studentId={studentId} />}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {loading ? (
            <p className="text-gray-500">Checking certificate eligibility...</p>
          ) : (
            <>
              <div
                className={`mb-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  eligible
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {eligible ? "Eligible for official certificates" : "Certificate locked"}
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                Official Completion Certificate
              </h2>
              <p className="mt-2 text-gray-600">
                {eligibility?.reason ||
                  "Complete your learning path and keep official sync connected to unlock certificates."}
              </p>

              <button
                type="button"
                disabled={!eligible}
                className={`mt-6 rounded-xl px-5 py-3 font-semibold ${
                  eligible
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "cursor-not-allowed bg-gray-200 text-gray-500"
                }`}
              >
                Download Certificate
              </button>

              {!eligible && (
                <p className="mt-3 text-sm text-gray-500">
                  Your learning app still works. Only official certificates require recent sync.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
