"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { updatePasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  passwordUpdateSchema,
  type PasswordUpdateInput,
} from "@/lib/validations/auth";

export function PasswordUpdateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<PasswordUpdateInput>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await updatePasswordAction(values);

          if (!result.success) {
            toast.error(result.message);
            Object.entries(result.fieldErrors ?? {}).forEach(([name, messages]) => {
              form.setError(name as keyof PasswordUpdateInput, {
                message: messages?.[0],
              });
            });
            return;
          }

          toast.success(result.message);

          if (result.data?.redirectTo) {
            router.replace(result.data.redirectTo);
            router.refresh();
          }
        });
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          {...form.register("password")}
        />
        <p className="text-xs text-destructive">
          {form.formState.errors.password?.message}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          {...form.register("confirmPassword")}
        />
        <p className="text-xs text-destructive">
          {form.formState.errors.confirmPassword?.message}
        </p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Updating password..." : "Update password"}
      </Button>
    </form>
  );
}
