import { getGroqEnv } from "@/lib/env";
import { assistantResponseSchema } from "@/lib/ai/assistant-schema";

function stripJsonFences(value: string) {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function generateGroqAssistantResponse(args: {
  systemPrompt: string;
  userPrompt: string;
}) {
  const { GROQ_API_KEY, GROQ_MODEL } = getGroqEnv();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: args.systemPrompt,
        },
        {
          role: "user",
          content: args.userPrompt,
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed: ${errorText}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty response.");
  }

  const parsed = assistantResponseSchema.safeParse(
    JSON.parse(stripJsonFences(content)),
  );

  if (!parsed.success) {
    throw new Error("Groq returned an invalid structured response.");
  }

  return parsed.data;
}
