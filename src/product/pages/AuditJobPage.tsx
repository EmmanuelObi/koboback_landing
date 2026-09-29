import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  RefreshCw,
  Search,
  Upload as UploadIcon,
  XCircle,
} from "lucide-react";
import ProductLayout from "../components/ProductLayout";
import JobFlowStepper from "../components/JobFlowStepper";
import PageHeader from "../ui/PageHeader";
import Button from "../ui/Button";
import AuditProgressCard from "../components/AuditProgressCard";
import {
  getJobStatus,
  pollJobUntilAudited,
  pollJobUntilParsed,
  refreshJobPayment,
  startJobAudit,
  startJobPayment,
  type FeeScan,
  type JobStatusResponse,
} from "../api/client";
import {
  isAuditInProgress,
  isParsingInProgress,
  isReadyToAudit,
  userFacingJobMessage,
} from "../lib/auditStatus";
import { useAuth } from "../context/AuthContext";
import { upsertProfile } from "../lib/profile";

const SCAN_LABELS: Record<string, string> = {
  sms_alert: "SMS",
  stamp_duty: "Stamp duty",
  transfer_fee: "NIP / transfer",
  ussd_fee: "USSD",
  card_maintenance: "Card maintenance",
  card_issuance: "Card issuance",
  account_maintenance: "Account maintenance",
  atm_fee: "ATM",
  vat: "VAT",
  unknown_fee: "Unspecified",
};

function isPaymentError(message: string | null): boolean {
  return /paystack|payment is required|payment didn’t|payment didn't/i.test(
    message ?? "",
  );
}

function parseApiError(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (
      err as { response?: { status?: number; data?: { detail?: string } } }
    ).response;
    if (response?.status === 402) {
      return (
        response.data?.detail ||
        "Payment is required before running this audit."
      );
    }
    if (typeof response?.data?.detail === "string") {
      return response.data.detail;
    }
  }
  if (err instanceof Error) return err.message;
  return "Failed to load audit status. Please try again.";
}

