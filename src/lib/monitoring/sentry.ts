import * as Sentry from "@sentry/nextjs";

import { getSiteUrl } from "@/lib/site";
import { getSupabaseEnv } from "@/lib/env";

type MonitoringArea = "auth" | "upload" | "ai" | "server" | "client";

type MonitoringContext = {
  area: MonitoringArea;
  action: string;
  userId?: string | null;
  route?: string;
  statusCode?: number;
  extra?: Record<string, string | number | boolean | null | undefined>;
};

function getCommonOptions() {
  const publicEnv = getSupabaseEnv();

  return {
    dsn: publicEnv.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    enabled: Boolean(publicEnv.NEXT_PUBLIC_SENTRY_DSN),
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    sendDefaultPii: false,
    tracesSampleRate: 0.05,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    tunnel: undefined,
    beforeSend(event: Sentry.ErrorEvent) {
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
        delete event.request.headers;
      }

      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
        delete event.user.username;
      }

      if (event.extra) {
        delete event.extra.body;
        delete event.extra.prompt;
        delete event.extra.response;
        delete event.extra.fileName;
        delete event.extra.filePath;
        delete event.extra.fileType;
        delete event.extra.sourceTitle;
        delete event.extra.noteContent;
      }

      return event;
    },
    initialScope: {
      tags: {
        app: "citemate",
      },
    },
    serverName: new URL(getSiteUrl()).hostname,
  };
}

export function initSentryClient() {
  Sentry.init(getCommonOptions());
}

export function initSentryServer() {
  Sentry.init({
    ...getCommonOptions(),
  });
}

export function captureMonitoredError(
  error: unknown,
  context: MonitoringContext,
) {
  Sentry.withScope((scope) => {
    scope.setTag("monitoring_area", context.area);
    scope.setTag("monitoring_action", context.action);

    if (context.route) {
      scope.setTag("route", context.route);
    }

    if (typeof context.statusCode === "number") {
      scope.setLevel(context.statusCode >= 500 ? "error" : "warning");
      scope.setTag("status_code", String(context.statusCode));
    }

    if (context.userId) {
      scope.setUser({ id: context.userId });
    }

    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        if (typeof value !== "undefined") {
          scope.setExtra(key, value);
        }
      });
    }

    Sentry.captureException(error);
  });
}
