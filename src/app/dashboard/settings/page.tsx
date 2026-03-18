import Link from "next/link";

import { AccountDangerZone } from "@/components/app/account-danger-zone";
import { PageHeader } from "@/components/app/page-header";
import { PasswordResetRequestForm } from "@/components/app/password-reset-request-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardShellData } from "@/lib/data/citemate";

export default async function SettingsPage() {
  const { email } = await getDashboardShellData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Account settings"
        description="Manage password recovery and permanent account deletion from inside your workspace."
      />

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="font-serif text-3xl tracking-tight">
                Password recovery
              </CardTitle>
              <Badge variant="secondary" className="rounded-full">
                Email-based
              </Badge>
            </div>
            <CardDescription className="max-w-2xl text-sm leading-6">
              Send yourself a reset link if you ever lose access to your
              password. The link opens a secure recovery screen where you can
              choose a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[1.5rem] border border-border/70 bg-secondary/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Account email
              </p>
              <p className="mt-2 break-all font-medium">{email}</p>
            </div>
            <PasswordResetRequestForm defaultEmail={email} />
            <p className="text-sm text-muted-foreground">
              Signed out already?{" "}
              <Link
                href={`/auth/forgot-password?email=${encodeURIComponent(email)}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                Open the recovery page
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-card/90">
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="font-serif text-3xl tracking-tight">
                Danger zone
              </CardTitle>
              <Badge variant="outline" className="rounded-full text-destructive">
                Permanent
              </Badge>
            </div>
            <CardDescription className="max-w-2xl text-sm leading-6">
              Delete your account directly from CiteMate. This removes your
              profile, sources, notes, checklist progress, reminders, and stored
              source files.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Make sure anything you want to keep has been exported first.
                After deletion, this workspace cannot be restored.
              </p>
            </div>
            <AccountDangerZone />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
