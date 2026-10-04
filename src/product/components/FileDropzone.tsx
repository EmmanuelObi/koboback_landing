import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Upload, FileText, X } from "lucide-react";
import { cn } from "../ui/tokens";
import {
  prepareStatementBytes,
  prepareStatementFile,
  type PreparedStatementUpload,
} from "../lib/auditStatus";
import {
  getUploadBrowserInfo,
  openInChrome,
  type UploadBrowserInfo,
} from "../lib/browserUpload";

interface FileDropzoneProps {
  onFileSelect: (file: File | PreparedStatementUpload | null) => void;
  onValidationError?: (message: string) => void;
  disabled?: boolean;
  selectedName?: string | null;
}

function androidAttachHelp(info: UploadBrowserInfo): string {
  if (info.restricted) {
    return `Uploads often fail inside ${info.appName ?? "this in-app browser"}. Tap Open in Chrome, then choose the file from Files → Downloads.`;
  }
  return "Could not attach that file. Save the statement to Files → Downloads (not Drive/WhatsApp), then choose it again. If it still fails, try Desktop site off and retry.";
}

/**
 * Statement file picker — Android Chrome safe.
 *
 * Critical: do NOT call setState while the OS picker is open. A re-render can
 * replace the <input> and Android Chrome then returns “No file chosen”.
 * Also keep the input mounted at all times and read bytes before any setState.
 */
