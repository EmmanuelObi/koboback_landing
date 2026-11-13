import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AlertTriangle, ArrowUpRight, Download, FileText, Plus, Save } from "lucide-react";
import type { Engagement, Finding, FindingStatus, Workspace } from "../types";
import type { AuditorData } from "../useAuditorData";
import { dateLabel, human, money, outcome } from "../helpers";
import ConfirmFactsForm from "./ConfirmFactsForm";
import { Badge, Button, Empty, Field, SearchBox } from "./ui";
export function FindingsWorkbench({
  workspace,
  findings,
  data,
  demo,
  base,
  onEvidence
}: {
  workspace: Workspace;
  findings: Finding[];
  data: AuditorData;
  demo: boolean;
  base: string;
  onEvidence: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [assessment, setAssessment] = useState("all");
  const [params, setParams] = useSearchParams();
  const filtered = findings.filter(f => (assessment === "all" || outcome(f) === assessment) && (status === "all" || f.status === status) && `${f.description} ${f.reference ?? ""} ${f.date}`.toLowerCase().includes(search.toLowerCase()));
  const selected = filtered.find(f => f.id === params.get("finding")) ?? filtered[0];
  const select = (id: string) => {
    const next = new URLSearchParams(params);
    next.set("finding", id);
    setParams(next, {
      replace: true
    });
  };
  return <>
    <div className="aw-assessment-summary" role="group" aria-label="Assessment outcomes">{["within_limit", "potential_excess", "needs_facts", "needs_evidence", "rule_unavailable"].map(value => <button key={value} type="button" aria-pressed={assessment === value} onClick={() => setAssessment(assessment === value ? "all" : value)}>{human(value)} <strong>{findings.filter(f => outcome(f) === value).length}</strong></button>)}</div>
    <div className="aw-workbench">
      <div className="aw-workbench-main">
        <div className="aw-toolbar"><SearchBox value={search} onChange={setSearch} placeholder="Search findings" /><select aria-label="Filter by assessment outcome" className="aw-select aw-filter" value={assessment} onChange={e => setAssessment(e.target.value)}><option value="all">All assessment outcomes</option>{["within_limit", "potential_excess", "needs_facts", "needs_evidence", "rule_unavailable"].map(s => <option value={s} key={s}>{human(s)}</option>)}</select><select aria-label="Filter findings by status" className="aw-select aw-filter" value={status} onChange={e => setStatus(e.target.value)}><option value="all">All statuses</option>{["open", "needs_evidence", "in_review", "supported", "dismissed"].map(s => <option key={s} value={s}>{human(s)}</option>)}</select></div>
        {filtered.length ? <div className="aw-table-wrap"><table className="aw-table"><thead><tr><th>Transaction / date</th><th>Amount charged</th><th>Est. excess</th><th>Assessment</th><th>Review</th></tr></thead><tbody>{filtered.map(f => <tr key={f.id} className={selected?.id === f.id ? "aw-selected" : ""}><td><button className="aw-row-button" onClick={() => select(f.id)} aria-pressed={selected?.id === f.id}><strong>{f.description}</strong><small>{dateLabel(f.date)}</small></button></td><td className="aw-numeric">{money(f.amount, f.currency)}</td><td className="aw-numeric">{f.status === "dismissed" ? "—" : f.reviewed_amount !== null ? money(f.reviewed_amount, f.currency) : f.engine_amount !== null ? money(f.engine_amount, f.currency) : "—"}</td><td><Badge status={outcome(f)} /></td><td><Badge status={f.status}>{f.review_stale ? "Review again" : f.kind === "within_limit" && !f.reviewed_at ? "No decision required" : undefined}</Badge></td></tr>)}</tbody></table></div> : <Empty title={search || status !== "all" ? "No matching findings" : "No findings to review yet"} description={search || status !== "all" ? "Try another search or status filter." : "Findings and evidence requests will appear after statement analysis."} />}
      </div>
      {selected ? <FindingInspector key={`${selected.id}:${selected.assessment_version ?? 0}`} finding={selected} workspace={workspace} data={data} demo={demo} base={base} onEvidence={onEvidence} /> : <aside className="aw-inspector"><Empty title="Select a finding" description="Review the source transaction, evidence and decision in this panel." /></aside>}
    </div>
    <p className="aw-review-footnote"><AlertTriangle size={13} />Unassessed and stale reviewed amounts are excluded from potential excess totals. All figures remain advisory.</p>
  </>;
}
function FindingInspector({
  finding,
  workspace,
  data,
  demo,
  base,
  onEvidence
}: {
  finding: Finding;
  workspace: Workspace;
  data: AuditorData;
  demo: boolean;
  base: string;
  onEvidence: (id: string) => void;
}) {
  const [note, setNote] = useState(finding.note);
  const [decision, setDecision] = useState<FindingStatus>(finding.status);
  const [amount, setAmount] = useState(finding.reviewed_amount === null ? "" : String(finding.reviewed_amount));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const statement = workspace.statements.find(s => s.id === finding.statement_id);
  const engagement = workspace.engagements.find(e => e.id === finding.engagement_id);
  const evidence = workspace.evidence.filter(e => e.finding_id === finding.id);
  const locked = engagement?.status === "completed";
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaved(false);
    try {
      await data.mutate(`/findings/${finding.id}/review`, "PATCH", {
        status: decision,
        note,
        reviewed_amount: amount === "" ? null : Number(amount),
        revision: workspace.revision
      });
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return <aside className="aw-inspector" aria-label="Finding details">
    <h2>{finding.description}</h2><Badge status={outcome(finding)} />
    {finding.review_stale ? <p role="status" className="aw-inline-message">The assessment changed. Your previous decision and evidence are preserved; review it again before completion. Its previous reviewed amount is excluded from totals.</p> : null}
    <p className="aw-inspector-source">{statement?.filename ?? "Source statement"}{finding.source_index === null ? "" : ` · Transaction ${finding.source_index + 1}`}<br />{finding.reference ? `Ref: ${finding.reference}` : "Reference not provided"}</p>
    <div className="aw-inspector-amount"><span>Charged amount</span><strong>{money(finding.amount, finding.currency)}</strong></div>
    <div className="aw-inspector-block"><h3>{finding.kind === "within_limit" ? "What was assessed" : finding.kind === "scrutiny" ? "Why it needs review" : "Why it was flagged"}</h3><p>{finding.reason}</p></div>
    {finding.established_facts?.length ? <div className="aw-inspector-block"><h3>Facts established</h3>{finding.established_facts.map((fact, i) => <p key={i}><strong>{human(fact.field)}: {String(fact.value)}</strong><br /><span className="aw-note">{fact.source}</span></p>)}</div> : null}
    {finding.kind === "within_limit" ? <div className="aw-inspector-block"><p>Charged {money(finding.amount, finding.currency)} against an evidenced allowance of {money(finding.cap ?? 0, finding.currency)}. This is an amount-only check, not a finding of full compliance.</p></div> : null}
    <div className="aw-inspector-block"><h3>{outcome(finding) === "rule_unavailable" ? "Authority to verify" : outcome(finding) === "needs_facts" ? "Statement facts to establish" : "Supporting evidence"}</h3>{finding.evidence_needed.length ? <ul>{finding.evidence_needed.map((text, i) => <li key={i}>{text}</li>)}</ul> : <p>No additional facts are required for this amount comparison. Review any other concerns separately.</p>}
      <Button variant="secondary" disabled={locked || Boolean(data.busy)} onClick={() => onEvidence(finding.id)}><Plus />Add evidence</Button>
    </div>
    {evidence.length > 0 ? <div className="aw-inspector-block"><h3>Supporting records ({evidence.length})</h3>{evidence.map(e => <details className="aw-evidence-item" key={e.id}><summary><strong>{e.title}</strong><small>{human(e.kind)} · {e.status === "ready" ? "Available" : "Upload incomplete"}</small></summary><div><p>{e.detail}</p>{e.kind === "reference" && /^https?:\/\//i.test(e.url) ? <a className="aw-quiet-link" href={e.url} target="_blank" rel="noopener noreferrer">Open reference <ArrowUpRight size={11} /></a> : null}{e.kind === "file" ? demo ? <p className="aw-note">Demo attachment metadata only; file bytes were not uploaded.</p> : <Button variant="ghost" disabled={e.status !== "ready"} onClick={() => data.download("evidence", e.id)}><Download />Download file</Button> : null}</div></details>)}</div> : null}
    <ConfirmFactsForm finding={finding} evidence={evidence} data={data} revision={workspace.revision} disabled={locked || Boolean(data.busy)} demo={demo} />
    {finding.assessment_history?.length ? <details className="aw-inspector-block"><summary>Previous assessments ({finding.assessment_history.length})</summary>{finding.assessment_history.map((run,i) => <p key={i}>{String(run.ruleset_version ?? "Earlier rules")} · {String(run.reason ?? "")}</p>)}</details> : null}
    {finding.citation ? <div className="aw-inspector-block"><h3>Regulatory basis</h3><p>{finding.citation}</p></div> : null}
    {!demo && statement ? <Button variant="ghost" onClick={() => data.download("statements", statement.id)}><FileText />Open source statement</Button> : null}
    <form onSubmit={save} className="aw-inspector-block">
      <Field label="Reviewer note"><textarea rows={4} placeholder="Add your assessment…" value={note} onChange={e => {
          setNote(e.target.value);
          setSaved(false);
        }} disabled={locked} required={["supported", "dismissed"].includes(decision)} /></Field>
      <Field label="Review decision"><select value={decision} disabled={locked} onChange={e => {
          setDecision(e.target.value as FindingStatus);
          setSaved(false);
        }}><option value="open">Keep open</option><option value="needs_evidence">Needs evidence</option><option value="in_review">In review</option><option value="supported">Supported by evidence</option><option value="dismissed">Dismissed with explanation</option></select></Field>
      {decision === "supported" ? <Field label="Reviewed potential excess" hint="Enter an explicit amount supported by the attached evidence. This does not establish refund entitlement."><input aria-label="Reviewed potential excess" type="number" min="0" step="0.01" max={finding.amount} required value={amount} onChange={e => setAmount(e.target.value)} disabled={locked} /></Field> : null}
      {error ? <p className="aw-form-error" role="alert">{error}</p> : null}
      <Button type="submit" disabled={locked || Boolean(data.busy)}><Save />{data.busy ? "Saving…" : "Save review"}</Button>
      {saved ? <p className="aw-review-success" role="status">Review saved. The change is recorded in activity.</p> : null}
      {locked ? <p className="aw-note">This engagement is completed. <Link className="aw-quiet-link" to={`${base}/engagements/${engagement?.id}?tab=overview`}>Reopen it</Link> before editing.</p> : null}
    </form>
  </aside>;
}
export function EvidenceRegister({
  workspace,
  engagement,
  data,
  demo,
  base
}: {
  workspace: Workspace;
  engagement?: Engagement;
  data: AuditorData;
  demo: boolean;
  base: string;
}) {
  const records = workspace.evidence.filter(e => !engagement || e.engagement_id === engagement.id);
  return <div className="aw-panel"><div className="aw-panel-heading"><div><h2>Evidence register</h2><p>Supporting records stay linked to the finding and its review history.</p></div><span className="aw-muted">{records.length} records</span></div>{records.length ? <div className="aw-table-wrap"><table className="aw-table"><thead><tr><th>Evidence / type</th><th>Related finding</th><th>Added by</th><th>Date</th><th>Open</th></tr></thead><tbody>{records.map(e => <tr key={e.id}><td><strong>{e.title}</strong><small>{human(e.kind)} · {e.status === "ready" ? "Available" : "Upload incomplete"}</small></td><td><Link to={`${base}/engagements/${e.engagement_id}?tab=findings&finding=${encodeURIComponent(e.finding_id)}`}><strong>{workspace.findings.find(f => f.id === e.finding_id)?.description ?? "View finding"}</strong></Link></td><td>{e.added_by}</td><td>{dateLabel(e.created_at)}</td><td>{e.kind === "file" && !demo ? <Button variant="ghost" disabled={e.status !== "ready"} onClick={() => data.download("evidence", e.id)}><Download />Download</Button> : e.kind === "reference" && /^https?:\/\//i.test(e.url) ? <a className="aw-quiet-link" href={e.url} target="_blank" rel="noopener noreferrer">Open reference</a> : <Link className="aw-quiet-link" to={`${base}/engagements/${e.engagement_id}?tab=findings&finding=${encodeURIComponent(e.finding_id)}`}>View record</Link>}</td></tr>)}</tbody></table></div> : <Empty title="No evidence attached yet" description="Open a finding and add a note, reference or supporting document to start building the working file." />}</div>;
}
