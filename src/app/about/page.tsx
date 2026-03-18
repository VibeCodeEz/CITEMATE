import type { Metadata } from "next";
import Link from "next/link";
import {
  BookText,
  FolderOpenDot,
  NotebookTabs,
  ShieldCheck,
} from "lucide-react";

import { AppFooter } from "@/components/app/app-footer";
import { AppLogo } from "@/components/app/app-logo";

export const metadata: Metadata = {
  title: "About | CiteMate",
  description:
    "Learn what CiteMate is, who it is for, and how it supports student research workflows.",
};

const pillars = [
  {
    title: "Save sources clearly",
    description:
      "Keep citations, metadata, links, tags, and optional attachments together so research does not get scattered across tabs and documents.",
    icon: BookText,
  },
  {
    title: "Organize by subject",
    description:
      "Separate coursework, projects, and themes into focused spaces that are easier to review when deadlines get close.",
    icon: FolderOpenDot,
  },
  {
    title: "Write linked notes",
    description:
      "Connect your reading notes to the source they came from so it is easier to trace claims, quotes, and ideas later.",
    icon: NotebookTabs,
  },
  {
    title: "Build literature reviews",
    description:
      "Use subject-level AI help to discover literature, cluster studies by theme, draft RRL outlines, compare related studies, and surface possible research gaps.",
    icon: ShieldCheck,
  },
  {
    title: "Review before submission",
    description:
      "Use reminders and the built-in checklist to catch incomplete details before turning in a paper or draft.",
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.14),_transparent_38%),linear-gradient(180deg,#fcfaf3_0%,#f3efe4_100%)] text-foreground"
    >
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-border/70 bg-background/85 px-5 py-5 shadow-lg shadow-teal-950/5 backdrop-blur">
          <AppLogo />
        </header>
        <article className="flex-1 py-10">
          <div className="rounded-[2rem] border border-border/70 bg-background/90 p-6 shadow-xl shadow-teal-950/5 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-muted-foreground">
              Product overview
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">
              CiteMate is a research workspace built to help students stay
              organized from first source to final citation.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              The app brings source tracking, note taking, citation generation,
              checklist review, research reminders, and literature review
              support into one calm workflow. It is designed for students who
              want structure without adding more friction to the writing
              process.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;

                return (
                  <section
                    key={pillar.title}
                    className="rounded-3xl border border-border/70 bg-secondary/30 p-5"
                  >
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-background shadow-sm">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold">
                      {pillar.title}
                    </h2>
                    <p className="mt-2 leading-7 text-muted-foreground">
                      {pillar.description}
                    </p>
                  </section>
                );
              })}
            </div>
            <div className="mt-8 grid gap-6 rounded-[1.75rem] bg-[linear-gradient(135deg,#115e59,#0f766e)] p-6 text-primary-foreground sm:grid-cols-2">
              <section>
                <h2 className="text-xl font-semibold">Who it is for</h2>
                <p className="mt-2 leading-7 text-white/80">
                  CiteMate is aimed at college students and academic writers who
                  need a simpler way to manage sources, notes, citation
                  details, and RRL writing while working across multiple
                  assignments or topics.
                </p>
              </section>
              <section>
                <h2 className="text-xl font-semibold">What makes it useful</h2>
                <p className="mt-2 leading-7 text-white/80">
                  Instead of treating citations, notes, and reminders as
                  separate tasks, CiteMate keeps them connected so your workflow
                  stays easier to review, synthesize, and manage near
                  submission.
                </p>
              </section>
            </div>
            <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-border/70 bg-background p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Start exploring</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Create an account to open the full dashboard, or review the
                  legal and support pages before launch.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/auth/sign-up"
                  className="rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Create account
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-border px-5 py-2.5 font-medium transition-colors hover:bg-secondary"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        </article>
        <AppFooter />
      </div>
    </main>
  );
}
