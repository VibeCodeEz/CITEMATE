"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import {
  Bold,
  Code2,
  Eye,
  Heading1,
  Italic,
  List,
  ListOrdered,
  PencilLine,
  Plus,
  Quote,
  SquarePen,
} from "lucide-react";
import { toast } from "sonner";

import { upsertNoteAction } from "@/actions/notes";
import { NoteMarkdown } from "@/components/app/note-markdown";
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
import { applyNoteMarkdownAction, type NoteMarkdownAction } from "@/lib/notes/editor";
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
  const formattingActions: Array<{
    action: NoteMarkdownAction;
    label: string;
    icon: typeof Heading1;
  }> = [
    { action: "heading", label: "Heading", icon: Heading1 },
    { action: "bold", label: "Bold", icon: Bold },
    { action: "italic", label: "Italic", icon: Italic },
    { action: "bulletList", label: "Bullet list", icon: List },
    { action: "numberedList", label: "Numbered list", icon: ListOrdered },
    { action: "blockquote", label: "Quote", icon: Quote },
    { action: "codeBlock", label: "Code block", icon: Code2 },
  ];
  const fieldId = useId();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");
  const [draftAvailable, setDraftAvailable] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const isEditing = Boolean(note);
  const draftStorageKey = `citemate:note-draft:${note?.id ?? lockedSourceId ?? "new"}`;
  const form = useForm<NoteInput>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      id: note?.id,
      title: note?.title ?? "",
      content: note?.content ?? "",
      sourceId: note?.source_id ?? lockedSourceId ?? undefined,
    },
  });
  const contentField = form.register("content");
  const selectedSourceId = useWatch({
    control: form.control,
    name: "sourceId",
  });
  const noteContent = useWatch({
    control: form.control,
    name: "content",
  });
  const draftValues = useWatch({
    control: form.control,
  });
  const linkedSource =
    sources.find((source) => source.id === (lockedSourceId ?? selectedSourceId)) ??
    null;

  useEffect(() => {
    if (!open || !form.formState.isDirty) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const savedAt = new Date().toISOString();

      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          values: draftValues,
          savedAt,
        }),
      );
      setDraftSavedAt(savedAt);
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [draftStorageKey, draftValues, form.formState.isDirty, open]);

  useEffect(() => {
    if (!open || !form.formState.isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty, open]);

  function clearDraft() {
    window.localStorage.removeItem(draftStorageKey);
    setDraftAvailable(false);
    setDraftSavedAt(null);
  }

  function loadDraftState() {
    const draft = window.localStorage.getItem(draftStorageKey);

    if (!draft) {
      setDraftAvailable(false);
      setDraftSavedAt(null);
      return;
    }

    try {
      const parsed = JSON.parse(draft) as {
        values?: NoteInput;
        savedAt?: string;
      };

      setDraftAvailable(Boolean(parsed.values));
      setDraftSavedAt(parsed.savedAt ?? null);
    } catch {
      setDraftAvailable(false);
      setDraftSavedAt(null);
    }
  }

  function restoreDraft() {
    const draft = window.localStorage.getItem(draftStorageKey);

    if (!draft) {
      return;
    }

    try {
      const parsed = JSON.parse(draft) as {
        values?: NoteInput;
        savedAt?: string;
      };

      if (!parsed.values) {
        return;
      }

      form.reset(parsed.values);
      setDraftAvailable(false);
      setDraftSavedAt(parsed.savedAt ?? null);
      toast.success("Local note draft restored.");
    } catch {
      toast.error("We couldn't restore that local draft.");
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && open && form.formState.isDirty) {
      const confirmed = window.confirm(
        "Close this note editor? Your unsaved changes are still autosaved on this device until you save or dismiss the draft.",
      );

      if (!confirmed) {
        return;
      }
    }

    if (!nextOpen) {
      setEditorMode("write");
    } else {
      loadDraftState();
    }

    setOpen(nextOpen);
  }

  function applyFormatting(action: NoteMarkdownAction) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const nextState = applyNoteMarkdownAction(
      form.getValues("content") ?? "",
      {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      },
      action,
    );

    form.setValue("content", nextState.value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextState.selection.start, nextState.selection.end);
    });
  }

  return (
    <>
      <Button
        variant={isEditing ? "outline" : "default"}
        onClick={() => {
          setEditorMode("write");
          loadDraftState();
          setOpen(true);
        }}
      >
        {isEditing ? <SquarePen className="size-4" /> : <Plus className="size-4" />}
        {isEditing ? "Edit" : "Add note"}
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
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
                clearDraft();
                setOpen(false);
                setEditorMode("write");
                router.refresh();
              });
            })}
          >
            {draftAvailable ? (
              <div className="rounded-[1.5rem] border border-border/80 bg-secondary/25 p-4">
                <p className="text-sm font-medium">Local draft available</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {draftSavedAt
                    ? `Autosaved on this device at ${new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(draftSavedAt))}.`
                    : "A local draft is saved on this device."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={restoreDraft}>
                    Restore draft
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={clearDraft}>
                    Dismiss draft
                  </Button>
                </div>
              </div>
            ) : null}
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
                  className="block h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  title={linkedSource?.title ?? ""}
                  value={selectedSourceId ?? ""}
                  onChange={(event) =>
                    form.setValue("sourceId", event.target.value || undefined)
                  }
                >
                  <option value="">No linked source</option>
                  {sources.map((source) => (
                    <option key={source.id} value={source.id} title={source.title}>
                      {source.title}
                    </option>
                  ))}
                </select>
                {linkedSource ? (
                  <p className="text-xs leading-5 text-muted-foreground break-words">
                    Selected: {linkedSource.title}
                  </p>
                ) : null}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-content`}>Note content</Label>
              <div className="space-y-3 rounded-[1.5rem] border border-border/80 bg-secondary/20 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={editorMode === "write" ? "default" : "outline"}
                      onClick={() => setEditorMode("write")}
                    >
                      <PencilLine className="size-4" />
                      Write
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={editorMode === "preview" ? "default" : "outline"}
                      onClick={() => setEditorMode("preview")}
                    >
                      <Eye className="size-4" />
                      Preview
                    </Button>
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Markdown supported. Shortcuts: Ctrl/Cmd+B and Ctrl/Cmd+I.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formattingActions.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Button
                        key={item.action}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => applyFormatting(item.action)}
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Existing plain-text notes still work. Add headings, emphasis, lists, quotes, and fenced code blocks when helpful.
                </p>
              </div>
              {editorMode === "write" ? (
                <Textarea
                  id={`${fieldId}-content`}
                  ref={(element) => {
                    textareaRef.current = element;
                    contentField.ref(element);
                  }}
                  rows={12}
                  placeholder={
                    "## Main idea\n\n**Important quote**\n> ...\n\n- Key takeaway\n- Supporting detail\n\nYour reflection"
                  }
                  onKeyDown={(event) => {
                    const isModifierKey = event.metaKey || event.ctrlKey;

                    if (!isModifierKey) {
                      return;
                    }

                    const key = event.key.toLowerCase();

                    if (key === "b") {
                      event.preventDefault();
                      applyFormatting("bold");
                    }

                    if (key === "i") {
                      event.preventDefault();
                      applyFormatting("italic");
                    }
                  }}
                  name={contentField.name}
                  onBlur={contentField.onBlur}
                  onChange={contentField.onChange}
                />
              ) : (
                <div className="min-h-[18rem] rounded-[1.5rem] border border-border/80 bg-background/70 p-4">
                  {(noteContent ?? "").trim() ? (
                    <NoteMarkdown content={noteContent ?? ""} />
                  ) : (
                    <p className="text-sm leading-6 text-muted-foreground">
                      Nothing to preview yet. Switch back to Write and add some note content.
                    </p>
                  )}
                </div>
              )}
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
            <p className="text-center text-xs text-muted-foreground">
              {draftSavedAt
                ? "Local draft autosave is on for this device while you edit."
                : "Unsaved note edits stay local until you save."}
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
