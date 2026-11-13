import { useState, type FormEvent } from "react";
import type { Evidence, Finding } from "../types";
import type { AuditorData } from "../useAuditorData";
import { Button, Field } from "./ui";

type Fact = {key: string; label: string; type: "choice" | "number"; choices?: [string, string][]; min?: number; max?: number; step?: string};
const yesNo: [string, string][] = [["true", "Yes"], ["false", "No"]];
const facts: Fact[] = [
  {key: "card_currency", label: "Card denomination", type: "choice", choices: [["NGN", "Naira card"], ["USD", "US dollar card"], ["GBP", "Sterling card"], ["EUR", "Euro card"]]},
  {key: "card_linked_to_account", label: "Card linked to this account", type: "choice", choices: yesNo},
  {key: "card_count", label: "Number of cards for this charge", type: "number", min: 1, step: "1"},
  {key: "covered_quarters", label: "Quarters covered by this charge", type: "number", min: 1, step: "1"},
  {key: "fee_basis", label: "Fee tax basis", type: "choice", choices: [["base", "Base fee (excluding VAT)"], ["vat_inclusive", "Total inclusive of VAT"]]},
  {key: "vat_rate", label: "VAT rate (decimal, e.g. 0.075)", type: "number", min: 0, max: 1, step: "0.001"},
  {key: "sms_origin", label: "SMS transaction origin", type: "choice", choices: [["customer", "Customer-induced"], ["bank", "Bank-induced"]]},
  {key: "sms_actual_total_cost", label: "Actual total SMS cost for this billed entry", type: "number", min: 0, step: "0.01"},
  {key: "transfer_purpose", label: "Transfer purpose", type: "choice", choices: [["salary", "Salary"], ["other", "Other evidenced purpose"]]},
  {key: "intra_bank_self_transfer", label: "Same-owner transfer within the same bank", type: "choice", choices: yesNo},
  {key: "own_account_deposit", label: "Deposit into own account", type: "choice", choices: yesNo},
  {key: "transfer_role", label: "Account's transfer role", type: "choice", choices: [["sender", "Sender"], ["receiver", "Recipient"]]},
  {key: "confirmed_fee_category", label: "Identified fee type", type: "choice", choices: [["sms_alert", "SMS alert"], ["stamp_duty", "Electronic transfer duty / EMTL"], ["transfer_fee", "Transfer fee"], ["card_maintenance", "Card maintenance"], ["card_issuance", "Card issuance / replacement"], ["account_maintenance", "Account maintenance"], ["ussd_fee", "USSD"], ["atm_fee", "ATM"], ["vat", "VAT"]]}
];
export default function ConfirmFactsForm({finding, evidence, data, revision, disabled, demo}: {
  finding: Finding; evidence: Evidence[]; data: AuditorData; revision: number; disabled: boolean; demo: boolean;
}) {
  const initialKey = /sms|alert/i.test(finding.description) ? "sms_actual_total_cost" : /tax basis/i.test(finding.reason) ? "fee_basis" : /card/i.test(finding.description) ? "card_currency" : "confirmed_fee_category";
  const [key, setKey] = useState(initialKey);
  const [value, setValue] = useState("");
  const [source, setSource] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const field = facts.find(f => f.key === key)!;
  const ready = evidence.filter(e => e.status === "ready");
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setSaved(false);
    try {
      const factValue = field.type === "number" ? Number(value) : value === "true" ? true : value === "false" ? false : value;
      await data.mutate(`/findings/${finding.id}/facts`, "POST", {revision, facts: {[key]: factValue}, evidence_id: source, note});
      setSaved(true);
    } catch (cause) { setError((cause as Error).message); }
  }
  return <details className="aw-inspector-block"><summary><strong>Confirm facts &amp; reassess</strong></summary>
    <p className="aw-note">Record only what the selected source establishes for this transaction. Notes and attachments alone do not change calculations. Each confirmation rechecks the statement against the current rules and preserves previous reviews.</p>
    {demo ? <p className="aw-note">Automatic reassessment is available in the live workspace; this demonstration does not run statement analysis.</p> : !ready.length ? <p className="aw-note">Add a supporting note, reference or file above before confirming facts. A note can quote a fact explicitly shown in the source statement.</p> : <form className="aw-form-stack" onSubmit={submit}>
      <Field label="Fact to confirm"><select disabled={disabled} value={key} onChange={e => {setKey(e.target.value);setValue("");}}>{facts.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}</select></Field>
      <Field label="Confirmed value">{field.type === "number" ? <input required type="number" min={field.min} max={field.max} step={field.step} value={value} disabled={disabled} onChange={e => setValue(e.target.value)} /> : <select required value={value} disabled={disabled} onChange={e => setValue(e.target.value)}><option value="">Select an evidenced value</option>{field.choices?.map(([v,label]) => <option key={v} value={v}>{label}</option>)}</select>}</Field>
      <Field label="Supporting record"><select required value={source} disabled={disabled} onChange={e => setSource(e.target.value)}><option value="">Select the source</option>{ready.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}</select></Field>
      <Field label="Source quotation or explanation"><textarea required minLength={3} maxLength={2000} rows={3} value={note} disabled={disabled} onChange={e => setNote(e.target.value)} /></Field>
      {error ? <p role="alert" className="aw-form-error">{error}</p> : null}
      <Button type="submit" disabled={disabled}>Confirm fact &amp; reassess</Button>
      {saved ? <p role="status">Fact recorded and statement reassessed.</p> : null}
    </form>}
  </details>;
}
