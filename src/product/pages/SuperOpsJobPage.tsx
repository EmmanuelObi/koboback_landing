import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import ProductLayout from "../components/ProductLayout";
import PageHeader from "../ui/PageHeader";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import {
  getSuperOpsJob,
  getSuperOpsStatementDownload,
  type SuperOpsJobDetail,
} from "../api/client";
import { statusLabel, statusTone } from "../lib/auditStatus";

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
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
  return "Could not load job.";
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 text-[13px] py-1.5 border-b border-slate-100 last:border-0">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-slate-900 break-all min-w-0">{value}</dd>
    </div>
  );
}

export default function SuperOpsJobPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<SuperOpsJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const data = await getSuperOpsJob(jobId);
      setJob(data);
      setError(null);
    } catch (err) {
      setError(parseApiError(err));
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  const downloadStatement = async () => {
    if (!jobId) return;
    setDownloading(true);
    try {
      const { download_url } = await getSuperOpsStatementDownload(jobId);
      window.open(download_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ProductLayout
      actions={
        <Link to="/product/super-ops">
          <Button size="sm" variant="secondary">
            <ArrowLeft className="w-3.5 h-3.5" />
            All jobs
          </Button>
        </Link>
      }
    >
      <main className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 lg:py-10 min-w-0 w-full">
        <PageHeader
          eyebrow="Ops"
          title={job?.file_name ?? "Job detail"}
          description={jobId}
        />

        {error && (
          <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-6">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-[13px] text-slate-500">Loading job…</p>
        )}

        {!loading && job && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(job.status)}>
                {statusLabel(job.status)}
              </Badge>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void downloadStatement()}
                disabled={downloading}
              >
                <Download className="w-3.5 h-3.5" />
                {downloading ? "Preparing…" : "Statement"}
              </Button>
              {job.status === "pending_review" && (
                <Link to={`/product/admin/review/${job.job_id}`}>
                  <Button size="sm" variant="secondary">
                    Admin review
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>

            <section className="rounded-xl border border-slate-200/90 bg-white px-4 py-3">
              <h2 className="text-[14px] font-semibold text-slate-950 mb-2">
                Identity
              </h2>
              <dl>
                <MetaRow label="Job ID" value={job.job_id} />
                <MetaRow
                  label="User"
                  value={job.user_email ?? job.user_id ?? "—"}
                />
                <MetaRow label="Bank" value={job.bank_name ?? "—"} />
                <MetaRow label="Account type" value={job.account_type ?? "—"} />
                <MetaRow label="Created" value={formatDate(job.created_at)} />
                <MetaRow label="Updated" value={formatDate(job.updated_at)} />
                <MetaRow label="Message" value={job.message || "—"} />
                <MetaRow label="Error" value={job.error || "—"} />
              </dl>
            </section>

            <section className="rounded-xl border border-slate-200/90 bg-white px-4 py-3">
              <h2 className="text-[14px] font-semibold text-slate-950 mb-2">
                Payment
              </h2>
              <dl>
                <MetaRow label="Paid" value={job.paid ? "Yes" : "No"} />
                <MetaRow label="Paid at" value={formatDate(job.paid_at)} />
                <MetaRow
                  label="Reference"
                  value={job.payment_reference ?? "—"}
                />
                <MetaRow
                  label="Amount"
                  value={
                    job.payment_amount_kobo != null
                      ? `₦${(job.payment_amount_kobo / 100).toLocaleString()}`
                      : "—"
                  }
                />
              </dl>
            </section>

            {job.parsed_summary && (
              <section className="rounded-xl border border-slate-200/90 bg-white px-4 py-3">
                <h2 className="text-[14px] font-semibold text-slate-950 mb-2">
                  Parsed summary
                </h2>
                <dl>
                  <MetaRow
                    label="Bank"
                    value={job.parsed_summary.bank_name ?? "—"}
                  />
                  <MetaRow
                    label="Account"
                    value={job.parsed_summary.account_name ?? "—"}
                  />
                  <MetaRow
                    label="Number"
                    value={job.parsed_summary.account_number ?? "—"}
                  />
                  <MetaRow
                    label="Period"
                    value={job.parsed_summary.statement_period ?? "—"}
                  />
                  <MetaRow
                    label="Txns"
                    value={job.parsed_summary.transaction_count}
                  />
                  <MetaRow
                    label="Debits"
                    value={
                      job.parsed_summary.total_debits != null
                        ? job.parsed_summary.total_debits.toLocaleString()
                        : "—"
                    }
                  />
                  <MetaRow
                    label="Credits"
                    value={
                      job.parsed_summary.total_credits != null
                        ? job.parsed_summary.total_credits.toLocaleString()
                        : "—"
                    }
                  />
                </dl>
              </section>
            )}

            {job.scan && (
              <section className="rounded-xl border border-slate-200/90 bg-white px-4 py-3">
                <h2 className="text-[14px] font-semibold text-slate-950 mb-2">
                  Fee scan
                </h2>
                <p className="text-[13px] text-slate-700">
                  {job.scan.fee_line_count} possible bank fee lines
                </p>
              </section>
            )}

            {(job.engine_audit_report || job.audit_report) && (
              <section className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 space-y-4">
                <h2 className="text-[14px] font-semibold text-slate-950">
                  Reports
                </h2>
                {job.engine_audit_report && (
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Engine
                    </p>
                    <p className="text-[13px] text-slate-800 whitespace-pre-wrap">
                      {job.engine_audit_report.executive_summary}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-1">
                      Risk {job.engine_audit_report.risk_level} · ₦
                      {job.engine_audit_report.total_overcharge_amount.toLocaleString()}{" "}
                      flagged ·{" "}
                      {job.engine_audit_report.flagged_transactions.length} items
                    </p>
                  </div>
                )}
                {job.audit_report && (
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Customer-facing
                    </p>
                    <p className="text-[13px] text-slate-800 whitespace-pre-wrap">
                      {job.audit_report.executive_summary}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-1">
                      Risk {job.audit_report.risk_level} · ₦
                      {job.audit_report.total_overcharge_amount.toLocaleString()}{" "}
                      flagged · {job.audit_report.flagged_transactions.length}{" "}
                      items
                    </p>
                  </div>
                )}
                {(job.review_notes || job.reviewed_by) && (
                  <p className="text-[12px] text-slate-500">
                    Review: {job.reviewed_by ?? "—"}
                    {job.reviewed_at ? ` · ${formatDate(job.reviewed_at)}` : ""}
                    {job.review_notes ? ` · ${job.review_notes}` : ""}
                  </p>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </ProductLayout>
  );
}
