/** Map Supabase / auth API errors to user-facing copy. */

export function humanizeAuthError(message: string | null | undefined): string {
  if (!message) return "Something went wrong. Please try again.";
  const lower = message.toLowerCase();

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid credentials")
  ) {
    return "That email or password doesn’t match. Try again, or reset your password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirm your email first — check your inbox for the link we sent.";
  }
  if (
    lower.includes("user already registered") ||
    lower.includes("already been registered")
  ) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (lower.includes("password should be at least")) {
    return "Password must be at least 6 characters.";
  }
  if (lower.includes("unable to validate email") || lower.includes("invalid email")) {
    return "Enter a valid email address.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network issue. Check your connection and try again.";
  }
  if (lower.includes("for security purposes")) {
    return "Please wait a few seconds before requesting another email.";
  }

  return message;
}
