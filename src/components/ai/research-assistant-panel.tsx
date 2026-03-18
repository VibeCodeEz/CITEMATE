"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, MessageSquareDashed } from "lucide-react";
import { toast } from "sonner";

import { AssistantContextSummary } from "@/components/ai/assistant-context-summary";
import { AssistantResponseCard } from "@/components/ai/assistant-response-card";
import { TaskActionButtons } from "@/components/ai/task-action-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  AssistantNoteContext,
  AssistantReminderContext,
  AssistantResponse,
  AssistantSourceContext,
  AssistantSubjectContext,
  AssistantTaskType,
} from "@/lib/ai/types";

type ResearchAssistantPanelProps = {
  title?: string;
  description?: string;
  tasks: AssistantTaskType[];
  sourceContext?: AssistantSourceContext;
  noteContext?: AssistantNoteContext;
  subjectContext?: AssistantSubjectContext;
  reminderContext?: AssistantReminderContext;
  draftLabel?: string;
};

export function ResearchAssistantPanel({
  title = "Research Assistant",
  description = "Get scoped AI help for the current source, note, or reminder. Suggestions never overwrite saved data automatically.",
  tasks,
  sourceContext,
  noteContext,
  subjectContext,
  reminderContext,
  draftLabel = "Working draft",
}: ResearchAssistantPanelProps) {
  const [activeTask, setActiveTask] = useState<AssistantTaskType | null>(null);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [draftText, setDraftText] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [pending, setPending] = useState(false);

  const hasContext = useMemo(
    () => Boolean(sourceContext || noteContext || reminderContext),
    [noteContext, reminderContext, sourceContext],
  );

  async function runTask(taskType: AssistantTaskType) {
    if (!hasContext) {
      toast.error("Add a source, note, or reminder context first.");
      return;
    }

    setActiveTask(taskType);
    setPending(true);

    try {
      const result = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskType,
          sourceContext,
          noteContext,
          subjectContext,
          reminderContext,
          userMessage: userMessage.trim() || undefined,
        }),
      });

      const payload = (await result.json()) as AssistantResponse & {
        error?: string;
      };

      if (!result.ok) {
        throw new Error(payload.error ?? "Assistant request failed.");
      }

      setResponse(payload);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The Research Assistant could not complete that request.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/70 bg-card/90">
        <CardHeader className="space-y-3">
          <div className="space-y-2">
            <CardTitle className="font-serif text-3xl tracking-tight">
              {title}
            </CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AssistantContextSummary
            sourceContext={sourceContext}
            noteContext={noteContext}
            reminderContext={reminderContext}
          />
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Quick actions
            </p>
            <TaskActionButtons
              tasks={tasks}
              activeTask={activeTask}
              disabled={pending}
              onSelect={runTask}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="assistant-follow-up"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground"
            >
              Optional follow-up
            </label>
            <Input
              id="assistant-follow-up"
              value={userMessage}
              onChange={(event) => setUserMessage(event.target.value)}
              placeholder="Ask a small follow-up question after choosing a task"
            />
          </div>
          {pending ? (
            <div className="flex items-center gap-2 rounded-[1.5rem] border border-border/80 bg-secondary/20 px-4 py-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Generating suggestion...
            </div>
          ) : null}
          {!pending && !response ? (
            <div className="rounded-[1.5rem] border border-dashed border-border/80 bg-secondary/10 p-5">
              <div className="flex items-start gap-3">
                <MessageSquareDashed className="mt-0.5 size-5 text-primary" />
                <div className="space-y-2">
                  <p className="font-medium">No suggestion yet</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Start with one of the task buttons above. The assistant stays scoped to the current context and labels everything as a suggestion.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {response ? (
        <AssistantResponseCard
          response={response}
          onUseAsDraft={(value) => {
            setDraftText(value);
            toast.success("Saved to draft.");
          }}
          onInsertIntoNote={(value) => {
            setDraftText((current) => (current ? `${current}\n\n${value}` : value));
            toast.success("Inserted into draft note.");
          }}
          onDismiss={() => {
            setResponse(null);
            setActiveTask(null);
          }}
        />
      ) : null}

      {draftText ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="font-serif text-2xl tracking-tight">
              {draftLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              rows={10}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(draftText);
                  toast.success("Copied draft.");
                }}
              >
                Copy draft
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDraftText("")}
              >
                Clear draft
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
