type SupabaseAuthErrorLike = {
  code?: string;
  message: string;
  status?: number;
};

export function getFriendlyAuthError(error: SupabaseAuthErrorLike) {
  const code = error.code?.toLowerCase();
  const message = error.message.toLowerCase();

  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials")
  ) {
    return "That email and password combination did not match our records.";
  }

  if (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return "Verify your email address first, then sign in again.";
  }

  if (
    code === "user_already_exists" ||
    message.includes("user already registered")
  ) {
    return "An account with that email already exists. Try signing in instead.";
  }

  if (
    code === "signup_disabled" ||
    message.includes("signups not allowed")
  ) {
    return "Sign ups are currently disabled for this project.";
  }

  if (
    code === "over_email_send_rate_limit" ||
    message.includes("security purposes") ||
    message.includes("rate limit")
  ) {
    return "Too many attempts in a short time. Please wait a minute and try again.";
  }

  if (message.includes("password")) {
    return error.message;
  }

  return "We could not complete that authentication request. Please try again.";
}
