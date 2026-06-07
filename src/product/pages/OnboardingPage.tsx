import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../ui/AuthLayout";
import Card from "../ui/Card";
import ProfileForm, { type ProfileFormValues } from "../components/ProfileForm";
import { upsertProfile } from "../lib/profile";
import { eyebrowClass, pageDescClass, pageTitleClass, cn } from "../ui/tokens";

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: ProfileFormValues) => {
    if (!user) throw new Error("Not signed in.");
    await upsertProfile(user.id, {
      full_name: values.full_name,
      phone: values.phone,
      company: values.company || null,
      primary_bank: values.primary_bank,
      referral_source: values.referral_source || null,
      onboarding_completed_at: new Date().toISOString(),
    });
    await refreshProfile();
    navigate("/product/dashboard", { replace: true });
  };

  return (
    <AuthLayout backTo="/product" backLabel="Back to sign in" wide>
      <p className={cn(eyebrowClass, "mb-3")}>Setup</p>
      <h1 className={pageTitleClass}>Complete your profile</h1>
      <p className={cn(pageDescClass, "mt-2 mb-8")}>
        A few details so we can personalize your audit experience.
      </p>
      <Card>
        <ProfileForm submitLabel="Continue to dashboard" onSubmit={handleSubmit} />
      </Card>
    </AuthLayout>
  );
}
