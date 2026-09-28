import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Clock, Shield, Users } from "lucide-react";
import ProductLayout from "../components/ProductLayout";
import PageHeader from "../ui/PageHeader";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { StatementListSkeleton } from "../ui/Skeleton";
import {
  listAdminJobs,
  listAdminUsers,
  type AdminUserSummary,
  type JobStatus,
  type JobSummary,
} from "../api/client";
import { statusLabel, statusTone } from "../lib/auditStatus";

type QueueFilter = "pending_review" | "all" | "complete";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
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
  return "Could not load admin data.";
}

export default function AdminQueuePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (searchParams.get("status") as QueueFilter) || "pending_review";
  const userId = searchParams.get("user") || undefined;

  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const status: JobStatus | undefined =
        filter === "all" ? undefined : filter;
      const [jobData, userData] = await Promise.all([
        listAdminJobs({ status, user_id: userId, limit: 100 }),
        listAdminUsers(),
      ]);
      setJobs(jobData.jobs);
      setUsers(userData.users);
      setError(null);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filter, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const pendingCount = useMemo(
    () => users.reduce((sum, user) => sum + user.pending_review_count, 0),
    [users],
  );

  const setFilter = (next: QueueFilter) => {
    const params = new URLSearchParams(searchParams);
    if (next === "pending_review") params.delete("status");
    else params.set("status", next);
    setSearchParams(params);
  };

  const selectedUser = users.find((user) => user.user_id === userId);

  return (
    <ProductLayout
      actions={
        <Button size="sm" variant="secondary" onClick={() => void load()}>
          Refresh
        </Button>
      }
    >
      <main className="max-w-[960px] mx-auto px-6 py-8 lg:py-10">
        <PageHeader
          eyebrow="Admin"
          title="Audit review"
          description="Every completed engine audit stays here until you release it. Customers cannot see findings until you give the go-ahead."
        />

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700 mb-1">
              Waiting for review
            </p>
            <p className="text-[22px] font-semibold text-slate-950">
              {pendingCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/90 bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1">
              Users
            </p>
            <p className="text-[22px] font-semibold text-slate-950">
              {users.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 col-span-2 lg:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1">
              Showing
            </p>
            <p className="text-[22px] font-semibold text-slate-950">
              {jobs.length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              ["pending_review", "Review queue"],
              ["all", "All audits"],
              ["complete", "Released"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium border ${
                filter === value
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

        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-6">
            {error}
          </p>
        )}

        {loading && <StatementListSkeleton rows={4} />}

        {!loading && jobs.length === 0 && (
          <div className="rounded-xl border border-slate-200/90 bg-white px-6 py-12 text-center mb-10">
            <Clock className="w-6 h-6 text-slate-400 mx-auto mb-3" />
            <p className="text-[15px] font-semibold text-slate-950">
              Nothing in this view
            </p>
            <p className="text-[13px] text-slate-500 mt-1">
              {filter === "pending_review"
                ? "New engine results will land here for release."
                : "No audits match this filter."}
            </p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <ul className="space-y-2 mb-10">
            {jobs.map((job) => (
              <li
                key={job.job_id}
                className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-slate-950 truncate">
                    {job.file_name}
                  </p>
                  <p className="text-[12px] text-slate-500 truncate">
                    {job.user_email ?? job.user_id ?? "Unknown user"}
                    {job.bank_name ? ` · ${job.bank_name}` : ""}
                    {` · ${formatDate(job.created_at)}`}
                  </p>
                </div>
                <Badge tone={statusTone(job.status)}>
                  {statusLabel(job.status)}
                </Badge>
                <Link to={`/product/admin/review/${job.job_id}`}>
                  <Button size="sm" variant="secondary">
                    {job.status === "pending_review" ? "Review" : "Open"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
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
            <p className="text-[13px] text-slate-500">No customer jobs yet.</p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li
                  key={user.user_id}
                  className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 flex items-center gap-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-slate-950 truncate">
                      {user.email ?? user.user_id}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {user.job_count} audit{user.job_count === 1 ? "" : "s"}
                      {user.pending_review_count > 0
                        ? ` · ${user.pending_review_count} waiting`
                        : ""}
                      {` · ${user.released_count} released`}
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
                    className="text-[13px] font-medium text-brand hover:underline"
                  >
                    View audits
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
