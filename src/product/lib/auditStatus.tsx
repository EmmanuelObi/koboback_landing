import {
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import type { JobStatus, JobStatusResponse, JobSummary } from "../api/client";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const AUDIT_STATUS_CONFIG: Record<
  JobStatus,
  { icon: React.ReactNode; label: string; color: string }
> = {
  awaiting_upload: {
    icon: <FileText className="w-4 h-4" />,
    label: "Uploading to secure storage…",
    color: "text-brand",
  },
  uploaded: {
    icon: <FileText className="w-4 h-4" />,
    label: "File uploaded — extracting transactions",
    color: "text-brand",
  },
  parsing: {
    icon: <Search className="w-4 h-4 animate-pulse" />,
    label: "Extracting transactions…",
    color: "text-brand",
  },
  parsed: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Ready to audit",
    color: "text-green-600",
  },
  auditing: {
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    label: "Reviewing fees against CBN guidance…",
    color: "text-violet-600",
  },
  pending_review: {
    icon: <Clock className="w-4 h-4" />,
    label: "Awaiting reviewer release",
    color: "text-amber-700",
  },
  complete: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Audit complete",
    color: "text-green-600",
  },
  failed: {
    icon: <XCircle className="w-4 h-4" />,
    label: "Processing failed",
    color: "text-red-600",
  },
};

export type StatusTone =
  | "blue"
  | "yellow"
  | "purple"
  | "green"
  | "red"
  | "neutral";

export function statusTone(status: JobStatus): StatusTone {
  if (status === "complete") return "green";
  if (status === "failed") return "red";
  if (status === "pending_review") return "yellow";
  if (status === "auditing") return "purple";
  if (status === "parsed") return "blue";
  if (status === "parsing" || status === "uploaded" || status === "awaiting_upload")
    return "yellow";
  return "neutral";
}

export function statusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    awaiting_upload: "Uploading",
    uploaded: "Queued",
    parsing: "Extracting",
    parsed: "Ready",
    auditing: "Auditing",
    pending_review: "In review",
    complete: "Audited",
    failed: "Failed",
  };
  return labels[status];
}

export const TERMINAL_JOB_STATUSES: JobStatus[] = [
  "complete",
  "failed",
  "pending_review",
];

export const PARSE_COMPLETE_STATUSES: JobStatus[] = [
  "parsed",
  "complete",
  "failed",
  "pending_review",
];

export function isTerminalJobStatus(status: JobStatus): boolean {
  return TERMINAL_JOB_STATUSES.includes(status);
}

export function isReadyToAudit(status: JobStatus): boolean {
  return status === "parsed";
}

export function isParsingInProgress(status: JobStatus): boolean {
  return (
    status === "uploaded" ||
    status === "parsing" ||
    status === "awaiting_upload"
  );
}

export function isAuditInProgress(status: JobStatus): boolean {
  return status === "auditing";
}

export function isJobInProgress(status: JobStatus): boolean {
  return isParsingInProgress(status) || isAuditInProgress(status);
}

/** Prefer friendly message over internal error strings. */
export function userFacingJobMessage(
  job:
    | (Pick<JobStatusResponse, "message" | "status"> & {
        error?: string | null;
      })
    | null,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!job) return fallback;
  const message = job.message?.trim();
  const error = job.error?.trim();

  if (job.status === "failed") {
    if (message && !looksTechnical(message)) return message;
    if (message) return softenTechnicalMessage(message);
    if (error) return softenTechnicalMessage(error);
    return "We couldn’t process this statement. Please upload it again.";
  }

  return message || error || fallback;
}

function looksTechnical(text: string): boolean {
  return /all extraction methods failed|missing from s3|traceback|exception|http\/1|token/i.test(
    text,
  );
}

function softenTechnicalMessage(text: string): string {
  const lower = text.toLowerCase();
  if (
    lower.includes("all extraction") ||
    lower.includes("no transactions") ||
    lower.includes("failed to parse") ||
    lower.includes("could not read")
  ) {
    return "We couldn’t read this bank statement. Please upload a clearer PDF, CSV, or Excel export and try again.";
  }
  if (
    lower.includes("audit could not be completed") ||
    lower.includes("transactions are saved")
  ) {
    return "The fee audit couldn’t finish, but your extracted transactions are saved. You can retry the audit without re-uploading.";
  }
  if (lower.includes("timeout")) {
    return "This is taking longer than expected. You can keep waiting from Statements, or upload again.";
  }
  return text;
}

export type FlowStepId = "upload" | "extract" | "audit" | "report";

export function flowStepIndex(
  status: JobStatus | null | undefined,
  options?: { hasParsedData?: boolean },
): number {
  if (!status) return 0;
  if (status === "awaiting_upload") return 0;
  if (isParsingInProgress(status)) return 1;
  if (status === "parsed") return 2;
  if (status === "auditing") return 2;
  if (status === "pending_review") return 3;
  if (status === "complete") return 3;
  if (status === "failed") {
    return options?.hasParsedData ? 2 : 1;
  }
  return 0;
}

export function canRetryAudit(job: Pick<JobSummary, "status" | "has_parsed_data" | "message">): boolean {
  if (job.status !== "failed") return false;
  if (job.has_parsed_data) return true;
  return /transactions are saved|retry the audit/i.test(job.message || "");
}

