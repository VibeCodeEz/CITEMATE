import type { Metadata } from "next";

import { AppFooter } from "@/components/app/app-footer";
import { AppLogo } from "@/components/app/app-logo";
import { getSupportEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact | CiteMate",
  description: "Contact and support information for CiteMate.",
};

export default function ContactPage() {
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
              Support and legal requests
            </p>
            <h1 className="mt-4 font-serif text-4xl tracking-tight">
              Contact CiteMate
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Use this page for product support, privacy questions, and account
              or data deletion requests.
            </p>
            <div className="mt-8 rounded-3xl border border-border/70 bg-secondary/30 p-5">
              <h2 className="text-lg font-semibold">Support Email</h2>
              {supportEmail ? (
                <p className="mt-2 leading-7 text-muted-foreground">
                  Email{" "}
                  <a
                    href={`mailto:${supportEmail}`}
                    className="font-medium text-foreground underline decoration-border underline-offset-4"
                  >
                    {supportEmail}
                  </a>{" "}
                  for account support, privacy requests, or help using the app.
                </p>
              ) : (
                <p className="mt-2 leading-7 text-muted-foreground">
                  A dedicated support inbox will be available soon. In the
                  meantime, this contact channel is being prepared so help,
                  privacy requests, and account questions have a clearer home.
                </p>
              )}
            </div>
            <div className="mt-6 space-y-4">
              <section className="space-y-2">
                <h2 className="text-xl font-semibold">What to include</h2>
                <p className="leading-7 text-muted-foreground">
                  Include your account email, a short description of the issue,
                  and any source or note details that help reproduce the
                  problem. For deletion requests, clearly state that you want
                  your account and stored data removed.
                </p>
              </section>
              <section className="space-y-2">
                <h2 className="text-xl font-semibold">Response expectations</h2>
                <p className="leading-7 text-muted-foreground">
                  Support and legal response times depend on the team operating
                  the deployed app. If this page is being used in production,
                  keep the published email monitored.
                </p>
              </section>
              <section className="space-y-2">
                <h2 className="text-xl font-semibold">Accessibility requests</h2>
                <p className="leading-7 text-muted-foreground">
                  If a screen reader, keyboard-only workflow, contrast setting,
                  or another accessibility need makes the product difficult to
                  use, report it here so the issue can be prioritized and fixed.
                </p>
              </section>
            </div>
          </div>
        </article>
        <AppFooter />
      </div>
    </main>
  );
}
