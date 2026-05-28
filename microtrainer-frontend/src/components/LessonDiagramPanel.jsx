import { useRef, useMemo, useState, useId, useEffect, forwardRef } from "react";
import { createPortal } from "react-dom";
import { layoutDiagram, edgePath, edgeLabelPos, nodeTextLayout } from "../utils/diagramLayout";
import {
  downloadSvgFile,
  downloadPngFromSvg,
  downloadPdfFromSvg,
} from "../utils/diagramDownload";

export default function LessonDiagramPanel({ diagram, conceptTitle }) {
  const svgRef = useRef(null);
  const fullscreenSvgRef = useRef(null);
  const [downloading, setDownloading] = useState(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const layout = useMemo(() => layoutDiagram(diagram), [diagram]);
  const markerId = `wf-arrow-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    if (!fullscreenOpen) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") setFullscreenOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreenOpen]);

  if (!diagram?.nodes?.length) return null;

  const svgForExport = (ref) => {
    const el = ref?.current;
    if (!el) return null;
    const clone = el.cloneNode(true);
    clone.setAttribute("width", String(layout.width));
    clone.setAttribute("height", String(layout.height));
    return clone;
  };

  const slug = (conceptTitle || diagram.title || "diagram")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 40);

  const runDownload = async (type, ref = svgRef) => {
    const exportSvg = svgForExport(ref);
    if (!exportSvg) return;
    setDownloading(type);
    try {
      if (type === "png") await downloadPngFromSvg(exportSvg, slug);
      else if (type === "svg") downloadSvgFile(exportSvg, slug);
      else if (type === "pdf")
        downloadPdfFromSvg(exportSvg, slug, diagram.title || conceptTitle);
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(null);
    }
  };

  const downloadRow = (ref) => (
    <div className="flex gap-1.5">
      <DownloadBtn label="PNG" active={downloading === "png"} onClick={() => runDownload("png", ref)} />
      <DownloadBtn label="SVG" active={downloading === "svg"} onClick={() => runDownload("svg", ref)} />
      <DownloadBtn
        label="PDF"
        active={downloading === "pdf"}
        onClick={() => runDownload("pdf", ref)}
        title="Opens print dialog — choose Save as PDF"
      />
    </div>
  );

  return (
    <>
      <aside
        className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col w-full"
        aria-label="Concept wireframe diagram"
      >
        <div className="px-4 py-2.5 border-b border-gray-100 bg-slate-50 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Wireframe
            </p>
            <h3 className="text-sm font-semibold text-slate-800 leading-snug mt-0.5">
              {diagram.title}
            </h3>
            {diagram.subtitle && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{diagram.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setFullscreenOpen(true)}
            className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition"
            title="Open wireframe fullscreen"
            aria-label="Open wireframe fullscreen"
          >
            <ExpandIcon className="w-3.5 h-3.5" />
            Fullscreen
          </button>
        </div>

        <button
          type="button"
          onClick={() => setFullscreenOpen(true)}
          className="px-3 py-3 bg-[#fafbfc] w-full text-left cursor-zoom-in group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-inset"
          aria-label="Tap to open wireframe fullscreen"
        >
          <WireframeSvg
            ref={svgRef}
            layout={layout}
            diagram={diagram}
            markerId={markerId}
            className="block w-full h-auto max-h-[320px]"
          />
          <p className="mt-2 text-[10px] text-slate-400 text-center group-hover:text-slate-500 transition">
            Click diagram to view fullscreen
          </p>
        </button>

        <div className="px-3 py-2 border-t border-gray-100">{downloadRow(svgRef)}</div>

        <p className="px-3 pb-2.5 text-[10px] text-slate-400 leading-snug">
          Sketch in rough notes — exports are full size.
        </p>
      </aside>

      {fullscreenOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex flex-col bg-slate-900/90 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={`Wireframe: ${diagram.title}`}
          >
            <header className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Wireframe
                </p>
                <h2 className="text-base font-semibold text-slate-900 truncate">
                  {diagram.title}
                </h2>
                {diagram.subtitle && (
                  <p className="text-sm text-slate-500 truncate">{diagram.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFullscreenOpen(false)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
                autoFocus
              >
                <CloseIcon className="w-4 h-4" />
                Close
              </button>
            </header>

            <div
              className="flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center min-h-0"
              onClick={(e) => {
                if (e.target === e.currentTarget) setFullscreenOpen(false);
              }}
            >
              <div className="w-full max-w-5xl bg-[#fafbfc] rounded-2xl border border-gray-200 shadow-xl p-4 sm:p-6">
                <WireframeSvg
                  ref={fullscreenSvgRef}
                  layout={layout}
                  diagram={diagram}
                  markerId={`${markerId}-fs`}
                  className="block w-full h-auto"
                />
              </div>
            </div>

            <footer className="shrink-0 px-4 py-3 bg-white border-t border-gray-200">
              <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex gap-1.5 flex-1">{downloadRow(fullscreenSvgRef)}</div>
                <p className="text-xs text-slate-400 sm:text-right">
                  Press <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono">Esc</kbd> to close
                </p>
              </div>
            </footer>
          </div>,
          document.body
        )}
    </>
  );
}

const WireframeSvg = forwardRef(function WireframeSvg(
  { layout, diagram, markerId, className },
  ref
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label={diagram.title}
    >
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="#64748b" />
        </marker>
      </defs>

      {layout.edges.map((e, i) => {
        const { startX, startY, endX, endY } = edgePath(e.from, e.to);
        const labelPos = edgeLabelPos(e.from, e.to, startX, startY, endX, endY);
        return (
          <g key={`edge-${i}`}>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="#94a3b8"
              strokeWidth="1.5"
              markerEnd={`url(#${markerId})`}
            />
            {e.label ? (
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: 10,
                  fontFamily: "system-ui, sans-serif",
                  fill: "#64748b",
                }}
              >
                {e.label}
              </text>
            ) : null}
          </g>
        );
      })}

      {layout.nodes.map((n) => {
        const { labelStartY, techStartY } = nodeTextLayout(n);
        const clipId = `clip-${markerId}-${n.id}`;
        return (
          <g key={n.id}>
            <defs>
              <clipPath id={clipId}>
                <rect x={n.x + 4} y={n.y + 4} width={n.w - 8} height={n.h - 8} rx="6" />
              </clipPath>
            </defs>
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx="8"
              fill="#ffffff"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <g clipPath={`url(#${clipId})`}>
              {n.labelLines.map((line, li) => (
                <text
                  key={`l-${li}`}
                  x={n.x + n.w / 2}
                  y={labelStartY + li * 13}
                  textAnchor="middle"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "system-ui, sans-serif",
                    fill: "#0f172a",
                  }}
                >
                  {line}
                </text>
              ))}
              {n.techLines.map((line, ti) => (
                <text
                  key={`t-${ti}`}
                  x={n.x + n.w / 2}
                  y={techStartY + ti * 11}
                  textAnchor="middle"
                  style={{
                    fontSize: 9,
                    fontFamily: "ui-monospace, monospace",
                    fill: "#475569",
                  }}
                >
                  {line}
                </text>
              ))}
            </g>
          </g>
        );
      })}
    </svg>
  );
});

function DownloadBtn({ label, onClick, active, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!!active}
      title={title}
      className="flex-1 min-w-0 px-2 py-1 text-[11px] font-medium rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-slate-300 disabled:opacity-50 transition"
    >
      {active ? "…" : label}
    </button>
  );
}

function ExpandIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
