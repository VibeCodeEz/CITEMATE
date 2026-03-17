"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CheckCircle2,
  CircleDashed,
  FileCheck2,
  SearchCheck,
} from "lucide-react";
import { toast } from "sonner";

import { updateChecklistProgressAction } from "@/actions/checklist";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChecklistItemWithProgress } from "@/types/app";

type ChecklistBoardProps = {
  items: ChecklistItemWithProgress[];
};

function formatTimestamp(value: string | null) {
  if (!value) return "Not saved yet";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ChecklistBoard({ items }: ChecklistBoardProps) {
  const [list, setList] = useState(items);
  const [pending, startTransition] = useTransition();

  const summary = useMemo(() => {
    const completed = list.filter((item) => item.completed).length;
    const total = list.length;
    const remaining = Math.max(total - completed, 0);
    const completion = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      completed,
      total,
      remaining,
      completion,
    };
  }, [list]);

  if (list.length === 0) {
    return (
      <Card className="border-dashed border-border/80 bg-card/80">
        <CardContent className="space-y-3 py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Checklist unavailable
          </p>
          <h2 className="font-serif text-3xl tracking-tight">
            No checklist items are loaded yet
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Run the latest Supabase schema or seed script so the academic writing
            checklist items are inserted into your database.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary/60">
                <FileCheck2 className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Final review
                </p>
                <CardTitle className="font-serif text-3xl tracking-tight">
                  {summary.completion}% complete
                </CardTitle>
              </div>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Treat this as your last pass before submission: citations, quotations, paraphrases, and originality checks in one place.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-3 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${summary.completion}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full">
                {summary.completed} of {summary.total} done
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {summary.remaining} remaining
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="space-y-3 py-6">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary/60">
              <CheckCircle2 className="size-5 text-primary" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Completed
            </p>
            <p className="font-serif text-5xl tracking-tight">{summary.completed}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="space-y-3 py-6">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary/60">
              <CircleDashed className="size-5 text-primary" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Still to review
            </p>
            <p className="font-serif text-5xl tracking-tight">{summary.remaining}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary/60">
              <SearchCheck className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="font-serif text-3xl tracking-tight">
                Academic writing checklist
              </CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                Check items as you verify them. Progress is saved to your account immediately.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {list.map((item, index) => (
            <div
              key={item.id}
              className="rounded-[1.75rem] border border-border/80 bg-secondary/20 p-4 sm:p-5"
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={item.completed}
                  disabled={pending}
                  aria-label={item.label}
                  onCheckedChange={(checked) => {
                    const nextCompleted = Boolean(checked);
                    const previous = item.completed;
                    const previousUpdatedAt = item.progress_updated_at;

                    setList((current) =>
                      current.map((currentItem) =>
                        currentItem.id === item.id
                          ? {
                              ...currentItem,
                              completed: nextCompleted,
                              progress_updated_at: new Date().toISOString(),
                            }
                          : currentItem,
                      ),
                    );

                    startTransition(async () => {
                      const result = await updateChecklistProgressAction(
                        item.id,
                        nextCompleted,
                      );

                      if (!result.success) {
                        setList((current) =>
                          current.map((currentItem) =>
                            currentItem.id === item.id
                              ? {
                                  ...currentItem,
                                  completed: previous,
                                  progress_updated_at: previousUpdatedAt,
                                }
                              : currentItem,
                          ),
                        );
                        toast.error(result.message);
                      }
                    });
                  }}
                />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full">
                          Step {index + 1}
                        </Badge>
                        <Badge
                          variant={item.completed ? "secondary" : "outline"}
                          className="rounded-full"
                        >
                          {item.completed ? "Checked" : "Open"}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold leading-7">
                        {item.label}
                      </h3>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {formatTimestamp(item.progress_updated_at)}
                    </p>
                  </div>
                  <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
