import { getSupabaseEnv } from "@/lib/env";

const fallbackSiteUrl = "http://localhost:3000";

export function getSiteUrl() {
  const env = getSupabaseEnv();

  return env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl;
}

export function getSupportEmail() {
  const env = getSupabaseEnv();

  return env.NEXT_PUBLIC_SUPPORT_EMAIL ?? null;
}
