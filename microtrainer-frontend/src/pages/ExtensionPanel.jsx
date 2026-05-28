import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { chatWithMicroTrainer } from "../api";
import SyncRequiredBanner from "../components/SyncRequiredBanner";
import { getStudentId } from "../utils/studentAuth";

const QUICK_PROMPTS = [
  "Explain this concept simply with one example.",
  "Give me a quick interview answer for this topic.",
  "Turn this into a step-by-step explanation.",
];

export default function ExtensionPanel() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const chatEndRef = useRef(null);
  const studentId = getStudentId();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    window.parent?.postMessage(
      {
        type: "MICROTRAINER_CONNECT",
        frontendUrl: window.location.origin,
      },
      "*"
    );
  }, []);

  async function askMicroTrainer(prompt = question) {
    const userQuestion = prompt.trim();
    if (!userQuestion || loading) return;

    setQuestion("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userQuestion, timestamp: new Date().toISOString() },
    ]);
    setLoading(true);

    try {
      const response = await chatWithMicroTrainer({
        question: userQuestion,
        sessionId,
      });

      if (response.data.sessionId && !sessionId) {
        setSessionId(response.data.sessionId);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.answer,
          timestamp: response.data.timestamp,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          content: error?.error || error?.message || "Could not reach MicroTrainer.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function openFullscreen(path = "/") {
    window.open(`${window.location.origin}${path}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">MicroTrainer</h1>
            <p className="text-xs text-slate-500">Quick help while you work</p>
          </div>
          <button
            type="button"
            onClick={() => openFullscreen("/")}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Fullscreen
          </button>
        </div>
      </header>

      <main className="space-y-4 px-4 py-4">
        {studentId && <SyncRequiredBanner studentId={studentId} />}

        <section className="grid grid-cols-2 gap-2">
          <ActionCard
            title="Ask"
            description="Get a direct answer"
            onClick={() => document.getElementById("microtrainer-panel-input")?.focus()}
          />
          <ActionCard
            title="Quick Explanation"
            description="Simple, short help"
            onClick={() => askMicroTrainer("Explain the topic I am studying in simple words with one small code example.")}
          />
          <ActionCard
            title="Interview Practice"
            description="Start a mock round"
            onClick={() => navigate("/interview?subject=React")}
          />
          <ActionCard
            title="Mini Dashboard"
            description="Check progress"
            onClick={() => navigate("/dashboard")}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setQuestion(prompt)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mb-3 max-h-[46vh] space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
                Ask a doubt, paste a concept, or start a quick interview practice.
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.timestamp}-${index}`}
                className={`rounded-xl p-3 text-sm ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : message.role === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-800"
                }`}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              askMicroTrainer();
            }}
          >
            <textarea
              id="microtrainer-panel-input"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask MicroTrainer..."
              rows={2}
              className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "..." : "Ask"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

function ActionCard({ title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </button>
  );
}
