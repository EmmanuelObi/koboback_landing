import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "../ui/tokens";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function FileDropzone({
  onFileSelect,
  disabled,
}: FileDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      if (file && isValidFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect, disabled],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && isValidFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div
      className={cn(
        "relative border border-dashed rounded-lg p-10 text-center transition-colors",
        dragActive
          ? "border-brand bg-brand-muted"
          : selectedFile
            ? "border-green-500 bg-green-50/50"
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50",
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
        <div className="flex items-center justify-center gap-3">
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
            onClick={(e) => {
              e.preventDefault();
              clearFile();
            }}
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

function isValidFile(file: File): boolean {
  const validTypes = [
    "application/pdf",
    "text/csv",
    "application/vnd.ms-excel",
  ];
  const validExtensions = [".pdf", ".csv", ".xls", ".xlsx"];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  return validTypes.includes(file.type) || validExtensions.includes(ext);
}
