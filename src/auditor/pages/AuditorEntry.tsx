import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "../../product/context/AuthContext";
import { getSupabaseClient } from "../../product/lib/supabase";
import { Button, Field } from "../components/ui";
import AuditorBrand from "../components/AuditorBrand";
export default function AuditorEntry() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [signup, setSignup] = useState(false);
  const [reset, setReset] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (reset) {
        const result = await auth.resetPasswordForEmail(email, "/auditor/reset-password");
        if (result) throw Error(result);
        setMessage("If an account matches this address, you will receive a password reset link.");
        return;
      }
      if (signup) {
        const result = await auth.signUp(email, password, terms, "/auditor");
        if (result.error) throw Error(result.error);
        if (result.needsEmailConfirmation) {
          setMessage("Check your email to confirm your account, then sign in here.");
          return;
        }
      } else {
        const result = await auth.signIn(email, password);
        if (result) throw Error(result);
      }
      navigate("/auditor/engagements");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return <main className="auditor-entry"><aside className="aw-entry-aside"><AuditorBrand to="/auditor" /><h1>A clearer working file.<br />A better review.</h1><p>Bring your clients, statement analysis, supporting evidence and professional judgement into one focused workspace.</p><div className="aw-entry-bottom">Evidence-led. Reviewer controlled.<br />Bank-charge analysis remains advisory.</div></aside><section className="aw-entry-form"><h2>{reset ? "Reset your password" : signup ? "Create your auditor account" : "Welcome to your audit desk"}</h2><p>{auth.isConfigured ? "Use your KoboBack account. Your auditor workspace has its own clients, engagements and review history." : "Explore the auditor workflow with fictional records. The live workspace is not available in this preview."}</p>{auth.isConfigured ? <form className="aw-form-stack" onSubmit={submit}><Field label="Email address"><input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></Field>{!reset ? <Field label="Password"><input type="password" required minLength={signup ? 8 : undefined} autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} /></Field> : null}{signup ? <label className="aw-checkbox"><input type="checkbox" required checked={terms} onChange={e => setTerms(e.target.checked)} /><span>I agree to the <Link to="/terms" target="_blank">Terms</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>.</span></label> : null}{error ? <p className="aw-form-error" role="alert">{error}</p> : null}{message ? <p className="aw-inline-message" role="status">{message}</p> : null}<Button type="submit" disabled={busy}>{busy ? "Please wait…" : reset ? "Send reset link" : signup ? "Create account" : "Sign in to workspace"}</Button><Button variant="ghost" onClick={() => {
          setSignup(reset ? false : !signup);
          setReset(false);
          setMessage("");
          setError("");
        }}>{reset || signup ? "Already have an account? Sign in" : "New to KoboBack? Create an account"}</Button>{!signup && !reset ? <Button variant="ghost" onClick={() => { setReset(true); setError(""); setMessage(""); }}>Forgot password?</Button> : null}</form> : null}<div className="aw-entry-divider">Explore the workflow</div><Link className="aw-button aw-button-secondary" to="/auditor/demo/engagements">Open demonstration<ArrowUpRight size={15} /></Link><p className="aw-note" style={{
        marginTop: 12
      }}>The demonstration uses fictional records and does not upload or analyse your files.</p></section></main>;
}

export function AuditorPasswordRecovery() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmation) { setError("The passwords do not match."); return; }
    const client = getSupabaseClient();
    if (!client || !auth.user) { setError("Open the password reset link from your email first."); return; }
    setBusy(true); setError("");
    try {
      const result = await client.auth.updateUser({ password });
      if (result.error) throw result.error;
      navigate("/auditor/engagements", { replace: true });
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }
  return <main className="auditor-entry"><aside className="aw-entry-aside"><AuditorBrand to="/auditor" /><h1>Back to your<br />audit desk.</h1><p>Set a new password for your KoboBack account.</p></aside><section className="aw-entry-form"><h2>Choose a new password</h2>{auth.user ? <form className="aw-form-stack" onSubmit={submit}><Field label="New password"><input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></Field><Field label="Confirm new password"><input type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></Field>{error ? <p role="alert" className="aw-form-error">{error}</p> : null}<Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save new password"}</Button></form> : <p>Open the password reset link from your email to continue. If the link has expired, request a new one from the sign-in screen.</p>}<Link to="/auditor/login">Return to auditor sign in</Link></section></main>;
}
