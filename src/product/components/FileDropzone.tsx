import { useCallback, useEffect, useRef, useState } from "react";
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
 * Statement file picker.
 *
 * Uses a visible native <input type="file"> — custom overlay / label / .click()
 * hacks are unreliable on Android Chrome (picker opens, no change event).
 * Also recovers the File on window focus if change was skipped.
 */
export default function FileDropzone({
  onFileSelect,
  onValidationError,
  disabled,
  selectedName,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pickerArmedRef = useRef(false);
  const changeHandledRef = useRef(false);
  const acceptFileRef = useRef<(file: File) => Promise<void>>(async () => {});
  const failRef = useRef<(message: string) => void>(() => {});

  const [dragActive, setDragActive] = useState(false);
  const [localName, setLocalName] = useState<string | null>(null);
  const [localSize, setLocalSize] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const displayName = selectedName ?? localName;
  const hasSelection = Boolean(displayName);

  const fail = useCallback(
    (message: string) => {
      setHint(message);
      setStatus(null);
      onValidationError?.(message);
    },
    [onValidationError],
  );

  const acceptFile = useCallback(
    async (file: File) => {
      setPreparing(true);
      setHint(null);
      setStatus(`Reading ${file.name || "file"}…`);
      try {
        const result = await prepareStatementFile(file);
        if ("error" in result) {
          setLocalName(null);
          setLocalSize(null);
          fail(result.error);
          return;
        }
        setLocalName(result.filename);
        setLocalSize(result.size);
        setStatus(`Ready: ${result.filename} (${(result.size / 1024).toFixed(1)} KB)`);
        onFileSelect(result);
      } finally {
        setPreparing(false);
        pickerArmedRef.current = false;
      }
    },
    [fail, onFileSelect],
  );

  acceptFileRef.current = acceptFile;
  failRef.current = fail;

  // Native listeners — more reliable than React synthetic events on some Android builds.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const onChange = () => {
      changeHandledRef.current = true;
      pickerArmedRef.current = false;
      const file = input.files?.[0] ?? null;
      if (!file) {
        failRef.current(
          "No file was received from this device. Open the statement from Files → Downloads, then choose it again.",
        );
        return;
      }
      void acceptFileRef.current(file);
    };

    const onPickIntent = () => {
      pickerArmedRef.current = true;
      changeHandledRef.current = false;
      setHint(null);
      setStatus("Waiting for file…");
    };

    input.addEventListener("change", onChange);
    input.addEventListener("click", onPickIntent);
    input.addEventListener("focus", onPickIntent);

    return () => {
      input.removeEventListener("change", onChange);
      input.removeEventListener("click", onPickIntent);
      input.removeEventListener("focus", onPickIntent);
    };
  }, []);

  // Android sometimes returns from the picker without firing change.
  useEffect(() => {
    const recover = () => {
      if (!pickerArmedRef.current || changeHandledRef.current) return;

      window.setTimeout(() => {
        if (!pickerArmedRef.current || changeHandledRef.current) return;
        pickerArmedRef.current = false;

        const file = inputRef.current?.files?.[0] ?? null;
        if (file) {
          changeHandledRef.current = true;
          void acceptFileRef.current(file);
          return;
        }

        // Soft hint only — cancelling the picker also hits this path.
        setHint(
          "No file received. If you selected one, open it from Files → Downloads and try again.",
        );
        setStatus(null);
      }, 500);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") recover();
    };

    window.addEventListener("focus", recover);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", recover);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

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

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalName(null);
    setLocalSize(null);
    setHint(null);
    setStatus(null);
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
        <div className="flex flex-col items-center w-full">
          <div className="mx-auto mb-4 h-11 w-11 rounded-md bg-slate-100 flex items-center justify-center">
            <Upload className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-[14px] text-slate-700 font-medium">
            {preparing ? "Reading file…" : "Choose your statement"}
          </p>
          <p className="text-[13px] text-slate-400 mt-1.5 mb-4">
            PDF, CSV, or Excel · max 10 MB
          </p>

          {/*
            Visible native control — no opacity overlay, no label hack, no .click().
            This is the reliable path on Android Chrome.
          */}
          <input
            id="koboback-statement-file"
            ref={inputRef}
            type="file"
            disabled={disabled || preparing}
            className={cn(
              "block w-full max-w-sm text-[13px] text-slate-600",
              "file:mr-3 file:inline-flex file:cursor-pointer file:rounded-md file:border-0",
              "file:bg-brand file:px-4 file:py-2.5 file:text-[13px] file:font-semibold file:text-white",
              "disabled:opacity-60",
            )}
          />

          {status && !hint && (
            <p className="mt-3 text-[12px] text-slate-500 max-w-[320px]">{status}</p>
          )}
          {hint && (
            <p className="mt-3 text-[12px] text-red-600 max-w-[320px]">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
}
