import { getSupabaseClient } from "./supabase";

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  primary_bank: string | null;
  referral_source: string | null;
  terms_accepted_at: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Globus Bank",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Opay",
  "Palmpay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "Suntrust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
  "Other",
] as const;

export const REFERRAL_SOURCES = [
  "Search engine",
  "Social media",
  "Friend or colleague",
  "News or blog",
  "Other",
] as const;

export function isOnboardingComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return Boolean(profile.onboarding_completed_at);
}

export function validatePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 14) {
    return "Enter a valid Nigerian phone number (10–14 digits).";
  }
  return null;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as UserProfile | null;
}

export async function createProfileStub(
  userId: string,
  termsAcceptedAt: string,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      terms_accepted_at: termsAcceptedAt,
    },
    { onConflict: "id" },
  );

  if (error) throw new Error(error.message);
}

export interface ProfileUpdateInput {
  full_name?: string;
  phone?: string;
  company?: string | null;
  primary_bank?: string | null;
  referral_source?: string | null;
  terms_accepted_at?: string;
  onboarding_completed_at?: string | null;
}

export async function upsertProfile(
  userId: string,
  input: ProfileUpdateInput,
): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Authentication is not configured.");

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...input }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as UserProfile;
}
