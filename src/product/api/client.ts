import axios from "axios";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 120_000,
});

api.interceptors.request.use(async (config) => {
  if (!isSupabaseConfigured) return config;
  const supabase = getSupabaseClient();
  if (!supabase) return config;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Transaction {
  date: string;
  description: string;
  reference: string | null;
  debit: number | null;
  credit: number | null;
  balance: number | null;
  category: string | null;
}

export interface ParsedStatement {
  bank_name: string;
  account_name: string | null;
  account_number: string | null;
  statement_period: string | null;
  currency: string;
  transactions: Transaction[];
  total_debits: number;
  total_credits: number;
  opening_balance: number | null;
  closing_balance: number | null;
}

export type JobStatus =
  | "awaiting_upload"
  | "uploaded"
  | "parsing"
  | "parsed"
  | "auditing"
  | "complete"
  | "failed";

export interface UploadInitResponse {
  job_id: string;
  upload_url: string;
  s3_key: string;
  content_type: string;
  expires_in: number;
  message: string;
}

export interface UploadJobResponse {
  job_id: string;
  status: JobStatus;
  message: string;
  file_name: string;
}

export interface JobSummary {
  job_id: string;
  file_name: string;
  status: JobStatus;
  message: string;
  progress_percent: number;
  bank_name: string | null;
  statement_period: string | null;
  risk_level: string | null;
  total_overcharge_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface JobListResponse {
  jobs: JobSummary[];
  next_cursor: string | null;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  message: string;
  progress_percent: number;
  file_name: string | null;
  bank_name: string | null;
  parsed_statement: ParsedStatement | null;
  audit_report: AuditReport | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlaggedTransaction {
  date: string;
  description: string;
  amount: number;
  cbn_max_allowed: number | null;
  overcharge_amount: number | null;
  flag_reason: string;
  risk_level: "high" | "medium" | "low";
  cbn_citation: string | null;
  original_description: string | null;
  debit: number | null;
  credit: number | null;
  balance: number | null;
  reference: string | null;
  is_bulk_charge?: boolean | null;
  estimated_units?: number | null;
  unit_cap?: number | null;
  max_allowed_total?: number | null;
  effective_per_unit?: number | null;
  bulk_breakdown?: string | null;
}

export interface ComplianceCheck {
  regulation: string;
  description: string;
  status: "pass" | "fail" | "warning";
  details: string;
}

export interface AuditReport {
  report_id: string;
  executive_summary: string;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  total_overcharge_amount: number;
  total_transactions: number;
  total_debits: number;
  total_credits: number;
  flagged_transactions: FlaggedTransaction[];
  compliance_checks: ComplianceCheck[];
  recommendations: string[];
  statement_period: string | null;
  bank_name: string;
  account_name: string | null;
}

export async function uploadStatement(file: File): Promise<UploadJobResponse> {
  if (file.size === 0) {
    throw new Error("Uploaded file is empty");
  }

  // Step 1: Get presigned S3 PUT URL from our API
  const { data: init } = await api.post<UploadInitResponse>("/upload/init", {
    filename: file.name,
    content_type: file.type || "application/octet-stream",
    file_size: file.size,
  });

  // Step 2: Upload directly to S3 (browser → S3, not through our backend)
  await fetch(init.upload_url, {
    method: "PUT",
    headers: {
      "Content-Type": init.content_type,
    },
    body: file,
  }).then((res) => {
    if (!res.ok) {
      throw new Error(
        `Direct upload to storage failed (${res.status}). Check S3 bucket CORS settings.`,
      );
    }
  });

  // Step 3: Tell backend to verify S3 object and start processing
  const { data } = await api.post<UploadJobResponse>(
    `/upload/complete/${init.job_id}`,
  );

  return data;
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  const { data } = await api.get<JobStatusResponse>(`/jobs/${jobId}`);
  return data;
}

export async function listJobs(
  cursor?: string,
  limit = 20,
): Promise<JobListResponse> {
  const { data } = await api.get<JobListResponse>("/jobs", {
    params: { cursor, limit },
  });
  return data;
}

export async function startJobAudit(jobId: string): Promise<{ job_id: string; status: JobStatus; message: string }> {
  const { data } = await api.post(`/jobs/${jobId}/audit`);
  return data;
}

export async function deleteJob(jobId: string): Promise<{ job_id: string; message: string }> {
  const { data } = await api.delete(`/jobs/${jobId}`);
  return data;
}

export async function pollJobUntilParsed(
  jobId: string,
  onProgress?: (status: JobStatusResponse) => void,
): Promise<JobStatusResponse> {
  const schedule: [number, number][] = [
    [2_000, 2],
    [5_000, 6],
    [10_000, 12],
  ];

  for (const [delay, count] of schedule) {
    for (let i = 0; i < count; i++) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      const status = await getJobStatus(jobId);
      onProgress?.(status);
      if (
        status.status === "parsed" ||
        status.status === "failed" ||
        status.status === "complete"
      ) {
        return status;
      }
    }
  }

  throw new Error("Timeout waiting for statement to be processed");
}

export async function pollJobUntilAudited(
  jobId: string,
  onProgress?: (status: JobStatusResponse) => void,
): Promise<JobStatusResponse> {
  const schedule: [number, number][] = [
    [3_000, 1],
    [5_000, 3],
    [10_000, 6],
    [20_000, 60],
  ];

  for (const [delay, count] of schedule) {
    for (let i = 0; i < count; i++) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      const status = await getJobStatus(jobId);
      onProgress?.(status);
      if (status.status === "complete" || status.status === "failed") {
        return status;
      }
    }
  }

  throw new Error("Timeout waiting for audit to complete");
}

export async function pollJobUntilComplete(
  jobId: string,
  onProgress?: (status: JobStatusResponse) => void,
): Promise<JobStatusResponse> {
  const schedule: [number, number][] = [
    [3_000, 1],
    [5_000, 3],
    [10_000, 6],
    [20_000, 60],
  ];

  for (const [delay, count] of schedule) {
    for (let i = 0; i < count; i++) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      const status = await getJobStatus(jobId);
      onProgress?.(status);
      if (
        status.status === "complete" ||
        status.status === "failed" ||
        status.status === "parsed"
      ) {
        return status;
      }
    }
  }

  throw new Error("Timeout waiting for job to complete");
}

export async function getReport(sessionId: string): Promise<AuditReport> {
  const { data } = await api.get<AuditReport>(`/reports/${sessionId}`);
  return data;
}

export default api;
