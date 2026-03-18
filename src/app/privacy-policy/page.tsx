import type { Metadata } from "next";

import { AppFooter } from "@/components/app/app-footer";
import { AppLogo } from "@/components/app/app-logo";
import { getSupportEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | CiteMate",
  description: "Privacy policy for CiteMate.",
};

const sections = [
  {
    title: "Who This Policy Covers",
    body: "This Privacy Policy applies to CiteMate's website, dashboard, and related services that let users create accounts, store research content, upload source files, and use AI-assisted research features.",
  },
  {
    title: "Information We Collect",
    body: "CiteMate may collect account information such as name and email address, workspace content such as sources, notes, subjects, checklist progress, reminder dismissals, and optional file attachments, and limited technical information such as authentication session data, request metadata, device or browser details, and diagnostic events needed to secure and operate the service.",
  },
  {
    title: "How We Use Information",
    body: "We use personal information to create and maintain accounts, provide the research workspace, generate citations, store notes and attachments, support password recovery and account deletion, protect the service from misuse, troubleshoot errors, and improve reliability. If you use AI-assisted features, only the information needed to respond to that request should be sent to the configured model provider.",
  },
  {
    title: "Cookies and Similar Technologies",
    body: "CiteMate uses cookies and similar session technologies that are needed to keep users signed in, protect authenticated routes, and support secure account access through Supabase and Next.js server-side session handling. These cookies are generally used for essential service operation rather than advertising. CiteMate may also use browser storage features such as local storage for device-specific drafting helpers like unsaved note drafts or saved note templates. Users can control cookies through browser settings, but blocking essential cookies may prevent sign-in or other core features from working correctly.",
  },
  {
    title: "Service Providers and Sharing",
    body: "CiteMate does not sell personal information. Information may be processed by service providers that support hosting, authentication, database and file storage, analytics or error monitoring, email delivery, and AI functionality, but only as needed to operate the service, comply with law, enforce the Terms, or protect users and the product.",
  },
  {
    title: "Retention",
    body: "We retain account and workspace information for as long as the account remains active, unless a longer period is required by law, security needs, or dispute resolution. When an account is deleted, CiteMate should remove the associated user-owned workspace data and stored attachments, subject to technical backup and recovery windows.",
  },
  {
    title: "Your Choices and Rights",
    body: "You may access, update, export, or delete content in your workspace through the app where those tools are available. You may also request account or data deletion through the contact path provided by CiteMate. Depending on where you live, you may have additional privacy rights under applicable law.",
  },
  {
    title: "Security",
    body: "CiteMate uses measures intended to reduce unauthorized access, including authenticated sessions, row-level security, controlled storage access, and signed file access where applicable. No method of transmission or storage is perfectly secure, so absolute security cannot be guaranteed.",
  },
  {
    title: "Children",
    body: "CiteMate is intended for users who are at least old enough to use the service lawfully in their jurisdiction. It is not designed for young children, and the service should not knowingly collect personal information from children in violation of applicable law.",
  },
  {
    title: "Changes to This Policy",
    body: "This policy may be updated as the product changes. When changes are material, the effective date on this page should be updated and reasonable notice should be provided where required by law.",
  },
];

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              This page explains what CiteMate collects, how it is used, and
              what choices users have when creating an account and storing
              research content in the app.
            </p>
            <div className="mt-6 rounded-3xl border border-border/70 bg-secondary/30 p-5">
              <h2 className="text-lg font-semibold">Questions about privacy</h2>
              <p className="mt-2 leading-7 text-muted-foreground">
                {supportEmail
                  ? `Privacy requests and questions can be sent to ${supportEmail}.`
                  : "Privacy requests and questions should be routed through the contact page and the support email configured for the deployed app."}
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
                This document is a product-level policy draft, not legal advice.
                If CiteMate will be used by real users outside a class, demo, or
                internal test, it should be reviewed by qualified counsel for the
                jurisdictions where it will operate.
              </p>
            </div>
          </div>
        </article>
        <AppFooter />
      </div>
    </main>
  );
}
