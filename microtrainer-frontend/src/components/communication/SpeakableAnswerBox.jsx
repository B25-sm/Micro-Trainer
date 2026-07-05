import { Mic, MicOff } from "lucide-react";

export default function SpeakableAnswerBox({
  value,
  onChange,
  disabled,
  placeholder = "Start speaking your answer here — complete sentences, as in a real interview...",
  rows = 8,
  speech,
  label = "Your answer (type or speak as you would in the interview)",
}) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="flex-1 flex flex-col min-h-[180px]">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
        {speech.supported && (
          <button
            type="button"
            onClick={speech.isRecording ? speech.stopRecording : speech.startRecording}
            disabled={disabled}
            title={speech.isRecording ? "Stop recording" : "Speak your answer"}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition disabled:opacity-60 ${
              speech.isRecording
                ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                : "bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {speech.isRecording ? (
              <>
                <MicOff className="h-3.5 w-3.5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" />
                Speak
              </>
            )}
          </button>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        placeholder={placeholder}
        className="flex-1 w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#202124] px-4 py-3 text-sm sm:text-base text-gray-800 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 dark:focus:ring-[#a78bfa]/20 disabled:opacity-60"
      />
      {speech.isRecording && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          Listening{speech.interimText ? `: "${speech.interimText}"` : "..."}
        </p>
      )}
      {speech.voiceError && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">{speech.voiceError}</p>
      )}
      <p className="text-xs text-gray-400 mt-1.5 text-right">
        {wordCount} words · aim for 80–150 for most prompts
      </p>
    </div>
  );
}
