import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, ChevronDown, ClipboardList, FileText, HelpCircle, Info, LayoutDashboard, Loader2, LogOut, Menu, Search, Users, X } from "lucide-react";
import { useAuth } from "../product/context/AuthContext";
import { useAuditorData } from "./useAuditorData";
import type { Statement } from "./types";
import { initials } from "./helpers";
import { Button, Empty, Title } from "./components/ui";
import ActivityList from "./components/ActivityList";
import AuditorBrand from "./components/AuditorBrand";
import { FindingsWorkbench } from "./components/FindingsWorkbench";
import WorkspaceModals, { type WorkspaceModal } from "./components/WorkspaceModals";
import { ClientsPage, EngagementPage, EngagementsPage, OverviewPage, WorkingPapersPage } from "./pages/WorkspacePages";
import AuditorEntry, { AuditorPasswordRecovery } from "./pages/AuditorEntry";
import "./auditor.css";
export default function AuditorApp() {
  const {
    pathname
  } = useLocation();
  const auth = useAuth();
  useEffect(() => {
    const previous = document.title;
    document.title = "KoboBack for Auditors";
    return () => {
      document.title = previous;
    };
  }, []);
  const demo = pathname === "/auditor/demo" || pathname.startsWith("/auditor/demo/");
  if (!demo && auth.loading) return <div className="auditor-entry"><div className="aw-loading"><Loader2 className="aw-spin" />Opening your workspace…</div></div>;
  if (pathname === "/auditor/reset-password") return <AuditorPasswordRecovery />;
  if (!demo && (!auth.isConfigured || !auth.user)) return <AuditorEntry />;
  return <WorkspaceApp key={demo ? "demonstration" : auth.user?.id} demo={demo} />;
}
const NAV = [{
  path: "overview",
  label: "Overview",
  icon: LayoutDashboard
}, {
  path: "clients",
  label: "Clients",
  icon: Users
}, {
  path: "engagements",
  label: "Engagements",
  icon: ClipboardList
}, {
  path: "findings",
  label: "Findings",
  icon: Search
}, {
  path: "working-papers",
  label: "Working papers",
  icon: FileText
}, {
  path: "activity",
  label: "Activity",
  icon: Activity
}];
function WorkspaceApp({
  demo
}: {
  demo: boolean;
}) {
  const data = useAuditorData(demo);
  const {
    workspace
  } = data;
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [modal, setModal] = useState<WorkspaceModal | null>(null);
  const base = demo ? "/auditor/demo" : "/auditor";
  const parts = location.pathname.slice(base.length).split("/").filter(Boolean);
  const page = parts[0] ?? "engagements";
  const engagement = page === "engagements" && parts[1] ? workspace?.engagements.find(e => e.id === parts[1]) : undefined;
  const name = demo ? "Demo reviewer" : auth.profile?.full_name || auth.user?.email || "Your account";
  const create = () => setModal({
    type: "engagement"
  });
  useEffect(() => {
    setMobile(false);
    setModal(null);
  }, [location.pathname]);
  const analyse = async (statement: Statement) => {
    try {
      await data.mutate(`/statements/${statement.id}/audit`, "POST");
    } catch (e) {
      data.setError((e as Error).message);
    }
  };
  if (parts.length === 0 || page === "login") return <Navigate to={`${base}/engagements`} replace />;
  const notice = demo ? <div className="aw-demo-notice"><Info /><span><strong>Demonstration workspace</strong> — fictional records. Changes stay in this browser; files are not uploaded or analysed.</span><button onClick={() => navigate("/auditor/login")}>Open live workspace</button></div> : null;
  const breadcrumb = engagement ? engagement.title : NAV.find(n => n.path === page)?.label ?? "Workspace";
  return <div className="auditor-shell">
    {mobile ? <button className="aw-mobile-backdrop" aria-label="Close navigation" onClick={() => setMobile(false)} /> : null}
    <aside className={`aw-sidebar ${mobile ? "aw-sidebar-open" : ""}`} aria-label="Auditor navigation">
      <AuditorBrand to={`${base}/engagements`} />
      <button className="aw-practice" onClick={() => setModal({
        type: "practice"
      })}><span>{workspace?.practice_name ?? "Your practice"}</span><ChevronDown size={15} /></button>
      <nav className="aw-navigation">{NAV.map(item => <NavLink key={item.path} to={`${base}/${item.path}`} end={item.path !== "engagements"}><item.icon />{item.label}</NavLink>)}</nav>
      <div className="aw-sidebar-bottom"><button onClick={() => setModal({
          type: "help"
        })}><HelpCircle size={18} />Help & workflow</button><div className="aw-sidebar-account"><span className="aw-avatar">{initials(name)}</span><div><strong>{name}</strong><small>{demo ? "Demonstration" : "Private practice workspace"}</small></div></div>{!demo ? <button onClick={() => void auth.signOut().then(() => navigate("/auditor/login"))}><LogOut size={15} />Sign out</button> : null}</div>
    </aside>
    <div className="aw-content"><header className="aw-topbar"><div className="aw-breadcrumbs"><button className="aw-icon-button aw-mobile-menu" aria-label="Open navigation" onClick={() => setMobile(true)}><Menu size={20} /></button><Link to={`${base}/engagements`}>{engagement ? "Engagements" : "Workspace"}</Link><span>/</span><strong>{breadcrumb}</strong></div><div className="aw-topbar-actions"><span className="aw-topbar-label">{demo ? "Preview · fictional data" : "Auditor workspace"}</span><Link className="aw-icon-button" to={`${base}/findings`} aria-label="Search all findings"><Search size={18} /></Link><span className="aw-avatar" title={name}>{initials(name)}</span></div></header>
    <main className={`aw-main ${engagement ? "aw-engagement-main" : ""}`}>
      {data.error ? <div className="aw-form-error aw-alert" role="alert"><span>{data.error}</span><button aria-label="Dismiss notification" onClick={() => data.setError("")}><X size={16} /></button></div> : null}
      {data.loading ? <div className="aw-loading"><Loader2 className="aw-spin" />Loading your engagements…</div> : workspace ? <>
        {!["engagements"].includes(page) ? notice : null}
        {page === "engagements" && !parts[1] ? <EngagementsPage workspace={workspace} base={base} demo={demo} onCreate={create} notice={notice} /> : null}
        {page === "engagements" && parts[1] ? engagement ? <EngagementPage workspace={workspace} engagement={engagement} data={data} demo={demo} base={base} notice={notice} onUpload={() => setModal({
            type: "upload",
            engagement
          })} onExport={() => setModal({
            type: "export",
            engagement
          })} onEvidence={findingId => setModal({
            type: "evidence",
            findingId
          })} onAnalyse={s => void analyse(s)} onExclude={statement => setModal({
            type: "exclude",
            statement
          })} /> : <Empty title="Engagement not found" description="This engagement is not available in your workspace." action={<Button onClick={() => navigate(`${base}/engagements`)}><ArrowLeft />Back to engagements</Button>} /> : null}
        {page === "overview" ? <OverviewPage workspace={workspace} base={base} onCreate={create} /> : null}
        {page === "clients" ? <ClientsPage workspace={workspace} base={base} onCreate={() => setModal({
            type: "client"
          })} /> : null}
        {page === "findings" ? <><Title title="Findings" description="Investigate potential excess and missing evidence across your engagements." /><FindingsWorkbench workspace={workspace} findings={workspace.findings} data={data} demo={demo} base={base} onEvidence={findingId => setModal({
              type: "evidence",
              findingId
            })} /></> : null}
        {page === "working-papers" ? <WorkingPapersPage workspace={workspace} onExport={engagement => setModal({
            type: "export",
            engagement
          })} /> : null}
        {page === "activity" ? <><Title title="Activity" description="A chronological record of the work, evidence and review decisions in your practice." /><div className="aw-panel"><ActivityList items={workspace.activity} /></div></> : null}
        {!NAV.some(n => n.path === page) ? <Empty title="Page not found" description="Choose a section from the workspace navigation." action={<Button onClick={() => navigate(`${base}/engagements`)}>Back to engagements</Button>} /> : null}
        <footer className="aw-footer">Evidence-led. Reviewer controlled.</footer>
      </> : <Empty title="Your live workspace is unavailable" description="We could not load the auditor service. You can retry or explore the demonstration." action={<><Button onClick={() => void data.refresh().catch(e => data.setError(e.message))}>Try again</Button><Link className="aw-quiet-link" to="/auditor/demo/engagements">Open demonstration</Link></>} />}
    </main></div>
    {modal && workspace ? <WorkspaceModals modal={modal} workspace={workspace} data={data} demo={demo} onClose={() => setModal(null)} onEngagement={id => navigate(`${base}/engagements/${id}`)} onUploaded={id => navigate(`${base}/engagements/${id}?tab=statements`)} onReset={() => {
      data.reset();
      setModal(null);
      navigate(`${base}/engagements`);
    }} /> : null}
  </div>;
}
