import { AlertTriangle, BookOpenText, NotebookPen, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type {
  AssistantNoteContext,
  AssistantReminderContext,
  AssistantSourceContext,
} from "@/lib/ai/types";

type AssistantContextSummaryProps = {
  sourceContext?: AssistantSourceContext;
  noteContext?: AssistantNoteContext;
  reminderContext?: AssistantReminderContext;
};

export function AssistantContextSummary({
  sourceContext,
  noteContext,
  reminderContext,
}: AssistantContextSummaryProps) {
  if (!sourceContext && !noteContext && !reminderContext) {
    return null;
  }

  return (
    <Card className="border-border/70 bg-secondary/20">
      <CardContent className="space-y-3 py-4">
        {sourceContext ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpenText className="size-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Current source
              </p>
            </div>
            <p className="font-medium leading-6">{sourceContext.title}</p>
            <div className="flex flex-wrap gap-2">
              {sourceContext.subjectLabels.slice(0, 3).map((label) => (
                <Badge key={label} variant="secondary" className="rounded-full">
                  {label}
                </Badge>
              ))}
              {sourceContext.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full">
                  <Tags className="mr-1 size-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
        {noteContext ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <NotebookPen className="size-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Current note
              </p>
            </div>
            <p className="font-medium leading-6">{noteContext.title}</p>
          </div>
        ) : null}
        {reminderContext ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Current reminder
              </p>
            </div>
            <p className="font-medium leading-6">{reminderContext.title}</p>
            <div className="flex flex-wrap gap-2">
              {reminderContext.missingFields.map((field) => (
                <Badge key={field} variant="outline" className="rounded-full">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
