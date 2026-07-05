import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";

const components = {
  p: ({ children }) => (
    <p className="mb-3 last:mb-0 leading-relaxed text-gray-800 dark:text-gray-100">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 ml-5 list-disc space-y-1 text-gray-800 dark:text-gray-100">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-5 list-decimal space-y-1 text-gray-800 dark:text-gray-100">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => (
    <h1 className="mb-3 mt-4 text-lg font-semibold text-gray-900 dark:text-gray-50 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 text-base font-semibold text-gray-900 dark:text-gray-50 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-3 text-sm font-semibold text-gray-900 dark:text-gray-50 first:mt-0">{children}</h3>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900 dark:text-gray-50">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-4 border-gray-300 dark:border-gray-600 pl-3 italic text-gray-600 dark:text-gray-300">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-gray-200 dark:border-gray-700" />,
  code({ inline, className, children }) {
    if (inline) {
      return (
        <code className="rounded-md border border-gray-200/80 bg-gray-100 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-gray-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {children}
        </code>
      );
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
  pre({ children }) {
    return <>{children}</>;
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#7c3aed] dark:text-[#a78bfa] underline underline-offset-2 hover:opacity-80"
      >
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="my-3 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-left font-semibold">
        {children}
      </th>
    );
  },
  td({ children }) {
    return <td className="border border-gray-200 dark:border-gray-700 px-3 py-1.5 align-top">{children}</td>;
  },
};

export default function MarkdownRenderer({ content }) {
  return (
    <div className="text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
