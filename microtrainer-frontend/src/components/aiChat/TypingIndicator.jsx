export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2" aria-label="AI is typing">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse [animation-delay:200ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse [animation-delay:400ms]" />
    </div>
  );
}
