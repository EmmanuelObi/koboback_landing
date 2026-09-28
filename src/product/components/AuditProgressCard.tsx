import { AUDIT_STATUS_CONFIG } from "../lib/auditStatus";
import type { JobStatusResponse } from "../api/client";

interface AuditProgressCardProps {
  jobStatus: JobStatusResponse;
  elapsedSec?: number;
}

export default function AuditProgressCard({
  jobStatus,
  elapsedSec,
}: AuditProgressCardProps) {
  const config = AUDIT_STATUS_CONFIG[jobStatus.status];
  const percent = Math.max(0, Math.min(100, jobStatus.progress_percent || 8));

  return (
    <div className="rounded-xl border border-brand/15 bg-white overflow-hidden">
      <div className="bg-gradient-to-br from-brand-muted via-white to-white px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3 mb-5">
          <div
            className={`h-10 w-10 rounded-lg bg-white border border-brand/15 flex items-center justify-center ${config.color}`}
          >
            {config.icon}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className={`text-[15px] font-semibold ${config.color}`}>
              {config.label}
            </p>
            <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">
              {jobStatus.message}
            </p>
          </div>
        </div>

        <div className="h-1.5 w-full bg-white/80 border border-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-2.5 tabular-nums">
          <span>{jobStatus.progress_percent}% complete</span>
          {elapsedSec != null && (
            <span>
              {Math.floor(elapsedSec / 60)}m {elapsedSec % 60}s elapsed
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60">
        <p className="text-[12px] text-slate-500">
          Work continues in the background — you can leave this page and return
          from Statements anytime.
        </p>
      </div>
    </div>
  );
}
