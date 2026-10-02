import { useCallback, useId, useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "../ui/tokens";
import { validateStatementFile } from "../lib/auditStatus";

interface FileDropzoneProps {
  onFileSelect: (file: File | null) => void;
  onValidationError?: (message: string) => void;
  disabled?: boolean;
  /** Parent-controlled selected filename (drives selected UI) */
  selectedName?: string | null;
}

/**
 * Reliable statement picker.
 *
 * Avoids a full-area opacity-0 &lt;input&gt; overlay — that pattern often fails
 * on mobile Safari/Chrome (picker closes, onChange never fires or UI never
 * updates). Uses an explicit label/button instead. File-type checks happen
 * in JS so the OS picker is not over-filtered by `accept`.
 */
export default function FileDropzone({
  onFileSelect,
  onValidationError,
  disabled,
  selectedName,
}: FileDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localName, setLocalName] = useState<string | null>(null);
  const [localSize, setLocalSize] = useState<number | null>(null);

  const displayName = selectedName ?? localName;
  const hasSelection = Boolean(displayName);

  const fail = useCallback(
    (message: string) => {
      onValidationError?.(message);
    },
    [onValidationError],
  );

  const acceptFile = useCallback(
    (file: File) => {
      const validationError = validateStatementFile(file);
      if (validationError) {
        setLocalName(null);
        setLocalSize(null);
        fail(validationError);
        return;
      }
      setLocalName(file.name);
      setLocalSize(file.size);
      onFileSelect(file);
    },
    [fail, onFileSelect],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, [disabled]);

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
      const file = e.target.files?.[0];
      // Allow re-selecting the same file later
      e.target.value = "";
      if (!file) {
        fail(
          "Could not read that file. Please choose a PDF, CSV, or Excel statement (max 10 MB).",
        );
        return;
      }
      acceptFile(file);
    },
    [acceptFile, fail],
  );

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalName(null);
    setLocalSize(null);
    if (inputRef.current) inputRef.current.value = "";
    onFileSelect(null);
  };

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
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
        disabled && "opacity-50 cursor-not-allowed",
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Hidden input — opened via label/button, never as a full-area overlay */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        // Keep accept loose enough for mobile; validate in JS.
        accept=".pdf,.csv,.xls,.xlsx,application/pdf,text/csv"
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />

      {hasSelection ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-green-600 shrink-0" />
          <div className="text-left min-w-0">
            <p className="text-[14px] font-medium text-slate-950 truncate">
              {displayName}
            </p>
            {localSize != null && (
              <p className="text-[13px] text-slate-500">
                {(localSize / 1024).toFixed(1)} KB
              </p>
            )}
            {!localSize && (
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
          <label
            htmlFor={inputId}
            onClick={(e) => {
              // Some mobile browsers need an explicit programmatic open
              // in addition to the label association.
              if (disabled) {
                e.preventDefault();
                return;
              }
              // Let the label do its job; also call openPicker as backup
              // only if the label click doesn't reach the input (rare).
              e.preventDefault();
              openPicker();
            }}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 text-[13px] font-semibold text-white",
              disabled ? "pointer-events-none opacity-60" : "cursor-pointer hover:opacity-95",
            )}
          >
            Choose file
          </label>
        </div>
      )}
    </div>
  );
}
