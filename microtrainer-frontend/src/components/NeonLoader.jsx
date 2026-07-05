/**
 * Two glowing blue neon arcs chasing each other in a continuous spin —
 * a homage to the dual-bar loading animation referenced by the user
 * (dribbble.com/shots/6801166), rebuilt from a still frame.
 */
export default function NeonLoader({ className = "h-7 w-7", label = "Loading" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} animate-[neon-spin_1.4s_linear_infinite]`}
      role="status"
      aria-label={label}
    >
      <defs>
        <filter id="neon-loader-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M 22 33 A 39 39 0 0 1 78 33"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="9"
        strokeLinecap="round"
        filter="url(#neon-loader-glow)"
      />
      <path
        d="M 78 67 A 39 39 0 0 1 22 67"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="9"
        strokeLinecap="round"
        filter="url(#neon-loader-glow)"
      />
    </svg>
  );
}
