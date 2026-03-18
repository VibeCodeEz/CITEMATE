import Link from "next/link";
import type { Metadata } from "next";

import { AppFooter } from "@/components/app/app-footer";
import { AppLogo } from "@/components/app/app-logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tutorial | CiteMate",
  description: "A step-by-step guide to using CiteMate from setup to export.",
};

const steps = [
  {
    step: "1. Create your account and open the dashboard",
    detail:
      "Sign up, confirm your account if needed, and enter the dashboard. This is your main workspace for sources, notes, subjects, settings, and guided onboarding.",
  },
  {
    step: "2. Create a subject for your class, project, or topic",
    detail:
      "Subjects help you organize research by course, paper, or theme. Even one well-named subject makes filtering and browsing much easier later.",
  },
  {
    step: "3. Add your first source manually or import a CSV",
    detail:
      "Use Add source for individual entries or Import CSV if you already have a spreadsheet. Fill the important basics first: title, authors, source type, and preferred citation style.",
  },
  {
    step: "4. Use the source discovery panel when you still need papers",
    detail:
      "If you are still collecting literature, open the source discovery panel in the Sources area and use tools like Google Scholar, DOAJ, PubMed, PubMed Central, OpenAlex, and Crossref to find relevant studies before adding them.",
  },
  {
    step: "5. Use DOI or URL metadata lookup when available",
    detail:
      "If you have a DOI or article URL, try metadata lookup to fill citation fields faster. Review the returned values before saving, especially author order and publication details.",
  },
  {
    step: "6. Attach files and add tags, abstract, and subject links",
    detail:
      "Add PDFs or other supported files, assign tags for quick recall, and connect the source to one or more subjects so the library stays organized as it grows.",
  },
  {
    step: "7. Review duplicate warnings before saving",
    detail:
      "If CiteMate warns about a matching DOI, URL, or very similar title, pause and confirm whether you are about to create an accidental duplicate or an intentionally separate record.",
  },
  {
    step: "8. Generate and compare citation styles",
    detail:
      "Open the citation preview or generator to compare styles like APA, MLA, Chicago, Harvard, IEEE, AMA, Vancouver, Turabian, ACS, CSE, OSCOLA, Bluebook, ASA, APSA, and NLM. Treat the result as a strong draft and still verify any required edge-case rules.",
  },
  {
    step: "9. Write linked notes while the source is fresh",
    detail:
      "Create notes tied to the source so your summary, argument ideas, quotations, and synthesis stay connected to the reference instead of drifting into disconnected documents.",
  },
  {
    step: "10. Use the AI assistant for RRL work",
    detail:
      "From a source, note, or subject, run AI actions like Find literature, Build RRL note, Group by theme, Build studies matrix, Generate RRL outline, and Find research gaps. Treat the output as a guided draft and verify it against your saved materials.",
  },
  {
    step: "11. Use search and filters to find material quickly",
    detail:
      "Search across titles, authors, abstracts, tags, subjects, URLs, DOIs, and linked note content. Filter by subject, source type, year, citation style, and tags when your library gets larger.",
  },
  {
    step: "12. Use AI carefully with the context controls",
    detail:
      "Before sending an AI request, review exactly which source, note, subject, collection, reminder, or follow-up context will be included. Turn off anything you do not want to share for that request.",
  },
  {
    step: "13. Restore an earlier version if an edit goes wrong",
    detail:
      "If you overwrite a source or note in a way you regret, open the saved version history and restore an earlier snapshot instead of rebuilding everything from memory.",
  },
  {
    step: "14. Export your workspace before major changes or deletion",
    detail:
      "Use the workspace export in settings when you want a backup of your structured research data. If you rely on uploaded files, download important attachments separately too.",
  },
  {
    step: "15. Manage password reset, support, and account deletion from settings",
    detail:
      "CiteMate includes password recovery, settings-based account controls, and deletion tools. Before deleting an account, export first so you keep a copy of what matters.",
  },
];

const quickTips = [
  "Start with one subject, one source, and one linked note before trying every feature.",
  "Use metadata lookup to save time, but always check the imported details.",
  "Use subject-level AI tools for synthesis, but verify every gap claim against your sources.",
  "Treat duplicate warnings as a moment to review, not as an error.",
  "Use AI as a helper, not as your final authority.",
  "Export before major cleanup or account deletion.",
];

export default function TutorialPage() {
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
              Tutorial
            </p>
            <h1 className="mt-4 font-serif text-4xl tracking-tight">
              How to Use CiteMate Step by Step
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              This guide walks through a complete first-run workflow so a new
              user can move from account setup to a clean, searchable, backed-up
              research workspace.
            </p>
            <div className="mt-6 rounded-[1.5rem] border border-border/70 bg-secondary/20 p-5">
              <h2 className="text-xl font-semibold">Quick start mindset</h2>
              <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                {quickTips.map((tip) => (
                  <p key={tip}>{tip}</p>
                ))}
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {steps.map((item) => (
                <section
                  key={item.step}
                  className="rounded-[1.5rem] border border-border/70 bg-background/70 p-5"
                >
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {item.step}
                  </h2>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    {item.detail}
                  </p>
                </section>
              ))}
            </div>
            <div className="mt-8 rounded-[1.5rem] border border-border/70 bg-secondary/20 p-5">
              <h2 className="text-xl font-semibold">Where to go next</h2>
              <p className="mt-2 leading-7 text-muted-foreground">
                Once the core workflow feels comfortable, use the FAQ for deeper
                answers about AI controls, version history, exports, duplicate
                detection, supported citation styles, and troubleshooting.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/faq">Open the FAQ</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">Visit contact page</Link>
                </Button>
              </div>
            </div>
          </div>
        </article>
        <AppFooter />
      </div>
    </main>
  );
}
