import type { Metadata } from "next";

import { AppFooter } from "@/components/app/app-footer";
import { AppLogo } from "@/components/app/app-logo";
import { getSupportEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service | CiteMate",
  description: "Terms of service for CiteMate.",
};

const sections = [
  {
    title: "Eligibility and Acceptance",
    body: "By using CiteMate, you agree to these Terms and represent that you are legally able to use the service in your jurisdiction. If you use CiteMate on behalf of an organization, you represent that you have authority to bind that organization to these Terms.",
  },
  {
    title: "Accounts",
    body: "You are responsible for activity under your account and for keeping your login information secure. You must provide accurate registration information and promptly update it if it changes. CiteMate may suspend or restrict access to protect the service, investigate abuse, or comply with legal obligations.",
  },
  {
    title: "Acceptable Use",
    body: "You may not use CiteMate to violate the law, infringe intellectual property or privacy rights, interfere with the service, attempt unauthorized access, upload malicious code, or submit content that you do not have the right to use or store.",
  },
  {
    title: "User Content",
    body: "You retain ownership of the content you create or upload. By using the service, you grant CiteMate the limited rights needed to host, store, process, back up, transmit, and display that content solely to operate and improve the service.",
  },
  {
    title: "AI Features and Academic Responsibility",
    body: "AI-generated suggestions are provided for convenience and may be incomplete, outdated, biased, or incorrect. You remain responsible for reviewing citations, summaries, notes, and any academic or professional work before relying on them or submitting them to another person or institution.",
  },
  {
    title: "Service Changes and Availability",
    body: "The service may change, be interrupted, or be discontinued at any time. CiteMate is provided on an as-available and as-is basis, and does not guarantee uninterrupted availability, compatibility with every device, or that the service will always be error free.",
  },
  {
    title: "Termination",
    body: "You may stop using CiteMate at any time. CiteMate may suspend or terminate accounts that violate these Terms, create security risk, or expose the service or other users to harm. Account deletion tools may be provided inside the app or through the documented support channel.",
  },
  {
    title: "Disclaimers and Limitation of Liability",
    body: "To the maximum extent allowed by law, CiteMate disclaims warranties of merchantability, fitness for a particular purpose, non-infringement, and uninterrupted service. CiteMate is not liable for indirect, incidental, special, consequential, or exemplary damages arising from use of the service, including loss of data, academic outcomes, or interruption of access.",
  },
  {
    title: "Governing Law",
    body: "These Terms should identify the governing law and venue chosen by the operator of the deployed service, unless applicable law requires a different approach for certain users or jurisdictions.",
  },
  {
    title: "Changes to These Terms",
    body: "These Terms may be updated over time. Continued use of the service after a revised version takes effect means you accept the updated Terms, except where applicable law requires additional notice or consent.",
  },
];

export default function TermsPage() {
  const supportEmail = getSupportEmail();

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
              Effective March 18, 2026
            </p>
            <h1 className="mt-4 font-serif text-4xl tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              These terms govern use of CiteMate and set expectations for
              accounts, content, AI-assisted features, and the public-facing
              operation of the service.
            </p>
            <div className="mt-6 rounded-3xl border border-border/70 bg-secondary/30 p-5">
              <h2 className="text-lg font-semibold">Operator contact</h2>
              <p className="mt-2 leading-7 text-muted-foreground">
                {supportEmail
                  ? `Questions about these Terms can be sent to ${supportEmail}.`
                  : "Questions about these Terms should be routed through the contact page and the support email configured for the deployed app."}
              </p>
            </div>
            <div className="mt-8 space-y-6">
              {sections.map((section) => (
                <section key={section.title} className="space-y-2">
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  <p className="leading-7 text-muted-foreground">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
            <div className="mt-8 rounded-3xl border border-dashed border-border/80 bg-background p-5">
              <p className="text-sm leading-6 text-muted-foreground">
                This Terms page is a strong product draft, but it is not a
                substitute for legal advice. Before public launch to real users,
                the governing law, business entity details, and any
                jurisdiction-specific consumer terms should be reviewed by
                qualified counsel.
              </p>
            </div>
          </div>
        </article>
        <AppFooter />
      </div>
    </main>
  );
}
