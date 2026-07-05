import NeonLoader from "../NeonLoader";

export default function TypingIndicator() {
  return (
    <div className="px-1 py-2" aria-label="AI is typing">
      <NeonLoader />
    </div>
  );
}
