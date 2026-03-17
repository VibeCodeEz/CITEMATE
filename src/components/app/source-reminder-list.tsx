"use client";

import Link from "next/link";
import { useTransition } from "react";
import { AlertTriangle, ArrowRight, BookOpenText, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { dismissSourceReminderAction } from "@/actions/reminders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SourceReminder } from "@/lib/reminders/source-reminders";

type SourceReminderListProps = {
  reminders: SourceReminder[];
  compact?: boolean;
};

export function SourceReminderList({
  reminders,
  compact = false,
}: SourceReminderListProps) {
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {reminders.map((reminder) => (
        <SourceReminderCard key={reminder.id} reminder={reminder} compact={compact} />
      ))}
    </div>
  );
}

function SourceReminderCard({
  reminder,
  compact,
}: {
  reminder: SourceReminder;
  compact: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Card className="border-border/70 bg-card/90">
      <CardContent className={compact ? "space-y-4 py-4" : "space-y-4 py-5"}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full">
                <AlertTriangle className="mr-1 size-3.5" />
                Needs attention
              </Badge>
              <Badge variant="secondary" className="rounded-full capitalize">
                {reminder.sourceType.replaceAll("_", " ")}
              </Badge>
              {reminder.subjectLabels.slice(0, 2).map((label) => (
                <Badge key={label} variant="secondary" className="rounded-full">
                  {label}
                </Badge>
              ))}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {reminder.title}
              </p>
              <h3
                className={
                  compact
                    ? "break-words font-semibold leading-6"
                    : "break-words font-serif text-2xl tracking-tight"
                }
              >
                {reminder.sourceTitle}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {reminder.description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/sources/${reminder.sourceId}`}>
                Open source
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await dismissSourceReminderAction(
                    reminder.sourceId,
                    reminder.key,
                    reminder.sourceUpdatedAt,
                  );

                  if (!result.success) {
                    toast.error(result.message);
                    return;
                  }

                  toast.success(result.message);
                });
              }}
            >
              {pending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <BookOpenText className="size-4" />
              )}
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
