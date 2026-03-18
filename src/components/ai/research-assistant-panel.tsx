"use client";

import { useMemo, useState } from "react";
import { ChevronDown, LoaderCircle, MessageSquareDashed, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AssistantContextSummary } from "@/components/ai/assistant-context-summary";
import { AssistantResponseCard } from "@/components/ai/assistant-response-card";
import { TaskActionButtons } from "@/components/ai/task-action-buttons";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  AssistantCollectionContext,
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
  collectionContext?: AssistantCollectionContext;
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
  collectionContext,
  reminderContext,
  draftLabel = "Working draft",
}: ResearchAssistantPanelProps) {
  const [activeTask, setActiveTask] = useState<AssistantTaskType | null>(null);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [draftText, setDraftText] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [showContextPreview, setShowContextPreview] = useState(false);
  const [includeSourceContext, setIncludeSourceContext] = useState(Boolean(sourceContext));
  const [includeNoteContext, setIncludeNoteContext] = useState(Boolean(noteContext));
  const [includeSubjectContext, setIncludeSubjectContext] = useState(Boolean(subjectContext));
  const [includeCollectionContext, setIncludeCollectionContext] = useState(Boolean(collectionContext));
  const [includeReminderContext, setIncludeReminderContext] = useState(Boolean(reminderContext));
  const [includeUserMessage, setIncludeUserMessage] = useState(true);

  const hasContext = useMemo(
    () =>
      Boolean(
        (includeSourceContext && sourceContext) ||
          (includeNoteContext && noteContext) ||
          (includeSubjectContext && subjectContext) ||
          (includeCollectionContext && collectionContext) ||
          (includeReminderContext && reminderContext),
      ),
    [
      collectionContext,
      includeCollectionContext,
      includeNoteContext,
      includeReminderContext,
      includeSourceContext,
      includeSubjectContext,
      noteContext,
      reminderContext,
      sourceContext,
      subjectContext,
    ],
  );

  const contextPreviewItems = useMemo(() => {
    const items: Array<{ label: string; value: string }> = [];

    if (includeSourceContext && sourceContext) {
      items.push({
        label: "Source",
        value: [
          sourceContext.title,
          sourceContext.authors.join(", "),
          sourceContext.abstract ?? "",
          sourceContext.tags.join(", "),
          sourceContext.subjectLabels.join(", "),
        ]
          .filter(Boolean)
          .join(" | "),
      });
    }

    if (includeNoteContext && noteContext) {
      items.push({
        label: "Note",
        value: [noteContext.title, noteContext.content].filter(Boolean).join(" | "),
      });
    }

    if (includeSubjectContext && subjectContext) {
      items.push({
        label: "Subject",
        value: [subjectContext.name, subjectContext.description ?? ""]
          .filter(Boolean)
          .join(" | "),
      });
    }

    if (includeCollectionContext && collectionContext) {
      items.push({
        label: "Collection",
        value: [
          collectionContext.label,
          collectionContext.description ?? "",
          `${collectionContext.sourceCount} sources`,
          `${collectionContext.noteCount} notes`,
        ]
          .filter(Boolean)
          .join(" | "),
      });
    }

    if (includeReminderContext && reminderContext) {
      items.push({
        label: "Reminder",
        value: [
          reminderContext.title,
          reminderContext.description,
          reminderContext.missingFields.join(", "),
        ]
          .filter(Boolean)
          .join(" | "),
      });
    }

    if (includeUserMessage && userMessage.trim()) {
      items.push({
        label: "Follow-up",
        value: userMessage.trim(),
      });
    }

    return items;
  }, [
    collectionContext,
    includeCollectionContext,
    includeNoteContext,
    includeReminderContext,
    includeSourceContext,
    includeSubjectContext,
    includeUserMessage,
    noteContext,
    reminderContext,
    sourceContext,
    subjectContext,
    userMessage,
  ]);

  async function runTask(taskType: AssistantTaskType) {
    if (!hasContext) {
      toast.error("Add a source, note, subject, or collection context first.");
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
          sourceContext: includeSourceContext ? sourceContext : undefined,
          noteContext: includeNoteContext ? noteContext : undefined,
          subjectContext: includeSubjectContext ? subjectContext : undefined,
          collectionContext: includeCollectionContext ? collectionContext : undefined,
          reminderContext: includeReminderContext ? reminderContext : undefined,
          userMessage:
            includeUserMessage && userMessage.trim()
              ? userMessage.trim()
              : undefined,
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
            sourceContext={includeSourceContext ? sourceContext : undefined}
            noteContext={includeNoteContext ? noteContext : undefined}
            subjectContext={includeSubjectContext ? subjectContext : undefined}
            collectionContext={includeCollectionContext ? collectionContext : undefined}
            reminderContext={includeReminderContext ? reminderContext : undefined}
          />
          <div className="rounded-[1.5rem] border border-border/80 bg-secondary/15 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    AI safety controls
                  </p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Choose exactly what context to include with this request. Turn sections off when you want a narrower prompt.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowContextPreview((current) => !current)}
              >
                <ChevronDown className="size-4" />
                {showContextPreview ? "Hide context preview" : "Show context preview"}
              </Button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sourceContext ? (
                <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-3">
                  <Checkbox
                    checked={includeSourceContext}
                    onCheckedChange={(value) => setIncludeSourceContext(Boolean(value))}
                    aria-label="Include source context in AI request"
                  />
                  <span className="space-y-1">
                    <span className="block font-medium">Include source metadata</span>
                    <span className="block text-xs leading-5 text-muted-foreground">
                      Title, authors, abstract, tags, citation details, and linked subjects.
                    </span>
                  </span>
                </label>
              ) : null}
              {noteContext ? (
                <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-3">
                  <Checkbox
                    checked={includeNoteContext}
                    onCheckedChange={(value) => setIncludeNoteContext(Boolean(value))}
                    aria-label="Include note context in AI request"
                  />
                  <span className="space-y-1">
                    <span className="block font-medium">Include note content</span>
                    <span className="block text-xs leading-5 text-muted-foreground">
                      Note title and current note text.
                    </span>
                  </span>
                </label>
              ) : null}
              {subjectContext ? (
                <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-3">
                  <Checkbox
                    checked={includeSubjectContext}
                    onCheckedChange={(value) => setIncludeSubjectContext(Boolean(value))}
                    aria-label="Include subject context in AI request"
                  />
                  <span className="space-y-1">
                    <span className="block font-medium">Include subject context</span>
                    <span className="block text-xs leading-5 text-muted-foreground">
                      Subject name and optional description.
                    </span>
                  </span>
                </label>
              ) : null}
              {collectionContext ? (
                <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-3">
                  <Checkbox
                    checked={includeCollectionContext}
                    onCheckedChange={(value) => setIncludeCollectionContext(Boolean(value))}
                    aria-label="Include collection context in AI request"
                  />
                  <span className="space-y-1">
                    <span className="block font-medium">Include source collection</span>
                    <span className="block text-xs leading-5 text-muted-foreground">
                      A compact set of related sources and notes for synthesis, comparison, and gap analysis.
                    </span>
                  </span>
                </label>
              ) : null}
              {reminderContext ? (
                <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-3">
                  <Checkbox
                    checked={includeReminderContext}
                    onCheckedChange={(value) => setIncludeReminderContext(Boolean(value))}
                    aria-label="Include reminder context in AI request"
                  />
                  <span className="space-y-1">
                    <span className="block font-medium">Include reminder context</span>
                    <span className="block text-xs leading-5 text-muted-foreground">
                      Reminder title, missing fields, and cleanup description.
                    </span>
                  </span>
                </label>
              ) : null}
              <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 p-3">
                <Checkbox
                  checked={includeUserMessage}
                  onCheckedChange={(value) => setIncludeUserMessage(Boolean(value))}
                  aria-label="Include follow-up message in AI request"
                />
                <span className="space-y-1">
                  <span className="block font-medium">Include follow-up message</span>
                  <span className="block text-xs leading-5 text-muted-foreground">
                    Sends the optional instruction you type below with this request.
                  </span>
                </span>
              </label>
            </div>
            {showContextPreview ? (
              <div className="mt-4 space-y-2 rounded-2xl border border-border/70 bg-background/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Context that will be sent
                </p>
                {contextPreviewItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No context is currently selected for this request.
                  </p>
                ) : (
                  contextPreviewItems.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {item.value}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
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
