import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  FileText,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import ProductLayout from "../components/ProductLayout";
import PageHeader from "../ui/PageHeader";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { listJobs, type JobStatus, type JobSummary } from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  isAuditInProgress,
  isParsingInProgress,
  isReadyToAudit,
} from "../lib/auditStatus";

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
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

export default function DashboardPage() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const stats = useMemo(() => {
    const completed = jobs.filter((j) => j.status === "complete");
    const ready = jobs.filter((j) => j.status === "parsed");
    const totalOvercharge = completed.reduce(
      (sum, j) => sum + (j.total_overcharge_amount ?? 0),
      0,
    );
    return {
      total: jobs.length,
      completed: completed.length,
      ready: ready.length,
      totalOvercharge,
    };
  }, [jobs]);

  const greeting = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <ProductLayout
      actions={
        <Link to="/product/statements">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            Upload statement
          </Button>
        </Link>
      }
    >
      <main className="max-w-[960px] mx-auto px-6 py-8 lg:py-10">
        <PageHeader
          eyebrow="Overview"
          title={`Welcome back, ${greeting}`}
          description="Upload statements, run audits when ready, and review compliance reports."
        />

        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Statements", value: String(stats.total) },
              { label: "Ready to audit", value: String(stats.ready) },
              {
                label: "Overcharges found",
                value: formatCurrency(stats.totalOvercharge),
              },
            ].map((stat) => (
              <Card key={stat.label} padding="sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-[22px] font-semibold text-slate-950 tracking-tight">
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>
        )}

        <p className="text-[12px] text-slate-400 mb-6">
          Uploading a statement only extracts transactions. Run an audit from
          your statements list when you want a compliance report.
        </p>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        )}

        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-6">
            {error}
          </p>
        )}

        {!loading && !error && jobs.length === 0 && (
          <Card padding="lg" className="text-center">
            <div className="mx-auto mb-5 h-12 w-12 rounded-full bg-brand-muted flex items-center justify-center">
              <FileText className="w-6 h-6 text-brand" />
            </div>
            <h2 className="text-[18px] font-semibold text-slate-950 mb-2">
              No statements yet
            </h2>
            <p className="text-[14px] text-slate-500 mb-6 max-w-sm mx-auto">
              Upload a bank statement to extract transactions. You can audit or
              delete each file from the statements page.
            </p>
            <Link to="/product/statements">
              <Button>
                Upload statement <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        )}

        {!loading && jobs.length > 0 && (
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-slate-950">
                Recent statements
              </h2>
              <Link
                to="/product/statements"
                className="text-[13px] font-medium text-brand hover:underline"
              >
                View all
              </Link>
            </div>
            <ul className="divide-y divide-slate-200">
              {jobs.slice(0, 5).map((job) => (
                <li key={job.job_id}>
                  <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/80 transition-colors">
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
                          {job.statement_period ? ` · ${job.statement_period}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 shrink-0 pl-12 sm:pl-0">
                      <Badge tone={statusTone(job.status)}>
                        {statusLabel(job.status)}
                      </Badge>

                      <div className="hidden sm:block text-[13px] min-w-[100px]">
                        {job.status === "complete" &&
                        job.total_overcharge_amount != null ? (
                          <span
                            className={
                              job.total_overcharge_amount > 0
                                ? "text-red-600 font-medium"
                                : "text-green-600"
                            }
                          >
                            {formatCurrency(job.total_overcharge_amount)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>

                      <div className="hidden md:flex items-center gap-1 text-[12px] text-slate-400 min-w-[90px]">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(job.created_at)}
                      </div>

                      <div className="min-w-[88px] text-right">
                        {job.status === "complete" && (
                          <Link
                            to={`/product/report/${job.job_id}`}
                            className="text-[13px] font-medium text-brand hover:underline inline-flex items-center gap-1"
                          >
                            Report <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        {isReadyToAudit(job.status) && (
                          <Link
                            to="/product/statements"
                            className="text-[13px] font-medium text-brand hover:underline inline-flex items-center gap-1"
                          >
                            <Search className="w-3.5 h-3.5" />
                            Audit
                          </Link>
                        )}
                        {(isParsingInProgress(job.status) ||
                          isAuditInProgress(job.status)) && (
                          <Link
                            to={`/product/audit/${job.job_id}`}
                            className="text-[13px] font-medium text-brand hover:underline inline-flex items-center gap-1"
                          >
                            Open <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </main>
    </ProductLayout>
  );
}
