import Link from "next/link";
import { BookMarked, CircleHelp, GraduationCap, NotebookPen, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OnboardingGuideCardProps = {
  stats: {
    sources: number;
    notes: number;
    subjects: number;
    checklistCompletion: number;
  };
};

export function OnboardingGuideCard({ stats }: OnboardingGuideCardProps) {
  const checklistItems = [
    {
      label: "Create your first source",
      done: stats.sources > 0,
      href: "/dashboard/sources",
    },
    {
      label: "Group work into a subject",
      done: stats.subjects > 0,
      href: "/dashboard/subjects",
    },
    {
      label: "Write at least one note",
      done: stats.notes > 0,
      href: "/dashboard/notes",
    },
    {
      label: "Review the final RRL checklist",
      done: stats.checklistCompletion > 0,
      href: "/dashboard/checklist",
    },
  ];

  const completedCount = checklistItems.filter((item) => item.done).length;

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            First-run guide
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {completedCount} of {checklistItems.length} complete
          </Badge>
        </div>
        <CardTitle className="font-serif text-3xl tracking-tight">
          Learn the workflow without guessing what comes next.
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2">
          {checklistItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-[1.5rem] border border-border/80 bg-secondary/25 p-4 transition-colors hover:bg-secondary/40"
              title={item.done ? "Completed step" : "Open this step"}
            >
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.done ? "Done" : "Open step"}
              </p>
            </Link>
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-border/80 bg-background/80 p-5">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Sample workflow
              </p>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                Example: create a subject like <span className="font-medium text-foreground">History 201</span>,
                save a source with title, authors, and DOI, then add one note with a quote and your own takeaway.
              </p>
              <p>
                Once that is in place, open the citation preview, use the assistant for RRL drafting if needed,
                and finish with the RRL and originality checklist before submission.
              </p>
            </div>
          </div>
          <div className="rounded-[1.75rem] border border-border/80 bg-secondary/25 p-5">
            <div className="flex items-center gap-2">
              <CircleHelp className="size-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Need help?
              </p>
            </div>
            <div className="mt-4 space-y-3">
              <Button variant="outline" asChild className="w-full justify-between">
                <Link href="/faq" title="Open frequently asked questions">
                  Open FAQ
                  <Sparkles className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-between">
                <Link href="/about" title="Learn what CiteMate is for">
                  About CiteMate
                  <BookMarked className="size-4" />
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full justify-between">
                <Link href="/contact" title="Contact support or ask for help">
                  Contact support
                  <NotebookPen className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
