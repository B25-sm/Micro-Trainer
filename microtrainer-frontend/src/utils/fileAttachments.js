// =======================================================
// Client-side file attachment reading + text extraction.
// Documents (PDF/DOCX/TXT/MD) → extracted text; images → base64 data URL.
// =======================================================

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const MAX_ATTACHMENTS = 4;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // xAI limit
const MAX_DOC_BYTES = 10 * 1024 * 1024;
export const MAX_TEXT_CHARS = 16000;

const IMAGE_MIMES = ["image/png", "image/jpeg", "image/jpg"];

// accept-strings for the hidden <input type="file">
export const ACCEPT_DOCUMENTS = ".pdf,.docx,.txt,.md,.markdown,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const ACCEPT_DOCUMENTS_AND_IMAGES = `${ACCEPT_DOCUMENTS},image/png,image/jpeg`;

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function isImage(file) {
  return IMAGE_MIMES.includes(file.type) || /\.(png|jpe?g)$/i.test(file.name);
}

function isPdf(file) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function isDocx(file) {
  return (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    /\.docx$/i.test(file.name)
  );
}

function readTextFile(file) {
  return file.text();
}

function readImageDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

async function extractPdfText(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const parts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    parts.push(content.items.map((it) => it.str).join(" "));
    if (parts.join("\n").length > MAX_TEXT_CHARS) break;
  }
  return parts.join("\n\n");
}

async function extractDocxText(file) {
  const buffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
  return value || "";
}

/**
 * Read one File into a normalized attachment object.
 * @returns {Promise<{id,name,kind,text?,dataUrl?,size,mime}>}
 * @throws {Error} with a user-friendly message on unsupported/oversized files
 */
export async function readAttachment(file) {
  if (isImage(file)) {
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(`${file.name} is too large (images must be under 20MB).`);
    }
    const dataUrl = await readImageDataUrl(file);
    return { id: genId(), name: file.name, kind: "image", dataUrl, size: file.size, mime: file.type };
  }

  if (file.size > MAX_DOC_BYTES) {
    throw new Error(`${file.name} is too large (documents must be under 10MB).`);
  }

  let raw;
  if (isPdf(file)) {
    raw = await extractPdfText(file);
  } else if (isDocx(file)) {
    raw = await extractDocxText(file);
  } else {
    raw = await readTextFile(file);
  }

  let text = (raw || "").trim();
  if (!text) {
    throw new Error(`Could not read any text from ${file.name}.`);
  }
  if (text.length > MAX_TEXT_CHARS) {
    text = `${text.slice(0, MAX_TEXT_CHARS)}\n\n[…truncated]`;
  }

  return { id: genId(), name: file.name, kind: "document", text, size: file.size, mime: file.type };
}

/**
 * Build the payload sent to the AI Chat stream endpoint from local attachments:
 * documents carry their extracted text; images carry their base64 dataUrl.
 */
export function toStreamAttachments(attachments) {
  return attachments.map((a) =>
    a.kind === "image"
      ? { name: a.name, kind: "image", dataUrl: a.dataUrl }
      : { name: a.name, kind: "document", text: a.text }
  );
}

/**
 * Concatenate extracted document text into one delimited context block
 * for the text-only Home tutor route.
 */
export function documentsToContextText(attachments) {
  const docs = attachments.filter((a) => a.kind === "document" && a.text);
  if (!docs.length) return "";
  let combined = docs
    .map((d) => `--- Attached file: ${d.name} ---\n${d.text}`)
    .join("\n\n");
  if (combined.length > MAX_TEXT_CHARS) {
    combined = `${combined.slice(0, MAX_TEXT_CHARS)}\n\n[…truncated]`;
  }
  return combined;
}
