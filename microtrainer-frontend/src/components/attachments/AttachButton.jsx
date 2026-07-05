import { useRef } from "react";
import { Plus } from "lucide-react";
import { MAX_ATTACHMENTS, readAttachment } from "../../utils/fileAttachments";

/**
 * Shared "+" attach trigger. Owns the hidden file input; hands normalized
 * attachment objects (or errors) back to the parent, which owns the list.
 *
 * @param {object} props
 * @param {string} props.accept - accept attribute for the file input
 * @param {number} props.count - current number of attachments (for the limit)
 * @param {(items:object[]) => void} props.onAdd
 * @param {(message:string) => void} props.onError
 * @param {boolean} [props.disabled]
 */
export default function AttachButton({ accept, count = 0, onAdd, onError, disabled }) {
  const inputRef = useRef(null);

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
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        title="Attach files"
        aria-label="Attach files"
        className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/[0.05] dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="h-5 w-5" />
      </button>
    </>
  );
}
