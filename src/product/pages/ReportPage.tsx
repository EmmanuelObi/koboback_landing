import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  Shield,
  Lightbulb,
  Banknote,
  Receipt,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Upload,
} from "lucide-react";
import ProductLayout from "../components/ProductLayout";
import PageHeader from "../ui/PageHeader";
import Button from "../ui/Button";
import RiskBadge from "../components/RiskBadge";
import ComplianceTable from "../components/ComplianceTable";
import FlaggedTransactions from "../components/FlaggedTransactions";
import { exportReportAsPdf } from "../utils/exportPdf";
import { useToast } from "../ui/Toast";
import {
  getJobStatus,
  getReport,
  type AuditReport,
} from "../api/client";

export default function ReportPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingAudit, setRetryingAudit] = useState(false);
  const [pendingReview, setPendingReview] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    async function load() {
      try {
        const status = await getJobStatus(jobId!);
        if (status.status === "pending_review") {
          setPendingReview(true);
          return;
        }
        if (status.audit_report) {
          setReport(status.audit_report);
          return;
        }
        if (status.status !== "complete") {
          setError("This report is not available yet.");
          return;
        }
        const fromS3 = await getReport(jobId!);
        setReport(fromS3);
      } catch {
        setError("Report not found or you do not have access.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [jobId]);

  const formatCurrency = (amount: number) =>
    `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  const isIncompleteAudit =
    report?.executive_summary.startsWith(
      "The audit could not be completed automatically.",
    ) ?? false;

  const isAllClear =
    !isIncompleteAudit &&
    report != null &&
    report.flagged_transactions.length === 0 &&
    (report.total_overcharge_amount ?? 0) <= 0;

  const handleRetryAudit = async () => {
    if (!jobId) return;
    setRetryingAudit(true);
    setError(null);
    try {
      toast("Confirm the account type to retry the audit.", "info");
      navigate(`/product/audit/${jobId}`);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not restart the audit. Please try again.",
      );
      setRetryingAudit(false);
    }
  };

  if (loading) {
    return (
      <ProductLayout>
        <main className="max-w-[960px] mx-auto px-6 py-8 lg:py-10 space-y-4">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200/80" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-white border border-slate-200/80"
              />
            ))}
          </div>
          <div className="h-40 animate-pulse rounded-xl bg-white border border-slate-200/80" />
        </main>
      </ProductLayout>
    );
  }

  if (pendingReview) {
    return (
      <ProductLayout>
        <main className="max-w-[560px] mx-auto px-6 py-24 text-center">
          <p className="text-[16px] font-semibold text-slate-950 mb-2">
            Your report is being reviewed
          </p>
          <p className="text-[14px] text-slate-600 mb-6">
            A reviewer will release it shortly. It will appear under Statements
            when it is ready.
          </p>
          <Link to="/product/statements">
            <Button variant="secondary">Back to statements</Button>
          </Link>
        </main>
      </ProductLayout>
    );
  }

  if (!report || error) {
    return (
      <ProductLayout>
        <main className="max-w-[560px] mx-auto px-6 py-24 text-center">
          <p className="text-[14px] text-slate-600 mb-6">
            {error ?? "Report unavailable."}
          </p>
          <Link to="/product/statements">
            <Button variant="secondary">Upload another statement</Button>
          </Link>
        </main>
      </ProductLayout>
    );
  }

  return (
    <ProductLayout
      actions={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/product/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
          {isIncompleteAudit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRetryAudit}
              disabled={retryingAudit}
            >
              {retryingAudit ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Retry audit
            </Button>
          )}
          <Button size="sm" onClick={() => exportReportAsPdf(report)}>
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </>
      }
    >
      <main className="max-w-[960px] mx-auto px-6 py-8 lg:py-10 space-y-6">
        <PageHeader
          eyebrow="Audit report"
          title={
            isIncompleteAudit
              ? "Audit incomplete"
              : isAllClear
                ? "No likely fee issues flagged"
                : "Potential overcharges to review"
          }
          description={`${report.bank_name}${
            report.statement_period ? ` · ${report.statement_period}` : ""
          }. This is an advisory review, not a legal determination.`}
          actions={
            isIncompleteAudit ? undefined : (
              <RiskBadge level={report.risk_level} score={report.risk_score} />
            )
          }
        />

        {isIncompleteAudit && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-slate-950">
                  This is not a clean bill of health
                </p>
                <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">
                  The fee analysis did not finish. Retry using your already-extracted
                  transactions — no need to re-upload.
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  onClick={handleRetryAudit}
                  disabled={retryingAudit}
                >
                  {retryingAudit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Retry audit
                </Button>
              </div>
            </div>
          </div>
        )}

        {isAllClear && (
          <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-brand-muted via-white to-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-white border border-brand/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-slate-950">
                  No likely issues in the fees we reviewed
                </p>
                <p className="text-[13px] text-slate-600 mt-1 leading-relaxed max-w-xl">
                  We did not flag charge patterns that appear to exceed the CBN
                  Guide to Bank Charges for the fee candidates in this statement.
                  That is not a guarantee — keep this report for your records.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className={`rounded-xl border bg-white p-4 ${
              isIncompleteAudit
                ? "border-amber-200"
                : report.total_overcharge_amount > 0
                  ? "border-red-200"
                  : "border-brand/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Banknote
                className={`w-4 h-4 ${
                  isIncompleteAudit
                    ? "text-amber-600"
                    : report.total_overcharge_amount > 0
                      ? "text-red-600"
                      : "text-brand"
                }`}
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                {isIncompleteAudit
                  ? "Audit incomplete"
                  : report.total_overcharge_amount > 0
                    ? "Est. potential overcharge"
                    : "Potential overcharge"}
              </span>
            </div>
            <p className="text-[22px] font-semibold text-slate-950 tracking-tight">
              {isIncompleteAudit
                ? "—"
                : formatCurrency(report.total_overcharge_amount)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Items to review
              </span>
            </div>
            <p className="text-[22px] font-semibold text-slate-950 tracking-tight">
              {report.flagged_transactions.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-4">
            <div className="flex items-center gap-2 text-brand mb-2">
              <Receipt className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Transactions
              </span>
            </div>
            <p className="text-[22px] font-semibold text-slate-950 tracking-tight">
              {report.total_transactions}
            </p>
          </div>
        </div>

        <p className="text-[12px] text-slate-500 leading-relaxed">
          KoboBack highlights charges that may exceed CBN fee guidance. Confirm
          details with your bank or a professional before disputing a fee.
        </p>

        <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6">
          <h3 className="text-[14px] font-semibold text-slate-950 mb-3">
            Analysis summary
          </h3>
          <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-line">
            {report.executive_summary}
          </p>
        </section>

        {report.flagged_transactions.length > 0 && (
          <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6">
            <h3 className="text-[14px] font-semibold text-slate-950 mb-4">
              Potential overcharges
            </h3>
            <FlaggedTransactions
              transactions={report.flagged_transactions}
              totalOverchargeFromReport={report.total_overcharge_amount}
            />
          </section>
        )}

        {report.compliance_checks.length > 0 && (
          <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-brand" />
              <h3 className="text-[14px] font-semibold text-slate-950">
                CBN fee guidance checks
              </h3>
            </div>
            <ComplianceTable checks={report.compliance_checks} />
          </section>
        )}

        <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-[14px] font-semibold text-slate-950">
              Recommended next steps
            </h3>
          </div>
          {report.recommendations.length > 0 ? (
            <ul className="space-y-3 mb-5">
              {report.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[14px] text-slate-600 leading-relaxed"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-md bg-brand-muted text-brand-dark flex items-center justify-center text-[11px] font-semibold">
                    {i + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-slate-500 mb-5">
              Export this report and keep it with your statement records.
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-1 border-t border-slate-100">
            <Button size="sm" onClick={() => exportReportAsPdf(report)}>
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Link to="/product/statements">
              <Button size="sm" variant="secondary">
                <Upload className="w-4 h-4" />
                Audit another statement
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </ProductLayout>
  );
}
