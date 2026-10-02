import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, AlertTriangle, RefreshCw, Users } from "lucide-react";
import ProductLayout from "../components/ProductLayout";
import PageHeader from "../ui/PageHeader";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { StatementListSkeleton } from "../ui/Skeleton";
import {
  getSuperOpsOverview,
  listSuperOpsJobs,
  listSuperOpsUsers,
  type JobStatus,
  type JobSummary,
  type SuperOpsOverview,
  type SuperOpsUserSummary,
} from "../api/client";
import { statusLabel, statusTone } from "../lib/auditStatus";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
  return "Could not load ops data.";
}

const STATUS_FILTERS: Array<{ value: "all" | JobStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "failed", label: "Failed" },
  { value: "pending_review", label: "Review" },
  { value: "parsed", label: "Parsed" },
  { value: "complete", label: "Released" },
];

export default function SuperOpsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status") || "all";
  const userId = searchParams.get("user") || undefined;

  const [overview, setOverview] = useState<SuperOpsOverview | null>(null);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [users, setUsers] = useState<SuperOpsUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const status: JobStatus | undefined =
        statusParam === "all" ? undefined : (statusParam as JobStatus);
      const [overviewData, jobData, userData] = await Promise.all([
        getSuperOpsOverview(),
        listSuperOpsJobs({ status, user_id: userId, limit: 100 }),
        listSuperOpsUsers(),
      ]);
      setOverview(overviewData);
      setJobs(jobData.jobs);
      setUsers(userData.users);
      setError(null);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [statusParam, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === "all") params.delete("status");
    else params.set("status", next);
    setSearchParams(params);
  };

  const selectedUser = users.find((u) => u.user_id === userId);

  return (
    <ProductLayout
      actions={
        <Button size="sm" variant="secondary" onClick={() => void load()}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      }
    >
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 lg:py-10 min-w-0 w-full">
        <PageHeader
          eyebrow="Ops"
          title="Super ops"
          description="Unlisted console. Job health, payments, and users — not linked from the product nav."
        />

        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-6">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          {[
            ["Jobs", overview?.total_jobs ?? "—"],
            ["Users", overview?.distinct_users ?? "—"],
            ["Paid", overview?.paid_jobs ?? "—"],
            ["Unpaid", overview?.unpaid_jobs ?? "—"],
            ["Failed 24h", overview?.failed_last_24h ?? "—"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200/90 bg-white p-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1">
                {label}
              </p>
              <p className="text-[22px] font-semibold text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        {overview && Object.keys(overview.by_status).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(overview.by_status)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => (
                <span
                  key={status}
                  className="text-[12px] px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-600"
                >
                  {status}: <strong className="text-slate-950">{count}</strong>
                </span>
              ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium border ${
                statusParam === value
                  ? "bg-slate-950 text-white border-slate-950"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
          {selectedUser && (
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete("user");
                setSearchParams(params);
              }}
              className="px-3 py-1.5 rounded-md text-[13px] font-medium border border-brand/30 bg-brand-muted text-brand-dark"
            >
              {selectedUser.email ?? selectedUser.user_id} ×
            </button>
          )}
        </div>

        {loading && <StatementListSkeleton rows={5} />}

        {!loading && jobs.length === 0 && (
          <p className="text-[13px] text-slate-500 py-8 text-center border border-dashed border-slate-200 rounded-xl mb-10">
            No jobs match this filter.
          </p>
        )}

        {!loading && jobs.length > 0 && (
          <ul className="space-y-2 mb-10">
            {jobs.map((job) => (
              <li
                key={job.job_id}
                className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 flex flex-col gap-3 lg:flex-row lg:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-slate-950 truncate">
                    {job.file_name}
                  </p>
                  <p className="text-[12px] text-slate-500 truncate">
                    {job.user_email ?? job.user_id ?? "Unknown"}
                    {job.bank_name ? ` · ${job.bank_name}` : ""}
                    {` · ${formatDate(job.updated_at)}`}
                  </p>
                  {(job.error || job.status === "failed") && (
                    <p className="text-[12px] text-red-600 mt-1 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {job.error || job.message}
                      </span>
                    </p>
                  )}
                  {(job.paid || job.payment_reference) && (
                    <p className="text-[12px] text-slate-500 mt-1">
                      {job.paid ? "Paid" : "Unpaid"}
                      {job.payment_reference
                        ? ` · ${job.payment_reference}`
                        : ""}
                      {job.payment_amount_kobo != null
                        ? ` · ₦${(job.payment_amount_kobo / 100).toLocaleString()}`
                        : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {typeof job.fee_line_count === "number" && (
                    <span className="text-[12px] text-slate-500">
                      {job.fee_line_count} fee lines
                    </span>
                  )}
                  <Badge tone={statusTone(job.status)}>
                    {statusLabel(job.status)}
                  </Badge>
                  <Link to={`/product/super-ops/jobs/${job.job_id}`}>
                    <Button size="sm" variant="secondary">
                      Open
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-slate-400" />
            <h2 className="text-[15px] font-semibold text-slate-950">Users</h2>
          </div>
          {users.length === 0 ? (
            <p className="text-[13px] text-slate-500">No users yet.</p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li
                  key={user.user_id}
                  className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-slate-950 truncate">
                      {user.email ?? user.user_id}
                    </p>
                    <p className="text-[12px] text-slate-500 truncate">
                      {user.job_count} jobs · {user.paid_count} paid ·{" "}
                      {user.failed_count} failed · {user.pending_review_count}{" "}
                      review
                      {user.last_activity_at
                        ? ` · last ${formatDate(user.last_activity_at)}`
                        : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set("user", user.user_id);
                      params.set("status", "all");
                      setSearchParams(params);
                    }}
                    className="text-[13px] font-medium text-brand hover:underline self-start sm:self-auto"
                  >
                    Filter jobs
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </ProductLayout>
  );
}
