import { useEffect, useRef, useState } from "react";
import { FileText, Image as ImageIcon, Plus } from "lucide-react";
import {
  ACCEPT_DOCUMENTS,
  ACCEPT_IMAGES,
  MAX_ATTACHMENTS,
  readAttachment,
} from "../../utils/fileAttachments";

/**
 * "+" attach trigger — opens a small menu (Gemini/ChatGPT-style) to choose
 * what to attach, rather than jumping straight to the OS file picker.
 * Owns the hidden file inputs; hands normalized attachment objects (or
 * errors) back to the parent, which owns the list.
 *
 * @param {object} props
 * @param {boolean} [props.allowImages] - also offer a "Photos" option (AI Chat only)
 * @param {number} props.count - current number of attachments (for the limit)
 * @param {(items:object[]) => void} props.onAdd
 * @param {(message:string) => void} props.onError
 * @param {boolean} [props.disabled]
 */
export default function AttachButton({ allowImages = false, count = 0, onAdd, onError, disabled }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const docInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const room = MAX_ATTACHMENTS - count;
    if (room <= 0) {
      onError?.(`You can attach up to ${MAX_ATTACHMENTS} files.`);
      return;
    }

    const results = [];
    for (const file of files.slice(0, room)) {
      try {
        results.push(await readAttachment(file));
      } catch (err) {
        onError?.(err.message || `Could not read ${file.name}.`);
      }
    }
    if (files.length > room) {
      onError?.(`Only the first ${room} file${room === 1 ? "" : "s"} were added (max ${MAX_ATTACHMENTS}).`);
    }
    if (results.length) onAdd?.(results);
  };

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      <input
        ref={docInputRef}
        type="file"
        accept={ACCEPT_DOCUMENTS}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {allowImages && (
        <input
          ref={imageInputRef}
          type="file"
          accept={ACCEPT_IMAGES}
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        title="Attach files"
        aria-label="Attach files"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center justify-center h-8 w-8 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/[0.05] dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#2f2f2f] shadow-lg py-1.5 z-10"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              docInputRef.current?.click();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <FileText className="h-4 w-4 text-gray-400" />
            Upload a document
          </button>
          {allowImages && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                imageInputRef.current?.click();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            >
              <ImageIcon className="h-4 w-4 text-gray-400" />
              Upload a photo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
