import Link from "next/link";
import {
  ArrowRight,
  BookText,
  FolderOpenDot,
  NotebookTabs,
  ShieldCheck,
} from "lucide-react";

import { AppLogo } from "@/components/app/app-logo";
import { AppFooter } from "@/components/app/app-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

const highlights = [
  {
    title: "Save sources once",
    description:
      "Track titles, authors, abstracts, links, tags, styles, and optional file attachments in one structured workspace.",
    icon: BookText,
  },
  {
    title: "Organize by subject",
    description:
      "Create reusable subjects for courses, projects, or themes, then filter fast when deadlines are close.",
    icon: FolderOpenDot,
  },
  {
    title: "Write smarter notes",
    description:
      "Capture multiline article notes per source and keep your synthesis connected to the original citation.",
    icon: NotebookTabs,
  },
  {
    title: "Review with confidence",
    description:
      "Use the built-in plagiarism checklist before turning in a paper or submitting a draft.",
    icon: ShieldCheck,
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_36%),linear-gradient(180deg,#fcfaf3_0%,#f3efe4_100%)] text-foreground"
    >
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-background/85 px-4 py-4 shadow-lg shadow-teal-950/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <AppLogo />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button variant="outline" asChild>
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                {user ? "Go to dashboard" : "Get started"}
              </Link>
            </Button>
          </div>
        </header>
        <section className="grid flex-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Citation workflow for real student research
              </p>
              <h1 className="max-w-4xl text-balance font-serif text-4xl leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
                Keep every source, note, and citation in a workspace that feels calm under pressure.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                CiteMate helps you save academic sources, generate APA 7, MLA 9,
                and Chicago citations, track notes, and run a final
                plagiarism-ready review before submission.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Button size="lg" asChild>
                <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                  {user ? "Open dashboard" : "Create free workspace"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/sign-in">Use existing account</Link>
              </Button>
            </div>
          </div>
          <Card className="border-border/70 bg-background/90 shadow-2xl shadow-teal-950/10">
            <CardContent className="space-y-6 p-6">
              <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,#115e59,#0f766e)] p-6 text-primary-foreground">
                <p className="text-sm uppercase tracking-[0.24em] text-white/70">
                  Dashboard snapshot
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                      Workspace
                    </p>
                    <p className="mt-2 font-serif text-2xl">Source library</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                      Writing
                    </p>
                    <p className="mt-2 font-serif text-2xl">Linked notes</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                      Final pass
                    </p>
                    <p className="mt-2 font-serif text-2xl">Checklist ready</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {highlights.map((highlight) => {
                  const Icon = highlight.icon;

                  return (
                    <div
                      key={highlight.title}
                      className="flex items-start gap-4 rounded-2xl border border-border/70 bg-secondary/30 p-4"
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background shadow-sm">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="font-semibold">{highlight.title}</h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
        <AppFooter />
      </div>
    </main>
  );
}
