import { useCallback, useEffect, useRef, useState } from 'react';

const HANDLE_HEIGHT = 6;
const MIN_EDITOR = 250;
const MIN_CONSOLE = 140;
const DEFAULT_CONSOLE_RATIO = 0.3;
const STORAGE_KEY = 'microtrainer-editor-console-ratio';

function clampConsoleHeight(total, desired) {
  const maxConsole = total - HANDLE_HEIGHT - MIN_EDITOR;
  return Math.max(MIN_CONSOLE, Math.min(maxConsole, desired));
}

function readInitialConsoleHeight(total) {
  const saved = localStorage.getItem(STORAGE_KEY);
  const ratio = saved ? parseFloat(saved) : DEFAULT_CONSOLE_RATIO;
  return clampConsoleHeight(total, Math.round((total - HANDLE_HEIGHT) * ratio));
}

/**
 * Vertical split: top panel (editor) + drag handle + bottom panel (console).
 */
export default function ResizeSplitter({ top, bottom, className = '' }) {
  const containerRef = useRef(null);
  const consoleHeightRef = useRef(MIN_CONSOLE);
  const initializedRef = useRef(false);
  const [consoleHeight, setConsoleHeight] = useState(MIN_CONSOLE);
  const [containerHeight, setContainerHeight] = useState(0);
  const [dragging, setDragging] = useState(false);

  const applyLayout = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const total = el.clientHeight;
    setContainerHeight(total);

    if (!initializedRef.current && total > MIN_EDITOR + MIN_CONSOLE) {
      const initial = readInitialConsoleHeight(total);
      consoleHeightRef.current = initial;
      setConsoleHeight(initial);
      initializedRef.current = true;
      return;
    }

    setConsoleHeight((prev) => {
      const next = clampConsoleHeight(total, prev);
      consoleHeightRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    applyLayout();
    const el = containerRef.current;
    if (!el) return undefined;

    const ro = new ResizeObserver(() => applyLayout());
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout]);

  const editorHeight = Math.max(
    MIN_EDITOR,
    containerHeight - HANDLE_HEIGHT - consoleHeight
  );

  const onMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startConsole = consoleHeightRef.current;
    const total = containerRef.current?.clientHeight ?? 0;

    setDragging(true);

    const onMove = (ev) => {
      const delta = startY - ev.clientY;
      const next = clampConsoleHeight(total, startConsole + delta);
      consoleHeightRef.current = next;
      setConsoleHeight(next);
    };

    const onUp = () => {
      setDragging(false);
      const t = containerRef.current?.clientHeight ?? 0;
      if (t > 0) {
        localStorage.setItem(
          STORAGE_KEY,
          String(consoleHeightRef.current / (t - HANDLE_HEIGHT))
        );
      }
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div
      ref={containerRef}
      className={`flex min-h-0 flex-1 flex-col ${className} ${dragging ? 'select-none' : ''}`}
    >
      <div
        className="min-h-0 overflow-hidden"
        style={{ height: editorHeight, minHeight: MIN_EDITOR }}
      >
        {top}
      </div>

      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize editor and console"
        onMouseDown={onMouseDown}
        style={{ height: HANDLE_HEIGHT }}
        className={`group flex shrink-0 cursor-row-resize items-center justify-center border-y border-zinc-700 bg-zinc-800 hover:bg-zinc-600 ${
          dragging ? 'bg-sky-600' : ''
        }`}
      >
        <div className="h-1 w-14 rounded-full bg-zinc-500 group-hover:bg-zinc-300" />
      </div>

      <div
        className="min-h-0 overflow-hidden"
        style={{ height: consoleHeight, minHeight: MIN_CONSOLE }}
      >
        {bottom}
      </div>
    </div>
  );
}
