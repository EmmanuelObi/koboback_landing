import Card from "../ui/Card";
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

  return (
    <Card padding="sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={config.color}>{config.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-[14px] font-medium ${config.color}`}>
            {config.label}
          </p>
          <p className="text-[13px] text-slate-500 truncate">{jobStatus.message}</p>
        </div>
      </div>
      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500"
          style={{ width: `${jobStatus.progress_percent}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-slate-400 mt-2 tabular-nums">
        <span>{jobStatus.progress_percent}% complete</span>
        {elapsedSec != null && (
          <span>
            {Math.floor(elapsedSec / 60)}m {elapsedSec % 60}s
          </span>
        )}
      </div>
    </Card>
  );
}
