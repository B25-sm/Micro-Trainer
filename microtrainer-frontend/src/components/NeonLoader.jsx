import { useId } from "react";

/** A compact orbital AI-core loader for chat response states. */
export default function NeonLoader({ className = "h-8 w-8", label = "AI is thinking" }) {
  const id = useId().replace(/:/g, "");
  const spectrumId = `loader-spectrum-${id}`;
  const reverseSpectrumId = `loader-reverse-spectrum-${id}`;
  const coreId = `loader-core-${id}`;
  const glowId = `loader-glow-${id}`;

  return (
    <svg
      viewBox="0 0 48 48"
      className={`${className} mt-ai-loader`}
      role="status"
      aria-label={label}
    >
      <defs>
        <linearGradient id={spectrumId} x1="4" y1="8" x2="44" y2="40">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="0.5" stopColor="#818cf8" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
        <linearGradient id={reverseSpectrumId} x1="40" y1="6" x2="8" y2="42">
          <stop offset="0" stopColor="#f0abfc" />
          <stop offset="0.48" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id={coreId}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.32" stopColor="#a5f3fc" />
          <stop offset="1" stopColor="#6366f1" />
        </radialGradient>
        <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle className="mt-ai-loader__halo" cx="24" cy="24" r="12" fill="#6366f1" />
      <circle cx="24" cy="24" r="20" fill="none" stroke="#67e8f9" strokeOpacity="0.12" />

      <g className="mt-ai-loader__orbit mt-ai-loader__orbit--outer">
        <circle
          cx="24"
          cy="24"
          r="19"
          fill="none"
          stroke={`url(#${spectrumId})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31 88"
          filter={`url(#${glowId})`}
        />
        <circle cx="24" cy="5" r="1.7" fill="#e879f9" filter={`url(#${glowId})`} />
      </g>

      <g className="mt-ai-loader__orbit mt-ai-loader__orbit--inner">
        <circle
          cx="24"
          cy="24"
          r="13.5"
          fill="none"
          stroke={`url(#${reverseSpectrumId})`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="25 60"
          filter={`url(#${glowId})`}
        />
        <circle cx="24" cy="10.5" r="1.35" fill="#67e8f9" filter={`url(#${glowId})`} />
      </g>

      <g className="mt-ai-loader__core" filter={`url(#${glowId})`}>
        <path d="M24 17.5 30.5 24 24 30.5 17.5 24Z" fill={`url(#${coreId})`} />
        <circle cx="24" cy="24" r="2.2" fill="#fff" />
      </g>
    </svg>
  );
}
