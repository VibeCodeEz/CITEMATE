import * as Sentry from "@sentry/nextjs";

import { initSentryServer } from "@/lib/monitoring/sentry";

export async function register() {
  initSentryServer();
}

export const onRequestError = Sentry.captureRequestError;
