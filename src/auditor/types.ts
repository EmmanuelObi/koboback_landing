export type EngagementStatus = "draft" | "in_progress" | "in_review" | "completed";
export type FindingStatus = "open" | "needs_evidence" | "in_review" | "supported" | "dismissed";
export interface Client {
  id: string;
  name: string;
  industry: string;
  contact: string;
  created_at: string;
}
export interface Engagement {
  id: string;
  client_id: string;
  title: string;
  period_from: string;
  period_to: string;
  objective: string;
  status: EngagementStatus;
  created_at: string;
  updated_at: string;
}
export interface Statement {
  id: string;
  engagement_id: string;
  job_id: string;
  filename: string;
  status: string;
  account_type: "savings" | "current";
  institution_type: string;
  bank_name: string | null;
  currency: string;
  period: string | null;
  transaction_count: number;
  report: Record<string, unknown> | null;
  created_at: string;
  message: string;
  progress: number;
  paid: boolean;
  excluded_reason?: string;
}
export interface Finding {
  id: string;
  engagement_id: string;
  statement_id: string;
  source_index: number | null;
  date: string;
  description: string;
  amount: number;
  currency: string;
  reference: string | null;
  kind: "potential" | "scrutiny";
  engine_amount: number | null;
  reason: string;
  citation: string | null;
  evidence_needed: string[];
  status: FindingStatus;
  note: string;
  reviewed_amount: number | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}
export interface Evidence {
  id: string;
  finding_id: string;
  engagement_id: string;
  kind: "note" | "reference" | "file";
  title: string;
  detail: string;
  url: string;
  filename: string | null;
  status: "pending" | "ready";
  added_by: string;
  created_at: string;
}
export interface Activity {
  id: string;
  action: string;
  detail: string;
  engagement_id: string | null;
  finding_id?: string | null;
  actor: string;
  created_at: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}
export interface Workspace {
  revision: number;
  practice_name: string;
  clients: Client[];
  engagements: Engagement[];
  statements: Statement[];
  findings: Finding[];
  evidence: Evidence[];
  activity: Activity[];
  payment_required?: boolean;
  audit_price_kobo?: number;
}
export type ClientInput = Pick<Client, "name" | "industry" | "contact">;
export type EngagementInput = Pick<Engagement, "client_id" | "title" | "period_from" | "period_to" | "objective">;
export interface EvidenceInput {
  kind: Evidence["kind"];
  title: string;
  detail: string;
  url: string;
  filename?: string;
  file_size?: number;
}
export interface ReviewInput {
  status: FindingStatus;
  note: string;
  reviewed_amount: number | null;
  revision: number;
}
