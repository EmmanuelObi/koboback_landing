interface RiskBadgeProps {
  level: "low" | "medium" | "high" | "critical";
  score: number;
}

const config = {
  low: {
    bg: "bg-green-100",
    text: "text-green-800",
    ring: "ring-green-600/20",
  },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    ring: "ring-yellow-600/20",
  },
  high: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    ring: "ring-orange-600/20",
  },
  critical: { bg: "bg-red-100", text: "text-red-800", ring: "ring-red-600/20" },
};

export default function RiskBadge({ level, score }: RiskBadgeProps) {
  const c = config[level];
  return (
    <div className="flex items-center gap-3">
      <div className="text-[22px] font-semibold text-slate-950 tracking-tight tabular-nums">
        {score}
        <span className="text-[14px] font-normal text-slate-400">/100</span>
      </div>
      <span
        className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${c.bg} ${c.text}`}
      >
        {level.toUpperCase()} RISK
      </span>
    </div>
  );
}
