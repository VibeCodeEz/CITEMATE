"use client";

import { useMemo, useState } from "react";

import { ResearchAssistantPanel } from "@/components/ai/research-assistant-panel";
import { NeedsAttentionBoard } from "@/components/app/needs-attention-board";
import { Button } from "@/components/ui/button";
import {
  mapReminderToAssistantContext,
  mapSourceToAssistantContext,
} from "@/lib/ai/context";
import type { AssistantTaskType } from "@/lib/ai/types";
import type { SourceReminder } from "@/lib/reminders/source-reminders";
import type { SourceWithRelations } from "@/types/app";

type RemindersAssistantWorkspaceProps = {
  reminders: SourceReminder[];
  sources: SourceWithRelations[];
};

const reminderTasks: AssistantTaskType[] = [
  "resolve_reminder",
  "suggest_missing_metadata",
  "explain_citation",
];

export function RemindersAssistantWorkspace({
  reminders,
  sources,
}: RemindersAssistantWorkspaceProps) {
  const [selectedReminderId, setSelectedReminderId] = useState(reminders[0]?.id ?? null);
  const selectedReminder =
    reminders.find((reminder) => reminder.id === selectedReminderId) ??
    reminders[0] ??
    null;
  const selectedSource =
    sources.find((source) => source.id === selectedReminder?.sourceId) ?? null;

  const reminderContext = useMemo(
    () =>
      selectedReminder ? mapReminderToAssistantContext(selectedReminder) : undefined,
    [selectedReminder],
  );
  const sourceContext = useMemo(
    () => (selectedSource ? mapSourceToAssistantContext(selectedSource) : undefined),
    [selectedSource],
  );

  return (
    <section className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Assistant focus
          </p>
          <div className="flex flex-wrap gap-2">
            {reminders.slice(0, 8).map((reminder) => (
              <Button
                key={reminder.id}
                type="button"
                size="sm"
                variant={reminder.id === selectedReminder?.id ? "default" : "outline"}
                onClick={() => setSelectedReminderId(reminder.id)}
              >
                {reminder.title}
              </Button>
            ))}
          </div>
        </div>
        <ResearchAssistantPanel
          tasks={reminderTasks}
          sourceContext={sourceContext}
          reminderContext={reminderContext}
          draftLabel="Reminder fix draft"
          description="Use the current reminder to understand what is missing and what to fill in next. Suggestions never update the source automatically."
        />
      </div>
      <NeedsAttentionBoard reminders={reminders} />
    </section>
  );
}
