import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useDisplayMode } from "../../hooks/useDisplayMode";

function languageFromClassName(className) {
  const match = /language-([\w+#-]+)/i.exec(className || "");
  return (match?.[1] || "text").toLowerCase();
}

export default function CodeBlock({ className, children }) {
  const { darkMode } = useDisplayMode();
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");
  const language = languageFromClassName(className);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl bg-[#0d1117] ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3 bg-[#161b22] px-3 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={darkMode ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "12.5px",
          lineHeight: 1.7,
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
