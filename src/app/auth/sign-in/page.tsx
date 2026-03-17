import { redirect } from "next/navigation";

import { AppLogo } from "@/components/app/app-logo";
import { AuthForm } from "@/components/app/auth-form";
import { normalizeNextPath } from "@/lib/auth-redirect";
import { getCurrentUser } from "@/lib/auth";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
    notice?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fcfaf3_0%,#f3efe4_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center gap-10 lg:grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden space-y-6 lg:block">
          <AppLogo />
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Sign in
            </p>
            <h1 className="font-serif text-6xl leading-[0.95] tracking-tight">
              Pick up your research exactly where you left it.
            </h1>
            <p className="max-w-xl text-base leading-8 text-muted-foreground">
              Open your saved sources, citation styles, notes, and checklist
              progress from one secure workspace.
            </p>
          </div>
        </div>
        <AuthForm
          mode="sign-in"
          nextPath={normalizeNextPath(params.next)}
          error={params.error}
          notice={params.notice}
        />
      </div>
    </main>
  );
}
