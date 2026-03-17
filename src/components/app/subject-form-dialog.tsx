"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Plus, SquarePen } from "lucide-react";
import { toast } from "sonner";

import { upsertSubjectAction } from "@/actions/subjects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { subjectSchema, type SubjectInput } from "@/lib/validations/subject";
import type { Subject } from "@/types/app";

type SubjectFormDialogProps = {
  subject?: Subject;
};

export function SubjectFormDialog({ subject }: SubjectFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      id: subject?.id,
      name: subject?.name ?? "",
      description: subject?.description ?? "",
      color: subject?.color ?? "#0f766e",
    },
  });
  const isEditing = Boolean(subject);

  return (
    <>
      <Button variant={isEditing ? "outline" : "default"} onClick={() => setOpen(true)}>
        {isEditing ? <SquarePen className="size-4" /> : <Plus className="size-4" />}
        {isEditing ? "Edit" : "Add subject"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit subject" : "Create a subject"}</DialogTitle>
            <DialogDescription>
              Group sources by course, theme, or research area.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => {
              startTransition(async () => {
                const result = await upsertSubjectAction(values);

                if (!result.success) {
                  toast.error(result.message);
                  Object.entries(result.fieldErrors ?? {}).forEach(([name, messages]) => {
                    form.setError(name as keyof SubjectInput, {
                      message: messages?.[0],
                    });
                  });
                  return;
                }

                toast.success(result.message);
                setOpen(false);
                router.refresh();
              });
            })}
          >
            <div className="space-y-2">
              <Label htmlFor={`subject-name-${subject?.id ?? "new"}`}>Name</Label>
              <Input
                id={`subject-name-${subject?.id ?? "new"}`}
                {...form.register("name")}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.name?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`subject-description-${subject?.id ?? "new"}`}>
                Description
              </Label>
              <Textarea
                id={`subject-description-${subject?.id ?? "new"}`}
                rows={4}
                {...form.register("description")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`subject-color-${subject?.id ?? "new"}`}>Color</Label>
              <Input
                id={`subject-color-${subject?.id ?? "new"}`}
                type="color"
                className="h-12 w-24 p-2"
                {...form.register("color")}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.color?.message}
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save changes"
                  : "Create subject"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
