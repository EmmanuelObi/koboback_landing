import type { Engagement, Workspace } from "./types";
import { clientName, dateLabel, engagementStats, excess, human, money, period, outcome } from "./helpers";
function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const cell = (value: unknown) => {
  let text = String(value ?? "");
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};
export function exportRegister(workspace: Workspace, demo: boolean) {
  const rows = [["Engagement", "Client", "Period", "Status", "Statements", "Open findings", "Potential excess NGN", "Demonstration"], ...workspace.engagements.map(e => {
    const stats = engagementStats(workspace, e.id);
    return [e.title, clientName(workspace, e), period(e), human(e.status), stats.statements, stats.open, stats.excess.toFixed(2), demo ? "YES — fictional data" : "No"];
  })];
  save(new Blob(["\uFEFF", rows.map(row => row.map(cell).join(",")).join("\r\n")], {
    type: "text/csv;charset=utf-8"
  }), "KoboBack-engagement-register.csv");
}
export async function exportWorkingPapers(workspace: Workspace, engagement: Engagement, kind: "csv" | "pdf" | "json", demo: boolean) {
  const findings = workspace.findings.filter(f => f.engagement_id === engagement.id);
  const statements = workspace.statements.filter(s => s.engagement_id === engagement.id);
  const evidence = workspace.evidence.filter(e => e.engagement_id === engagement.id);
  const filename = `KoboBack-${engagement.title.replace(/[^a-zA-Z0-9]+/g, "-")}`;
  if (kind === "csv") {
    const rows = [["Transaction", "Date", "Statement", "Source transaction", "Reference", "Currency", "Amount charged", "Engine estimate", "Reviewed estimate", "Included potential excess NGN", "Assessment outcome", "Review status", "Review requires confirmation", "Established facts", "Missing facts / authority", "Reviewer note", "Guidance", "Reviewed by", "Reviewed at", "Demonstration"], ...findings.map(f => [f.description, f.date, statements.find(s => s.id === f.statement_id)?.filename, f.source_index === null ? "Not available" : f.source_index + 1, f.reference, f.currency, f.amount, f.engine_amount ?? "Unassessed", f.reviewed_amount ?? "Unassessed", excess(f), human(outcome(f)), human(f.status), f.review_stale ? "Yes" : "No", (f.established_facts ?? []).map(x => `${x.field}: ${String(x.value)} (${x.source})`).join("; "), f.evidence_needed.join("; "), f.note, f.citation, f.reviewed_by, f.reviewed_at, demo ? "YES — fictional data" : "No"])];
    save(new Blob(["\uFEFF", rows.map(row => row.map(cell).join(",")).join("\r\n")], {
      type: "text/csv;charset=utf-8"
    }), `${filename}.csv`);
    return;
  }
  if (kind === "json") {
    const pack = {
      demonstration: demo,
      generated_at: new Date().toISOString(),
      engagement,
      client: workspace.clients.find(c => c.id === engagement.client_id),
      findings,
      evidence: evidence.map(e => ({
        id: e.id,
        title: e.title,
        kind: e.kind,
        detail: e.detail,
        url: e.url,
        filename: e.filename,
        status: e.status,
        added_by: e.added_by,
        created_at: e.created_at,
        finding_id: e.finding_id
      })),
      statements: statements.map(({
        report: _report,
        ...s
      }) => s),
      activity: workspace.activity.filter(a => a.engagement_id === engagement.id)
    };
    save(new Blob([JSON.stringify(pack, null, 2)], {
      type: "application/json"
    }), `${filename}-evidence-index.json`);
    return;
  }
  const [{
    default: jsPDF
  }, {
    default: autoTable
  }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF();
  const clean = (text: string) => text.replace(/₦/g, "NGN ").replace(/→/g, "to");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(16, 45, 40);
  doc.text("KOBOBACK | Auditor working papers", 14, 22);
  doc.setFontSize(12);
  doc.text(clean(engagement.title), 14, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(70);
  doc.text(clean(`${clientName(workspace, engagement)} | ${period(engagement)}`), 14, 40);
  doc.text(`Generated ${dateLabel(new Date().toISOString())} | ${human(engagement.status)}${demo ? " | DEMONSTRATION DATA" : ""}`, 14, 46);
  const stats = engagementStats(workspace, engagement.id);
  doc.text(`Statements: ${stats.statements} | Open findings: ${stats.open} | Est. potential excess: ${money(stats.excess)}`, 14, 55);
  const note = "Advisory amount-only working papers. Unassessed and stale reviewed amounts are excluded. Within assessed limit does not establish full compliance or remove other review concerns. No guarantee of recovery.";
  doc.text(doc.splitTextToSize(note, 180), 14, 63);
  autoTable(doc, {
    startY: 81,
    head: [["Transaction / Source", "Charged", "Est. excess", "Review / Evidence"]],
    body: findings.map(f => [clean(`${f.description}\n${f.date}\n${statements.find(s => s.id === f.statement_id)?.filename ?? ""}${f.source_index === null ? "" : ` / transaction ${f.source_index + 1}`}\n${f.reference ?? ""}`), money(f.amount, f.currency), f.status === "dismissed" ? "Dismissed" : f.reviewed_amount === null && f.engine_amount === null ? "Unassessed" : money(excess(f)), clean(`${human(outcome(f))} | Review: ${human(f.status)}${f.review_stale ? " (review again)" : ""}\n${f.reason}\n${f.evidence_needed.length ? `Evidence needed: ${f.evidence_needed.join("; ")}\n` : ""}${f.established_facts?.length ? `Facts: ${f.established_facts.map(x => `${x.field}: ${String(x.value)} (${x.source})`).join("; ")}\n` : ""}${f.note ? `Reviewer: ${f.note}\n` : ""}${f.citation ?? ""}`)]),
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak"
    },
    headStyles: {
      fillColor: [16, 45, 40]
    },
    columnStyles: {
      0: {
        cellWidth: 57
      },
      1: {
        cellWidth: 27
      },
      2: {
        cellWidth: 27
      },
      3: {
        cellWidth: "auto"
      }
    },
    margin: {
      bottom: 20
    }
  });
  const finalY = (doc as unknown as {
    lastAutoTable: {
      finalY: number;
    };
  }).lastAutoTable.finalY;
  autoTable(doc, {
    startY: finalY + 10,
    head: [["Evidence record", "Finding", "Added by / Date"]],
    body: evidence.map(e => [clean(`${e.title}\n${e.detail}\n${e.filename ?? e.url}`), clean(findings.find(f => f.id === e.finding_id)?.description ?? ""), `${e.added_by}\n${dateLabel(e.created_at)}`]),
    styles: {
      fontSize: 8,
      overflow: "linebreak"
    },
    headStyles: {
      fillColor: [16, 45, 40]
    },
    margin: {
      bottom: 20
    }
  });
  const excluded = statements.filter(s => s.status === "excluded");
  if (excluded.length) {
    const lastY = (doc as unknown as {
      lastAutoTable: {
        finalY: number;
      };
    }).lastAutoTable.finalY;
    autoTable(doc, {
      startY: lastY + 10,
      head: [["Source excluded from scope", "Recorded reason"]],
      body: excluded.map(s => [clean(s.filename), clean(s.excluded_reason ?? "")]),
      styles: {
        fontSize: 8,
        overflow: "linebreak"
      },
      headStyles: {
        fillColor: [90, 102, 95]
      },
      margin: {
        bottom: 20
      }
    });
  }
  for (let i = 1; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(`KoboBack | ${demo ? "Demonstration" : "Confidential working papers"} | Page ${i}`, 14, 288);
  }
  save(doc.output("blob"), `${filename}.pdf`);
}
