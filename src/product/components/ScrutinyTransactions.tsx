import { AlertTriangle } from "lucide-react";
import type { ScrutinyTransaction } from "../api/client";

export default function ScrutinyTransactions({
  transactions,
  pendingCount = transactions.length,
}: {
  transactions: ScrutinyTransaction[];
  pendingCount?: number;
}) {
  if (pendingCount === 0) return null;

  return (
    <section aria-labelledby="scrutiny-heading" className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 sm:p-6 space-y-4 min-w-0">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h3 id="scrutiny-heading" className="text-[15px] font-semibold text-slate-950">
            Needs additional scrutiny ({pendingCount})
          </h3>
          <p className="text-[13px] text-slate-700 mt-1 leading-relaxed">
            Evidence is missing for these charges. Their amounts are not included in
            the estimated overcharge total. Ask for the supporting records before drawing a conclusion.
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-slate-700">
          This older report did not save transaction-level scrutiny details. Run a new audit to identify the charges and missing evidence.
        </p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <article key={tx.index} className="rounded-lg border border-amber-200 bg-white p-4 space-y-3 min-w-0 break-words">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="text-xs text-slate-600">
                  Transaction {tx.index + 1} · {tx.date || "Date unavailable"}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Amount charged</p>
                  <p className="font-mono text-sm font-semibold text-slate-900">
                    {tx.currency} {tx.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-950">{tx.description}</p>
              {tx.reference ? <p className="text-xs text-slate-600 break-all">Reference: {tx.reference}</p> : null}
              <div className="text-sm text-slate-700 space-y-1">
                <p className="font-semibold text-amber-900">Evidence needed</p>
                {tx.evidence_needed.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {tx.evidence_needed.map((evidence, index) => <li key={index}>{evidence}</li>)}
                  </ul>
                ) : <p>{tx.reason}</p>}
              </div>
              <p className="text-sm text-slate-700"><span className="font-semibold">Next step: </span>{tx.next_step}</p>
              {tx.citation ? <p className="text-xs text-slate-500">Relevant guidance: {tx.citation}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
