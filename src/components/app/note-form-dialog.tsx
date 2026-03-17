"use client";

import { useId, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { Plus, SquarePen } from "lucide-react";
import { toast } from "sonner";

import { upsertNoteAction } from "@/actions/notes";
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
import { noteSchema, type NoteInput } from "@/lib/validations/note";
import type { Note, SourceWithRelations } from "@/types/app";

type NoteFormDialogProps = {
  note?: Note;
  sources: SourceWithRelations[];
  lockedSourceId?: string;
  lockedSourceTitle?: string;
};

export function NoteFormDialog({
  note,
  sources,
  lockedSourceId,
  lockedSourceTitle,
}: NoteFormDialogProps) {
  const fieldId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const isEditing = Boolean(note);
  const form = useForm<NoteInput>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      id: note?.id,
      title: note?.title ?? "",
      content: note?.content ?? "",
      sourceId: note?.source_id ?? lockedSourceId ?? undefined,
    },
  });
  const selectedSourceId = useWatch({
    control: form.control,
    name: "sourceId",
  });
  const linkedSource =
    sources.find((source) => source.id === (lockedSourceId ?? selectedSourceId)) ??
    null;

  return (
    <>
      <Button variant={isEditing ? "outline" : "default"} onClick={() => setOpen(true)}>
        {isEditing ? <SquarePen className="size-4" /> : <Plus className="size-4" />}
        {isEditing ? "Edit" : "Add note"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit note" : "Write a note"}</DialogTitle>
            <DialogDescription>
              Capture quotes, paraphrases, and analysis in a clean multiline note.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit((values) => {
              startTransition(async () => {
                const result = await upsertNoteAction(values);

                if (!result.success) {
                  toast.error(result.message);
                  Object.entries(result.fieldErrors ?? {}).forEach(([name, messages]) => {
                    form.setError(name as keyof NoteInput, {
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
              <Label htmlFor={`${fieldId}-title`}>Title</Label>
              <Input
                id={`${fieldId}-title`}
                placeholder="Main idea, quote cluster, or synthesis angle"
                {...form.register("title")}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.title?.message}
              </p>
            </div>
            {lockedSourceId ? (
              <div className="rounded-[1.5rem] border border-border/80 bg-secondary/25 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Linked source
                </p>
                <p className="mt-2 text-sm leading-6">
                  {lockedSourceTitle ?? linkedSource?.title ?? "Current source"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor={`${fieldId}-source`}>Linked source</Label>
                <select
                  id={`${fieldId}-source`}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={selectedSourceId ?? ""}
                  onChange={(event) =>
                    form.setValue("sourceId", event.target.value || undefined)
                  }
                >
                  <option value="">No linked source</option>
                  {sources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-content`}>Note content</Label>
              <div className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-3">
                <p className="text-xs leading-5 text-muted-foreground">
                  Multiline text is preserved. Use short paragraphs, quotes, and bullet-style lines for a readable study note.
                </p>
              </div>
              <Textarea
                id={`${fieldId}-content`}
                rows={12}
                placeholder={"Key claim or takeaway\n\nImportant quote:\n\"...\"\n\nYour paraphrase or reflection"}
                {...form.register("content")}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.content?.message}
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? isEditing
                  ? "Saving..."
                  : "Saving note..."
                : isEditing
                  ? "Save changes"
                  : "Save note"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
