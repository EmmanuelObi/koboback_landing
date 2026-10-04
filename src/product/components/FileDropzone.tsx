import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "../ui/tokens";
import {
  prepareStatementFile,
  type PreparedStatementUpload,
} from "../lib/auditStatus";

interface FileDropzoneProps {
  onFileSelect: (file: File | PreparedStatementUpload | null) => void;
  onValidationError?: (message: string) => void;
  disabled?: boolean;
  /** Parent-controlled selected filename (drives selected UI) */
  selectedName?: string | null;
}

/**
 * Mobile-safe statement picker tuned for Android Chrome.
 *
 * Prefer a real button + input.click() over a full-zone opacity overlay alone —
 * some Android Chrome builds open the picker from overlays then never fire onChange.
 * No `accept` filter: Android often omits MIME/extension and a strict accept hides
 * valid statement files in Downloads.
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
  const [preparing, setPreparing] = useState(false);

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
    async (file: File) => {
      setPreparing(true);
      try {
        const result = await prepareStatementFile(file);
        if ("error" in result) {
          setLocalName(null);
          setLocalSize(null);
          fail(result.error);
          return;
        }
        setHint(null);
        setLocalName(result.filename);
        setLocalSize(result.size);
        onFileSelect(result);
      } finally {
        setPreparing(false);
      }
    },
    [fail, onFileSelect],
  );

  const openPicker = useCallback(() => {
    if (disabled || preparing) return;
    const input = inputRef.current;
    if (!input) return;
    // Reset before open so selecting the same path fires onChange again.
    input.value = "";
    input.click();
  }, [disabled, preparing]);

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
      if (disabled || preparing) return;

      const file = e.dataTransfer.files?.[0];
      if (!file) {
        fail("No file was dropped. Please choose a PDF, CSV, or Excel statement.");
        return;
      }
      void acceptFile(file);
    },
    [acceptFile, disabled, fail, preparing],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      const file = list && list.length > 0 ? list[0] : null;
      e.target.value = "";
      if (!file) return;
      void acceptFile(file);
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
        "relative border border-dashed rounded-xl p-8 sm:p-10 text-center transition-colors",
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
      {/*
        Keep the input in the DOM (not display:none). Opening via button.click()
        is the reliable path on Android Chrome.
      */}
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        disabled={disabled || preparing}
        className="absolute h-px w-px opacity-0"
        aria-hidden="true"
        tabIndex={-1}
      />

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
            disabled={disabled || preparing}
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
            {preparing ? "Reading file…" : "Tap to choose your statement"}
          </p>
          <p className="text-[13px] text-slate-400 mt-1.5">
            PDF, CSV, or Excel · max 10 MB
          </p>
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled || preparing}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            {preparing ? "Reading…" : "Choose file"}
          </button>
          {hint && (
            <p className="mt-3 text-[12px] text-red-600 max-w-[320px]">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
}
