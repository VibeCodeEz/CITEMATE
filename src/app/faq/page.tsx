import Link from "next/link";
import type { Metadata } from "next";

import { AppFooter } from "@/components/app/app-footer";
import { AppLogo } from "@/components/app/app-logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ | CiteMate",
  description: "Frequently asked questions about using CiteMate.",
};

const faqSections = [
  {
    title: "Getting Started",
    description:
      "The basics for new users who want the quickest path from sign up to a usable research workspace.",
    items: [
      {
        question: "What is CiteMate designed to help with?",
        answer:
          "CiteMate is built for students and researchers who want one place to save sources, organize notes, generate citations, and build calmer, more consistent RRL or literature review workflows.",
      },
      {
        question: "What is the best first workflow for a new user?",
        answer:
          "Start small: create one subject, add one source, link one note to that source, and then open the citation generator. Once that feels natural, move on to imports, AI help, version history, and exports.",
      },
      {
        question: "Do I need to fill every field when adding a source?",
        answer:
          "No. Title, authors, source type, and citation style are the most important starting fields. You can add a DOI, URL, abstract, tags, subjects, and files later as your research set grows.",
      },
      {
        question: "Can I import existing references instead of adding them one by one?",
        answer:
          "Yes. CiteMate supports CSV import with column mapping, preview, duplicate warnings, and default source-type and citation-style selections.",
      },
      {
        question: "Can CiteMate help me find literature before I add it?",
        answer:
          "Yes. The Sources area now includes a discovery panel that points users to Google Scholar, Crossref, DOAJ, PubMed, PubMed Central, and OpenAlex so they can find relevant studies before saving them into the workspace.",
      },
    ],
  },
  {
    title: "Sources, Notes, and Search",
    description:
      "How source records, linked notes, search, filtering, and duplicate detection behave inside the app.",
    items: [
      {
        question: "How are sources and notes connected?",
        answer:
          "Each note can stay connected to its source so your summaries, analysis, and writing prep remain anchored to the original reference instead of getting separated into disconnected text fragments.",
      },
      {
        question: "What does the search feature look through?",
        answer:
          "Search can match source titles, authors, abstracts, DOI, URL, tags, subjects, and linked note text. On the notes side, search can also surface results through related source information.",
      },
      {
        question: "How does duplicate detection work?",
        answer:
          "When editing or adding a source, CiteMate warns about matching DOIs, matching URLs, or near-identical titles combined with the same year or overlapping authors. It is a warning, not a hard block, because sometimes similar records are intentionally separate.",
      },
      {
        question: "Can I attach files to a source?",
        answer:
          "Yes. You can attach supported files such as PDFs and keep them tied to the source record so your stored reference, notes, and attachment stay together in the same workspace.",
      },
      {
        question: "Does autosave save directly to the database?",
        answer:
          "No. Autosave stores a local draft on the device you are using. Your real source or note record only changes when you explicitly save.",
      },
      {
        question: "Can I organize sources for a literature review and not just by class subject?",
        answer:
          "Yes. Subjects still provide the main container, but the assistant can now use a subject-level collection of sources and notes to group studies by theme, build a related studies matrix, and draft an RRL structure.",
      },
    ],
  },
  {
    title: "Citations and Formatting",
    description:
      "How citation generation works, what styles are supported, and where manual review still matters.",
    items: [
      {
        question: "Which citation styles are currently supported?",
        answer:
          "CiteMate currently supports APA, MLA, Chicago, Harvard, IEEE, AMA, Vancouver, Turabian, ACS, CSE, OSCOLA, Bluebook, ASA, APSA, and NLM.",
      },
      {
        question: "Does CiteMate replace checking my citations manually?",
        answer:
          "No. CiteMate helps structure your metadata and produce formatted citations faster, but you should still verify source details and any course, department, or journal-specific rules before submission.",
      },
      {
        question: "Why might two styles look similar for some sources?",
        answer:
          "Some styles overlap heavily for common source types, especially in first-pass implementations for general books, journal articles, websites, and reports. The differences become more specific with discipline-specific edge cases.",
      },
      {
        question: "What if a citation style has special rules for certain source types?",
        answer:
          "CiteMate aims to give a strong practical starting point for the supported source types in the app. If your professor, editor, or field uses a specialized rule variation, treat the generated result as a draft to review rather than as the final word.",
      },
    ],
  },
  {
    title: "AI, Privacy, and Safety",
    description:
      "What the assistant sees, how context controls work, and how to think about sensitive research content.",
    items: [
      {
        question: "What does the AI assistant receive when I ask for help?",
        answer:
          "Only the context you choose for that specific request. You can review and turn off source, note, subject, collection, reminder, or follow-up context before sending a prompt.",
      },
      {
        question: "Can I use the AI tools without sharing every note or source?",
        answer:
          "Yes. The per-request controls let you opt out of sending certain context so you can keep the assistant focused only on the material you want included.",
      },
      {
        question: "What RRL tasks can the AI assistant handle now?",
        answer:
          "CiteMate now includes AI actions for literature discovery guidance, RRL note building, theme grouping, related studies matrix drafting, RRL outline generation, and research gap finding. These outputs are suggestions that still need your review.",
      },
      {
        question: "Should I paste sensitive personal or confidential content into the AI assistant?",
        answer:
          "Use judgment. CiteMate includes context controls and privacy-aware monitoring, but you should still avoid sending especially sensitive, confidential, or regulated information unless you are sure it is appropriate for your use case.",
      },
      {
        question: "Does the AI always give correct academic advice?",
        answer:
          "No. AI output can be useful for brainstorming, summarizing, and explaining differences between citation styles, but it can still be incomplete or mistaken. Always verify important claims, quotations, and final references yourself.",
      },
    ],
  },
  {
    title: "Versions, Export, and Account Controls",
    description:
      "How to recover from bad edits, back up your work, and manage account-level actions safely.",
    items: [
      {
        question: "Can I undo edits to notes or sources?",
        answer:
          "Yes. CiteMate keeps saved version history for notes and sources. You can review earlier snapshots and restore a previous version if a recent edit went in the wrong direction.",
      },
      {
        question: "What should I do before deleting my account?",
        answer:
          "Use the workspace export option first. That gives you a user-visible backup of your stored research data before you remove your account.",
      },
      {
        question: "Does the workspace export include everything?",
        answer:
          "The export includes structured workspace data such as sources, notes, subjects, checklist progress, and attachment metadata. If you need full offline copies of uploaded files, download important attachments separately as well.",
      },
      {
        question: "Can I reset my password?",
        answer:
          "Yes. CiteMate includes password recovery and reset flows so users can request a reset link and choose a new password without needing manual support.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    description:
      "Common issues that new users hit and the fastest ways to get unstuck.",
    items: [
      {
        question: "Why is metadata lookup not filling my source fields?",
        answer:
          "Metadata lookup depends on a valid DOI or article URL and on the external metadata source returning usable results. If nothing fills in, check the DOI or URL format and be ready to enter missing details manually.",
      },
      {
        question: "Why does research gap finding feel too general sometimes?",
        answer:
          "Gap finding is only as good as the sources and notes you provide. If the current subject has too few studies, thin notes, or missing abstracts, the assistant will produce broader and more cautious suggestions instead of strong gap claims.",
      },
      {
        question: "Why did my draft disappear on another device?",
        answer:
          "Local autosave drafts stay on the device and browser where they were created. They are meant to prevent accidental loss while editing, not to sync across devices.",
      },
      {
        question: "Why can I see a duplicate warning even when I want to save the source?",
        answer:
          "Duplicate warnings are advisory. They are there to help you catch accidental duplicate entries, but you can still save if the source is intentionally distinct, such as a different edition or a separate record you truly want to keep.",
      },
      {
        question: "Where should I learn the full workflow from beginning to end?",
        answer:
          "The step-by-step tutorial walks through the full process from account setup and subjects to citations, AI help, exports, and settings. Use the tutorial if you want a guided first run.",
      },
    ],
  },
];

export default function FaqPage() {
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
              Help
            </p>
            <h1 className="mt-4 font-serif text-4xl tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              A fuller guide to how CiteMate works, what the AI sees, how
              citations are generated, and how to protect your work as your
              research workspace grows.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/tutorial">Read the step-by-step tutorial</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact support</Link>
              </Button>
            </div>
            <div className="mt-8 space-y-8">
              {faqSections.map((section) => (
                <section key={section.title} className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="font-serif text-3xl tracking-tight">
                      {section.title}
                    </h2>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div
                        key={item.question}
                        className="rounded-[1.5rem] border border-border/70 bg-secondary/20 p-5"
                      >
                        <h3 className="text-xl font-semibold">{item.question}</h3>
                        <p className="mt-2 leading-7 text-muted-foreground">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </article>
        <AppFooter />
      </div>
    </main>
  );
}