export default function FileDropzone({
  onFileSelect,
  onValidationError,
  disabled,
  selectedName,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pickerArmedRef = useRef(false);
  const handledRef = useRef(false);
  const pollTimerRef = useRef<number | null>(null);
  const browserInfoRef = useRef<UploadBrowserInfo>(getUploadBrowserInfo());
  const onFileSelectRef = useRef(onFileSelect);
  const onValidationErrorRef = useRef(onValidationError);

  const [dragActive, setDragActive] = useState(false);
  const [localName, setLocalName] = useState<string | null>(null);
  const [localSize, setLocalSize] = useState<number | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<UploadBrowserInfo>(() =>
    getUploadBrowserInfo(),
  );

  const displayName = selectedName ?? localName;
  const hasSelection = Boolean(displayName);

  onFileSelectRef.current = onFileSelect;
  onValidationErrorRef.current = onValidationError;

  const clearPoll = () => {
    if (pollTimerRef.current != null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const fail = useCallback((message: string) => {
    setHint(message);
    onValidationErrorRef.current?.(message);
  }, []);

  const commitPrepared = useCallback(
    (result: PreparedStatementUpload | { error: string }) => {
      if ("error" in result) {
        setLocalName(null);
        setLocalSize(null);
        setPreparing(false);
        fail(result.error);
        return;
      }
      setLocalName(result.filename);
      setLocalSize(result.size);
      setHint(null);
      setPreparing(false);
      onFileSelectRef.current(result);
    },
    [fail],
  );

  const ingestFile = useCallback(
    async (file: File) => {
      if (handledRef.current) return;
      handledRef.current = true;
      pickerArmedRef.current = false;
      clearPoll();

      // Read bytes BEFORE any setState — Android may revoke the File after render.
      let bytes: ArrayBuffer;
      try {
        bytes = await file.arrayBuffer();
        if (bytes.byteLength === 0) {
          bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result instanceof ArrayBuffer) resolve(reader.result);
              else reject(new Error("empty"));
            };
            reader.onerror = () => reject(reader.error ?? new Error("read"));
            reader.readAsArrayBuffer(file);
          });
        }
      } catch {
        handledRef.current = false;
        setPreparing(false);
        fail(androidAttachHelp(browserInfoRef.current));
        return;
      }

      setPreparing(true);
      commitPrepared(
        prepareStatementBytes(bytes, file.name || "statement", file.type || ""),
      );
    },
    [commitPrepared, fail],
  );

  const ingestFileRef = useRef(ingestFile);
  ingestFileRef.current = ingestFile;

  useEffect(() => {
    const info = getUploadBrowserInfo();
    browserInfoRef.current = info;
    setBrowserInfo(info);
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const armPicker = () => {
      // Intentionally no setState here — re-rendering during the picker breaks
      // Android Chrome file delivery.
      pickerArmedRef.current = true;
      handledRef.current = false;
      clearPoll();
    };

    const onChange = () => {
      const file = input.files?.[0] ?? null;
      if (!file) {
        // Empty change: poll briefly in case the FileList fills late.
        schedulePoll();
        return;
      }
      void ingestFileRef.current(file);
    };

    const schedulePoll = () => {
      clearPoll();
      const delays = [0, 200, 500, 1000, 2000];
      let i = 0;

      const step = () => {
        if (handledRef.current) return;
        const file = inputRef.current?.files?.[0] ?? null;
        if (file) {
          void ingestFileRef.current(file);
          return;
        }
        i += 1;
        if (i >= delays.length) {
          if (pickerArmedRef.current) {
            pickerArmedRef.current = false;
            fail(androidAttachHelp(browserInfoRef.current));
          }
          return;
        }
        pollTimerRef.current = window.setTimeout(step, delays[i]! - delays[i - 1]!);
      };

      pollTimerRef.current = window.setTimeout(step, delays[0]);
    };

    const onFocusReturn = () => {
      if (!pickerArmedRef.current || handledRef.current) return;
      schedulePoll();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") onFocusReturn();
    };

    input.addEventListener("change", onChange);
    input.addEventListener("click", armPicker);
    window.addEventListener("focus", onFocusReturn);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearPoll();
      input.removeEventListener("change", onChange);
      input.removeEventListener("click", armPicker);
      window.removeEventListener("focus", onFocusReturn);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fail]);

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
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled || preparing) return;

      const file = e.dataTransfer.files?.[0];
      if (!file) {
        fail("No file was dropped. Please choose a PDF, CSV, or Excel statement.");
        return;
      }
      setPreparing(true);
      commitPrepared(await prepareStatementFile(file));
    },
    [commitPrepared, disabled, fail, preparing],
  );

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalName(null);
    setLocalSize(null);
    setHint(null);
    handledRef.current = false;
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
      {browserInfo.restricted && !hasSelection && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-left">
          <p className="text-[13px] font-medium text-amber-950">
            Open in Chrome to upload
          </p>
          <p className="mt-1 text-[12px] text-amber-900/80">
            {browserInfo.appName ?? "This app"}’s built-in browser on Android
            often cannot attach PDFs.
          </p>
          <button
            type="button"
            onClick={() => openInChrome()}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-950 px-3 py-2 text-[12px] font-semibold text-white"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Chrome
          </button>
        </div>
      )}

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
            PDF, CSV, or Excel · max 10 MB · prefer Files → Downloads
          </p>
        </div>
      )}

      {/* Always mounted — unmounting after pick breaks Chromium file delivery. */}
      <input
        id="koboback-statement-file"
        ref={inputRef}
        type="file"
        disabled={disabled || preparing}
        className={cn(
          hasSelection
            ? "absolute h-px w-px opacity-0 pointer-events-none"
            : cn(
                "block w-full max-w-sm mx-auto text-[13px] text-slate-600",
                "file:mr-3 file:inline-flex file:cursor-pointer file:rounded-md file:border-0",
                "file:bg-brand file:px-4 file:py-2.5 file:text-[13px] file:font-semibold file:text-white",
                "disabled:opacity-60",
              ),
        )}
      />

      {!hasSelection && hint && (
        <div className="mt-3 flex flex-col items-center">
          <p className="text-[12px] text-red-600 max-w-[340px] text-center">{hint}</p>
          {browserInfo.isAndroid && !browserInfo.restricted && (
            <p className="mt-2 text-[11px] text-slate-500 max-w-[340px] text-center">
              Tip: open the PDF in your Files app once, then pick it from
              Downloads here.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
