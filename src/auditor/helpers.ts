import type { Engagement, Finding, Workspace } from "./types";
export const money = (amount: number, currency = "NGN") => `${currency} ${amount.toLocaleString("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;
const labels: Record<string, string> = {within_limit: "Within assessed limit", potential_excess: "Potential excess", needs_facts: "Check statement facts", rule_unavailable: "Rule coverage unavailable"};
export const human = (value: string) => labels[value] ?? value.replace(/_/g, " ").replace(/^./, c => c.toUpperCase());
export const initials = (value: string) => value.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase();
export const dateLabel = (value: string) => value && !Number.isNaN(Date.parse(value)) ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value).toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric"
}) : value || "Not provided";
export const period = (engagement: Engagement) => `${dateLabel(engagement.period_from)} – ${dateLabel(engagement.period_to)}`;
export function excess(finding: Finding) {
  if (finding.review_stale) return 0;
  if (finding.status === "dismissed" || finding.currency !== "NGN") return 0;
  return finding.status === "supported" ? finding.reviewed_amount ?? 0 : finding.engine_amount ?? 0;
}
export const unresolved = (finding: Finding) => Boolean(finding.review_stale) || finding.kind !== "within_limit" && !["supported", "dismissed"].includes(finding.status);
export function outcome(finding: Finding): string {
  if (finding.assessment_outcome) return finding.assessment_outcome;
  if (finding.kind === "within_limit") return "within_limit";
  if (finding.kind === "potential") return "potential_excess";
  if (finding.assessment_gap === "rule_coverage" || /historical authority|not yet effective|circular|authority is missing|universal numeric cap|foreign currency/i.test(finding.reason)) return "rule_unavailable";
  if (finding.assessment_gap === "statement_facts") return "needs_facts";
  if (finding.assessment_gap === "supporting_evidence" || /actual sms|cost and transaction-origin|negotiated rate|cost-recovery/i.test(finding.reason)) return "needs_evidence";
  return "needs_facts";
}
export function engagementStats(workspace: Workspace, id?: string) {
  const findings = workspace.findings.filter(f => !id || f.engagement_id === id);
  return {
    statements: workspace.statements.filter(s => s.status !== "excluded" && (!id || s.engagement_id === id)).length,
    findings: findings.length,
    needsEvidence: findings.filter(f => unresolved(f) && outcome(f) === "needs_evidence").length,
    open: findings.filter(unresolved).length,
    excess: findings.reduce((sum, f) => sum + excess(f), 0)
  };
}
export const clientName = (workspace: Workspace, engagement: Engagement) => workspace.clients.find(c => c.id === engagement.client_id)?.name ?? "Unknown client";
