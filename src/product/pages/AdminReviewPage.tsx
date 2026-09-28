import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import ProductLayout from "../components/ProductLayout";
import PageHeader from "../ui/PageHeader";
import Button from "../ui/Button";
import RiskBadge from "../components/RiskBadge";
import { useToast } from "../ui/Toast";
import {
  approveAdminJob,
  getAdminJob,
  getAdminStatementDownload,
  holdAdminJob,
  resetAdminReport,
  saveAdminReport,
  type AuditReport,
  type ComplianceCheck,
  type FlaggedTransaction,
  type JobStatusResponse,
  type ParsedStatement,
} from "../api/client";

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
  return "Could not load this audit.";
}

function cloneReport(report: AuditReport): AuditReport {
  return structuredClone(report);
}

function emptyFlag(): FlaggedTransaction {
  return {
    date: "",
    description: "",
    amount: 0,
    cbn_max_allowed: null,
    overcharge_amount: 0,
    flag_reason: "",
    risk_level: "medium",
    cbn_citation: null,
    original_description: null,
    debit: null,
    credit: null,
    balance: null,
    reference: null,
    is_bulk_charge: false,
    estimated_units: null,
    unit_cap: null,
    max_allowed_total: null,
    effective_per_unit: null,
    bulk_breakdown: null,
  };
}

