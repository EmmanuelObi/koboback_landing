import { useState, type FormEvent } from "react";
import { Download, FileText, Upload } from "lucide-react";
import type { Engagement, EvidenceInput, Statement, Workspace } from "../types";
import type { AuditorData } from "../useAuditorData";
import { Button, Field, Modal } from "./ui";
import { exportWorkingPapers } from "../exports";
export type WorkspaceModal = {
  type: "client";
} | {
  type: "engagement";
} | {
  type: "upload";
  engagement: Engagement;
} | {
  type: "evidence";
  findingId: string;
} | {
  type: "export";
  engagement: Engagement;
} | {
  type: "exclude";
  statement: Statement;
} | {
  type: "practice";
} | {
  type: "help";
};
interface Props {
  modal: WorkspaceModal;
  workspace: Workspace;
  data: AuditorData;
  demo: boolean;
  onClose: () => void;
  onEngagement: (id: string) => void;
  onUploaded: (id: string) => void;
  onReset: () => void;
}
export default function WorkspaceModals(props: Props) {
  const {
    modal,
    onClose
  } = props;
  if (modal.type === "client") return <Modal title="New client" onClose={onClose}><ClientForm {...props} /></Modal>;
  if (modal.type === "engagement") return <Modal title="New engagement" onClose={onClose}><EngagementForm {...props} /></Modal>;
  if (modal.type === "upload") return <Modal title="Upload statements" onClose={onClose}><UploadForm {...props} engagement={modal.engagement} /></Modal>;
  if (modal.type === "evidence") return <Modal title="Add supporting evidence" onClose={onClose}><EvidenceForm {...props} findingId={modal.findingId} /></Modal>;
  if (modal.type === "export") return <Modal title="Export working papers" onClose={onClose}><ExportForm {...props} engagement={modal.engagement} /></Modal>;
  if (modal.type === "practice") return <Modal title="Practice settings" onClose={onClose}><PracticeForm {...props} /></Modal>;
  if (modal.type === "exclude") return <Modal title="Exclude unanalysed source" onClose={onClose}><ExcludeForm {...props} statement={modal.statement} /></Modal>;
  return <Modal title="Your review workflow" onClose={onClose}><div className="aw-help-list"><div><h3>1. Build the working file</h3><p>Create a client and an engagement, then upload the statements for the review period. Account and institution details must be confirmed rather than guessed.</p></div><div><h3>2. Investigate the findings</h3><p>Review potential excess and missing-evidence items separately. Each item retains its source statement, transaction reference and applicable guidance where available.</p></div><div><h3>3. Record a decision</h3><p>Add supporting notes, references or files. Supporting a finding requires evidence, a reviewer note and an explicit reviewed estimate. Dismissals require an explanation.</p></div><div><h3>4. Export the working papers</h3><p>Export the current register, review report or evidence index. Open evidence questions remain visible and do not become quantified excess automatically. Analysis is advisory, not a refund determination.</p></div></div><div className="aw-form-footer"><Button onClick={onClose}>Return to workspace</Button></div></Modal>;
}
function ClientForm({
  data,
  onClose
}: Props) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await data.mutate("/clients", "POST", {
        name,
        industry,
        contact
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return <form onSubmit={submit}><div className="aw-form-stack"><Field label="Client name"><input required maxLength={160} autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Meridian Trading Ltd" /></Field><Field label="Industry"><input maxLength={100} value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Trading & distribution" /></Field><Field label="Client contact"><input maxLength={200} value={contact} onChange={e => setContact(e.target.value)} placeholder="Name or email of the primary contact" /></Field>{error ? <p className="aw-form-error" role="alert">{error}</p> : null}</div><div className="aw-form-footer"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={Boolean(data.busy)}>Create client</Button></div></form>;
}
function EngagementForm({
  data,
  workspace,
  onClose,
  onEngagement
}: Props) {
  const [clientId, setClientId] = useState(workspace.clients[0]?.id ?? "new");
  const [clientName, setClientName] = useState("");
  const [title, setTitle] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [objective, setObjective] = useState("Review bank charges against the applicable guidance and document evidence-backed conclusions.");
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      let selected = clientId;
      if (selected === "new") {
        const next = await data.mutate<Workspace>("/clients", "POST", {
          name: clientName,
          industry: "",
          contact: ""
        });
        selected = next.clients[next.clients.length - 1].id;
        setClientId(selected);
      }
      const next = await data.mutate<Workspace>("/engagements", "POST", {
        client_id: selected,
        title,
        period_from: from,
        period_to: to,
        objective
      });
      onClose();
      onEngagement(next.engagements[0].id);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return <form onSubmit={submit}><div className="aw-form-stack"><Field label="Client"><select value={clientId} onChange={e => setClientId(e.target.value)}>{workspace.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}<option value="new">+ Create a new client</option></select></Field>{clientId === "new" ? <Field label="New client name"><input required maxLength={160} value={clientName} onChange={e => setClientName(e.target.value)} /></Field> : null}<Field label="Engagement title"><input required autoFocus maxLength={160} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 2026 Bank charges review" /></Field><div className="aw-form-grid"><Field label="Period from"><input type="date" required value={from} onChange={e => setFrom(e.target.value)} /></Field><Field label="Period to"><input type="date" min={from} required value={to} onChange={e => setTo(e.target.value)} /></Field></div><Field label="Review objective"><textarea rows={3} maxLength={1000} value={objective} onChange={e => setObjective(e.target.value)} /></Field>{error ? <p className="aw-form-error" role="alert">{error}</p> : null}</div><div className="aw-form-footer"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={Boolean(data.busy)}>Create engagement</Button></div></form>;
}
function UploadForm({
  data,
  demo,
  onClose,
  onUploaded,
  engagement
}: Props & {
  engagement: Engagement;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [account, setAccount] = useState<"savings" | "current">("current");
  const [institution, setInstitution] = useState("unknown");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!files.length || files.length > 20) {
      setError("Select between 1 and 20 statement files.");
      return;
    }
    try {
      await data.uploadStatements(engagement.id, files, account, institution);
      onClose();
      onUploaded(engagement.id);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return <form onSubmit={submit}><p className="aw-modal-note">{demo ? "Demonstration: only filenames and metadata are saved in this browser. File bytes are not uploaded or analysed." : "Files are stored privately and extracted first. Start each analysis when extraction is ready."}</p><div className="aw-form-stack"><div className="aw-file-drop"><Upload size={25} /><strong>Select bank statements</strong><small>PDF, CSV, XLS or XLSX · up to 20 files</small><input aria-label="Statement files" type="file" multiple accept=".pdf,.csv,.xls,.xlsx" onChange={e => setFiles(Array.from(e.target.files ?? []))} /></div>{files.length ? <ul className="aw-file-list">{files.map((f, i) => <li key={i}>{f.name} · {(f.size / 1024).toFixed(0)} KB</li>)}</ul> : null}<div className="aw-form-grid"><Field label="Confirmed account type"><select value={account} onChange={e => setAccount(e.target.value as "savings" | "current")}><option value="current">Current</option><option value="savings">Savings</option></select></Field><Field label="Institution schedule"><select value={institution} onChange={e => setInstitution(e.target.value)}><option value="unknown">Not established yet</option><option value="bank">Banks</option><option value="microfinance_bank">Microfinance bank</option><option value="primary_mortgage_bank">Primary mortgage bank</option><option value="finance_company">Finance company</option><option value="mobile_money_operator">Mobile money operator</option></select></Field></div><label className="aw-checkbox"><input type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /><span>The account details apply to every selected statement. I have permission to process these files for this engagement.</span></label>{data.busy ? <p className="aw-note" role="status">{data.busy}</p> : null}{error ? <p className="aw-form-error" role="alert">{error}</p> : null}</div><div className="aw-form-footer"><Button variant="ghost" onClick={onClose} disabled={Boolean(data.busy)}>Cancel</Button><Button type="submit" disabled={Boolean(data.busy) || !files.length || !confirmed}><Upload />{demo ? "Add to demonstration" : "Upload statements"}</Button></div></form>;
}
function EvidenceForm({
  data,
  demo,
  findingId,
  onClose
}: Props & {
  findingId: string;
}) {
  const [kind, setKind] = useState<EvidenceInput["kind"]>("note");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File>();
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (kind === "file" && !file) {
      setError("Choose a supporting file.");
      return;
    }
    try {
      await data.addEvidence(findingId, {
        kind,
        title,
        detail,
        url,
        ...(file ? {
          filename: file.name,
          file_size: file.size
        } : {})
      }, file);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return <form onSubmit={submit}><p className="aw-modal-note">Evidence supports a review decision; adding a record does not automatically resolve the finding.</p><div className="aw-form-stack"><Field label="Evidence type"><select value={kind} onChange={e => setKind(e.target.value as EvidenceInput["kind"])}><option value="note">Supporting note</option><option value="reference">Reference link</option><option value="file">Supporting file</option></select></Field><Field label="Evidence title"><input autoFocus required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Bank's SMS cost breakdown" /></Field>{kind === "reference" ? <Field label="Reference URL" hint="The link is recorded, not fetched automatically."><input required type="url" maxLength={2000} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" /></Field> : null}{kind === "file" ? <Field label="Supporting file" hint={demo ? "Preview metadata only. File bytes stay on your device." : "PDF, spreadsheets, images or text. Access remains private to your account."}><input type="file" accept=".pdf,.csv,.xls,.xlsx,.png,.jpg,.jpeg,.txt" required onChange={e => setFile(e.target.files?.[0])} /></Field> : null}<Field label={kind === "note" ? "Supporting note" : "What does this record establish?"}><textarea required={kind === "note"} rows={5} maxLength={10000} value={detail} onChange={e => setDetail(e.target.value)} placeholder="Record the source, relevant facts and how they relate to this charge." /></Field>{error ? <p className="aw-form-error" role="alert">{error}</p> : null}</div><div className="aw-form-footer"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={Boolean(data.busy)}>{data.busy ? "Saving…" : "Add evidence"}</Button></div></form>;
}
function ExportForm({
  workspace,
  engagement,
  demo
}: Props & {
  engagement: Engagement;
}) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const download = async (kind: "csv" | "pdf" | "json") => {
    setBusy(kind);
    setError("");
    setDone(false);
    try {
      await exportWorkingPapers(workspace, engagement, kind, demo);
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  return <><p className="aw-modal-note">{engagement.title}. Exports reflect the current review state. Unresolved evidence requests remain visible.{demo ? " All records are fictional demonstration data." : ""}</p><div className="aw-export-options">{[["csv", "Findings schedule", "CSV · source transactions, estimates and reviewer decisions"], ["pdf", "Review report", "PDF · engagement summary, findings and evidence register"], ["json", "Evidence & activity index", "JSON · record references and change history, excluding file bytes"]].map(([kind, title, description]) => <button className="aw-export-option" key={kind} disabled={Boolean(busy)} onClick={() => void download(kind as "csv" | "pdf" | "json")}><FileText size={21} /><span><strong>{title}</strong><small>{busy === kind ? "Preparing download…" : description}</small></span><Download size={16} /></button>)}</div>{error ? <p className="aw-form-error" role="alert">{error}</p> : null}{done ? <p className="aw-review-success" role="status">Working papers prepared for download.</p> : null}</>;
}
function PracticeForm({
  workspace,
  data,
  demo,
  onClose,
  onReset
}: Props) {
  const [name, setName] = useState(workspace.practice_name);
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await data.mutate("/practice", "PATCH", {
        name
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return <form onSubmit={submit}><p className="aw-modal-note">This workspace belongs to your signed-in account. Team invitations and shared access are not enabled in this version.</p><Field label="Practice name"><input required maxLength={120} value={name} onChange={e => setName(e.target.value)} /></Field>{demo ? <p className="aw-note">Demonstration changes are stored only in this browser. Resetting restores the fictional sample records.</p> : null}{error ? <p className="aw-form-error" role="alert">{error}</p> : null}<div className="aw-form-footer">{demo ? <Button variant="ghost" onClick={onReset}>Reset demonstration</Button> : null}<Button type="submit" disabled={Boolean(data.busy)}>Save settings</Button></div></form>;
}
function ExcludeForm({
  workspace,
  data,
  onClose,
  statement
}: Props & {
  statement: Statement;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await data.mutate(`/statements/${statement.id}/exclude`, "POST", {
        reason,
        revision: workspace.revision
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return <form onSubmit={submit}><p className="aw-modal-note">{statement.filename} will remain in the working file and activity history, but will be excluded from the engagement scope. The file is not deleted. An already-running analysis may still finish.</p><Field label="Reason for scope exclusion"><textarea required minLength={3} maxLength={1000} rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Incomplete export; replaced by the corrected statement." /></Field>{error ? <p className="aw-form-error" role="alert">{error}</p> : null}<div className="aw-form-footer"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={Boolean(data.busy)}>Record exclusion</Button></div></form>;
}
