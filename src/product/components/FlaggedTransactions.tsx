import { AlertTriangle, CheckCircle, BookOpen } from "lucide-react";
import type { FlaggedTransaction } from "../api/client";

interface Props {
  transactions: FlaggedTransaction[];
  totalOverchargeFromReport?: number; // From the API response
}

const riskColor = {
  high: "text-red-700 bg-red-50",
  medium: "text-yellow-700 bg-yellow-50",
  low: "text-emerald-700 bg-emerald-50",
};

export default function FlaggedTransactions({
  transactions,
  totalOverchargeFromReport,
}: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
        <p>
          No overcharges detected. Your bank fees appear compliant with CBN
          regulations.
        </p>
      </div>
    );
  }

  // Calculate from transactions as fallback, but prefer the API total
  const calculatedTotal = transactions.reduce(
    (sum, tx) => sum + (tx.overcharge_amount || 0),
    0,
  );
  const totalOvercharge = totalOverchargeFromReport ?? calculatedTotal;

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-red-800 font-medium">
            {transactions.length} potential overcharge
            {transactions.length !== 1 ? "s" : ""} detected
          </span>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-red-600 uppercase tracking-wider">
            Est. Refund Owed
          </p>
          <p className="text-xl font-bold text-red-700">
            ₦
            {totalOvercharge.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Cards layout for better readability */}
      <div className="space-y-3">
        {transactions.map((tx, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
          >
            {/* Header row: Date, Risk Badge, Amounts */}
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{tx.date}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${riskColor[tx.risk_level]}`}
                >
                  {tx.risk_level.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <span className="text-slate-500 text-xs block">Charged</span>
                  <span className="font-mono font-medium">
                    ₦
                    {tx.amount.toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {tx.cbn_max_allowed != null && (
                  <div className="text-right">
                    <span className="text-slate-500 text-xs block">CBN Max</span>
                    <span className="font-mono text-slate-600">
                      ₦
                      {tx.cbn_max_allowed.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                {tx.overcharge_amount != null && tx.overcharge_amount > 0 && (
                  <div className="text-right">
                    <span className="text-red-500 text-xs block">
                      Overcharge
                    </span>
                    <span className="font-mono font-bold text-red-600">
                      +₦
                      {tx.overcharge_amount.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-900 font-medium mb-1">
              {tx.description}
            </p>

            {/* Original transaction details */}
            {(tx.original_description ||
              tx.debit != null ||
              tx.credit != null ||
              tx.balance != null) && (
              <div className="mb-2 bg-slate-50 rounded-md px-3 py-2 text-xs text-slate-600 space-y-1">
                {tx.original_description &&
                  tx.original_description !== tx.description && (
                    <p>
                      <span className="font-medium text-slate-500">
                        Narration:
                      </span>{" "}
                      {tx.original_description}
                    </p>
                  )}
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {tx.debit != null && (
                    <span>
                      <span className="font-medium text-slate-500">Debit:</span>{" "}
                      <span className="font-mono">
                        ₦
                        {tx.debit.toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </span>
                  )}
                  {tx.credit != null && (
                    <span>
                      <span className="font-medium text-slate-500">Credit:</span>{" "}
                      <span className="font-mono">
                        ₦
                        {tx.credit.toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </span>
                  )}
                  {tx.balance != null && (
                    <span>
                      <span className="font-medium text-slate-500">
                        Balance:
                      </span>{" "}
                      <span className="font-mono">
                        ₦
                        {tx.balance.toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </span>
                  )}
                  {tx.reference && (
                    <span>
                      <span className="font-medium text-slate-500">Ref:</span>{" "}
                      <span className="font-mono">{tx.reference}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Bulk fee breakdown */}
            {tx.is_bulk_charge && tx.bulk_breakdown && (
              <div className="mb-2 bg-brand-muted border border-brand/20 rounded-md px-3 py-2 text-xs text-slate-700">
                <p className="font-medium text-brand-dark mb-1">
                  Bulk charge analysis
                </p>
                <p>{tx.bulk_breakdown}</p>
                {tx.estimated_units != null && tx.unit_cap != null && (
                  <p className="mt-1 text-slate-600">
                    {tx.estimated_units} units × ₦
                    {tx.unit_cap.toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    max = ₦
                    {(tx.max_allowed_total ?? 0).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                    {tx.effective_per_unit != null && (
                      <>
                        {" "}
                        · effective ₦
                        {tx.effective_per_unit.toLocaleString("en-NG", {
                          minimumFractionDigits: 2,
                        })}
                        /unit
                      </>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Violation reason */}
            <p className="text-sm text-slate-600">
              <span className="font-medium text-orange-700">Violation:</span>{" "}
              {tx.flag_reason}
            </p>

            {/* CBN Citation */}
            {tx.cbn_citation && (
              <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3 shrink-0" />
                <span className="font-medium">{tx.cbn_citation}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Summary table for quick reference */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
          View as table
        </summary>
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Date
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  Description
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">
                  Charged
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">
                  CBN Max
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-600">
                  Overcharge
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-600">
                  CBN Regulation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {transactions.map((tx, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 whitespace-nowrap">{tx.date}</td>
                  <td
                    className="px-3 py-2 max-w-[200px] truncate"
                    title={tx.original_description || tx.description}
                  >
                    {tx.description}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    ₦
                    {tx.amount.toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-500">
                    {tx.cbn_max_allowed != null
                      ? `₦${tx.cbn_max_allowed.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-red-600">
                    {tx.overcharge_amount != null && tx.overcharge_amount > 0
                      ? `+₦${tx.overcharge_amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </td>
                  <td
                    className="px-3 py-2 text-xs text-emerald-700 max-w-[200px]"
                    title={tx.cbn_citation || ""}
                  >
                    {tx.cbn_citation || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan={5} className="px-3 py-2 text-right font-semibold">
                  Total Overcharge:
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-red-600">
                  +₦
                  {totalOvercharge.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </details>
    </div>
  );
}
