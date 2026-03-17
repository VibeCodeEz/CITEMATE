"use client";

import Link from "next/link";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signInAction, signUpAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
} from "@/lib/validations/auth";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  nextPath?: string;
  notice?: string;
  error?: string;
};

type AuthFormValues = {
  fullName?: string;
  email: string;
  password: string;
};

export function AuthForm({ mode, nextPath, notice, error }: AuthFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isSignUp = mode === "sign-up";
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema) as never,
    defaultValues: isSignUp
      ? {
          fullName: "",
          email: "",
          password: "",
        }
      : {
          email: "",
          password: "",
        },
  });

  return (
    <Card className="w-full border-border/70 bg-card/90 shadow-xl shadow-teal-950/5">
      <CardHeader className="space-y-2">
        <CardTitle className="font-serif text-3xl tracking-tight">
          {isSignUp ? "Create your workspace" : "Welcome back"}
        </CardTitle>
        <CardDescription className="text-sm leading-6">
          {isSignUp
            ? "Start saving sources, organizing research, and building citations with a secure personal dashboard."
            : "Sign in to continue managing your references, notes, and review checklist."}
        </CardDescription>
        {notice ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm text-foreground">
            {notice}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = isSignUp
                ? await signUpAction(values as SignUpInput, nextPath)
                : await signInAction(values as SignInInput, nextPath);

              if (!result.success) {
                toast.error(result.message);
                Object.entries(result.fieldErrors ?? {}).forEach(([name, messages]) => {
                  form.setError(name as keyof AuthFormValues, {
                    message: messages?.[0],
                  });
                });
                return;
              }

              toast.success(result.message);

              if (result.data?.redirectTo) {
                router.replace(result.data.redirectTo);
                router.refresh();
              } else if (isSignUp) {
                form.reset();
              }
            });
          })}
        >
          {isSignUp ? (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...form.register("fullName")} />
              <p className="text-xs text-destructive">
                {form.formState.errors.fullName?.message}
              </p>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.email?.message}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              {...form.register("password")}
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.password?.message}
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending
              ? isSignUp
                ? "Creating account..."
                : "Signing in..."
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </Button>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
            <Link
              href={
                isSignUp
                  ? `/auth/sign-in${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`
                  : `/auth/sign-up${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`
              }
              className="font-medium text-foreground underline underline-offset-4"
            >
              {isSignUp ? "Sign in" : "Create one"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
