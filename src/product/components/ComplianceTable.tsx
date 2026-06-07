import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { ComplianceCheck } from "../api/client";

interface Props {
  checks: ComplianceCheck[];
}

const statusIcon = {
  pass: <CheckCircle className="w-5 h-5 text-green-600" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
  fail: <XCircle className="w-5 h-5 text-red-600" />,
};

const statusBg = {
  pass: "bg-green-50",
  warning: "bg-yellow-50",
  fail: "bg-red-50",
};

export default function ComplianceTable({ checks }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Regulation
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {checks.map((check, i) => (
            <tr key={i} className={statusBg[check.status]}>
              <td className="px-4 py-3 whitespace-nowrap">
                {statusIcon[check.status]}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-slate-950">
                {check.regulation}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {check.details}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
