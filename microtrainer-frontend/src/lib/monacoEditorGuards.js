/**
 * Disable copy / cut / paste in Monaco (problem-solving arena).
 */
export function attachClipboardGuards(editor, monaco, { onBlocked } = {}) {
  if (!editor || !monaco) return () => {};

  const notify = () => {
    if (typeof onBlocked === "function") onBlocked();
  };

  const blockKeys = [
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC,
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX,
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV,
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.Insert,
    monaco.KeyMod.Shift | monaco.KeyCode.Insert,
  ];

  const disposables = blockKeys.map((key) =>
    editor.addCommand(key, () => {
      notify();
      return null;
    })
  );

  const dom = editor.getDomNode();
  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    notify();
  };

  if (dom) {
    dom.addEventListener("copy", prevent);
    dom.addEventListener("cut", prevent);
    dom.addEventListener("paste", prevent);
    dom.addEventListener("drop", prevent);
  }

  return () => {
    disposables.forEach((d) => {
      try {
        d?.dispose?.();
      } catch {
        /* ignore */
      }
    });
    if (dom) {
      dom.removeEventListener("copy", prevent);
      dom.removeEventListener("cut", prevent);
      dom.removeEventListener("paste", prevent);
      dom.removeEventListener("drop", prevent);
    }
  };
}
