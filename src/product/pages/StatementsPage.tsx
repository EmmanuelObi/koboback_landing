import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Loader2,
  Search,
  Trash2,
  Upload as UploadIcon,
  XCircle,
} from "lucide-react";
import FileDropzone from "../components/FileDropzone";
import ProductLayout from "../components/ProductLayout";
import PageHeader from "../ui/PageHeader";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import {
  deleteJob,
  listJobs,
  startJobAudit,
  uploadStatement,
  type JobStatus,
  type JobSummary,
} from "../api/client";
import {
  isParsingInProgress,
  isReadyToAudit,
} from "../lib/auditStatus";

function parseApiError(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { detail?: string } } }).response?.data
      ?.detail === "string"
  ) {
    return (err as { response: { data: { detail: string } } }).response.data
      .detail;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusTone(status: JobStatus): "blue" | "yellow" | "purple" | "green" | "red" | "neutral" {
  if (status === "complete") return "green";
  if (status === "failed") return "red";
  if (status === "auditing") return "purple";
  if (status === "parsed") return "green";
  if (status === "parsing" || status === "uploaded") return "yellow";
  return "blue";
}

function statusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    awaiting_upload: "Uploading",
    uploaded: "Queued",
    parsing: "Extracting",
    parsed: "Ready",
    auditing: "Auditing",
    complete: "Audited",
    failed: "Failed",
  };
  return labels[status];
}

export default function StatementsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionJobId, setActionJobId] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const data = await listJobs();
      setJobs(data.jobs);
      setError(null);
    } catch {
      setError("Could not load your statements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const hasProcessing = jobs.some((j) => isParsingInProgress(j.status));

  useEffect(() => {
    if (!hasProcessing) {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
        refreshTimer.current = null;
      }
      return;
    }

    refreshTimer.current = setInterval(() => {
      void loadJobs();
    }, 5000);

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current);
        refreshTimer.current = null;
      }
    };
  }, [hasProcessing, loadJobs]);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setError(null);
  };

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      await uploadStatement(file);
      setFile(null);
      await loadJobs();
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setUploading(false);
    }
  }, [file, loadJobs]);

  const handleAudit = async (jobId: string) => {
    setActionJobId(jobId);
    setError(null);
    try {
      await startJobAudit(jobId);
      navigate(`/product/audit/${jobId}`);
    } catch (err: unknown) {
      setError(parseApiError(err));
      setActionJobId(null);
    }
  };

  const handleDelete = async (job: JobSummary) => {
    if (
      !window.confirm(
        `Delete "${job.file_name}"? This removes the file and any extracted data.`,
      )
    ) {
      return;
    }

    setActionJobId(job.job_id);
    setError(null);
    try {
      await deleteJob(job.job_id);
      setJobs((prev) => prev.filter((j) => j.job_id !== job.job_id));
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setActionJobId(null);
    }
  };

  return (
    <ProductLayout>
      <main className="max-w-[960px] mx-auto px-6 py-8 lg:py-10">
        <PageHeader
          eyebrow="Statements"
          title="Your bank statements"
          description="Upload statements first, then run a compliance audit when you're ready."
        />

        <Card className="mb-8">
          <h2 className="text-[14px] font-semibold text-slate-950 mb-4">
            Upload a statement
          </h2>
          <FileDropzone onFileSelect={handleFileSelect} disabled={uploading} />

          {error && (
            <div className="mt-4 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3 flex items-start gap-3">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {file && (
            <div className="mt-4">
              <Button fullWidth onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4" />
                    Upload statement
                  </>
                )}
              </Button>
              <p className="mt-2 text-[12px] text-slate-400 text-center">
                Upload only — we extract transactions first. You choose when to
                audit.
              </p>
            </div>
          )}
        </Card>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <Card padding="lg" className="text-center">
            <div className="mx-auto mb-5 h-12 w-12 rounded-full bg-brand-muted flex items-center justify-center">
              <FileText className="w-6 h-6 text-brand" />
            </div>
            <h2 className="text-[18px] font-semibold text-slate-950 mb-2">
              No statements yet
            </h2>
            <p className="text-[14px] text-slate-500 max-w-sm mx-auto">
              Upload a PDF or CSV export from your bank. Once extracted, you can
              run a CBN fee audit or delete the file.
            </p>
          </Card>
        )}

        {!loading && jobs.length > 0 && (
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-slate-950">
                Uploaded statements
              </h2>
              {hasProcessing && (
                <span className="text-[12px] text-slate-400 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Updating…
                </span>
              )}
            </div>
            <ul className="divide-y divide-slate-200">
              {jobs.map((job) => {
                const busy = actionJobId === job.job_id;

                return (
                  <li key={job.job_id}>
                    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="h-9 w-9 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-slate-950 truncate">
                            {job.file_name}
                          </p>
                          <p className="text-[13px] text-slate-500 truncate">
                            {job.bank_name ?? "Processing…"}
                            {job.statement_period
                              ? ` · ${job.statement_period}`
                              : ""}
                          </p>
                          <p className="text-[12px] text-slate-400 mt-0.5">
                            {formatDate(job.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 pl-12 sm:pl-0">
                        <Badge tone={statusTone(job.status)}>
                          {isParsingInProgress(job.status) && (
                            <Loader2 className="w-3 h-3 animate-spin mr-1 inline" />
                          )}
                          {statusLabel(job.status)}
                        </Badge>

                        <div className="flex items-center gap-2">
                          {isReadyToAudit(job.status) && (
                            <Button
                              size="sm"
                              onClick={() => handleAudit(job.job_id)}
                              disabled={busy}
                            >
                              {busy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Search className="w-3.5 h-3.5" />
                                  Audit
                                </>
                              )}
                            </Button>
                          )}

                          {job.status === "complete" && (
                            <Link to={`/product/report/${job.job_id}`}>
                              <Button size="sm" variant="secondary">
                                View report
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          )}

                          {job.status === "auditing" && (
                            <Link to={`/product/audit/${job.job_id}`}>
                              <Button size="sm" variant="secondary">
                                View progress
                              </Button>
                            </Link>
                          )}

                          {!isParsingInProgress(job.status) &&
                            job.status !== "auditing" && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleDelete(job)}
                                disabled={busy}
                                className="text-red-600 hover:text-red-700"
                              >
                                {busy ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </main>
    </ProductLayout>
  );
}
