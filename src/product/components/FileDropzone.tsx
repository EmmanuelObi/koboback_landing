import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "../ui/tokens";
import {
  normalizeStatementFile,
  validateStatementFile,
} from "../lib/auditStatus";

interface FileDropzoneProps {
  onFileSelect: (file: File | null) => void;
  onValidationError?: (message: string) => void;
  disabled?: boolean;
  /** Parent-controlled selected filename (drives selected UI) */
  selectedName?: string | null;
}

/**
 * Mobile-safe statement picker.
 *
 * Critical: keep a real &lt;input type="file"&gt; inside a &lt;label&gt; and do not
 * call preventDefault / input.click(). Programmatic clicks and opacity-0
 * overlays frequently fail on iOS/Android (picker closes, no onChange).
 */
export default function FileDropzone({
  onFileSelect,
  onValidationError,
  disabled,
  selectedName,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localName, setLocalName] = useState<string | null>(null);
  const [localSize, setLocalSize] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const displayName = selectedName ?? localName;
  const hasSelection = Boolean(displayName);

  const fail = useCallback(
    (message: string) => {
      setHint(message);
      onValidationError?.(message);
    },
    [onValidationError],
  );

  const acceptFile = useCallback(
    (file: File) => {
      const normalized = normalizeStatementFile(file);
      const validationError = validateStatementFile(normalized);
      if (validationError) {
        setLocalName(null);
        setLocalSize(null);
        fail(validationError);
        return;
      }
      setHint(null);
      setLocalName(normalized.name);
      setLocalSize(normalized.size);
      onFileSelect(normalized);
    },
    [fail, onFileSelect],
  );

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [disabled],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (!file) {
        fail("No file was dropped. Please choose a PDF, CSV, or Excel statement.");
        return;
      }
      acceptFile(file);
    },
    [acceptFile, disabled, fail],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      const file = list && list.length > 0 ? list[0] : null;
      // Reset so the same path can be chosen again later.
      e.target.value = "";
      if (!file) {
        // User cancelled the picker — stay quiet, keep empty state.
        return;
      }
      acceptFile(file);
    },
    [acceptFile],
  );

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalName(null);
    setLocalSize(null);
    setHint(null);
    if (inputRef.current) inputRef.current.value = "";
    onFileSelect(null);
  };

  return (
    <div
      className={cn(
        "border border-dashed rounded-xl p-8 sm:p-10 text-center transition-colors",
        dragActive
          ? "border-brand bg-white"
          : hasSelection
            ? "border-brand/40 bg-white"
            : "border-slate-300/90 bg-white/80 hover:border-brand/40 hover:bg-white",
        disabled && "opacity-50",
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {hasSelection ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-green-600 shrink-0" />
          <div className="text-left min-w-0">
            <p className="text-[14px] font-medium text-slate-950 truncate">
              {displayName}
            </p>
            {localSize != null ? (
              <p className="text-[13px] text-slate-500">
                {(localSize / 1024).toFixed(1)} KB
              </p>
            ) : (
              <p className="text-[13px] text-slate-500">Ready to upload</p>
            )}
          </div>
          <button
            type="button"
            onClick={clearFile}
            disabled={disabled}
            aria-label="Remove file"
            className="ml-2 p-1.5 rounded-md hover:bg-slate-100 transition shrink-0"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mx-auto mb-4 h-11 w-11 rounded-md bg-slate-100 flex items-center justify-center">
            <Upload className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-[14px] text-slate-700 font-medium">
            Drop your statement here
          </p>
          <p className="text-[13px] text-slate-400 mt-1.5 mb-4">
            PDF, CSV, or Excel · max 10 MB
          </p>

          {/*
            Native label wrapping the input is the most reliable mobile pattern.
            Do not preventDefault or call input.click() programmatically.
          */}
          <label
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 text-[13px] font-semibold text-white",
              disabled
                ? "pointer-events-none opacity-60"
                : "cursor-pointer hover:opacity-95",
            )}
          >
            Choose file
            <input
              ref={inputRef}
              type="file"
              // No accept= filter — Android/iOS often return empty file lists
              // when the MIME/extension matrix is too strict. Validate in JS.
              onChange={handleChange}
              disabled={disabled}
              // display:none inside a label is fine and works on iOS; do NOT
              // open via input.click() when the input is display:none.
              className="hidden"
            />
          </label>

          {hint && (
            <p className="mt-3 text-[12px] text-red-600 max-w-[280px]">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
}
