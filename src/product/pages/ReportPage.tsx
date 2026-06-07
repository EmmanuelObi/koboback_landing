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
} from "lucide-react";
import ProductLayout from "../components/ProductLayout";
import PageHeader from "../ui/PageHeader";
import Card from "../ui/Card";
import Button from "../ui/Button";
import RiskBadge from "../components/RiskBadge";
import ComplianceTable from "../components/ComplianceTable";
import FlaggedTransactions from "../components/FlaggedTransactions";
import { exportReportAsPdf } from "../utils/exportPdf";
import {
  getJobStatus,
  getReport,
  type AuditReport,
} from "../api/client";

export default function ReportPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    async function load() {
      try {
        const status = await getJobStatus(jobId!);
        if (status.audit_report) {
          setReport(status.audit_report);
          setLoading(false);
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

  if (loading) {
    return (
      <ProductLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
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
          <Button variant="ghost" size="sm" onClick={() => navigate("/product/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Button>
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
          title="Bank fee compliance"
          description={`${report.bank_name}${
            report.statement_period ? ` · ${report.statement_period}` : ""
          }`}
          actions={<RiskBadge level={report.risk_level} score={report.risk_score} />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            padding="sm"
            className={
              report.total_overcharge_amount > 0
                ? "border-red-200 bg-red-50/40"
                : "border-green-200 bg-green-50/40"
            }
          >
            <div className="flex items-center gap-2 mb-2">
              <Banknote
                className={`w-4 h-4 ${report.total_overcharge_amount > 0 ? "text-red-600" : "text-green-600"}`}
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                {report.total_overcharge_amount > 0
                  ? "Total overcharged"
                  : "No overcharges"}
              </span>
            </div>
            <p className="text-[22px] font-semibold text-slate-950 tracking-tight">
              {formatCurrency(report.total_overcharge_amount)}
            </p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Violations
              </span>
            </div>
            <p className="text-[22px] font-semibold text-slate-950 tracking-tight">
              {report.flagged_transactions.length}
            </p>
          </Card>

          <Card padding="sm">
            <div className="flex items-center gap-2 text-brand mb-2">
              <Receipt className="w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                Transactions
              </span>
            </div>
            <p className="text-[22px] font-semibold text-slate-950 tracking-tight">
              {report.total_transactions}
            </p>
          </Card>
        </div>

        <Card>
          <h3 className="text-[14px] font-semibold text-slate-950 mb-3">
            Executive summary
          </h3>
          <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-line">
            {report.executive_summary}
          </p>
        </Card>

        {report.flagged_transactions.length > 0 && (
          <Card>
            <h3 className="text-[14px] font-semibold text-slate-950 mb-4">
              Flagged transactions
            </h3>
            <FlaggedTransactions
              transactions={report.flagged_transactions}
              totalOverchargeFromReport={report.total_overcharge_amount}
            />
          </Card>
        )}

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-brand" />
            <h3 className="text-[14px] font-semibold text-slate-950">
              CBN compliance checks
            </h3>
          </div>
          <ComplianceTable checks={report.compliance_checks} />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-[14px] font-semibold text-slate-950">
              Recommended next steps
            </h3>
          </div>
          <ul className="space-y-3">
            {report.recommendations.map((rec, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[14px] text-slate-600 leading-relaxed"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-semibold">
                  {i + 1}
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </ProductLayout>
  );
}
