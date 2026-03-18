import { NextResponse, type NextRequest } from "next/server";

import { captureMonitoredError } from "@/lib/monitoring/sentry";
import { assistantRequestSchema } from "@/lib/ai/assistant-schema";
import { generateGroqAssistantResponse } from "@/lib/ai/groq";
import {
  buildAssistantSystemPrompt,
  buildAssistantUserPrompt,
  getAssistantApplyActions,
} from "@/lib/ai/prompts";
import { checkAssistantRateLimit } from "@/lib/ai/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to use the Research Assistant." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = assistantRequestSchema.safeParse(body);

    if (!parsed.success) {
      captureMonitoredError(parsed.error, {
        area: "ai",
        action: "assistant_request_invalid",
        userId: user.id,
        route: "/api/ai/assistant",
        statusCode: 400,
      });
      return NextResponse.json(
        { error: "The assistant request was invalid." },
        { status: 400 },
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const rateLimit = checkAssistantRateLimit(`${user.id}:${ip}`);

    if (!rateLimit.allowed) {
      captureMonitoredError(new Error("Assistant rate limit exceeded"), {
        area: "ai",
        action: "assistant_rate_limited",
        userId: user.id,
        route: "/api/ai/assistant",
        statusCode: 429,
      });
      return NextResponse.json(
        {
          error:
            "The Research Assistant is receiving too many requests right now. Please wait a moment and try again.",
        },
        { status: 429 },
      );
    }

    const aiResponse = await generateGroqAssistantResponse({
      systemPrompt: buildAssistantSystemPrompt(),
      userPrompt: buildAssistantUserPrompt(parsed.data),
    });

    return NextResponse.json({
      ...aiResponse,
      applyActions:
        aiResponse.applyActions && aiResponse.applyActions.length > 0
          ? aiResponse.applyActions
          : getAssistantApplyActions(parsed.data.taskType),
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message.includes("Missing Groq environment variables")
    ) {
      captureMonitoredError(error, {
        area: "ai",
        action: "assistant_env_missing",
        route: "/api/ai/assistant",
        statusCode: 503,
      });

      return NextResponse.json(
        {
          error:
            "The Research Assistant is not configured on this deployment yet. Add GROQ_API_KEY in your host environment variables and redeploy.",
        },
        { status: 503 },
      );
    }

    captureMonitoredError(error, {
      area: "ai",
      action: "assistant_request_failed",
      route: "/api/ai/assistant",
      statusCode: 500,
    });

    return NextResponse.json(
      {
        error:
          "The Research Assistant could not complete that request. Please try again with a little more context.",
      },
      { status: 500 },
    );
  }
}
