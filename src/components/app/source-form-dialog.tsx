"use client";

import { useId, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Paperclip, Plus, SquarePen } from "lucide-react";
import { toast } from "sonner";

import { attachSourceFileAction, upsertSourceAction } from "@/actions/sources";
import { CitationPreview } from "@/components/app/citation-preview";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CitationSource } from "@/lib/citations/types";
import {
  parseAuthors,
  sourceSchema,
  sourceTypeOptions,
  type SourceInput,
} from "@/lib/validations/source";
import type { SourceWithRelations, SubjectWithCount } from "@/types/app";
import { useWatch } from "react-hook-form";

type SourceFormDialogProps = {
  source?: SourceWithRelations;
  subjects: SubjectWithCount[];
};

export function SourceFormDialog({
  source,
  subjects,
}: SourceFormDialogProps) {
  const fieldId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const isEditing = Boolean(source);
  const form = useForm<SourceInput>({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      id: source?.id,
      title: source?.title ?? "",
      authorsText: source?.authors.join("; ") ?? "",
      year: source?.year ? String(source.year) : "",
      journalOrPublisher: source?.publisher ?? "",
      url: source?.url ?? "",
      doi: source?.doi ?? "",
      tagsText: source?.tags.join(", ") ?? "",
      abstract: source?.abstract ?? "",
      sourceType: source?.source_type ?? "journal_article",
      citationStylePreference: source?.citation_style ?? "apa",
      subjectIds: source?.subjects.map((subjectItem) => subjectItem.id) ?? [],
    },
  });
  const previewValues = useWatch({ control: form.control });
  const previewSource: CitationSource = {
    title: previewValues.title?.trim() || "",
    authors: parseAuthors(previewValues.authorsText ?? ""),
    year: previewValues.year ? Number(previewValues.year) : null,
    journalOrPublisher: previewValues.journalOrPublisher?.trim() || null,
    url: previewValues.url?.trim() || null,
    doi: previewValues.doi?.trim() || null,
    abstract: previewValues.abstract?.trim() || null,
    sourceType: previewValues.sourceType ?? "journal_article",
    citationStylePreference:
      previewValues.citationStylePreference ?? "apa",
  };

  return (
    <>
      <Button variant={isEditing ? "outline" : "default"} onClick={() => setOpen(true)}>
        {isEditing ? <SquarePen className="size-4" /> : <Plus className="size-4" />}
        {isEditing ? "Edit" : "Add source"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit source" : "Add a source"}</DialogTitle>
            <DialogDescription>
              Save the metadata once and generate citations anytime.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
            onSubmit={form.handleSubmit((values) => {
              startTransition(async () => {
                const result = await upsertSourceAction(values);

                if (!result.success) {
                  toast.error(result.message);
                  Object.entries(result.fieldErrors ?? {}).forEach(([name, messages]) => {
                    form.setError(name as keyof SourceInput, {
                      message: messages?.[0],
                    });
                  });
                  return;
                }

                if (file && result.data?.sourceId) {
                  const supabase = createSupabaseBrowserClient();
                  const {
                    data: { user },
                  } = await supabase.auth.getUser();

                  if (user) {
                    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
                    const filePath = `${user.id}/${result.data.sourceId}/${safeName}`;
                    const uploadResult = await supabase.storage
                      .from("source-files")
                      .upload(filePath, file, {
                        cacheControl: "3600",
                        upsert: true,
                      });

                    if (uploadResult.error) {
                      toast.error(uploadResult.error.message);
                      return;
                    }

                    const attachResult = await attachSourceFileAction(
                      result.data.sourceId,
                      filePath,
                      file.name,
                    );

                    if (!attachResult.success) {
                      toast.error(attachResult.message);
                      return;
                    }
                  }
                }

                toast.success(result.message);
                setFile(null);
                setOpen(false);
                router.refresh();
              });
            })}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${fieldId}-title`}>Title</Label>
                <Input id={`${fieldId}-title`} {...form.register("title")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.title?.message}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${fieldId}-authors`}>Authors</Label>
                <Textarea
                  id={`${fieldId}-authors`}
                  rows={3}
                  placeholder="Separate authors with semicolons or new lines"
                  {...form.register("authorsText")}
                />
                <p className="text-xs text-destructive">
                  {form.formState.errors.authorsText?.message}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${fieldId}-year`}>Year</Label>
                  <Input
                    id={`${fieldId}-year`}
                    inputMode="numeric"
                    {...form.register("year")}
                  />
                  <p className="text-xs text-destructive">
                    {form.formState.errors.year?.message}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${fieldId}-source-type`}>Source type</Label>
                  <select
                    id={`${fieldId}-source-type`}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...form.register("sourceType")}
                  >
                    {sourceTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${fieldId}-style`}>
                    Citation style preference
                  </Label>
                  <select
                    id={`${fieldId}-style`}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...form.register("citationStylePreference")}
                  >
                    <option value="apa">APA 7</option>
                    <option value="mla">MLA 9</option>
                    <option value="chicago">Chicago</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${fieldId}-journal-publisher`}>
                    Journal or publisher
                  </Label>
                  <Input
                    id={`${fieldId}-journal-publisher`}
                    {...form.register("journalOrPublisher")}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`${fieldId}-doi`}>DOI</Label>
                  <Input id={`${fieldId}-doi`} {...form.register("doi")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${fieldId}-url`}>URL</Label>
                  <Input id={`${fieldId}-url`} {...form.register("url")} />
                  <p className="text-xs text-destructive">
                    {form.formState.errors.url?.message}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${fieldId}-tags`}>Tags</Label>
                <Input
                  id={`${fieldId}-tags`}
                  placeholder="research, sociology, final paper"
                  {...form.register("tagsText")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${fieldId}-abstract`}>Abstract</Label>
                <Textarea
                  id={`${fieldId}-abstract`}
                  rows={5}
                  {...form.register("abstract")}
                />
              </div>
              <div className="space-y-3">
                <Label>Subjects</Label>
                {subjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Create a subject first, then you can assign it here.
                  </p>
                ) : (
                  <Controller
                    control={form.control}
                    name="subjectIds"
                    render={({ field }) => (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {subjects.map((subjectItem) => {
                          const selected = field.value ?? [];
                          const checked = selected.includes(subjectItem.id);

                          return (
                            <label
                              key={subjectItem.id}
                              className="flex items-start gap-3 rounded-2xl border border-border/80 bg-secondary/30 p-3"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(nextChecked) => {
                                  if (nextChecked) {
                                    field.onChange([...selected, subjectItem.id]);
                                    return;
                                  }

                                  field.onChange(
                                    selected.filter((value) => value !== subjectItem.id),
                                  );
                                }}
                              />
                              <span className="space-y-1">
                                <span className="block font-medium">
                                  {subjectItem.name}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {subjectItem.sourceCount} source
                                  {subjectItem.sourceCount === 1 ? "" : "s"}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${fieldId}-file`}>Attachment</Label>
                <Input
                  id={`${fieldId}-file`}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Paperclip className="size-3.5" />
                  Optional. Stored securely in Supabase Storage.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending
                  ? isEditing
                    ? "Saving..."
                    : "Saving source..."
                  : isEditing
                    ? "Save changes"
                    : "Save source"}
              </Button>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-border/70 bg-secondary/30 p-4">
                <h3 className="font-serif text-2xl tracking-tight">
                  Citation preview
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Review all supported citation styles before saving.
                </p>
              </div>
              <CitationPreview
                source={previewSource}
                activeStyle={previewSource.citationStylePreference}
                compact
              />
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