function ScanInventory({ scan }: { scan: FeeScan | null | undefined }) {
  if (!scan) return null;
  const entries = Object.entries(scan.by_category).sort((a, b) => b[1] - a[1]);
  return (
    <div className="mb-5">
      <p className="text-[13px] font-medium text-slate-950 mb-2">
        {scan.fee_line_count === 0
          ? "No fee-like lines found"
          : `${scan.fee_line_count.toLocaleString()} fee-like line${
              scan.fee_line_count === 1 ? "" : "s"
            }`}
      </p>
      {entries.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {entries.map(([category, count]) => (
            <li
              key={category}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[12px] text-slate-600"
            >
              {SCAN_LABELS[category] ?? category} · {count}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function pageEyebrow(
  status: JobStatusResponse["status"] | undefined,
  failed: boolean,
): string {
  if (failed) return "Needs attention";
  if (!status) return "Statement progress";
  if (isReadyToAudit(status)) return "Ready to audit";
  if (isAuditInProgress(status)) return "Audit in progress";
  if (status === "pending_review") return "In review";
  if (isParsingInProgress(status)) return "Extracting transactions";
  return "Statement progress";
}

function pageDescription(job: JobStatusResponse | null): string {
  if (!job) return "Analyzing your statement for billing errors.";
  if (job.status === "failed") {
    if (job.parsed_statement) {
      return "Extraction succeeded, but the fee audit could not finish.";
    }
    return "Something went wrong while processing this file.";
  }
  if (isReadyToAudit(job.status)) {
    return job.bank_name
      ? `${job.bank_name} · Free fee-line scan ready`
      : "Transactions extracted. Review the fee-line scan, then pay to audit if you want a full check.";
  }
  if (isParsingInProgress(job.status)) {
    return "Reading your statement and extracting transactions.";
  }
  if (isAuditInProgress(job.status)) {
    return job.bank_name
      ? `${job.bank_name} · Reviewing fees against CBN guidance`
      : "Reviewing fees against CBN guidance.";
  }
  if (job.status === "pending_review") {
    return "The engine finished. A reviewer will release the report shortly.";
  }
  return job.bank_name
    ? `${job.bank_name} · Advisory CBN fee review`
    : "Reviewing your statement for possible billing issues.";
}

export default function AuditJobPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const [paying, setPaying] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [polling, setPolling] = useState(false);
  const [startingAudit, setStartingAudit] = useState(false);
  const [accountType, setAccountType] = useState<"savings" | "current" | "">(
    "",
  );

  const runAuditPolling = useCallback(
    async (id: string) => {
      setPolling(true);
      setError(null);

      try {
        const finalStatus = await pollJobUntilAudited(id, setJobStatus);
        if (finalStatus.status === "complete" && finalStatus.audit_report) {
          navigate(`/product/report/${id}`, { replace: true });
        } else if (finalStatus.status === "failed") {
          setError(userFacingJobMessage(finalStatus));
        }
      } catch (err: unknown) {
        setError(parseApiError(err));
      } finally {
        setPolling(false);
      }
    },
    [navigate],
  );

  const runParsePolling = useCallback(async (id: string) => {
    setPolling(true);
    setError(null);

    try {
      const finalStatus = await pollJobUntilParsed(id, setJobStatus);
      if (finalStatus.status === "failed") {
        setError(userFacingJobMessage(finalStatus));
      }
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setPolling(false);
    }
  }, []);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    getJobStatus(jobId)
      .then((status) => {
        if (cancelled) return;
        setJobStatus(status);
        setLoading(false);
        if (status.account_type === "savings" || status.account_type === "current") {
          setAccountType(status.account_type);
        }

        if (status.status === "complete" && status.audit_report) {
          navigate(`/product/report/${jobId}`, { replace: true });
        } else if (status.status === "failed") {
          setError(userFacingJobMessage(status));
        } else if (isParsingInProgress(status.status)) {
          void runParsePolling(jobId);
        } else if (isAuditInProgress(status.status)) {
          void runAuditPolling(jobId);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setError("Statement not found or you do not have access.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, navigate, runAuditPolling, runParsePolling]);

  useEffect(() => {
    if (accountType) return;
    if (profile?.account_type === "savings" || profile?.account_type === "current") {
      setAccountType(profile.account_type);
    }
  }, [accountType, profile?.account_type]);

  useEffect(() => {
    if (!jobId) return;
    const returned =
      searchParams.get("reference") ||
      searchParams.get("trxref") ||
      searchParams.get("payment");
    if (!returned) return;
    let cancelled = false;
    refreshJobPayment(jobId)
      .then(async () => {
        if (cancelled) return;
        const status = await getJobStatus(jobId);
        if (!cancelled) setJobStatus(status);
      })
      .finally(() => {
        if (!cancelled) {
          searchParams.delete("reference");
          searchParams.delete("trxref");
          searchParams.delete("payment");
          setSearchParams(searchParams, { replace: true });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [jobId, searchParams, setSearchParams]);

  useEffect(() => {
    if (!polling) {
      setElapsedSec(0);
      return;
    }
    const t = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [polling]);

  const handlePay = async () => {
    if (!jobId) return;
    setPaying(true);
    setError(null);
    try {
      const checkout = await startJobPayment(jobId);
      window.location.assign(checkout.authorization_url);
    } catch (err: unknown) {
      setError(parseApiError(err));
      setPaying(false);
    }
  };

  const handleStartAudit = async (retry = false) => {
    if (!jobId) return;
    if (accountType !== "savings" && accountType !== "current") {
      setError("Select whether this is a savings or current account before running the audit.");
      return;
    }
    setStartingAudit(true);
    setError(null);
    try {
      await startJobAudit(jobId, retry, accountType);
      if (user) {
        try {
          await upsertProfile(user.id, { account_type: accountType });
        } catch {
          // Profile column may not exist yet; the job still has the answer.
        }
      }
      const status = await getJobStatus(jobId);
      setJobStatus(status);
      await runAuditPolling(jobId);
    } catch (err: unknown) {
      setError(parseApiError(err));
    } finally {
      setStartingAudit(false);
    }
  };

  if (loading) {
    return (
      <ProductLayout>
        <main className="max-w-[560px] mx-auto px-4 sm:px-6 py-8 lg:py-10 space-y-4 min-w-0 w-full">
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200/80" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200/80" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200/80" />
          </div>
          <div className="h-28 animate-pulse rounded-xl bg-white border border-slate-200/80" />
        </main>
      </ProductLayout>
    );
  }

  if (!jobId || (error && !jobStatus)) {
    return (
      <ProductLayout>
        <main className="max-w-[560px] mx-auto px-4 sm:px-6 py-24 text-center min-w-0 w-full">
          <p className="text-[14px] text-slate-600 mb-6">
            {error ?? "Statement not found."}
          </p>
          <Link to="/product/statements">
            <Button variant="secondary">Back to statements</Button>
          </Link>
        </main>
      </ProductLayout>
    );
  }

  const failed = jobStatus?.status === "failed";
  const paymentError = isPaymentError(error);
  const canRetryAudit =
    failed && Boolean(jobStatus?.parsed_statement) && !paymentError;
  const showProgress =
    jobStatus &&
    (isParsingInProgress(jobStatus.status) ||
      isAuditInProgress(jobStatus.status));

  return (
    <ProductLayout
      actions={
        <Link to="/product/statements">
          <Button size="sm" variant="secondary">
            All statements
          </Button>
        </Link>
      }
    >
      <main className="max-w-[560px] mx-auto px-4 sm:px-6 py-8 lg:py-10 min-w-0 w-full">
        <PageHeader
          eyebrow={pageEyebrow(jobStatus?.status, failed)}
          title={jobStatus?.file_name ?? "Statement audit"}
          description={pageDescription(jobStatus)}
        />

        <JobFlowStepper
          status={jobStatus?.status}
          failed={failed}
          hasParsedData={Boolean(jobStatus?.parsed_statement)}
          className="mb-6"
        />

        {showProgress && jobStatus && (
          <AuditProgressCard jobStatus={jobStatus} elapsedSec={elapsedSec} />
        )}

        {jobStatus?.status === "pending_review" && (
          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
            <p className="text-[15px] font-semibold text-slate-950 mb-1">
              Your audit is being reviewed
            </p>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              The fee check finished. A reviewer will release the report before
              it appears in your account. You can leave this page — it will show
              up under Statements once it is ready.
            </p>
            <Link to="/product/statements" className="inline-block mt-4">
              <Button variant="secondary">Back to statements</Button>
            </Link>
          </div>
        )}

        {jobStatus && isReadyToAudit(jobStatus.status) && !polling && !failed && (
          <div className="mt-2 rounded-xl border border-brand/15 bg-gradient-to-br from-brand-muted via-white to-white p-5 sm:p-6">
            {(() => {
              const scan = jobStatus.scan;
              const emptyScan = (scan?.fee_line_count ?? 0) === 0;
              const needsPay = Boolean(
                jobStatus.payment_required && !jobStatus.paid,
              );
              const canPay = needsPay && !emptyScan;
              const canRun = !needsPay;
              return (
                <>
                  <p className="text-[15px] font-semibold text-slate-950 mb-1">
                    {emptyScan
                      ? "Scan complete"
                      : jobStatus.paid
                        ? "Ready for a fee audit"
                        : "Fee-line scan"}
                  </p>
                  <p className="text-[13px] text-slate-600 mb-5 leading-relaxed">
                    Transactions are extracted
                    {jobStatus.parsed_statement
                      ? ` (${jobStatus.parsed_statement.transactions.length.toLocaleString()} found)`
                      : ""}
                    . This inventory counts fee-like lines only — not amounts
                    or verdicts.
                  </p>
                  <ScanInventory scan={scan} />
                  {emptyScan && (
                    <p className="text-[13px] text-slate-600 mb-5 leading-relaxed">
                      We didn’t find fee-like lines on this statement. A paid
                      audit is unlikely to help here.
                    </p>
                  )}
                  {canPay && (
                    <div className="mb-1">
                      <p className="text-[13px] text-slate-600 mb-4 leading-relaxed">
                        Pay ₦2,000 once for this statement to run the full CBN
                        fee audit.
                      </p>
                      <Button onClick={() => void handlePay()} disabled={paying}>
                        {paying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Pay ₦2,000
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  {canRun && (
                    <>
                      {jobStatus.paid && (
                        <p className="text-[13px] text-slate-600 mb-4 leading-relaxed">
                          Payment received. Confirm the account type — CBN
                          maintenance rules differ for savings and current —
                          then start the advisory fee review.
                        </p>
                      )}
                      {!jobStatus.paid && !emptyScan && (
                        <p className="text-[13px] text-slate-600 mb-4 leading-relaxed">
                          Confirm the account type — CBN maintenance rules
                          differ for savings and current — then start the
                          advisory fee review.
                        </p>
                      )}
                      <fieldset className="mb-5">
                        <legend className="text-[13px] font-medium text-slate-950 mb-2">
                          What type of account is this statement from?
                        </legend>
                        <div className="grid grid-cols-2 gap-2">
                          {(
                            [
                              ["savings", "Savings"],
                              ["current", "Current"],
                            ] as const
                          ).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setAccountType(value)}
                              className={`rounded-lg border px-3 py-3 text-[13px] font-medium transition-colors ${
                                accountType === value
                                  ? "border-brand bg-brand-muted text-brand-dark"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <Button
                        onClick={() => handleStartAudit(false)}
                        disabled={startingAudit || !accountType}
                      >
                        {startingAudit ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            Run audit
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {error && (
          <div
            className={`mt-2 rounded-xl border p-5 sm:p-6 ${
              paymentError || canRetryAudit
                ? "border-amber-200 bg-amber-50/60"
                : "border-red-200 bg-red-50/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <XCircle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  paymentError || canRetryAudit
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              />
              <div>
                <p className="text-[14px] font-semibold text-slate-950">
                  {paymentError
                    ? "Payment didn’t go through"
                    : canRetryAudit
                      ? "Audit incomplete"
                      : jobStatus?.status === "failed"
                        ? "We couldn’t finish this statement"
                        : "Something went wrong"}
                </p>
                <p className="text-[13px] mt-1 text-slate-600">{error}</p>
              </div>
            </div>
            {canRetryAudit && (
              <fieldset className="mt-4">
                <legend className="text-[13px] font-medium text-slate-950 mb-2">
                  Confirm account type to retry
                </legend>
                <div className="grid grid-cols-2 gap-2 max-w-sm">
                  {(
                    [
                      ["savings", "Savings"],
                      ["current", "Current"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAccountType(value)}
                      className={`rounded-lg border px-3 py-2.5 text-[13px] font-medium ${
                        accountType === value
                          ? "border-brand bg-brand-muted text-brand-dark"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {paymentError ? (
                <Button onClick={() => void handlePay()} disabled={paying}>
                  {paying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Try payment again
                    </>
                  )}
                </Button>
              ) : canRetryAudit ? (
                <Button
                  onClick={() => handleStartAudit(true)}
                  disabled={startingAudit || !accountType}
                >
                  {startingAudit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Retry audit
                    </>
                  )}
                </Button>
              ) : (
                <Link to="/product/statements">
                  <Button>
                    <UploadIcon className="w-4 h-4" />
                    Re-upload statement
                  </Button>
                </Link>
              )}
              <Link to="/product/statements">
                <Button variant="secondary">
                  <ArrowLeft className="w-4 h-4" />
                  All statements
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </ProductLayout>
  );
}
