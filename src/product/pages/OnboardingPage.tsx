import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout, { AuthFlowAside } from "../ui/AuthLayout";
import ProfileForm, { type ProfileFormValues } from "../components/ProfileForm";
import { upsertProfile } from "../lib/profile";
import { useToast } from "../ui/Toast";
import { eyebrowClass, pageDescClass, pageTitleClass, cn } from "../ui/tokens";

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (values: ProfileFormValues) => {
    if (!user) throw new Error("Not signed in.");
    await upsertProfile(user.id, {
      full_name: values.full_name,
      phone: values.phone || null,
      company: values.company || null,
      primary_bank: values.primary_bank || null,
      ...(values.account_type
        ? { account_type: values.account_type }
        : {}),
      referral_source: values.referral_source || null,
      onboarding_completed_at: new Date().toISOString(),
    });
    await refreshProfile();
    toast("You’re in — upload a statement to get started.", "success");
    navigate("/product/statements", { replace: true });
  };

  return (
    <AuthLayout
      backTo="/product"
      backLabel="Back to sign in"
      aside={<AuthFlowAside />}
    >
      <p className={cn(eyebrowClass, "mb-3")}>Almost there</p>
      <h1 className={pageTitleClass}>What should we call you?</h1>
      <p className={cn(pageDescClass, "mt-2 mb-6")}>
        Just your name to get started. Bank and phone can wait — you can add
        them later from Profile.
      </p>
      <ProfileForm
        mode="onboarding"
        submitLabel="Continue to upload"
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}
