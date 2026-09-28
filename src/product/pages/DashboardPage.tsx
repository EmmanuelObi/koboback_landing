import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import ProductLayout from "../components/ProductLayout";
import PageHeader from "../ui/PageHeader";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { StatGridSkeleton, StatementListSkeleton } from "../ui/Skeleton";
import { listJobs, type JobSummary } from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  canRetryAudit,
  isJobInProgress,
  isReadyToAudit,
  nextActionForJob,
  statusLabel,
  statusTone,
} from "../lib/auditStatus";
import { profileNeedsDetails } from "../lib/profile";

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

export default function DashboardPage() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissNudge, setDismissNudge] = useState(false);

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
    const ready = jobs.filter((j) => isReadyToAudit(j.status));
    const failed = jobs.filter((j) => j.status === "failed");
    const inProgress = jobs.filter((j) => isJobInProgress(j.status));
    const totalOvercharge = completed.reduce(
      (sum, j) => sum + (j.total_overcharge_amount ?? 0),
      0,
    );
    return {
      total: jobs.length,
      completed: completed.length,
      ready: ready.length,
      failed: failed.length,
      inProgress: inProgress.length,
      totalOvercharge,
    };
  }, [jobs]);

  const attentionJobs = useMemo(() => {
    return jobs
      .filter(
        (j) =>
          isReadyToAudit(j.status) ||
          j.status === "failed" ||
          isJobInProgress(j.status),
      )
      .slice(0, 4);
  }, [jobs]);

  const greeting = profile?.full_name?.split(" ")[0] ?? "there";
  const showProfileNudge =
    !dismissNudge && profileNeedsDetails(profile);

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
          description="Your command center for extracted statements, pending audits, and advisory fee reports."
        />

        {showProfileNudge && (
          <div className="mb-6 rounded-xl border border-brand/20 bg-white px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-slate-950">
                Finish your profile
              </p>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Add your phone or primary bank anytime — it helps personalize
                audits.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/product/profile">
                <Button size="sm" variant="secondary">
                  Update profile
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setDismissNudge(true)}
                className="text-[12px] text-slate-400 hover:text-slate-700 px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {loading && (
          <>
            <StatGridSkeleton />
            <StatementListSkeleton rows={3} />
          </>
        )}

        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-6">
            {error}
          </p>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="rounded-xl border border-brand/15 bg-gradient-to-br from-brand-muted via-white to-white px-6 py-12 text-center">
            <div className="mx-auto mb-5 h-12 w-12 rounded-xl bg-white border border-brand/15 flex items-center justify-center">
              <FileText className="w-6 h-6 text-brand" />
            </div>
            <h2 className="text-[18px] font-semibold text-slate-950 mb-2">
              Start with a statement
            </h2>
            <p className="text-[14px] text-slate-500 mb-6 max-w-sm mx-auto">
              Upload a Nigerian bank statement to extract transactions, then run
              a CBN fee audit when you’re ready.
            </p>
            <Link to="/product/statements">
              <Button>
                Upload statement <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {[
                {
                  label: "Statements",
                  value: String(stats.total),
                  hint: null as string | null,
                },
                {
                  label: "Ready to audit",
                  value: String(stats.ready),
                  hint: stats.ready > 0 ? "Needs your action" : null,
                },
                {
                  label: "Needs attention",
                  value: String(stats.failed),
                  hint: stats.failed > 0 ? "Failed or incomplete" : null,
                },
                {
                  label: "Potential overcharges",
                  value: formatCurrency(stats.totalOvercharge),
                  hint: null,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200/90 bg-white p-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-[22px] font-semibold text-slate-950 tracking-tight">
                    {stat.value}
                  </p>
                  {stat.hint && (
                    <p className="text-[11px] text-amber-700 mt-1">{stat.hint}</p>
                  )}
                </div>
              ))}
            </div>

            {attentionJobs.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[15px] font-semibold text-slate-950">
                    Needs your attention
                  </h2>
                  <Link
                    to="/product/statements"
                    className="text-[13px] font-medium text-brand hover:underline"
                  >
                    All statements
                  </Link>
                </div>
                <ul className="space-y-2">
                  {attentionJobs.map((job) => {
                    const next = nextActionForJob(job);
                    return (
                      <li
                        key={job.job_id}
                        className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 flex items-center gap-3"
                      >
                        <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          {job.status === "failed" ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          ) : isReadyToAudit(job.status) || canRetryAudit(job) ? (
                            <Search className="w-4 h-4 text-brand" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-medium text-slate-950 truncate">
                            {job.file_name}
                          </p>
                          <p className="text-[12px] text-slate-500 truncate">
                            {job.bank_name ?? "Processing…"}
                            {typeof job.fee_line_count === "number"
                              ? ` · ${job.fee_line_count} fee line${
                                  job.fee_line_count === 1 ? "" : "s"
                                }`
                              : ""}
                          </p>
                        </div>
                        <Badge tone={statusTone(job.status)}>
                          {statusLabel(job.status)}
                        </Badge>
                        {next && (
                          <Link to={next.to}>
                            <Button size="sm" variant="secondary">
                              {next.label}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-semibold text-slate-950">
                  Recent statements
                </h2>
                <Link
                  to="/product/statements"
                  className="text-[13px] font-medium text-brand hover:underline"
                >
                  View all
                </Link>
              </div>
              <ul className="space-y-2">
                {jobs.slice(0, 5).map((job) => {
                  const next = nextActionForJob(job);
                  return (
                    <li
                      key={job.job_id}
                      className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-brand-muted/70 border border-brand/10 flex items-center justify-center shrink-0">
                          {job.status === "complete" ? (
                            <CheckCircle2 className="w-4 h-4 text-brand" />
                          ) : (
                            <FileText className="w-4 h-4 text-brand-dark" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium text-slate-950 truncate">
                            {job.file_name}
                          </p>
                          <p className="text-[12px] text-slate-500 truncate">
                            {job.bank_name ?? "Processing…"}
                            {job.statement_period
                              ? ` · ${job.statement_period}`
                              : ""}
                            {typeof job.fee_line_count === "number"
                              ? ` · ${job.fee_line_count} fee line${
                                  job.fee_line_count === 1 ? "" : "s"
                                }`
                              : ""}
                            {` · ${formatDate(job.created_at)}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 pl-12 sm:pl-0">
                        <Badge tone={statusTone(job.status)}>
                          {statusLabel(job.status)}
                        </Badge>
                        <div className="hidden sm:block text-[13px] min-w-[88px] text-right">
                          {job.status === "complete" &&
                          job.total_overcharge_amount != null ? (
                            <span
                              className={
                                job.total_overcharge_amount > 0
                                  ? "text-red-600 font-medium"
                                  : "text-brand font-medium"
                              }
                            >
                              {formatCurrency(job.total_overcharge_amount)}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </div>
                        {next && (
                          <Link
                            to={next.to}
                            className="text-[13px] font-medium text-brand hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                          >
                            {next.label}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </main>
    </ProductLayout>
  );
}
