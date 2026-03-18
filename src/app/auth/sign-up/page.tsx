import { redirect } from "next/navigation";

import { AppLogo } from "@/components/app/app-logo";
import { AuthForm } from "@/components/app/auth-form";
import { normalizeNextPath } from "@/lib/auth-redirect";
import { getCurrentUser } from "@/lib/auth";

type SignUpPageProps = {
  searchParams: Promise<{
    next?: string;
    notice?: string;
    error?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[linear-gradient(180deg,#fcfaf3_0%,#f3efe4_100%)] px-4 py-8 sm:px-6"
    >
      <div className="mx-auto flex min-h-screen max-w-5xl items-center gap-8 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
        <div className="hidden space-y-6 lg:block">
          <AppLogo />
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Get started
            </p>
            <h1 className="font-serif text-4xl leading-[0.95] tracking-tight xl:text-6xl">
              Build a research system that actually keeps up with college
              writing.
            </h1>
            <p className="max-w-xl text-base leading-8 text-muted-foreground">
              Create an account to save references, generate citations, store
              notes, and keep your submission checklist on track.
            </p>
          </div>
        </div>
        <AuthForm
          mode="sign-up"
          nextPath={normalizeNextPath(params.next)}
          notice={params.notice}
          error={params.error}
        />
      </div>
    </main>
  );
}
