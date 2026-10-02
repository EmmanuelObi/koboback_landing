import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getSupabaseClient,
  isSupabaseConfigured,
  type Session,
  type User,
} from "../lib/supabase";
import {
  createProfileStub,
  getProfile,
  isOnboardingComplete,
  type UserProfile,
} from "../lib/profile";
import { humanizeAuthError } from "../lib/authErrors";
import { getMe } from "../api/client";

export type SignUpResult = {
  error: string | null;
  needsEmailConfirmation: boolean;
};

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  /** True until /me role flags have resolved (or there is no user). */
  rolesLoading: boolean;
  isConfigured: boolean;
  onboardingComplete: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signUp: (
    email: string,
    password: string,
    termsAccepted: boolean,
  ) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<string | null>;
  resetPasswordForEmail: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const data = await getProfile(userId);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user.id);
  }, [user, loadProfile]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session?.user) {
        loadProfile(data.session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
      if (nextSession?.user) {
        loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  useEffect(() => {
    if (loading) return;
    if (isSupabaseConfigured && !user) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setRolesLoading(false);
      return;
    }
    let cancelled = false;
    setRolesLoading(true);
    getMe()
      .then((me) => {
        if (!cancelled) {
          setIsAdmin(me.is_admin);
          setIsSuperAdmin(Boolean(me.is_super_admin));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      })
      .finally(() => {
        if (!cancelled) setRolesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      termsAccepted: boolean,
    ): Promise<SignUpResult> => {
      if (!termsAccepted) {
        return {
          error: "You must accept the Terms of Service and Privacy Policy.",
          needsEmailConfirmation: false,
        };
      }
      const supabase = getSupabaseClient();
      if (!supabase) {
        return {
          error: "Authentication is not configured.",
          needsEmailConfirmation: false,
        };
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        return {
          error: humanizeAuthError(error.message),
          needsEmailConfirmation: false,
        };
      }
      if (data.user) {
        try {
          await createProfileStub(data.user.id, new Date().toISOString());
        } catch (err) {
          return {
            error:
              err instanceof Error
                ? humanizeAuthError(err.message)
                : "Failed to create profile.",
            needsEmailConfirmation: false,
          };
        }
      }
      return {
        error: null,
        needsEmailConfirmation: Boolean(data.user) && !data.session,
      };
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return "Authentication is not configured.";
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error ? humanizeAuthError(error.message) : null;
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return "Authentication is not configured.";
    const redirectTo = `${window.location.origin}/product`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return error ? humanizeAuthError(error.message) : null;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const getAccessToken = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  const onboardingComplete = isOnboardingComplete(profile);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      profileLoading,
      rolesLoading,
      isConfigured: isSupabaseConfigured,
      onboardingComplete,
      isAdmin,
      isSuperAdmin,
      signUp,
      signIn,
      resetPasswordForEmail,
      signOut,
      getAccessToken,
      refreshProfile,
    }),
    [
      user,
      session,
      profile,
      loading,
      profileLoading,
      rolesLoading,
      onboardingComplete,
      isAdmin,
      isSuperAdmin,
      signUp,
      signIn,
      resetPasswordForEmail,
      signOut,
      getAccessToken,
      refreshProfile,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
