import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Search, XCircle } from "lucide-react";
import ProductLayout from "../components/ProductLayout";
import PageHeader from "../ui/PageHeader";
import Button from "../ui/Button";
import Card from "../ui/Card";
import AuditProgressCard from "../components/AuditProgressCard";
import {
  getJobStatus,
  pollJobUntilAudited,
  pollJobUntilParsed,
  startJobAudit,
  type JobStatusResponse,
} from "../api/client";
import {
  isAuditInProgress,
  isParsingInProgress,
  isReadyToAudit,
} from "../lib/auditStatus";

function parseApiError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Failed to load audit status. Please try again.";
}

export default function AuditJobPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [jobStatus, setJobStatus] = useState<JobStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [polling, setPolling] = useState(false);
  const [startingAudit, setStartingAudit] = useState(false);

  const runAuditPolling = useCallback(
    async (id: string) => {
      setPolling(true);
      setError(null);

      try {
        const finalStatus = await pollJobUntilAudited(id, setJobStatus);
        if (finalStatus.status === "complete" && finalStatus.audit_report) {
          navigate(`/product/report/${id}`, { replace: true });
        } else if (finalStatus.status === "failed") {
          setError(
            finalStatus.error || finalStatus.message || "Audit failed",
          );
        }
      } catch (err: unknown) {
        setError(parseApiError(err));
      } finally {
        setPolling(false);
      }
    },
    [navigate],
  );

  const runParsePolling = useCallback(
    async (id: string) => {
      setPolling(true);
      setError(null);

      try {
        const finalStatus = await pollJobUntilParsed(id, setJobStatus);
        if (finalStatus.status === "failed") {
          setError(
            finalStatus.error || finalStatus.message || "Extraction failed",
          );
        }
      } catch (err: unknown) {
        setError(parseApiError(err));
      } finally {
        setPolling(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    getJobStatus(jobId)
      .then((status) => {
        if (cancelled) return;
        setJobStatus(status);
        setLoading(false);

        if (status.status === "complete" && status.audit_report) {
          navigate(`/product/report/${jobId}`, { replace: true });
        } else if (status.status === "failed") {
          setError(status.error || status.message || "Processing failed");
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
    if (!polling) return;
    const t = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [polling]);

  const handleStartAudit = async () => {
    if (!jobId) return;
    setStartingAudit(true);
    setError(null);
    try {
      await startJobAudit(jobId);
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
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </ProductLayout>
    );
  }

  if (!jobId || (error && !jobStatus)) {
    return (
      <ProductLayout>
        <main className="max-w-[560px] mx-auto px-6 py-24 text-center">
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
      <main className="max-w-[560px] mx-auto px-6 py-8 lg:py-10">
        <PageHeader
          eyebrow={
            isReadyToAudit(jobStatus?.status ?? "uploaded")
              ? "Ready to audit"
              : "Audit in progress"
          }
          title={jobStatus?.file_name ?? "Statement audit"}
          description={
            jobStatus?.bank_name
              ? `${jobStatus.bank_name} · CBN fee compliance check`
              : "Analyzing your statement for billing errors."
          }
        />

        {showProgress && jobStatus && (
          <AuditProgressCard jobStatus={jobStatus} elapsedSec={elapsedSec} />
        )}

        {jobStatus && isReadyToAudit(jobStatus.status) && !polling && (
          <Card padding="sm" className="mt-6">
            <p className="text-[14px] text-slate-700 mb-4">
              Transactions have been extracted. Start the audit when you are
              ready to check fees against CBN regulations.
            </p>
            <Button onClick={handleStartAudit} disabled={startingAudit}>
              {startingAudit ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Run audit
                </>
              )}
            </Button>
          </Card>
        )}

        {error && (
          <Card className="mt-6" padding="sm">
            <div className="flex items-start gap-3 text-red-600">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-medium">Something went wrong</p>
                <p className="text-[13px] mt-1 text-red-600/90">{error}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Link to="/product/statements">
                <Button variant="secondary">
                  <ArrowLeft className="w-4 h-4" />
                  Statements
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {polling && (
          <p className="mt-6 text-[12px] text-slate-400 text-center">
            Keep this tab open while we finish.
          </p>
        )}
      </main>
    </ProductLayout>
  );
}
