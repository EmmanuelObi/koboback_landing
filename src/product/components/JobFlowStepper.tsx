import { cn } from "../ui/tokens";
import { flowStepIndex, type FlowStepId } from "../lib/auditStatus";
import type { JobStatus } from "../api/client";

const STEPS: { id: FlowStepId; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "extract", label: "Extract" },
  { id: "audit", label: "Audit" },
  { id: "report", label: "Report" },
];

export default function JobFlowStepper({
  status,
  failed = false,
  hasParsedData = false,
  className,
}: {
  status: JobStatus | null | undefined;
  failed?: boolean;
  hasParsedData?: boolean;
  className?: string;
}) {
  const active = flowStepIndex(status, { hasParsedData });
  const isFailed = failed || status === "failed";

  return (
    <ol
      className={cn(
        "flex items-center gap-1 sm:gap-2 text-[12px] sm:text-[13px]",
        className,
      )}
      aria-label="Statement progress"
    >
      {STEPS.map((step, index) => {
        const done = index < active || (status === "complete" && index <= active);
        const current = index === active && status !== "complete";
        const failHere = isFailed && index === active;

        return (
          <li key={step.id} className="flex items-center gap-1 sm:gap-2 min-w-0">
            {index > 0 && (
              <span
                className={cn(
                  "hidden sm:block w-6 h-px shrink-0",
                  done || current ? "bg-slate-300" : "bg-slate-200",
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium truncate",
                failHere && "bg-red-50 text-red-700",
                !failHere && done && "bg-slate-100 text-slate-700",
                !failHere && current && "bg-brand-muted text-brand-dark",
                !failHere && !done && !current && "text-slate-400",
              )}
            >
              <span
                className={cn(
                  "h-5 w-5 rounded-full text-[11px] flex items-center justify-center shrink-0",
                  failHere && "bg-red-600 text-white",
                  !failHere && done && "bg-slate-700 text-white",
                  !failHere && current && "bg-brand text-white",
                  !failHere && !done && !current && "bg-slate-200 text-slate-500",
                )}
              >
                {index + 1}
              </span>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
