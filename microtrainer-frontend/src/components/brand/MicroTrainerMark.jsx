/**
 * MicroTrainer brand mark — MT monogram with practice-stripe accent.
 * Used on home, chat coach replies, etc.
 */
export default function MicroTrainerMark({
  size = "md",
  className = "",
  showStripe = true,
}) {
  const sizes = {
    sm: { box: "h-8 w-8 rounded-lg text-xs", stripe: "h-8 w-1 rounded-l-lg" },
    md: { box: "h-11 w-11 rounded-xl text-sm", stripe: "h-11 w-1.5 rounded-l-xl" },
    lg: { box: "h-14 w-14 rounded-2xl text-base", stripe: "h-14 w-2 rounded-l-2xl" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-stretch shrink-0 ${className}`} aria-hidden>
      {showStripe && (
        <div
          className={`${s.stripe} bg-gradient-to-b from-[#1a73e8] via-[#2563eb] to-[#ea580c] dark:from-[#8ab4f8] dark:via-[#60a5fa] dark:to-[#fb923c]`}
        />
      )}
      <div
        className={`${s.box} flex items-center justify-center font-bold tracking-tight bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-[#202124] shadow-sm`}
      >
        MT
      </div>
    </div>
  );
}
