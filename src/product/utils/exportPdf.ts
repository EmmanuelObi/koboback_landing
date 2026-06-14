import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AuditReport } from "../api/client";
import { brandRgb } from "../../brand/colors";
import { logoBase64 } from "../../brand/logoBase64";

/** Wordmark aspect ratio from `public/logo.png` content bounds (~1339×214). */
const LOGO_ASPECT = 1339 / 214;

// jspdf-autotable extends the jsPDF instance
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

/* ──────────────────────────────────────────────────────────
 *  Colour palette — keeps every tint in one place
 * ────────────────────────────────────────────────────────── */
const C = {
  brand: brandRgb.DEFAULT,
  brandLight: brandRgb.muted,
  brandAccent: brandRgb.light,
  onBrandSubtle: brandRgb.onBrandSubtle,
  dark: [17, 24, 39] as const, // gray-900
  body: [55, 65, 81] as const, // gray-700
  muted: [107, 114, 128] as const, // gray-500
  faint: [156, 163, 175] as const, // gray-400
  border: [229, 231, 235] as const, // gray-200
  bgLight: [249, 250, 251] as const, // gray-50
  red: [185, 28, 28] as const,
  redLight: [254, 242, 242] as const,
  orange: [234, 88, 12] as const,
  orangeLight: [255, 247, 237] as const,
  green: [22, 163, 74] as const,
  greenLight: [240, 253, 244] as const,
  yellow: [202, 138, 4] as const,
  yellowLight: [254, 252, 232] as const,
  white: [255, 255, 255] as const,
};

type RGB = readonly [number, number, number];
type Color3 = [number, number, number];

/** Cast readonly RGB tuple to mutable for jspdf-autotable's Color type. */
const rgb = (c: RGB): Color3 => [c[0], c[1], c[2]];

/**
 * Generate and download a polished, well-typeset PDF audit report.
 */
