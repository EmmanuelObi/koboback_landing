import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabaseClient } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import ProductLayout from "../components/ProductLayout";
import PageHeader from "../ui/PageHeader";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ProfileForm, { type ProfileFormValues } from "../components/ProfileForm";
import { upsertProfile } from "../lib/profile";
import { labelClass } from "../ui/tokens";

export default function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) throw new Error("Not signed in.");
    await upsertProfile(user.id, {
      full_name: values.full_name,
      phone: values.phone,
      company: values.company || null,
      primary_bank: values.primary_bank,
      referral_source: values.referral_source || null,
      onboarding_completed_at:
        profile?.onboarding_completed_at ?? new Date().toISOString(),
    });
    await refreshProfile();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setPasswordError("Authentication is not configured.");
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);

    if (error) {
      setPasswordError(error.message);
      return;
    }

    setNewPassword("");
    setPasswordMessage("Password updated successfully.");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/product", { replace: true });
  };

  return (
    <ProductLayout>
      <main className="max-w-[640px] mx-auto px-6 py-8 lg:py-10">
        <PageHeader
          eyebrow="Account"
          title="Profile"
          description="Manage your personal details and sign-in settings."
        />

        <div className="space-y-6">
          <Card>
            <h2 className="text-[14px] font-semibold text-slate-950 mb-4">
              Personal information
            </h2>
            {profileSaved && (
              <p className="mb-4 text-[13px] text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                Profile saved.
              </p>
            )}
            <ProfileForm
              initial={profile}
              submitLabel="Save changes"
              onSubmit={handleProfileSubmit}
            />
          </Card>

          <Card>
            <h2 className="text-[14px] font-semibold text-slate-950 mb-4">
              Sign-in
            </h2>
            <div className="mb-4">
              <label className={labelClass}>Email</label>
              <Input
                type="email"
                readOnly
                value={user?.email ?? ""}
                className="bg-slate-50 text-slate-500"
              />
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className={labelClass}>New password</label>
                <Input
                  type="password"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              {passwordError && (
                <p className="text-[13px] text-red-600">{passwordError}</p>
              )}
              {passwordMessage && (
                <p className="text-[13px] text-green-700">{passwordMessage}</p>
              )}
              <Button
                type="submit"
                variant="secondary"
                disabled={savingPassword || !newPassword}
              >
                {savingPassword ? "Updating..." : "Update password"}
              </Button>
            </form>
          </Card>

          <Button variant="ghost" onClick={handleSignOut} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            Sign out
          </Button>
        </div>
      </main>
    </ProductLayout>
  );
}
