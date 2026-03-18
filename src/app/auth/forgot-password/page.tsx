import Link from "next/link";
import type { Metadata } from "next";

import { AppLogo } from "@/components/app/app-logo";
import { PasswordResetRequestForm } from "@/components/app/password-reset-request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Forgot Password | CiteMate",
  description: "Request a password reset email for your CiteMate account.",
};

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;

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
              Password recovery
            </p>
            <h1 className="font-serif text-4xl leading-[0.95] tracking-tight xl:text-6xl">
              Reset access without losing your research workspace.
            </h1>
            <p className="max-w-xl text-base leading-8 text-muted-foreground">
              Enter your account email and CiteMate will send a secure link so
              you can choose a new password.
            </p>
          </div>
        </div>
        <Card className="w-full border-border/70 bg-card/90 shadow-xl shadow-teal-950/5">
          <CardHeader className="space-y-2">
            <CardTitle className="font-serif text-3xl tracking-tight">
              Forgot your password?
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              We&apos;ll email a recovery link to the address tied to your
              account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <PasswordResetRequestForm defaultEmail={params.email ?? ""} />
            <p className="text-sm text-muted-foreground">
              Remembered it?{" "}
              <Link
                href="/auth/sign-in"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Return to sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