export function exportReportAsPdf(report: AuditReport): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth(); // 210
  const ph = doc.internal.pageSize.getHeight(); // 297
  const mx = 18; // horizontal margin
  const cw = pw - mx * 2; // content width
  let y = 0;

  const fmt = (n: number) =>
    `N${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  /** Replace ₦ (U+20A6) with "N" — Helvetica doesn't have the Naira glyph. */
  const sanitize = (text: string) => text.replace(/\u20A6/g, "N");
  // ── helpers ──────────────────────────────────────────────
  const ensureSpace = (needed: number) => {
    if (y + needed > ph - 22) {
      doc.addPage();
      y = mx;
    }
  };

  const setColor = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const setFill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);

  /** Section heading with coloured rule underneath. */
  const heading = (title: string) => {
    ensureSpace(18);
    y += 10;
    doc.setFontSize(12.5);
    doc.setFont("helvetica", "bold");
    setColor(C.dark);
    doc.text(title, mx, y);
    y += 3;
    setDraw(C.brand);
    doc.setLineWidth(0.6);
    doc.line(mx, y, mx + cw, y);
    y += 7;
  };

  /** Small label text (used inside metric cards). */
  const label = (text: string, x: number, yy: number, color: RGB = C.muted) => {
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    setColor(color);
    doc.text(text.toUpperCase(), x, yy);
  };

  /** Large metric value (used inside metric cards). */
  const bigValue = (
    text: string,
    x: number,
    yy: number,
    color: RGB = C.dark,
  ) => {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    setColor(color);
    doc.text(text, x, yy);
  };

  /** Draw a label/value row inside the report header meta panel. */
  const metaRow = (
    rowLabel: string,
    value: string,
    x: number,
    rowY: number,
    labelW: number,
    valueMaxW: number,
  ) => {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    setColor(C.muted);
    doc.text(rowLabel.toUpperCase(), x, rowY);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    setColor(C.dark);
    doc.text(sanitize(value), x + labelW, rowY, { maxWidth: valueMaxW });
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  PAGE 1 — HEADER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const accentH = 2.5;
  const logoH = 7.5;
  const logoW = logoH * LOGO_ASPECT;
  const metaLabelW = 24;
  const metaPad = 5;
  const metaRowH = 6;
  const generatedOn = new Date().toLocaleDateString("en-NG", {
    dateStyle: "long",
  });

  const metaRows: [string, string][] = [
    ["Bank", report.bank_name],
    ...(report.statement_period
      ? ([["Period", report.statement_period]] as [string, string][])
      : []),
    ...(report.account_name
      ? ([["Account", report.account_name]] as [string, string][])
      : []),
  ];

  const metaPanelH = metaPad * 2 + metaRows.length * metaRowH;
  const headerTop = 10;
  const titleY = headerTop + logoH + 9;
  const ruleY = titleY + 4;
  const metaPanelY = ruleY + 5;
  const headerH = metaPanelY + metaPanelH + 6;

  // White letterhead — green wordmark reads clearly
  setFill(C.white);
  doc.rect(0, 0, pw, headerH, "F");

  // Row 1 — logo (left) + generated date (right)
  doc.addImage(logoBase64, "PNG", mx, headerTop, logoW, logoH);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setColor(C.muted);
  doc.text(`Generated ${generatedOn}`, pw - mx, headerTop + logoH - 1, {
    align: "right",
  });

  // Row 2 — report title (full width)
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  setColor(C.dark);
  doc.text("Bank Fee Audit Report", mx, titleY);

  // Divider
  setDraw(C.brand);
  doc.setLineWidth(0.5);
  doc.line(mx, ruleY, pw - mx, ruleY);

  // Row 3 — structured metadata panel
  setFill(C.brandLight);
  setDraw(C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(mx, metaPanelY, cw, metaPanelH, 2, 2, "FD");

  metaRows.forEach(([rowLabel, value], i) => {
    metaRow(
      rowLabel,
      value,
      mx + metaPad,
      metaPanelY + metaPad + 4 + i * metaRowH,
      metaLabelW,
      cw - metaPad * 2 - metaLabelW,
    );
  });

  // Brand accent rule beneath header
  setFill(C.brand);
  doc.rect(0, headerH, pw, accentH, "F");

  y = headerH + accentH + 8;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  KEY METRICS — 3 cards
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const cardW = (cw - 8) / 3; // 3 cards with 4mm gap
  const cardH = 26;
  const cardGap = 4;

  // Card 1 — Total Overcharge
  const hasOvercharge = report.total_overcharge_amount > 0;
  setFill(hasOvercharge ? C.redLight : C.greenLight);
  setDraw(hasOvercharge ? C.red : C.green);
  doc.setLineWidth(0.4);
  doc.roundedRect(mx, y, cardW, cardH, 2, 2, "FD");
  label(
    hasOvercharge ? "Total Overcharged" : "No Overcharges",
    mx + 5,
    y + 8,
    hasOvercharge ? C.red : C.green,
  );
  bigValue(
    fmt(report.total_overcharge_amount),
    mx + 5,
    y + 18,
    hasOvercharge ? C.red : C.green,
  );

  // Card 2 — Violations
  const card2x = mx + cardW + cardGap;
  setFill(C.orangeLight);
  setDraw(C.orange);
  doc.roundedRect(card2x, y, cardW, cardH, 2, 2, "FD");
  label("Violations Found", card2x + 5, y + 8, C.orange);
  bigValue(
    String(report.flagged_transactions.length),
    card2x + 5,
    y + 18,
    C.dark,
  );

  // Card 3 — Transactions
  const card3x = mx + (cardW + cardGap) * 2;
  setFill(C.brandLight);
  setDraw(C.brand);
  doc.roundedRect(card3x, y, cardW, cardH, 2, 2, "FD");
  label("Transactions Analyzed", card3x + 5, y + 8, C.brand);
  bigValue(String(report.total_transactions), card3x + 5, y + 18, C.dark);

  y += cardH + 5;

  // Risk pill
  const riskCols: Record<string, RGB> = {
    low: C.green,
    medium: C.yellow,
    high: C.red,
    critical: [127, 29, 29],
  };
  const rc = riskCols[report.risk_level] ?? C.yellow;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  setColor(rc);
  doc.text(
    `Overall Risk: ${report.risk_level.toUpperCase()}  (${report.risk_score}/100)`,
    mx,
    y,
  );
  y += 2;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  EXECUTIVE SUMMARY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  heading("Executive Summary");

  // Light background block for the summary text
  doc.setFontSize(9.5);
  const sumLines: string[] = doc.splitTextToSize(
    sanitize(report.executive_summary),
    cw - 12,
  );
  const sumBlockH = sumLines.length * 5 + 8;
  ensureSpace(sumBlockH);
  setFill(C.bgLight);
  setDraw(C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(mx, y - 2, cw, sumBlockH, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  setColor(C.body);
  doc.text(sumLines, mx + 6, y + 4, { lineHeightFactor: 1.55 });
  y += sumBlockH + 4;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  FLAGGED TRANSACTIONS TABLE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (report.flagged_transactions.length > 0) {
    heading(`Flagged Overcharges  (${report.flagged_transactions.length})`);

    const tbody = report.flagged_transactions.map((tx, i) => [
      String(i + 1),
      tx.date,
      sanitize((tx.original_description || tx.description).slice(0, 60)),
      fmt(tx.amount),
      tx.cbn_max_allowed != null ? fmt(tx.cbn_max_allowed) : "\u2014",
      tx.overcharge_amount != null && tx.overcharge_amount > 0
        ? `+${fmt(tx.overcharge_amount)}`
        : "\u2014",
      tx.risk_level.toUpperCase(),
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: mx, right: mx },
      head: [
        [
          "#",
          "Date",
          "Description",
          "Charged",
          "CBN Max",
          "Overcharge",
          "Risk",
        ],
      ],
      body: tbody,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
        lineColor: rgb(C.border),
        lineWidth: 0.25,
        textColor: rgb(C.dark),
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: rgb(C.brand),
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 22 },
        2: { cellWidth: "auto", fontSize: 7.5 },
        3: { halign: "right", cellWidth: 23, fontStyle: "bold" },
        4: { halign: "right", cellWidth: 23 },
        5: {
          halign: "right",
          cellWidth: 23,
          fontStyle: "bold",
          textColor: rgb(C.red),
        },
        6: { cellWidth: 14, halign: "center", fontStyle: "bold" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 6) {
          const v = String(data.cell.raw);
          if (v === "HIGH") data.cell.styles.textColor = rgb(C.red);
          else if (v === "MEDIUM") data.cell.styles.textColor = rgb(C.yellow);
          else data.cell.styles.textColor = rgb(C.brand);
        }
      },
    });

    y = (doc as unknown as JsPDFWithAutoTable).lastAutoTable.finalY + 5;

    // Total overcharge — right-aligned bold summary
    ensureSpace(10);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    setColor(C.red);
    doc.text(
      `Total Overcharge:  ${fmt(report.total_overcharge_amount)}`,
      pw - mx,
      y,
      { align: "right" },
    );
    y += 4;

    // ── Violation detail cards ──
    heading("Violation Details & CBN Citations");

    report.flagged_transactions.forEach((tx, i) => {
      const descText = sanitize(tx.original_description || tx.description);
      const reasonText = sanitize(tx.flag_reason);
      const citationText = tx.cbn_citation ? sanitize(tx.cbn_citation) : null;
      const bulkText = tx.bulk_breakdown ? sanitize(tx.bulk_breakdown) : null;

      // Measure text to size the card
      doc.setFontSize(8.5);
      const descLines: string[] = doc.splitTextToSize(descText, cw - 18);
      const reasonLines: string[] = doc.splitTextToSize(reasonText, cw - 18);
      const bulkLines: string[] = bulkText
        ? doc.splitTextToSize(bulkText, cw - 18)
        : [];
      const citLines: string[] = citationText
        ? doc.splitTextToSize(citationText, cw - 18)
        : [];
      const detailCardH =
        10 +
        descLines.length * 4 +
        3 +
        (bulkLines.length ? bulkLines.length * 4 + 4 : 0) +
        reasonLines.length * 4 +
        (citLines.length ? citLines.length * 4 + 4 : 0) +
        5;

      ensureSpace(detailCardH);

      // Card background
      setFill(C.bgLight);
      setDraw(C.border);
      doc.setLineWidth(0.25);
      doc.roundedRect(mx, y, cw, detailCardH, 1.5, 1.5, "FD");

      // Left accent stripe (colour by risk)
      const stripe: RGB =
        tx.risk_level === "high"
          ? C.red
          : tx.risk_level === "medium"
            ? C.yellow
            : C.brand;
      setFill(stripe);
      doc.rect(mx, y + 1, 2.5, detailCardH - 2, "F");

      let cy = y + 6;

      // Header line: number · date · amount
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      setColor(C.dark);
      doc.text(`#${i + 1}`, mx + 7, cy);

      doc.setFont("helvetica", "normal");
      setColor(C.muted);
      doc.text(sanitize(tx.date), mx + 15, cy);

      doc.setFont("helvetica", "bold");
      setColor(C.red);
      doc.text(fmt(tx.amount), pw - mx - 5, cy, { align: "right" });

      cy += 6;

      // Description
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      setColor(C.body);
      doc.text(descLines, mx + 7, cy);
      cy += descLines.length * 4 + 3;

      if (bulkText && bulkLines.length) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        setColor(C.brand);
        doc.text("Bulk analysis:", mx + 7, cy);
        cy += 4;
        doc.setFont("helvetica", "normal");
        setColor(C.body);
        doc.text(bulkLines, mx + 7, cy);
        cy += bulkLines.length * 4 + 3;
      }

      // Violation reason with label
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      setColor(C.orange);
      doc.text("Violation:", mx + 7, cy);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      setColor(C.body);
      doc.text(reasonLines, mx + 7, cy + 4);
      cy += reasonLines.length * 4 + 4;

      // CBN citation
      if (citationText && citLines.length) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        setColor(C.brand);
        doc.text("\u00BB  " + citLines[0], mx + 7, cy);
        if (citLines.length > 1) {
          doc.setFont("helvetica", "normal");
          doc.text(citLines.slice(1), mx + 11, cy + 4);
        }
      }

      y += detailCardH + 3;
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  COMPLIANCE CHECKS TABLE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (report.compliance_checks.length > 0) {
    heading("CBN Fee Compliance Checks");

    const compBody = report.compliance_checks.map((c) => [
      c.status.toUpperCase(),
      sanitize(c.regulation),
      sanitize(c.details),
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: mx, right: mx },
      head: [["Status", "Regulation", "Details"]],
      body: compBody,
      theme: "grid",
      styles: {
        fontSize: 8.5,
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
        lineColor: rgb(C.border),
        lineWidth: 0.25,
        textColor: rgb(C.dark),
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: rgb(C.brand),
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 20, halign: "center", fontStyle: "bold" },
        1: { cellWidth: 42, fontStyle: "bold" },
        2: { cellWidth: "auto" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          const v = String(data.cell.raw);
          if (v === "FAIL") {
            data.cell.styles.textColor = rgb(C.red);
            data.cell.styles.fillColor = rgb(C.redLight);
          } else if (v === "WARNING") {
            data.cell.styles.textColor = rgb(C.yellow);
            data.cell.styles.fillColor = rgb(C.yellowLight);
          } else {
            data.cell.styles.textColor = rgb(C.green);
            data.cell.styles.fillColor = rgb(C.greenLight);
          }
        }
      },
    });

    y = (doc as unknown as JsPDFWithAutoTable).lastAutoTable.finalY + 4;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RECOMMENDATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (report.recommendations.length > 0) {
    heading("Recommendations");

    report.recommendations.forEach((rec, i) => {
      doc.setFontSize(9);
      const lines: string[] = doc.splitTextToSize(sanitize(rec), cw - 14);
      const blockH = lines.length * 4.8 + 4;
      ensureSpace(blockH);

      // Number badge circle
      setFill(C.brandLight);
      doc.circle(mx + 4, y + 1, 3.5, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      setColor(C.brand);
      doc.text(String(i + 1), mx + 4, y + 2, { align: "center" });

      // Recommendation text
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      setColor(C.body);
      doc.text(lines, mx + 11, y, { lineHeightFactor: 1.5 });
      y += blockH;
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  PAGE FOOTERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Thin rule
    setDraw(C.border);
    doc.setLineWidth(0.3);
    doc.line(mx, ph - 14, pw - mx, ph - 14);

    // Left: branding
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    setColor(C.faint);
    doc.text("KoboBack  \u00B7  Confidential", mx, ph - 9);

    // Right: page number
    doc.text(`Page ${p} of ${totalPages}`, pw - mx, ph - 9, {
      align: "right",
    });

    // Top accent bar on continuation pages
    if (p > 1) {
      setFill(C.brand);
      doc.rect(0, 0, pw, 3, "F");
    }
  }

  // ── Download ──
  const safeName = report.bank_name.replace(/[^a-zA-Z0-9]+/g, "-");
  const filename = `KoboBack-Audit-${safeName}-${report.report_id.slice(0, 8)}.pdf`;
  doc.save(filename);
}
