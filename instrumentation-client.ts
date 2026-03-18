import * as Sentry from "@sentry/nextjs";

import { initSentryClient } from "@/lib/monitoring/sentry";

initSentryClient();

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
