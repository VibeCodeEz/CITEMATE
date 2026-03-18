import type { Metadata } from "next";

import { AppFooter } from "@/components/app/app-footer";
import { AppLogo } from "@/components/app/app-logo";

export const metadata: Metadata = {
  title: "FAQ | CiteMate",
  description: "Frequently asked questions about using CiteMate.",
};

const faqItems = [
  {
    question: "How should I start using CiteMate?",
    answer:
      "Start by creating one subject, saving one source, and writing one note linked to that source. Once that flow feels comfortable, use filters, exports, reminders, and the checklist.",
  },
  {
    question: "Does CiteMate replace checking my citations manually?",
    answer:
      "No. CiteMate helps you organize details and format citations, but you should still verify source information and your institution's requirements before submitting work.",
  },
  {
    question: "What does the AI assistant receive?",
    answer:
      "Only the context you choose for that request. You can now review and turn off source, note, subject, reminder, or follow-up context before sending.",
  },
  {
    question: "Can I undo edits to notes or sources?",
    answer:
      "Yes. Saved versions are kept for notes and sources, and you can restore an earlier version from the details or note card history controls.",
  },
  {
    question: "Does autosave publish changes immediately?",
    answer:
      "No. Autosave stores a local draft on the device you are using. Your real source or note is only updated when you explicitly save.",
  },
  {
    question: "How does duplicate detection work?",
    answer:
      "When you edit a source, CiteMate warns about matching DOIs, matching URLs, or near-identical titles with the same year or overlapping authors. It is a warning, not a hard block.",
  },
];

export default function FaqPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.14),_transparent_38%),linear-gradient(180deg,#fcfaf3_0%,#f3efe4_100%)] text-foreground"
    >
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8">
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
              Quick answers for getting started, understanding AI controls,
              restoring versions, and avoiding duplicate entries.
            </p>
            <div className="mt-8 space-y-4">
              {faqItems.map((item) => (
                <section
                  key={item.question}
                  className="rounded-[1.5rem] border border-border/70 bg-secondary/20 p-5"
                >
                  <h2 className="text-xl font-semibold">{item.question}</h2>
                  <p className="mt-2 leading-7 text-muted-foreground">
                    {item.answer}
                  </p>
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
