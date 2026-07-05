import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { getAiChatStatus } from "../api";
import {
  AI_CHAT_MODELS,
  DEFAULT_AI_CHAT_SETTINGS,
  loadAiChatSettings,
  saveAiChatSettings,
} from "../utils/aiChatSettingsStorage";

export default function AiChatSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(DEFAULT_AI_CHAT_SETTINGS);
  const [status, setStatus] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadAiChatSettings());
    getAiChatStatus()
      .then((res) => setStatus(res.data))
      .catch(() => setStatus({ configured: false, models: [] }));
  }, []);

  const handleSave = () => {
    saveAiChatSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button
        type="button"
        onClick={() => navigate("/ai-chat")}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to AI Chat
      </button>

      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">AI Chat settings</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        These preferences are stored in your browser and applied to new messages you send.
      </p>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Backend status</h2>
        {status === null ? (
          <p className="text-sm text-gray-400">Checking…</p>
        ) : status.configured ? (
          <p className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            Grok API key is configured on the server.
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-sm text-red-500">
            <XCircle className="w-4 h-4" />
            No GROK_API_KEY set — add it to the backend's .env, then restart the server.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">Model</label>
          <select
            value={settings.model}
            onChange={(e) => setSettings((s) => ({ ...s, model: e.target.value }))}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2b2e] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#7c3aed] dark:focus:border-[#a78bfa]"
          >
            {AI_CHAT_MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Temperature</label>
            <span className="text-xs text-gray-500 dark:text-gray-400">{settings.temperature.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={settings.temperature}
            onChange={(e) => setSettings((s) => ({ ...s, temperature: Number(e.target.value) }))}
            className="w-full accent-[#7c3aed] dark:accent-[#a78bfa]"
          />
          <p className="text-xs text-gray-400 mt-1">Lower = more focused. Higher = more creative.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">
            Custom system prompt <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => setSettings((s) => ({ ...s, systemPrompt: e.target.value }))}
            rows={4}
            placeholder="e.g. Answer concisely and always show a code example."
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2b2e] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-[#7c3aed] dark:focus:border-[#a78bfa] resize-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="text-sm font-medium px-4 py-2 rounded-lg bg-[#7c3aed] dark:bg-[#a78bfa] text-white dark:text-gray-900 hover:opacity-90"
      >
        {saved ? "Saved ✓" : "Save settings"}
      </button>
    </div>
  );
}
