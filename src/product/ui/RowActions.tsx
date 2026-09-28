import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "../ui/tokens";

export type RowAction = {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
};

/**
 * Desktop: shows primary inline; overflow in a menu.
 * Mobile: collapses most actions into a single menu.
 */
export default function RowActions({
  primary,
  secondary = [],
  className,
}: {
  primary?: React.ReactNode;
  secondary?: RowAction[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative flex items-center gap-2", className)}>
      {primary && <div className="flex items-center gap-2">{primary}</div>}

      {secondary.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:text-slate-950 hover:border-slate-300 transition-colors"
            aria-label="More actions"
            aria-expanded={open}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 z-20 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              {secondary.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  disabled={action.disabled}
                  onClick={() => {
                    setOpen(false);
                    action.onClick();
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-[13px] transition-colors disabled:opacity-50",
                    action.danger
                      ? "text-red-600 hover:bg-red-50"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
