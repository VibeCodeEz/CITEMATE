"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { requestPasswordResetAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  passwordResetRequestSchema,
  type PasswordResetRequestInput,
} from "@/lib/validations/auth";

type PasswordResetRequestFormProps = {
  defaultEmail?: string;
};

export function PasswordResetRequestForm({
  defaultEmail = "",
}: PasswordResetRequestFormProps) {
  const [pending, startTransition] = useTransition();
  const form = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await requestPasswordResetAction(values);

          if (!result.success) {
            toast.error(result.message);
            Object.entries(result.fieldErrors ?? {}).forEach(([name, messages]) => {
              form.setError(name as keyof PasswordResetRequestInput, {
                message: messages?.[0],
              });
            });
            return;
          }

          toast.success(result.message);
          form.reset(values);
        });
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          autoComplete="email"
          {...form.register("email")}
        />
        <p className="text-xs text-destructive">
          {form.formState.errors.email?.message}
        </p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending reset link..." : "Send reset link"}
      </Button>
    </form>
  );
}
