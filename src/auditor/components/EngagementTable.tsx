import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Engagement, Workspace } from "../types";
import { Badge, Empty, SearchBox } from "./ui";
import { clientName, dateLabel, engagementStats, initials, period } from "../helpers";
export default function EngagementTable({
  workspace,
  base,
  clientId,
  compact = false
}: {
  workspace: Workspace;
  base: string;
  clientId?: string | null;
  compact?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const records = workspace.engagements.filter(e => !clientId || e.client_id === clientId);
  const filtered = records.filter(e => (status === "all" || e.status === status) && `${e.title} ${clientName(workspace, e)} ${period(e)}`.toLowerCase().includes(search.toLowerCase()));
  const size = compact ? 5 : 8;
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * size, current * size);
  return <div className="aw-panel">{compact ? <div className="aw-panel-heading"><h2>Active engagements</h2><Link className="aw-quiet-link" to={`${base}/engagements`}>View register</Link></div> : <div className="aw-tabs" role="tablist" aria-label="Engagement status">{[["all", "All engagements"], ["in_progress", "In progress"], ["in_review", "In review"], ["completed", "Completed"]].map(([value, label]) => <button role="tab" aria-selected={status === value} className={`aw-tab ${status === value ? "active" : ""}`} key={value} onClick={() => {
        setStatus(value);
        setPage(1);
      }}>{label}<span className="aw-tab-count">{value === "all" ? records.length : records.filter(e => e.status === value).length}</span></button>)}</div>}
    {!compact ? <div className="aw-toolbar"><SearchBox value={search} onChange={value => {
        setSearch(value);
        setPage(1);
      }} placeholder="Search engagements, clients, or period…" />{clientId ? <Link className="aw-quiet-link" to={`${base}/engagements`}>Clear client filter</Link> : null}</div> : null}
    {rows.length ? <div className="aw-table-wrap"><table className="aw-table"><thead><tr><th>Engagement / Client</th><th>Period</th><th>Statements</th><th>Findings</th><th>Status</th>{!compact ? <th>Updated</th> : null}</tr></thead><tbody>{rows.map(e => <EngagementRow key={e.id} engagement={e} workspace={workspace} base={base} compact={compact} />)}</tbody></table></div> : <Empty title={search || status !== "all" ? "No matching engagements" : "Start your first engagement"} description={search || status !== "all" ? "Try another search or status." : "Create a client and an engagement to organize statements, findings and supporting evidence."} />}
    {!compact ? <div className="aw-table-footer"><span>{filtered.length ? `Showing ${(current - 1) * size + 1}–${Math.min(current * size, filtered.length)} of ${filtered.length} engagements` : "0 engagements"}</span><div><button aria-label="Previous page" className="aw-icon-button" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft size={15} /></button><span className="aw-page-number">{current}</span><span>of {pages}</span><button aria-label="Next page" className="aw-icon-button" disabled={current === pages} onClick={() => setPage(current + 1)}><ChevronRight size={15} /></button></div></div> : null}
  </div>;
}
function EngagementRow({
  engagement: e,
  workspace,
  base,
  compact
}: {
  engagement: Engagement;
  workspace: Workspace;
  base: string;
  compact: boolean;
}) {
  const name = clientName(workspace, e);
  const stats = engagementStats(workspace, e.id);
  const status = e.status === "in_progress" && stats.needsEvidence ? "needs_evidence" : e.status;
  return <tr><td><Link className="aw-client-cell" to={`${base}/engagements/${e.id}`}><span className="aw-avatar">{initials(name)}</span><span><strong>{e.title}</strong><small>{name}</small></span></Link></td><td className="aw-numeric">{period(e)}</td><td>{stats.statements} statements</td><td>{stats.findings} findings</td><td><Badge status={status}>{status === "needs_evidence" ? "Awaiting evidence" : undefined}</Badge></td>{!compact ? <td className="aw-numeric aw-muted">{dateLabel(e.updated_at)}</td> : null}</tr>;
}
