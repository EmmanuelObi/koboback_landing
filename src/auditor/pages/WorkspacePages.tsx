import { useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, Circle, Download, FileText, FolderOpen, Play, Plus, Upload } from "lucide-react";
import type { Engagement, Statement, Workspace } from "../types";
import type { AuditorData } from "../useAuditorData";
import { clientName, dateLabel, engagementStats, human, initials, money, period, unresolved } from "../helpers";
import { Badge, Button, Empty, Metrics, SearchBox, Title } from "../components/ui";
import EngagementTable from "../components/EngagementTable";
import ActivityList from "../components/ActivityList";
import { EvidenceRegister, FindingsWorkbench } from "../components/FindingsWorkbench";
import { exportRegister } from "../exports";
export function EngagementsPage({
  workspace,
  base,
  demo,
  onCreate,
  notice
}: {
  workspace: Workspace;
  base: string;
  demo: boolean;
  onCreate: () => void;
  notice?: ReactNode;
}) {
  const [params] = useSearchParams();
  const stats = engagementStats(workspace);
  return <><Title title="Engagements" description="Manage statement reviews, evidence, and client deliverables." actions={<><Button variant="secondary" onClick={() => exportRegister(workspace, demo)}><Download />Export register</Button><Button onClick={onCreate}><Plus />New engagement</Button></>} /><Metrics values={[{
      label: "Active engagements",
      value: workspace.engagements.filter(e => e.status !== "completed").length.toString().padStart(2, "0")
    }, {
      label: "Awaiting evidence",
      value: stats.needsEvidence.toString().padStart(2, "0"),
      warning: true
    }, {
      label: "Ready for review",
      value: workspace.engagements.filter(e => e.status === "in_review").length.toString().padStart(2, "0")
    }, {
      label: "Potential excess",
      value: money(stats.excess)
    }]} />{notice}<EngagementTable workspace={workspace} base={base} clientId={params.get("client")} /></>;
}
export function OverviewPage({
  workspace,
  base,
  onCreate
}: {
  workspace: Workspace;
  base: string;
  onCreate: () => void;
}) {
  const stats = engagementStats(workspace);
  const pending = workspace.findings.filter(unresolved).slice(0, 5);
  return <><Title title="Practice overview" description="A clear view of your engagements, open questions, and next review decisions." actions={<Button onClick={onCreate}><Plus />New engagement</Button>} /><Metrics values={[{
      label: "Clients",
      value: workspace.clients.length
    }, {
      label: "Active engagements",
      value: workspace.engagements.filter(e => e.status !== "completed").length
    }, {
      label: "Open findings",
      value: stats.open,
      warning: stats.open > 0
    }, {
      label: "Est. potential excess",
      value: money(stats.excess)
    }]} /><div className="aw-two-column"><div className="aw-stack"><EngagementTable workspace={{
          ...workspace,
          engagements: workspace.engagements.filter(e => e.status !== "completed")
        }} base={base} compact /><div className="aw-panel"><div className="aw-panel-heading"><h2>Recent activity</h2><Link className="aw-quiet-link" to={`${base}/activity`}>View activity</Link></div><ActivityList items={workspace.activity} limit={4} /></div></div><div className="aw-panel"><div className="aw-panel-heading"><div><h2>Review queue</h2><p>Questions that need your attention.</p></div></div>{pending.length ? pending.map(f => <Link className="aw-queue-item" key={f.id} to={`${base}/engagements/${f.engagement_id}?tab=findings&finding=${encodeURIComponent(f.id)}`}><strong>{f.description}</strong><small>{workspace.engagements.find(e => e.id === f.engagement_id)?.title}</small><div><Badge status={f.status} /></div></Link>) : <Empty title="Your queue is clear" description="New analysis results and open evidence questions will appear here." />}</div></div></>;
}
export function ClientsPage({
  workspace,
  base,
  onCreate
}: {
  workspace: Workspace;
  base: string;
  onCreate: () => void;
}) {
  const [search, setSearch] = useState("");
  const clients = workspace.clients.filter(c => `${c.name} ${c.industry} ${c.contact}`.toLowerCase().includes(search.toLowerCase()));
  return <><Title title="Clients" description="Keep each client's engagements and supporting records organized." actions={<Button onClick={onCreate}><Plus />New client</Button>} /><div className="aw-panel"><div className="aw-toolbar"><SearchBox value={search} onChange={setSearch} placeholder="Search clients" /><span className="aw-filter aw-muted">{clients.length} clients</span></div>{clients.length ? <div className="aw-table-wrap"><table className="aw-table"><thead><tr><th>Client</th><th>Industry</th><th>Contact</th><th>Engagements</th><th>Created</th><th /></tr></thead><tbody>{clients.map(c => <tr key={c.id}><td><div className="aw-client-cell"><span className="aw-avatar">{initials(c.name)}</span><strong>{c.name}</strong></div></td><td>{c.industry || "Not provided"}</td><td>{c.contact || "Not provided"}</td><td>{workspace.engagements.filter(e => e.client_id === c.id).length}</td><td>{dateLabel(c.created_at)}</td><td><Link className="aw-quiet-link" to={`${base}/engagements?client=${c.id}`}>View engagements <ArrowUpRight size={12} /></Link></td></tr>)}</tbody></table></div> : <Empty title={search ? "No matching clients" : "Create your first client"} description="Client records are the starting point for an engagement and its working file." action={!search ? <Button onClick={onCreate}><Plus />New client</Button> : undefined} />}</div></>;
}
export function EngagementPage({
  workspace,
  engagement,
  data,
  demo,
  base,
  onUpload,
  onExport,
  onEvidence,
  onAnalyse,
  onExclude,
  notice
}: {
  workspace: Workspace;
  notice?: ReactNode;
  engagement: Engagement;
  data: AuditorData;
  demo: boolean;
  base: string;
  onUpload: () => void;
  onExport: () => void;
  onEvidence: (id: string) => void;
  onAnalyse: (statement: Statement) => void;
  onExclude: (statement: Statement) => void;
}) {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "overview";
  const stats = engagementStats(workspace, engagement.id);
  const findings = workspace.findings.filter(f => f.engagement_id === engagement.id);
  const statements = workspace.statements.filter(s => s.engagement_id === engagement.id);
  const inScope = statements.filter(s => s.status !== "excluded");
  const changeTab = (value: string) => {
    const next = new URLSearchParams(params);
    next.set("tab", value);
    next.delete("finding");
    setParams(next);
  };
  return <><Title title={engagement.title} description={`${clientName(workspace, engagement)} · ${period(engagement)}`} actions={<><Badge status={engagement.status} /><Button variant="secondary" onClick={onExport}><Download />Export working papers</Button><Button onClick={onUpload} disabled={engagement.status === "completed"}><Upload />Upload statements</Button></>} /><Metrics values={[{
      label: "Statements",
      value: stats.statements
    }, {
      label: "Potential findings",
      value: findings.filter(f => f.kind === "potential" && f.status !== "dismissed").length
    }, {
      label: "Needs evidence",
      value: stats.needsEvidence,
      warning: true
    }, {
      label: "Est. potential excess",
      value: money(stats.excess)
    }]} />{notice}<div className="aw-tabs aw-section-tabs" role="tablist" aria-label="Engagement sections">{["overview", "statements", "findings", "evidence", "activity"].map(value => <button role="tab" aria-selected={tab === value} className={`aw-tab ${tab === value ? "active" : ""}`} key={value} onClick={() => changeTab(value)}>{human(value)}</button>)}</div>
  {tab === "overview" ? <div className="aw-two-column"><div className="aw-panel"><div className="aw-panel-heading"><h2>Engagement brief</h2><FolderOpen size={18} className="aw-muted" /></div><div className="aw-panel-body"><p className="aw-objective">{engagement.objective}</p><dl className="aw-detail-grid"><div><dt>Client</dt><dd>{clientName(workspace, engagement)}</dd></div><div><dt>Review period</dt><dd>{period(engagement)}</dd></div><div><dt>Created</dt><dd>{dateLabel(engagement.created_at)}</dd></div><div><dt>Review state</dt><dd><Badge status={engagement.status} /></dd></div></dl><div className="aw-form-footer"><Button variant="secondary" onClick={() => changeTab("statements")}><FileText />View statements</Button><Button onClick={() => changeTab("findings")}>Open review desk<ArrowUpRight /></Button></div></div></div><div className="aw-panel"><div className="aw-panel-heading"><h2>Review readiness</h2></div><div className="aw-panel-body aw-checklist"><div>{inScope.length > 0 && inScope.every(s => s.report) ? <CheckCircle2 /> : <Circle />}<span>Source statements<small>{inScope.filter(s => s.report).length} of {inScope.length} analyses available</small></span></div><div>{inScope.length > 0 && inScope.every(s => s.report) && findings.every(f => !unresolved(f)) ? <CheckCircle2 /> : <Circle />}<span>Finding decisions<small>{findings.filter(f => !unresolved(f)).length} of {findings.length} resolved</small></span></div><div><FileText /><span>Supporting records<small>{workspace.evidence.filter(e => e.engagement_id === engagement.id && e.status === "ready").length} evidence records attached</small></span></div><p className="aw-note">Complete all statement analyses and resolve the findings before completing this engagement. Reopen a completed engagement to make changes.</p><div className="aw-inline-actions">{engagement.status === "completed" ? <Button variant="secondary" disabled={Boolean(data.busy)} onClick={() => void data.mutate(`/engagements/${engagement.id}`, "PATCH", {
              status: "in_progress",
              revision: workspace.revision
            }).catch(() => {})}>Reopen engagement</Button> : <><Button variant="secondary" disabled={Boolean(data.busy) || engagement.status === "in_review"} onClick={() => void data.mutate(`/engagements/${engagement.id}`, "PATCH", {
                status: "in_review",
                revision: workspace.revision
              }).catch(() => {})}>Move to review</Button><Button disabled={Boolean(data.busy)} onClick={() => void data.mutate(`/engagements/${engagement.id}`, "PATCH", {
                status: "completed",
                revision: workspace.revision
              }).catch(() => {})}>Complete engagement</Button></>}</div></div></div></div> : null}
  {tab === "statements" ? <div className="aw-panel"><div className="aw-panel-heading"><div><h2>Statements</h2><p>Original files and processing results stay linked to this engagement.</p></div><span className="aw-muted">{statements.length} files · {inScope.length} in scope</span></div>{statements.length ? <div className="aw-table-wrap"><table className="aw-table"><thead><tr><th>Statement / bank</th><th>Period</th><th>Account</th><th>Transactions</th><th>Status</th><th>Action</th></tr></thead><tbody>{statements.map(s => <tr key={s.id}><td><strong>{s.filename}</strong><small>{s.bank_name ?? "Issuer not yet extracted"}</small>{s.excluded_reason || s.status === "failed" || demo && !s.report ? <small>{s.excluded_reason ? `Excluded: ${s.excluded_reason}` : s.message}</small> : null}</td><td>{s.period ?? "Not available"}</td><td>{human(s.account_type)}<small>{human(s.institution_type)}</small></td><td>{s.transaction_count || "—"}</td><td><Badge status={s.status} />{["parsing", "auditing"].includes(s.status) ? <small>{s.progress}%</small> : null}</td><td><div className="aw-table-actions">{s.status === "excluded" ? <span className="aw-note">Excluded from scope</span> : s.report ? <Button variant="ghost" onClick={() => changeTab("findings")}>Review findings<ArrowUpRight /></Button> : s.status === "parsed" || s.status === "failed" ? <Button variant="secondary" disabled={demo || Boolean(data.busy) || engagement.status === "completed"} onClick={() => onAnalyse(s)}><Play />{s.status === "failed" ? "Retry analysis" : "Run analysis"}</Button> : <span className="aw-note">{demo ? "Not analysed in demo" : s.message}</span>}{!demo ? <button className="aw-icon-button" aria-label={`Download ${s.filename}`} onClick={() => data.download("statements", s.id)}><Download size={15} /></button> : null}{!s.report && s.status !== "excluded" && engagement.status !== "completed" ? <Button variant="ghost" onClick={() => onExclude(s)}>Exclude</Button> : null}</div></td></tr>)}</tbody></table></div> : <Empty title="Add the source statements" description="Upload PDFs, CSVs or Excel files. Each statement is analysed separately, then its findings are combined in this working file." action={<Button onClick={onUpload}><Upload />Upload statements</Button>} />}</div> : null}
  {tab === "findings" ? <FindingsWorkbench workspace={workspace} findings={findings} data={data} demo={demo} base={base} onEvidence={onEvidence} /> : null}
  {tab === "evidence" ? <EvidenceRegister workspace={workspace} engagement={engagement} data={data} demo={demo} base={base} /> : null}
  {tab === "activity" ? <div className="aw-panel"><div className="aw-panel-heading"><h2>Engagement activity</h2><span className="aw-note">Review changes are recorded with before and after values.</span></div><ActivityList items={workspace.activity.filter(a => a.engagement_id === engagement.id)} /></div> : null}
  {!['overview', 'statements', 'findings', 'evidence', 'activity'].includes(tab) ? <Empty title="Section not found" description="Choose a section above to continue." /> : null}</>;
}
export function WorkingPapersPage({
  workspace,
  onExport
}: {
  workspace: Workspace;
  onExport: (engagement: Engagement) => void;
}) {
  return <><Title title="Working papers" description="Export the current findings, evidence index, and reviewer decisions for each engagement." /><div className="aw-panel"><div className="aw-panel-heading"><div><h2>Engagement deliverables</h2><p>Exports retain unresolved evidence requests separately from quantified potential excess.</p></div></div>{workspace.engagements.length ? <div className="aw-table-wrap"><table className="aw-table"><thead><tr><th>Engagement / client</th><th>Status</th><th>Open findings</th><th>Potential excess</th><th>Export</th></tr></thead><tbody>{workspace.engagements.map(e => {
              const stats = engagementStats(workspace, e.id);
              return <tr key={e.id}><td><strong>{e.title}</strong><small>{clientName(workspace, e)}</small></td><td><Badge status={e.status} /></td><td>{stats.open}</td><td className="aw-numeric">{money(stats.excess)}</td><td><Button variant="secondary" onClick={() => onExport(e)}><Download />Working papers</Button></td></tr>;
            })}</tbody></table></div> : <Empty title="No working files yet" description="Create an engagement to start building a review register and evidence index." />}</div></>;
}
