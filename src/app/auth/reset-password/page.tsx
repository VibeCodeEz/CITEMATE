import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AppLogo } from "@/components/app/app-logo";
import { PasswordUpdateForm } from "@/components/app/password-update-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Reset Password | CiteMate",
  description: "Choose a new password for your CiteMate account.",
};

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(
      "/auth/sign-in?error=Open%20the%20password%20reset%20link%20from%20your%20email%20again.",
    );
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
              Choose a new password
            </p>
            <h1 className="font-serif text-4xl leading-[0.95] tracking-tight xl:text-6xl">
              Set a fresh password and get back to your research.
            </h1>
            <p className="max-w-xl text-base leading-8 text-muted-foreground">
              This page is available after opening a valid recovery link from
              your email.
            </p>
          </div>
        </div>
        <Card className="w-full border-border/70 bg-card/90 shadow-xl shadow-teal-950/5">
          <CardHeader className="space-y-2">
            <CardTitle className="font-serif text-3xl tracking-tight">
              Update password
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              Choose a strong password with at least 8 characters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordUpdateForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
