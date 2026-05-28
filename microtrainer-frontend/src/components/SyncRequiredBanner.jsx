import { useEffect, useState } from "react";
import API from "../api";
import { getStudentHeaders } from "../utils/studentAuth";

export default function SyncRequiredBanner({ studentId }) {
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    if (!studentId) return;

    let cancelled = false;

    async function fetchSyncStatus() {
      try {
        const res = await API.get(`/api/sync/status/${studentId}`, {
          headers: getStudentHeaders(studentId),
        });
        if (!cancelled) setSyncStatus(res.data);
      } catch (error) {
        console.error("Sync status fetch error:", error);
        if (!cancelled) {
          setSyncStatus({
            status: "disconnected",
            officialBenefitsEnabled: false,
            message: "Could not verify official progress sync.",
          });
        }
      }
    }

    fetchSyncStatus();
    const intervalId = setInterval(fetchSyncStatus, 60000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [studentId]);

  if (!syncStatus || !syncStatus.syncRequired) return null;

  const connected = syncStatus.officialBenefitsEnabled;
  const lastSync = syncStatus.lastSuccessfulSyncAt
    ? new Date(syncStatus.lastSuccessfulSyncAt).toLocaleString()
    : null;

  return (
    <div
      className={`mb-6 rounded-2xl border p-4 ${
        connected
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold">
            {connected
              ? "Official tracking connected"
              : "Official progress sync required"}
          </p>
          <p className="text-sm mt-1">
            {connected
              ? "Your progress is being reported for trainer verification."
              : "Your app will keep working, but certificates, official badges, leaderboards, and trainer verification stay locked until progress sync reconnects."}
          </p>
          {syncStatus.lastFailureReason && !connected && (
            <p className="text-xs mt-2 opacity-80">
              Last sync issue: {syncStatus.lastFailureReason}
            </p>
          )}
        </div>
        <div className="text-xs md:text-right">
          <p className="font-medium">
            Status: {connected ? "Connected" : "Disconnected"}
          </p>
          <p>{lastSync ? `Last sync: ${lastSync}` : "No successful sync yet"}</p>
        </div>
      </div>
    </div>
  );
}
