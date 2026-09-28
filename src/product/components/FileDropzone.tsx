import { useCallback, useEffect, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "../ui/tokens";
import { validateStatementFile } from "../lib/auditStatus";

interface FileDropzoneProps {
  onFileSelect: (file: File | null) => void;
  onValidationError?: (message: string) => void;
  disabled?: boolean;
  /** Clear internal selection when parent clears the file */
  selectedName?: string | null;
}

export default function FileDropzone({
  onFileSelect,
  onValidationError,
  disabled,
  selectedName,
}: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!selectedName) {
      setSelectedFile(null);
    }
  }, [selectedName]);

  const acceptFile = useCallback(
    (file: File) => {
      const validationError = validateStatementFile(file);
      if (validationError) {
        onValidationError?.(validationError);
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect, onValidationError],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file) acceptFile(file);
    },
    [acceptFile, disabled],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) acceptFile(file);
    },
    [acceptFile],
  );

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    onFileSelect(null);
  };

  return (
    <div
      className={cn(
        "relative border border-dashed rounded-xl p-8 sm:p-10 text-center transition-colors",
        dragActive
          ? "border-brand bg-white"
          : selectedFile
            ? "border-brand/40 bg-white"
            : "border-slate-300/90 bg-white/80 hover:border-brand/40 hover:bg-white",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "cursor-pointer",
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf,.csv,.xls,.xlsx"
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      {selectedFile ? (
        <div className="flex items-center justify-center gap-3 relative z-10">
          <FileText className="w-8 h-8 text-green-600" />
          <div className="text-left">
            <p className="text-[14px] font-medium text-slate-950">
              {selectedFile.name}
            </p>
            <p className="text-[13px] text-slate-500">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="ml-2 p-1.5 rounded-md hover:bg-white/80 transition"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      ) : (
        <>
          <div className="mx-auto mb-4 h-11 w-11 rounded-md bg-slate-100 flex items-center justify-center">
            <Upload className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-[14px] text-slate-700 font-medium">
            Drop your statement here, or{" "}
            <span className="text-brand">browse</span>
          </p>
          <p className="text-[13px] text-slate-400 mt-1.5">
            PDF, CSV, or Excel · max 10 MB
          </p>
        </>
      )}
    </div>
  );
}
