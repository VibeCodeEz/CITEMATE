"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { deleteAccountAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteAccountSchema,
  type DeleteAccountFormInput,
} from "@/lib/validations/auth";

export function AccountDangerZone() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<DeleteAccountFormInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmation: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="destructive" />}
        disabled={pending}
      >
        Delete account
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Delete account permanently</DialogTitle>
          <DialogDescription>
            This removes your account, sources, notes, checklist progress,
            reminders, and uploaded source files. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await deleteAccountAction(values);

              if (!result.success) {
                toast.error(result.message);
                Object.entries(result.fieldErrors ?? {}).forEach(([name, messages]) => {
                  form.setError(name as keyof DeleteAccountFormInput, {
                    message: messages?.[0],
                  });
                });
                return;
              }

              toast.success(result.message);
              setOpen(false);

              if (result.data?.redirectTo) {
                router.replace(result.data.redirectTo);
                router.refresh();
              }
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">
              Type <span className="font-semibold">DELETE</span> to confirm
            </Label>
            <Input
              id="delete-confirmation"
              autoComplete="off"
              {...form.register("confirmation")}
            />
            <p className="text-xs text-destructive">
              {form.formState.errors.confirmation?.message}
            </p>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Deleting account..." : "Delete permanently"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
