import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../product/context/AuthContext";
import { readDemo, demoAction, persistDemo, resetDemo } from "./demo";
import type { Workspace, Statement } from "./types";
const API = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");
export function useAuditorData(demo: boolean) {
  const {
    getAccessToken
  } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(() => demo ? readDemo() : null);
  const current = useRef(workspace);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(!demo);
  const active = useRef(true);
  const accept = useCallback((state: Workspace) => {
    current.current = state;
    if (active.current) setWorkspace(state);
  }, []);
  const request = useCallback(async <T,>(path: string, method = "GET", body?: unknown): Promise<T> => {
    const token = await getAccessToken();
    const result = await fetch(`${API}/auditor${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? {
          Authorization: `Bearer ${token}`
        } : {})
      },
      ...(body === undefined ? {} : {
        body: JSON.stringify(body)
      })
    });
    const payload = await result.json().catch(() => ({}));
    if (!result.ok) {
      const detail = payload.detail;
      throw Error(typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((d: {
        msg?: string;
      }) => d.msg).join("; ") : "The request could not be completed.");
    }
    return payload;
  }, [getAccessToken]);
  const refresh = useCallback(async () => {
    if (demo) return;
    const state = await request<Workspace>("/workspace");
    accept(state);
  }, [demo, request, accept]);
  useEffect(() => {
    active.current = true;
    if (!demo) refresh().catch(e => setError(e.message)).finally(() => setLoading(false));
    return () => {
      active.current = false;
    };
  }, [demo, refresh]);
  const processing = workspace?.statements.some(s => ["awaiting_upload", "uploaded", "parsing", "auditing", "pending_review"].includes(s.status));
  useEffect(() => {
    if (demo || !processing) return;
    let running = false;
    const timer = window.setInterval(async () => {
      if (running || document.hidden) return;
      running = true;
      try {
        await refresh();
      } catch (e) {
        setError((e as Error).message);
      } finally {
        running = false;
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [demo, processing, refresh]);
  const mutate = useCallback(async <T = Workspace,>(path: string, method = "POST", body?: unknown): Promise<T> => {
    setBusy("Saving…");
    setError("");
    try {
      const payload = demo ? demoAction(current.current!, path, body) : await request<T>(path, method, body);
      const next = (payload as {
        workspace?: Workspace;
      }).workspace ?? payload as Workspace;
      if (next.clients) accept(next);
      return payload as T;
    } catch (e) {
      setError((e as Error).message);
      if (!demo) await refresh().catch(() => {});
      throw e;
    } finally {
      if (active.current) setBusy("");
    }
  }, [demo, request, accept, refresh]);
  const uploadStatements = async (engagementId: string, files: File[], accountType: "savings" | "current", institutionType: string) => {
    setBusy("Preparing statements…");
    setError("");
    try {
      if (demo) {
        const state: Workspace = JSON.parse(JSON.stringify(current.current));
        for (const file of files) {
          const record: Statement = {
            id: crypto.randomUUID(),
            job_id: "demo-only",
            engagement_id: engagementId,
            filename: file.name,
            status: "uploaded",
            account_type: accountType,
            institution_type: institutionType,
            bank_name: null,
            currency: "NGN",
            period: null,
            transaction_count: 0,
            report: null,
            created_at: new Date().toISOString(),
            message: "Demo file metadata only. No file bytes were uploaded or analysed.",
            progress: 0,
            paid: false
          };
          state.statements.push(record);
          state.activity.unshift({
            id: crypto.randomUUID(),
            action: "Statement added",
            detail: `${file.name} · demo metadata only`,
            engagement_id: engagementId,
            actor: "You (demo)",
            created_at: record.created_at
          });
        }
        state.revision++;
        persistDemo(state);
        accept(state);
        return;
      }
      for (const file of files) {
        setBusy(`Uploading ${file.name}…`);
        const prepared = await request<{
          statement_id: string;
          upload: {
            upload_url: string;
            content_type: string;
          };
          workspace: Workspace;
        }>(`/engagements/${engagementId}/statements/init`, "POST", {
          filename: file.name,
          content_type: file.type || "application/octet-stream",
          file_size: file.size,
          account_type: accountType,
          institution_type: institutionType
        });
        accept(prepared.workspace);
        const uploaded = await fetch(prepared.upload.upload_url, {
          method: "PUT",
          headers: {
            "Content-Type": prepared.upload.content_type
          },
          body: file
        });
        if (!uploaded.ok) throw Error(`Storage rejected ${file.name}. The statement has not been analysed.`);
        accept(await request<Workspace>(`/statements/${prepared.statement_id}/complete`, "POST"));
      }
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setBusy("");
    }
  };
  const addEvidence = async (findingId: string, data: unknown, file?: File) => {
    const result = await mutate<{
      workspace: Workspace;
      evidence_id: string;
      upload_url: string | null;
    }>(`/findings/${findingId}/evidence`, "POST", data);
    if (file && !demo && result.upload_url) {
      setBusy("Uploading evidence…");
      try {
        const uploaded = await fetch(result.upload_url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/octet-stream"
          },
          body: file
        });
        if (!uploaded.ok) throw Error("Evidence upload did not complete. It is not available for review.");
        accept(await request<Workspace>(`/evidence/${result.evidence_id}/complete`, "POST"));
      } catch (e) {
        setError((e as Error).message);
        throw e;
      } finally {
        setBusy("");
      }
    }
  };
  const download = async (kind: "statements" | "evidence", id: string) => {
    setError("");
    try {
      const {
        url
      } = await request<{
        url: string;
      }>(`/${kind}/${id}/download`);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return {
    workspace,
    busy,
    loading,
    error,
    setError,
    refresh,
    mutate,
    uploadStatements,
    addEvidence,
    download,
    reset: () => accept(resetDemo())
  };
}
export type AuditorData = ReturnType<typeof useAuditorData>;
