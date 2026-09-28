import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "../ui/tokens";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setItems((prev) => [...prev.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-[360px] w-[calc(100%-2rem)] sm:w-auto"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg bg-white text-[13px] animate-in",
              item.tone === "success" && "border-brand/25",
              item.tone === "error" && "border-red-200",
              item.tone === "info" && "border-slate-200",
            )}
          >
            {item.tone === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            ) : item.tone === "error" ? (
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : null}
            <p className="flex-1 text-slate-700 leading-snug">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="p-0.5 text-slate-400 hover:text-slate-700"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (_message: string, _tone?: ToastTone) => {
        /* no-op outside provider */
      },
    };
  }
  return ctx;
}
