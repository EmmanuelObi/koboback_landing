import {
  CheckCircle2,
  FileText,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import type { JobStatus } from "../api/client";

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
    label: "Checking fees against CBN regulations…",
    color: "text-violet-600",
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

export const TERMINAL_JOB_STATUSES: JobStatus[] = ["complete", "failed"];

export const PARSE_COMPLETE_STATUSES: JobStatus[] = ["parsed", "complete", "failed"];

export function isTerminalJobStatus(status: JobStatus): boolean {
  return TERMINAL_JOB_STATUSES.includes(status);
}

export function isReadyToAudit(status: JobStatus): boolean {
  return status === "parsed";
}

export function isParsingInProgress(status: JobStatus): boolean {
  return status === "uploaded" || status === "parsing" || status === "awaiting_upload";
}

export function isAuditInProgress(status: JobStatus): boolean {
  return status === "auditing";
}
