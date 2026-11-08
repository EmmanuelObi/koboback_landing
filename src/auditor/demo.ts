import type { Workspace, Finding, ReviewInput, EngagementStatus, EvidenceInput, EngagementInput, ClientInput } from "./types";
import { unresolved } from "./helpers";
const KEY = "koboback.auditor.demo.v1";
const stamp = () => new Date().toISOString();
const id = () => crypto.randomUUID();
export function seedDemo(): Workspace {
  const created = stamp();
  const clients = [["meridian", "Meridian Trading Ltd", "Trading & distribution", "finance@meridian.example"], ["northline", "Northline Logistics", "Transport & logistics", "accounts@northline.example"], ["aster", "Aster Manufacturing", "Manufacturing", "finance@aster.example"], ["elm", "Elm Services", "Professional services", "accounts@elm.example"]].map(([id, name, industry, contact]) => ({
    id,
    name,
    industry,
    contact,
    created_at: created
  }));
  const engagements = [{
    id: "meridian-2026",
    client_id: "meridian",
    title: "2026 Bank charges review",
    period_from: "2026-01-01",
    period_to: "2026-06-30",
    status: "in_progress" as const
  }, {
    id: "northline-q3",
    client_id: "northline",
    title: "Q3 Treasury review",
    period_from: "2026-07-01",
    period_to: "2026-09-30",
    status: "in_progress" as const
  }, {
    id: "aster-operating",
    client_id: "aster",
    title: "Operating accounts review",
    period_from: "2026-01-01",
    period_to: "2026-06-30",
    status: "in_review" as const
  }, {
    id: "elm-annual",
    client_id: "elm",
    title: "Annual fee assessment",
    period_from: "2026-01-01",
    period_to: "2026-09-30",
    status: "completed" as const
  }].map((e, i) => ({
    ...e,
    objective: "Review bank charges against the applicable source guidance and document evidence-backed conclusions.",
    created_at: created,
    updated_at: new Date(Date.now() - i * 86400000).toISOString()
  }));
  const statements = engagements.flatMap((e, index) => Array.from({
    length: index === 0 ? 6 : 2
  }, (_, i) => ({
    id: `${e.id}-s${i + 1}`,
    engagement_id: e.id,
    job_id: `sample-${e.id}-${i}`,
    filename: `${["January", "February", "March", "April", "May", "June"][i]}_2026_statement.pdf`,
    status: "complete",
    account_type: "current" as const,
    institution_type: "bank",
    bank_name: "Example Bank",
    currency: "NGN",
    period: `2026-${String(i + 1).padStart(2, "0")}`,
    transaction_count: 146 + i * 23,
    report: {
      demonstration: true
    },
    created_at: created,
    message: "Sample analysis available",
    progress: 100,
    paid: true
  })));
  const definitions: [string, string, string, number, number | null, Finding["status"]][] = [["sms-1", "meridian-2026", "SMS alert arrears", 215, null, "needs_evidence"], ["nip-1", "meridian-2026", "NIP transfer fee", 53.75, 26.87, "open"], ["card-1", "meridian-2026", "Card maintenance", 53.75, 53.75, "in_review"], ["camf-1", "meridian-2026", "Account maintenance", 1250, null, "needs_evidence"], ["ussd-1", "northline-q3", "USSD session charge", 75, null, "needs_evidence"], ["nip-2", "aster-operating", "Electronic transfer fee", 75, 21.25, "open"], ["sms-2", "aster-operating", "SMS alert fee", 430, null, "needs_evidence"], ["closed-1", "elm-annual", "Card replacement fee", 1075, null, "dismissed"]];
  const findings: Finding[] = definitions.map(([id, engagement_id, description, amount, engine_amount, status], i) => ({
    id,
    engagement_id,
    statement_id: `${engagement_id}-s${engagement_id === "meridian-2026" ? 6 : 1}`,
    source_index: 41 + i,
    date: `2026-06-${String(3 + i).padStart(2, "0")}`,
    description,
    amount,
    currency: "NGN",
    reference: `SAMPLE-REF-${String(i + 1).padStart(4, "0")}`,
    kind: engine_amount === null ? "scrutiny" : "potential",
    engine_amount,
    status,
    note: status === "dismissed" ? "Sample review: supporting fee breakdown did not establish an excess." : "",
    reviewed_amount: null,
    reviewed_at: status === "dismissed" ? created : null,
    reviewed_by: status === "dismissed" ? "Demo reviewer" : null,
    reason: id.startsWith("sms") ? "The statement does not establish the actual delivery cost or whether the alerts were customer-induced." : engine_amount !== null ? "The sample calculation indicates a potential excess against the evidenced allowance. Verify the underlying facts before supporting the finding." : "Supporting transaction and tariff information is required before this charge can be assessed.",
    citation: id.startsWith("sms") ? "CBN Guide to Charges 2020, Banks §10.10.1, PDF p23" : id.startsWith("nip") ? "CBN Guide to Charges 2020, Banks §10.2, PDF p21" : null,
    evidence_needed: id.startsWith("sms") ? ["SMS cost-recovery breakdown", "Customer- or bank-induced alerts"] : ["Underlying transaction and applicable fee basis"]
  }));
  return {
    revision: 0,
    practice_name: "Your practice",
    clients,
    engagements,
    statements,
    findings,
    evidence: [],
    payment_required: false,
    activity: [{
      id: id(),
      action: "Analysis ready",
      detail: "June statement · 4 sample findings available for review",
      engagement_id: "meridian-2026",
      actor: "Demo engine",
      created_at: created
    }, {
      id: id(),
      action: "Engagement created",
      detail: "2026 Bank charges review",
      engagement_id: "meridian-2026",
      actor: "Demo reviewer",
      created_at: created
    }]
  };
}
export function readDemo(): Workspace {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (value && typeof value.practice_name === "string" && typeof value.revision === "number" && ["clients", "engagements", "statements", "findings", "evidence", "activity"].every(key => Array.isArray(value[key]))) return value;
  } catch {/* A damaged preview store can be reset safely to fictional records. */}
  return seedDemo();
}
export function persistDemo(workspace: Workspace) {
  localStorage.setItem(KEY, JSON.stringify(workspace));
}
export function resetDemo() {
  const state = seedDemo();
  persistDemo(state);
  return state;
}
export function demoAction(current: Workspace, path: string, body: unknown): Workspace | {
  workspace: Workspace;
  evidence_id: string;
  upload_url: null;
} {
  const state: Workspace = JSON.parse(JSON.stringify(current));
  const log = (action: string, detail: string, engagement_id: string | null = null, finding_id: string | null = null) => state.activity.unshift({
    id: id(),
    action,
    detail,
    engagement_id,
    finding_id,
    actor: "You (demo)",
    created_at: stamp()
  });
  let envelope: string | null = null;
  if (path === "/clients") {
    const value = body as ClientInput;
    if (!value.name.trim()) throw Error("Client name is required.");
    state.clients.push({
      ...value,
      id: id(),
      created_at: stamp()
    });
    log("Client created", value.name);
  } else if (path === "/engagements") {
    const value = body as EngagementInput;
    if (!state.clients.some(c => c.id === value.client_id) || !value.title.trim() || value.period_to < value.period_from) throw Error("Provide a client, title and valid review period.");
    const record = {
      ...value,
      id: id(),
      status: "in_progress" as const,
      created_at: stamp(),
      updated_at: stamp()
    };
    state.engagements.unshift(record);
    log("Engagement created", value.title, record.id);
  } else if (path.startsWith("/engagements/")) {
    const record = state.engagements.find(e => e.id === path.split("/")[2]);
    if (!record) throw Error("Engagement not found.");
    const status = (body as {
      status: EngagementStatus;
    }).status;
    if (status === "completed" && (!state.statements.some(s => s.engagement_id === record.id && s.status !== "excluded") || state.statements.some(s => s.engagement_id === record.id && s.status !== "excluded" && !s.report) || state.findings.some(f => f.engagement_id === record.id && unresolved(f)))) throw Error("Complete statement analysis and resolve every finding before completing the engagement.");
    record.status = status;
    record.updated_at = stamp();
    log("Engagement status changed", status.replace(/_/g, " "), record.id);
  } else if (path.startsWith("/statements/") && path.endsWith("/exclude")) {
    const statement = state.statements.find(s => s.id === path.split("/")[2]);
    if (!statement || statement.report) throw Error("Only unanalysed source statements can be excluded.");
    if (state.engagements.find(e => e.id === statement.engagement_id)?.status === "completed") throw Error("Reopen this engagement before changing records.");
    const reason = (body as {
      reason: string;
    }).reason.trim();
    if (reason.length < 3) throw Error("Record the reason for excluding this source.");
    statement.status = "excluded";
    statement.excluded_reason = reason;
    log("Source excluded from scope", `${statement.filename}: ${reason}`, statement.engagement_id);
  } else if (path === "/practice") {
    const name = (body as {
      name: string;
    }).name.trim();
    if (!name) throw Error("Practice name is required.");
    state.practice_name = name;
    log("Practice updated", name);
  } else if (path.startsWith("/findings/")) {
    const finding = state.findings.find(f => f.id === path.split("/")[2]);
    if (!finding) throw Error("Finding not found.");
    if (state.engagements.find(e => e.id === finding.engagement_id)?.status === "completed") throw Error("Reopen this engagement before changing its records.");
    if (path.endsWith("/review")) {
      const value = body as ReviewInput;
      if (["supported", "dismissed"].includes(value.status) && value.note.trim().length < 3) throw Error("Record the reasoning for your review decision.");
      if (value.status === "supported" && (value.reviewed_amount === null || value.reviewed_amount < 0 || value.reviewed_amount > finding.amount)) throw Error("Enter a valid reviewed excess no greater than the charge.");
      if (value.status === "supported" && !state.evidence.some(e => e.finding_id === finding.id && e.status === "ready")) throw Error("Attach supporting evidence before marking a finding supported.");
      const before = {
        status: finding.status,
        note: finding.note,
        reviewed_amount: finding.reviewed_amount
      };
      Object.assign(finding, value, {
        reviewed_amount: value.status === "supported" ? value.reviewed_amount : null,
        reviewed_at: stamp(),
        reviewed_by: "You (demo)"
      });
      log("Finding reviewed", `${finding.description}: ${before.status} → ${value.status}`, finding.engagement_id, finding.id);
      Object.assign(state.activity[0], {
        before,
        after: {
          status: finding.status,
          note: finding.note,
          reviewed_amount: finding.reviewed_amount
        }
      });
    } else {
      const value = body as EvidenceInput;
      if (!value.title.trim() || value.kind === "note" && !value.detail.trim()) throw Error("Provide an evidence title and supporting note.");
      if (value.kind === "reference" && !/^https?:\/\//i.test(value.url)) throw Error("Provide an http or https reference URL.");
      const evidence = {
        ...value,
        id: id(),
        finding_id: finding.id,
        engagement_id: finding.engagement_id,
        filename: value.filename ?? null,
        status: "ready" as const,
        added_by: "You (demo)",
        created_at: stamp()
      };
      state.evidence.unshift(evidence);
      envelope = evidence.id;
      log("Evidence added", value.title, finding.engagement_id, finding.id);
    }
  } else throw Error("This action is unavailable in the demonstration.");
  state.revision++;
  persistDemo(state);
  return envelope ? {
    workspace: state,
    evidence_id: envelope,
    upload_url: null
  } : state;
}