export function nextActionForJob(job: JobSummary): {
  label: string;
  to: string;
} | null {
  if (job.status === "complete") {
    return { label: "View report", to: `/product/report/${job.job_id}` };
  }
  if (job.status === "pending_review") {
    return { label: "View status", to: `/product/audit/${job.job_id}` };
  }
  if (isReadyToAudit(job.status)) {
    if (job.fee_line_count === 0) {
      return { label: "View scan", to: `/product/audit/${job.job_id}` };
    }
    if (job.payment_required && job.paid === false) {
      return { label: "Pay to audit", to: `/product/audit/${job.job_id}` };
    }
    return { label: "Run audit", to: `/product/audit/${job.job_id}` };
  }
  if (isJobInProgress(job.status)) {
    return { label: "View progress", to: `/product/audit/${job.job_id}` };
  }
  if (canRetryAudit(job)) {
    return { label: "Retry audit", to: `/product/audit/${job.job_id}` };
  }
  if (job.status === "failed") {
    return { label: "Re-upload", to: "/product/statements" };
  }
  return null;
}

export function validateStatementFile(file: File): string | null {
  if (file.size === 0) {
    return "That file looks empty. Please choose another statement export.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "File is too large. Please upload a statement under 10 MB.";
  }
  if (!statementFileLooksValid(file)) {
    return "Please upload a PDF, CSV, or Excel bank statement.";
  }
  return null;
}

const STATEMENT_MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/x-pdf": ".pdf",
  "text/pdf": ".pdf",
  "text/csv": ".csv",
  "application/csv": ".csv",
  "text/comma-separated-values": ".csv",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  // Some Android apps label Office docs this way
  "application/haansoftxlsx": ".xlsx",
  "application/wps-office.xlsx": ".xlsx",
};

const STATEMENT_EXTENSIONS = new Set([".pdf", ".csv", ".xls", ".xlsx"]);

function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  if (i < 0 || i === name.length - 1) return "";
  return name.slice(i).toLowerCase();
}

function statementFileLooksValid(file: File): boolean {
  const ext = extensionOf(file.name);
  if (ext && STATEMENT_EXTENSIONS.has(ext)) return true;
  const mime = (file.type || "").toLowerCase().trim();
  if (mime && mime in STATEMENT_MIME_TO_EXT) return true;
  return false;
}

/** Sniff common statement formats from the first bytes (Android often omits type/ext). */
async function sniffStatementExtension(file: File): Promise<string | null> {
  try {
    const buf = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buf);
    const asText = String.fromCharCode(...bytes);

    if (asText.startsWith("%PDF")) return ".pdf";
    // ZIP/XLSX
    if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
      return ".xlsx";
    }
    // Old OLE XLS
    if (
      bytes[0] === 0xd0 &&
      bytes[1] === 0xcf &&
      bytes[2] === 0x11 &&
      bytes[3] === 0xe0
    ) {
      return ".xls";
    }
    // Heuristic CSV: printable text with a comma/tab in the first line
    const sample = asText.replace(/\0/g, "");
    if (sample.length >= 8 && /[,\t;]/.test(sample) && /^[\x09\x0a\x0d\x20-\x7e]+$/.test(sample)) {
      return ".csv";
    }
  } catch {
    return null;
  }
  return null;
}

/** Ensure the File has a real extension so API/S3 metadata validation passes. */
export function normalizeStatementFile(file: File, forcedExt?: string): File {
  const existing = extensionOf(file.name);
  if (existing && STATEMENT_EXTENSIONS.has(existing)) {
    return file.type
      ? file
      : new File([file], file.name, {
          type: mimeForExt(existing),
          lastModified: file.lastModified,
        });
  }

  const mime = (file.type || "").toLowerCase().trim();
  const mapped = forcedExt || STATEMENT_MIME_TO_EXT[mime];
  if (!mapped) return file;

  const rawBase = file.name.replace(/\.[^.]+$/, "").trim();
  const base =
    rawBase && rawBase.toLowerCase() !== "blob" && !rawBase.includes("/")
      ? rawBase
      : "statement";
  return new File([file], `${base}${mapped}`, {
    type: file.type || mimeForExt(mapped),
    lastModified: file.lastModified,
  });
}

function mimeForExt(ext: string): string {
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".csv":
      return "text/csv";
    case ".xls":
      return "application/vnd.ms-excel";
    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    default:
      return "application/octet-stream";
  }
}

/**
 * Android Chrome often gives PDFs with empty `type` and no filename extension.
 * Normalize + sniff so those still upload.
 */
export async function prepareStatementFile(
  file: File,
): Promise<{ file: File } | { error: string }> {
  if (file.size === 0) {
    return {
      error: "That file looks empty. Please choose another statement export.",
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      error: "File is too large. Please upload a statement under 10 MB.",
    };
  }

  let prepared = normalizeStatementFile(file);
  if (!statementFileLooksValid(prepared)) {
    const sniffed = await sniffStatementExtension(file);
    if (sniffed) {
      prepared = normalizeStatementFile(file, sniffed);
    }
  }

  const validationError = validateStatementFile(prepared);
  if (validationError) {
    return {
      error:
        validationError === "Please upload a PDF, CSV, or Excel bank statement."
          ? "Could not recognize that file on this device. Export or share the statement as a PDF, then choose it again."
          : validationError,
    };
  }
  return { file: prepared };
}
