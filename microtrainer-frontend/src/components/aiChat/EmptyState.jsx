import { Bot } from "lucide-react";

const STARTER_PROMPTS = [
  "Explain closures in JavaScript with a simple example",
  "Write a Python function to reverse a linked list",
  "What's the difference between SQL and NoSQL databases?",
  "Help me debug a React useEffect infinite loop",
];

export default function EmptyState({ onPick }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 dark:bg-[#a78bfa]/10 flex items-center justify-center mb-4">
        <Bot className="w-6 h-6 text-[#7c3aed] dark:text-[#a78bfa]" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
        How can I help you today?
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        Ask anything — I'll remember our conversation as we go.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="text-left text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
