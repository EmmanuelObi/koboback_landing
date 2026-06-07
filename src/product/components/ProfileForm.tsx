import { useState } from "react";
import {
  NIGERIAN_BANKS,
  REFERRAL_SOURCES,
  validatePhone,
  type UserProfile,
} from "../lib/profile";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { labelClass } from "../ui/tokens";

export interface ProfileFormValues {
  full_name: string;
  phone: string;
  company: string;
  primary_bank: string;
  referral_source: string;
}

interface ProfileFormProps {
  initial?: UserProfile | null;
  submitLabel: string;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
}

export default function ProfileForm({
  initial,
  submitLabel,
  onSubmit,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [primaryBank, setPrimaryBank] = useState(initial?.primary_bank ?? "");
  const [referralSource, setReferralSource] = useState(
    initial?.referral_source ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    if (!primaryBank) {
      setError("Please select your primary bank.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        full_name: fullName.trim(),
        phone: phone.trim(),
        company: company.trim(),
        primary_bank: primaryBank,
        referral_source: referralSource,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2.5">
          {error}
        </p>
      )}

      <div>
        <label className={labelClass}>Full name *</label>
        <Input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ada Okonkwo"
        />
      </div>

      <div>
        <label className={labelClass}>Phone number *</label>
        <Input
          type="tel"
          required
          placeholder="+234 801 234 5678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>Primary bank *</label>
        <Select
          required
          value={primaryBank}
          onChange={(e) => setPrimaryBank(e.target.value)}
        >
          <option value="">Select your bank…</option>
          {NIGERIAN_BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className={labelClass}>Company (optional)</label>
        <Input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>How did you hear about us? (optional)</label>
        <Select
          value={referralSource}
          onChange={(e) => setReferralSource(e.target.value)}
        >
          <option value="">Select one</option>
          {REFERRAL_SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </Select>
      </div>

      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
