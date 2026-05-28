/** Export wireframe SVG to PNG / SVG / PDF (client-side, no AI) */

export function downloadSvgFile(svgEl, filename) {
  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  triggerDownload(blob, `${filename}.svg`);
}

export async function downloadPngFromSvg(svgEl, filename, scale = 2) {
  const xml = new XMLSerializer().serializeToString(svgEl);
  const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await loadImage(url);
    const w = (svgEl.viewBox?.baseVal?.width || svgEl.clientWidth || 400) * scale;
    const h = (svgEl.viewBox?.baseVal?.height || svgEl.clientHeight || 280) * scale;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    triggerDownload(blob, `${filename}.png`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** PDF via print-friendly window (no extra npm deps) */
export function downloadPdfFromSvg(svgEl, filename, title) {
  const xml = new XMLSerializer().serializeToString(svgEl);
  const win = window.open("", "_blank");
  if (!win) {
    alert("Allow pop-ups to download PDF, or use PNG/SVG.");
    return;
  }
  win.document.write(`<!DOCTYPE html>
<html><head><title>${escapeHtml(title)}</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 24px; margin: 0; }
  h1 { font-size: 16px; margin: 0 0 16px; color: #1e3a5f; }
  svg { max-width: 100%; height: auto; border: 1px solid #e5e7eb; border-radius: 8px; }
  @media print { body { padding: 12px; } }
</style></head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${xml}
  <script>window.onload = () => { window.print(); }</script>
</body></html>`);
  win.document.close();
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function triggerDownload(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
