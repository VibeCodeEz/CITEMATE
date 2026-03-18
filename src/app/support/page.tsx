import type { Metadata } from "next";
import Image from "next/image";

import { AppFooter } from "@/components/app/app-footer";
import { AppLogo } from "@/components/app/app-logo";

export const metadata: Metadata = {
  title: "Support CiteMate | CiteMate",
  description: "Optional donation page for supporting CiteMate development.",
};

export default function SupportPage() {
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
              Support the project
            </p>
            <h1 className="mt-4 font-serif text-4xl tracking-tight">
              Support CiteMate
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              If CiteMate helps with your research workflow, citations, or RRL
              writing, you can support the project with an optional donation.
              Donations help with hosting, maintenance, and future improvements.
            </p>

            <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-[1.75rem] border border-border/70 bg-secondary/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Donation details
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium">GCash number</p>
                    <p className="mt-1 font-serif text-3xl tracking-tight">
                      09937041995
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment method</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      GCash via mobile number or QR scan
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/80 bg-background/80 p-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                      Donations are optional and do not unlock premium academic
                      features. CiteMate remains usable without donating.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Scan to donate
                </p>
                <div className="mt-4 flex flex-col items-center gap-4">
                  <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-white p-3 shadow-sm">
                    <Image
                      src="/img/Gcash QR .png"
                      alt="GCash donation QR code for CiteMate support"
                      width={320}
                      height={520}
                      className="h-auto w-full max-w-[18rem]"
                      priority
                    />
                  </div>
                  <p className="max-w-md text-center text-sm leading-6 text-muted-foreground">
                    Use the QR code above or the listed GCash number if you want
                    to support the project directly.
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-8 rounded-3xl border border-dashed border-border/80 bg-background p-5">
              <p className="text-sm leading-6 text-muted-foreground">
                Thank you for supporting an independent student-friendly
                research tool. Every contribution helps keep development moving.
              </p>
            </div>
          </div>
        </article>
        <AppFooter />
      </div>
    </main>
  );
}
