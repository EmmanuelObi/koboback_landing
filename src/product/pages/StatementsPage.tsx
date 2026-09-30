import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Loader2,
  Search,
  Upload as UploadIcon,
  XCircle,
} from "lucide-react";
import FileDropzone from "../components/FileDropzone";
import JobFlowStepper from "../components/JobFlowStepper";
import ProductLayout from "../components/ProductLayout";
import PageHeader from "../ui/PageHeader";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import RowActions from "../ui/RowActions";
import { StatementListSkeleton } from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import {
  deleteJob,
  listJobs,
  uploadStatement,
  type JobSummary,
} from "../api/client";
import {
  isJobInProgress,
  isReadyToAudit,
  canRetryAudit,
  nextActionForJob,
  statusLabel,
  statusTone,
  userFacingJobMessage,
  validateStatementFile,
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

export default function StatementsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionJobId, setActionJobId] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const uploadSectionRef = useRef<HTMLDivElement | null>(null);

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

  const hasProcessing = jobs.some((j) => isJobInProgress(j.status));

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

  const handleFileSelect = (f: File | null) => {
    setFile(f);
    if (f) setError(null);
  };

  const handleUpload = useCallback(async () => {
    if (!file) return;
    const validationError = validateStatementFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploaded = await uploadStatement(file);
      setFile(null);
      toast("Statement uploaded — extracting transactions…", "success");
      navigate(`/product/audit/${uploaded.job_id}`);
    } catch (err: unknown) {
      setError(parseApiError(err));
      setUploading(false);
    }
  }, [file, navigate, toast]);

  const handleAudit = (jobId: string) => {
    navigate(`/product/audit/${jobId}`);
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
      toast("Statement deleted.", "success");
    } catch (err: unknown) {
      setError(parseApiError(err));
      toast(parseApiError(err), "error");
    } finally {
      setActionJobId(null);
    }
  };

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ProductLayout>
      <main className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 lg:py-10 min-w-0 w-full">
        <PageHeader
          eyebrow="Statements"
          title="Your bank statements"
          description="Upload a statement. A free fee scan counts possible bank fees. Pay ₦2,000 to run the full audit."
        />

        <JobFlowStepper status={null} className="mb-6" />

        <section
          ref={uploadSectionRef}
          className="mb-10 rounded-xl border border-brand/15 bg-gradient-to-br from-brand-muted via-white to-white p-4 sm:p-6 min-w-0"
        >
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-slate-950">
              Upload a statement
            </h2>
            <p className="text-[13px] text-slate-500 mt-1">
              PDF, CSV, or Excel · max 10 MB. Extraction and a free fee
              scan start automatically.
            </p>
          </div>

          <FileDropzone
            onFileSelect={handleFileSelect}
            onValidationError={setError}
            disabled={uploading}
            selectedName={file?.name ?? null}
          />

          {error && (
            <div className="mt-4 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3 flex items-start gap-3">
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
                    Upload & continue
                  </>
                )}
              </Button>
            </div>
          )}
        </section>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-slate-950">
            Uploaded statements
          </h2>
          {hasProcessing && (
            <span className="text-[12px] text-slate-400 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Updating…
            </span>
          )}
        </div>

        {loading && <StatementListSkeleton />}

        {!loading && jobs.length === 0 && (
          <p className="text-[13px] text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-xl bg-white/60">
            No statements yet — use the upload area above to get started.
          </p>
        )}

        {!loading && jobs.length > 0 && (
          <ul className="space-y-2">
            {jobs.map((job) => {
              const busy = actionJobId === job.job_id;
              const next = nextActionForJob(job);

              let primary: ReactNode = null;
              if (isReadyToAudit(job.status) && next) {
                const shortLabel =
                  next.label === "Pay to audit"
                    ? "Pay"
                    : next.label === "View scan"
                      ? "Scan"
                      : "Audit";
                primary = (
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
                        <span className="hidden sm:inline">{next.label}</span>
                        <span className="sm:hidden">{shortLabel}</span>
                      </>
                    )}
                  </Button>
                );
              } else if (canRetryAudit(job)) {
                primary = (
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
                        Retry
                      </>
                    )}
                  </Button>
                );
              } else if (job.status === "complete" && next) {
                primary = (
                  <Link to={next.to}>
                    <Button size="sm" variant="secondary">
                      Report
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                );
              } else if (isJobInProgress(job.status) && next) {
                primary = (
                  <Link to={next.to}>
                    <Button size="sm" variant="secondary">
                      Progress
                    </Button>
                  </Link>
                );
              } else if (job.status === "failed") {
                primary = (
                  <Button size="sm" onClick={scrollToUpload}>
                    <UploadIcon className="w-3.5 h-3.5" />
                    Re-upload
                  </Button>
                );
              }

              const secondary = !isJobInProgress(job.status)
                ? [
                    {
                      label: "Delete",
                      danger: true,
                      disabled: busy,
                      onClick: () => void handleDelete(job),
                    },
                  ]
                : [];

              return (
                <li
                  key={job.job_id}
                  className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 sm:px-5 hover:border-slate-300 transition-colors min-w-0"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-brand-muted/80 border border-brand/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-brand-dark" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[14px] font-medium text-slate-950 truncate">
                              {job.file_name}
                            </p>
                            <Badge tone={statusTone(job.status)}>
                              {isJobInProgress(job.status) && (
                                <Loader2 className="w-3 h-3 animate-spin mr-1 inline" />
                              )}
                              {statusLabel(job.status)}
                            </Badge>
                          </div>
                          <p className="text-[12px] text-slate-500 truncate mt-0.5">
                            {job.bank_name ?? "Processing…"}
                            {job.statement_period
                              ? ` · ${job.statement_period}`
                              : ""}
                            {typeof job.fee_line_count === "number"
                              ? ` · ${job.fee_line_count} fee charge${
                                  job.fee_line_count === 1 ? "" : "s"
                                }`
                              : ""}
                            {job.paid ? " · Paid" : ""}
                            {` · ${formatDate(job.created_at)}`}
                          </p>
                          {job.status === "failed" && (
                            <p className="text-[12px] text-red-600/90 mt-1 line-clamp-2">
                              {userFacingJobMessage(job)}
                            </p>
                          )}
                        </div>
                        {secondary.length > 0 && (
                          <RowActions
                            secondary={secondary}
                            className="shrink-0 -mt-0.5"
                          />
                        )}
                      </div>
                      {primary && (
                        <div className="mt-3">
                          <RowActions primary={primary} />
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </ProductLayout>
  );
}