function emptyCheck(): ComplianceCheck {
  return {
    regulation: "",
    description: "",
    status: "warning",
    details: "",
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[12px] font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:bg-slate-50";

export default function AdminReviewPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<JobStatusResponse | null>(null);
  const [draft, setDraft] = useState<AuditReport | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<
    "save" | "approve" | "hold" | "reset" | "download" | null
  >(null);
  const [showStatement, setShowStatement] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    getAdminJob(jobId)
      .then((data) => {
        setJob(data);
        setNotes(data.review_notes ?? "");
        if (data.audit_report) {
          setDraft(cloneReport(data.audit_report));
        }
        setError(null);
        setDirty(false);
      })
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, [jobId]);

  const canDecide = job?.status === "pending_review";
  const statement: ParsedStatement | null = job?.parsed_statement ?? null;

  const overchargeFromFlags = useMemo(() => {
    if (!draft) return 0;
    return draft.flagged_transactions.reduce(
      (sum, tx) => sum + (tx.overcharge_amount || 0),
      0,
    );
  }, [draft]);

  const updateDraft = (updater: (prev: AuditReport) => AuditReport) => {
    setDraft((prev) => (prev ? updater(prev) : prev));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!jobId || !draft) return;
    setSaving("save");
    try {
      const updated = await saveAdminReport(jobId, draft, notes);
      setJob(updated);
      if (updated.audit_report) setDraft(cloneReport(updated.audit_report));
      setDirty(false);
      toast("Draft saved.", "success");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(null);
    }
  };

  const handleApprove = async () => {
    if (!jobId || !draft) return;
    setSaving("approve");
    try {
      const updated = await approveAdminJob(jobId, notes, draft);
      setJob(updated);
      setDirty(false);
      toast("Report released to the customer.", "success");
      navigate("/product/admin");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(null);
    }
  };

  const handleHold = async () => {
    if (!jobId || !draft) return;
    setSaving("hold");
    try {
      const updated = await holdAdminJob(jobId, notes, draft);
      setJob(updated);
      if (updated.audit_report) setDraft(cloneReport(updated.audit_report));
      setDirty(false);
      toast("Audit held. The customer still cannot see the report.", "info");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(null);
    }
  };

  const handleReset = async () => {
    if (!jobId) return;
    if (
      !window.confirm(
        "Reset the working report to the original engine output? Unsaved edits will be lost.",
      )
    ) {
      return;
    }
    setSaving("reset");
    try {
      const updated = await resetAdminReport(jobId);
      setJob(updated);
      if (updated.audit_report) setDraft(cloneReport(updated.audit_report));
      setDirty(false);
      toast("Restored engine report.", "success");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(null);
    }
  };

  const handleDownload = async () => {
    if (!jobId) return;
    setSaving("download");
    try {
      const result = await getAdminStatementDownload(jobId);
      window.open(result.download_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(parseApiError(err));
      toast(parseApiError(err), "error");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <ProductLayout>
        <main className="max-w-[1100px] mx-auto px-6 py-8 space-y-4">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200/80" />
          <div className="h-40 animate-pulse rounded-xl bg-white border border-slate-200/80" />
        </main>
      </ProductLayout>
    );
  }

  if (!job || (error && !job)) {
    return (
      <ProductLayout>
        <main className="max-w-[560px] mx-auto px-6 py-24 text-center">
          <p className="text-[14px] text-slate-600 mb-6">
            {error ?? "Audit not found."}
          </p>
          <Link to="/product/admin">
            <Button variant="secondary">Back to review queue</Button>
          </Link>
        </main>
      </ProductLayout>
    );
  }

  return (
    <ProductLayout
      actions={
        <Link to="/product/admin">
          <Button size="sm" variant="secondary">
            <ArrowLeft className="w-4 h-4" />
            Queue
          </Button>
        </Link>
      }
    >
      <main className="max-w-[1100px] mx-auto px-6 py-8 lg:py-10 space-y-6">
        <PageHeader
          eyebrow="Manual review"
          title={job.file_name ?? "Audit review"}
          description={`${job.user_email ?? job.user_id ?? "Unknown user"}${
            job.bank_name ? ` · ${job.bank_name}` : ""
          }. Edit the report below — only your released copy reaches the customer.`}
          actions={
            draft ? (
              <RiskBadge level={draft.risk_level} score={draft.risk_score} />
            ) : undefined
          }
        />

        {error && (
          <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            {error}
          </p>
        )}

        {job.status === "complete" && (
          <div className="rounded-xl border border-green-200 bg-green-50/60 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-700 mt-0.5" />
            <p className="text-[13px] text-slate-700">
              Released
              {job.reviewed_by ? ` by ${job.reviewed_by}` : ""}. The customer
              can now open this report.
            </p>
          </div>
        )}

        {job.status === "pending_review" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-700 mt-0.5" />
            <p className="text-[13px] text-slate-700">
              Hidden from the customer until you release it.
              {dirty ? " You have unsaved edits." : ""}
            </p>
          </div>
        )}

        <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-[14px] font-semibold text-slate-950">
                Uploaded statement
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                {job.file_name}
                {statement
                  ? ` · ${statement.transactions.length.toLocaleString()} extracted transactions`
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void handleDownload()}
                disabled={saving === "download"}
              >
                {saving === "download" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Download original
              </Button>
              {statement && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowStatement((v) => !v)}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {showStatement ? "Hide extract" : "Show extract"}
                </Button>
              )}
            </div>
          </div>

          {showStatement && statement && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[360px] overflow-y-auto">
              <table className="min-w-full text-[12px]">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="text-left text-slate-500">
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 font-medium text-right">Debit</th>
                    <th className="px-3 py-2 font-medium text-right">Credit</th>
                    <th className="px-3 py-2 font-medium text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.transactions.map((tx, index) => (
                    <tr key={index} className="border-t border-slate-100">
                      <td className="px-3 py-2 whitespace-nowrap text-slate-600">
                        {tx.date}
                      </td>
                      <td className="px-3 py-2 text-slate-800 max-w-[320px]">
                        {tx.description}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {tx.debit != null
                          ? tx.debit.toLocaleString("en-NG", {
                              minimumFractionDigits: 2,
                            })
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {tx.credit != null
                          ? tx.credit.toLocaleString("en-NG", {
                              minimumFractionDigits: 2,
                            })
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {tx.balance != null
                          ? tx.balance.toLocaleString("en-NG", {
                              minimumFractionDigits: 2,
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {draft ? (
          <>
            <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-4">
              <h3 className="text-[14px] font-semibold text-slate-950">
                Report header
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Bank name">
                  <input
                    className={inputClass}
                    disabled={!canDecide}
                    value={draft.bank_name}
                    onChange={(e) =>
                      updateDraft((r) => ({ ...r, bank_name: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Account name">
                  <input
                    className={inputClass}
                    disabled={!canDecide}
                    value={draft.account_name ?? ""}
                    onChange={(e) =>
                      updateDraft((r) => ({
                        ...r,
                        account_name: e.target.value || null,
                      }))
                    }
                  />
                </Field>
                <Field label="Statement period">
                  <input
                    className={inputClass}
                    disabled={!canDecide}
                    value={draft.statement_period ?? ""}
                    onChange={(e) =>
                      updateDraft((r) => ({
                        ...r,
                        statement_period: e.target.value || null,
                      }))
                    }
                  />
                </Field>
                <Field label="Risk level">
                  <select
                    className={inputClass}
                    disabled={!canDecide}
                    value={draft.risk_level}
                    onChange={(e) =>
                      updateDraft((r) => ({
                        ...r,
                        risk_level: e.target.value as AuditReport["risk_level"],
                      }))
                    }
                  >
                    {["low", "medium", "high", "critical"].map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Risk score (0–100)">
                  <input
                    type="number"
                    className={inputClass}
                    disabled={!canDecide}
                    value={draft.risk_score}
                    onChange={(e) =>
                      updateDraft((r) => ({
                        ...r,
                        risk_score: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </Field>
                <Field label="Total overcharge (₦)">
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    disabled={!canDecide}
                    value={draft.total_overcharge_amount}
                    onChange={(e) =>
                      updateDraft((r) => ({
                        ...r,
                        total_overcharge_amount: Number(e.target.value) || 0,
                      }))
                    }
                  />
                  <button
                    type="button"
                    disabled={!canDecide}
                    className="text-[11px] text-brand mt-1 disabled:opacity-50"
                    onClick={() =>
                      updateDraft((r) => ({
                        ...r,
                        total_overcharge_amount: Number(
                          overchargeFromFlags.toFixed(2),
                        ),
                      }))
                    }
                  >
                    Recalc from flagged rows (₦
                    {overchargeFromFlags.toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                    )
                  </button>
                </Field>
                <Field label="Total transactions">
                  <input
                    type="number"
                    className={inputClass}
                    disabled={!canDecide}
                    value={draft.total_transactions}
                    onChange={(e) =>
                      updateDraft((r) => ({
                        ...r,
                        total_transactions: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </Field>
                <Field label="Total debits">
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    disabled={!canDecide}
                    value={draft.total_debits}
                    onChange={(e) =>
                      updateDraft((r) => ({
                        ...r,
                        total_debits: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </Field>
                <Field label="Total credits">
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    disabled={!canDecide}
                    value={draft.total_credits}
                    onChange={(e) =>
                      updateDraft((r) => ({
                        ...r,
                        total_credits: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-3">
              <h3 className="text-[14px] font-semibold text-slate-950">
                Executive summary
              </h3>
              <textarea
                rows={6}
                className={inputClass}
                disabled={!canDecide}
                value={draft.executive_summary}
                onChange={(e) =>
                  updateDraft((r) => ({
                    ...r,
                    executive_summary: e.target.value,
                  }))
                }
              />
            </section>

            <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[14px] font-semibold text-slate-950">
                  Flagged transactions ({draft.flagged_transactions.length})
                </h3>
                {canDecide && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateDraft((r) => ({
                        ...r,
                        flagged_transactions: [
                          ...r.flagged_transactions,
                          emptyFlag(),
                        ],
                      }))
                    }
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add finding
                  </Button>
                )}
              </div>

              {draft.flagged_transactions.length === 0 && (
                <p className="text-[13px] text-slate-500">
                  No flagged items. Add findings if needed before release.
                </p>
              )}

              <div className="space-y-4">
                {draft.flagged_transactions.map((tx, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-semibold text-slate-500">
                        Finding #{index + 1}
                      </p>
                      {canDecide && (
                        <button
                          type="button"
                          className="text-[12px] text-red-600 inline-flex items-center gap-1"
                          onClick={() =>
                            updateDraft((r) => ({
                              ...r,
                              flagged_transactions:
                                r.flagged_transactions.filter(
                                  (_, i) => i !== index,
                                ),
                            }))
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Date">
                        <input
                          className={inputClass}
                          disabled={!canDecide}
                          value={tx.date}
                          onChange={(e) =>
                            updateDraft((r) => {
                              const next = [...r.flagged_transactions];
                              next[index] = { ...tx, date: e.target.value };
                              return { ...r, flagged_transactions: next };
                            })
                          }
                        />
                      </Field>
                      <Field label="Risk">
                        <select
                          className={inputClass}
                          disabled={!canDecide}
                          value={tx.risk_level}
                          onChange={(e) =>
                            updateDraft((r) => {
                              const next = [...r.flagged_transactions];
                              next[index] = {
                                ...tx,
                                risk_level: e.target
                                  .value as FlaggedTransaction["risk_level"],
                              };
                              return { ...r, flagged_transactions: next };
                            })
                          }
                        >
                          {["low", "medium", "high"].map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Description">
                        <input
                          className={inputClass}
                          disabled={!canDecide}
                          value={tx.description}
                          onChange={(e) =>
                            updateDraft((r) => {
                              const next = [...r.flagged_transactions];
                              next[index] = {
                                ...tx,
                                description: e.target.value,
                              };
                              return { ...r, flagged_transactions: next };
                            })
                          }
                        />
                      </Field>
                      <Field label="Amount charged">
                        <input
                          type="number"
                          step="0.01"
                          className={inputClass}
                          disabled={!canDecide}
                          value={tx.amount}
                          onChange={(e) =>
                            updateDraft((r) => {
                              const next = [...r.flagged_transactions];
                              next[index] = {
                                ...tx,
                                amount: Number(e.target.value) || 0,
                              };
                              return { ...r, flagged_transactions: next };
                            })
                          }
                        />
                      </Field>
                      <Field label="CBN max allowed">
                        <input
                          type="number"
                          step="0.01"
                          className={inputClass}
                          disabled={!canDecide}
                          value={tx.cbn_max_allowed ?? ""}
                          onChange={(e) =>
                            updateDraft((r) => {
                              const next = [...r.flagged_transactions];
                              next[index] = {
                                ...tx,
                                cbn_max_allowed:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              };
                              return { ...r, flagged_transactions: next };
                            })
                          }
                        />
                      </Field>
                      <Field label="Overcharge amount">
                        <input
                          type="number"
                          step="0.01"
                          className={inputClass}
                          disabled={!canDecide}
                          value={tx.overcharge_amount ?? ""}
                          onChange={(e) =>
                            updateDraft((r) => {
                              const next = [...r.flagged_transactions];
                              next[index] = {
                                ...tx,
                                overcharge_amount:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              };
                              return { ...r, flagged_transactions: next };
                            })
                          }
                        />
                      </Field>
                      <Field label="CBN citation">
                        <input
                          className={inputClass}
                          disabled={!canDecide}
                          value={tx.cbn_citation ?? ""}
                          onChange={(e) =>
                            updateDraft((r) => {
                              const next = [...r.flagged_transactions];
                              next[index] = {
                                ...tx,
                                cbn_citation: e.target.value || null,
                              };
                              return { ...r, flagged_transactions: next };
                            })
                          }
                        />
                      </Field>
                      <Field label="Reference">
                        <input
                          className={inputClass}
                          disabled={!canDecide}
                          value={tx.reference ?? ""}
                          onChange={(e) =>
                            updateDraft((r) => {
                              const next = [...r.flagged_transactions];
                              next[index] = {
                                ...tx,
                                reference: e.target.value || null,
                              };
                              return { ...r, flagged_transactions: next };
                            })
                          }
                        />
                      </Field>
                    </div>
                    <Field label="Flag reason">
                      <textarea
                        rows={3}
                        className={inputClass}
                        disabled={!canDecide}
                        value={tx.flag_reason}
                        onChange={(e) =>
                          updateDraft((r) => {
                            const next = [...r.flagged_transactions];
                            next[index] = {
                              ...tx,
                              flag_reason: e.target.value,
                            };
                            return { ...r, flagged_transactions: next };
                          })
                        }
                      />
                    </Field>
                    <Field label="Original description">
                      <textarea
                        rows={2}
                        className={inputClass}
                        disabled={!canDecide}
                        value={tx.original_description ?? ""}
                        onChange={(e) =>
                          updateDraft((r) => {
                            const next = [...r.flagged_transactions];
                            next[index] = {
                              ...tx,
                              original_description: e.target.value || null,
                            };
                            return { ...r, flagged_transactions: next };
                          })
                        }
                      />
                    </Field>
                    <Field label="Bulk breakdown">
                      <textarea
                        rows={2}
                        className={inputClass}
                        disabled={!canDecide}
                        value={tx.bulk_breakdown ?? ""}
                        onChange={(e) =>
                          updateDraft((r) => {
                            const next = [...r.flagged_transactions];
                            next[index] = {
                              ...tx,
                              bulk_breakdown: e.target.value || null,
                            };
                            return { ...r, flagged_transactions: next };
                          })
                        }
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[14px] font-semibold text-slate-950">
                  Compliance checks ({draft.compliance_checks.length})
                </h3>
                {canDecide && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateDraft((r) => ({
                        ...r,
                        compliance_checks: [
                          ...r.compliance_checks,
                          emptyCheck(),
                        ],
                      }))
                    }
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add check
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {draft.compliance_checks.map((check, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <Field label="Regulation">
                      <input
                        className={inputClass}
                        disabled={!canDecide}
                        value={check.regulation}
                        onChange={(e) =>
                          updateDraft((r) => {
                            const next = [...r.compliance_checks];
                            next[index] = {
                              ...check,
                              regulation: e.target.value,
                            };
                            return { ...r, compliance_checks: next };
                          })
                        }
                      />
                    </Field>
                    <Field label="Status">
                      <select
                        className={inputClass}
                        disabled={!canDecide}
                        value={check.status}
                        onChange={(e) =>
                          updateDraft((r) => {
                            const next = [...r.compliance_checks];
                            next[index] = {
                              ...check,
                              status: e.target
                                .value as ComplianceCheck["status"],
                            };
                            return { ...r, compliance_checks: next };
                          })
                        }
                      >
                        {["pass", "fail", "warning"].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Description">
                      <input
                        className={inputClass}
                        disabled={!canDecide}
                        value={check.description}
                        onChange={(e) =>
                          updateDraft((r) => {
                            const next = [...r.compliance_checks];
                            next[index] = {
                              ...check,
                              description: e.target.value,
                            };
                            return { ...r, compliance_checks: next };
                          })
                        }
                      />
                    </Field>
                    <div className="flex items-end justify-between gap-2">
                      <Field label="Details">
                        <input
                          className={inputClass}
                          disabled={!canDecide}
                          value={check.details}
                          onChange={(e) =>
                            updateDraft((r) => {
                              const next = [...r.compliance_checks];
                              next[index] = {
                                ...check,
                                details: e.target.value,
                              };
                              return { ...r, compliance_checks: next };
                            })
                          }
                        />
                      </Field>
                      {canDecide && (
                        <button
                          type="button"
                          className="text-[12px] text-red-600 mb-2"
                          onClick={() =>
                            updateDraft((r) => ({
                              ...r,
                              compliance_checks: r.compliance_checks.filter(
                                (_, i) => i !== index,
                              ),
                            }))
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[14px] font-semibold text-slate-950">
                  Recommendations
                </h3>
                {canDecide && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateDraft((r) => ({
                        ...r,
                        recommendations: [...r.recommendations, ""],
                      }))
                    }
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {draft.recommendations.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      className={inputClass}
                      disabled={!canDecide}
                      value={item}
                      onChange={(e) =>
                        updateDraft((r) => {
                          const next = [...r.recommendations];
                          next[index] = e.target.value;
                          return { ...r, recommendations: next };
                        })
                      }
                    />
                    {canDecide && (
                      <button
                        type="button"
                        className="text-[12px] text-red-600 shrink-0"
                        onClick={() =>
                          updateDraft((r) => ({
                            ...r,
                            recommendations: r.recommendations.filter(
                              (_, i) => i !== index,
                            ),
                          }))
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <p className="text-[14px] text-slate-600">
            No stored report is attached to this job yet.
          </p>
        )}

        <section className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6">
          <h3 className="text-[14px] font-semibold text-slate-950 mb-2">
            Reviewer notes
          </h3>
          <p className="text-[12px] text-slate-500 mb-3">
            Internal only — customers never see these notes.
          </p>
          <textarea
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setDirty(true);
            }}
            disabled={!canDecide}
            rows={4}
            className={inputClass}
            placeholder="Optional notes for the team…"
          />
          {canDecide && draft && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => void handleApprove()} disabled={!!saving}>
                {saving === "approve" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Release to customer
              </Button>
              <Button
                variant="secondary"
                onClick={() => void handleSave()}
                disabled={!!saving}
              >
                {saving === "save" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save draft
              </Button>
              <Button
                variant="secondary"
                onClick={() => void handleHold()}
                disabled={!!saving}
              >
                {saving === "hold" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                Hold
              </Button>
              <Button
                variant="secondary"
                onClick={() => void handleReset()}
                disabled={!!saving}
              >
                {saving === "reset" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Reset to engine
              </Button>
            </div>
          )}
        </section>
      </main>
    </ProductLayout>
  );
}
