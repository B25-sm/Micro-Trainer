import { FileText, Image as ImageIcon, X } from "lucide-react";

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * The row of attachment chips shown above a composer. `onRemove` is optional —
 * when omitted (e.g. rendering inside a sent message) chips are read-only.
 */
export default function AttachmentChips({ attachments = [], onRemove }) {
  if (!attachments.length) return null;

  return (
    <div className="flex flex-wrap gap-2 px-1 pb-2">
      {attachments.map((a) => (
        <div
          key={a.id || a.name}
          className="group flex items-center gap-2 max-w-[220px] rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.06] pl-2 pr-1.5 py-1.5"
        >
          {a.kind === "image" && a.dataUrl ? (
            <img src={a.dataUrl} alt="" className="h-7 w-7 rounded object-cover flex-shrink-0" />
          ) : a.kind === "image" ? (
            <ImageIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
          ) : (
            <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">{a.name}</p>
            {a.size ? (
              <p className="text-[10px] text-gray-400">{formatSize(a.size)}</p>
            ) : null}
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(a.id)}
              className="flex-shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/[0.06] dark:hover:bg-white/10"
              aria-label={`Remove ${a.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
