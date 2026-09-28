import { cn } from "./tokens";

export default function Skeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200/80",
        className,
      )}
      aria-hidden
    />
  );
}

export function StatementListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-white px-4 py-4"
        >
          <Skeleton className="h-9 w-9 shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-3.5 w-2/3 max-w-[220px]" />
            <Skeleton className="h-3 w-1/3 max-w-[140px]" />
          </div>
          <Skeleton className="hidden sm:block h-6 w-16 shrink-0" />
          <Skeleton className="h-8 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function StatGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8" aria-busy="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200/80 bg-white p-4"
        >
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-7 w-16" />
        </div>
      ))}
    </div>
  );
}
