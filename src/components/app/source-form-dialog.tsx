"use client";

import { useId, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { LoaderCircle, Paperclip, Plus, Search, SquarePen } from "lucide-react";
import { toast } from "sonner";

import {
  attachSourceFileAction,
  fetchSourceMetadataAction,
  upsertSourceAction,
} from "@/actions/sources";
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
import {
  mergeMetadataIntoSourceForm,
  metadataToSourceFormValues,
  type SourceMetadataField,
} from "@/lib/source-metadata/form";
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
  const metadataFieldLabels: Record<SourceMetadataField, string> = {
    title: "title",
    authorsText: "authors",
    year: "publication year",
    journalOrPublisher: "journal or publisher",
    doi: "DOI",
    url: "URL",
    abstract: "abstract",
    sourceType: "source type",
  };
  const fieldId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [savePending, startSaveTransition] = useTransition();
  const [metadataPending, startMetadataTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [metadataStatus, setMetadataStatus] = useState<{
    tone: "success" | "error" | "info";
    message: string;
  } | null>(null);
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

  const handleFetchMetadata = () => {
    setMetadataStatus({
      tone: "info",
      message: "Looking up citation metadata...",
    });

    startMetadataTransition(async () => {
      const lookupValues = form.getValues();
      const result = await fetchSourceMetadataAction({
        doi: lookupValues.doi,
        url: lookupValues.url,
      });

      if (!result.success || !result.data) {
        toast.error(result.message);
        Object.entries(result.fieldErrors ?? {}).forEach(([name, messages]) => {
          form.setError(name as keyof SourceInput, {
            message: messages?.[0],
          });
        });
        setMetadataStatus({
          tone: "error",
          message: result.message,
        });
        return;
      }

      const fetchedValues = metadataToSourceFormValues(result.data.metadata);
      const currentValues = form.getValues();
      let mergeResult = mergeMetadataIntoSourceForm(
        currentValues,
        fetchedValues,
        form.formState.dirtyFields as Record<SourceMetadataField, boolean>,
      );

      if (mergeResult.conflictingFields.length > 0) {
        const labels = mergeResult.conflictingFields
          .map((fieldName) => metadataFieldLabels[fieldName])
          .join(", ");
        const confirmed = window.confirm(
          `Replace your manually edited fields with fetched metadata for: ${labels}?`,
        );

        if (confirmed) {
          mergeResult = mergeMetadataIntoSourceForm(
            form.getValues(),
            fetchedValues,
            form.formState.dirtyFields as Record<SourceMetadataField, boolean>,
            true,
          );
        }
      }

      Object.entries(mergeResult.nextValues).forEach(([name, value]) => {
        form.setValue(name as keyof SourceInput, value as never, {
          shouldDirty: false,
          shouldTouch: true,
          shouldValidate: true,
        });
      });

      const skippedCount = mergeResult.conflictingFields.length;

      if (mergeResult.appliedFields.length === 0 && skippedCount === 0) {
        setMetadataStatus({
          tone: "success",
          message: "Metadata found, but your form already has those values.",
        });
        toast.success("Metadata fetched. No changes were needed.");
        return;
      }

      const statusMessage =
        skippedCount > 0
          ? `Filled ${mergeResult.appliedFields.length} field${mergeResult.appliedFields.length === 1 ? "" : "s"} and kept ${skippedCount} manual edit${skippedCount === 1 ? "" : "s"}.`
          : `Filled ${mergeResult.appliedFields.length} field${mergeResult.appliedFields.length === 1 ? "" : "s"} from fetched metadata.`;

      setMetadataStatus({
        tone: "success",
        message: statusMessage,
      });
      toast.success(statusMessage);
    });
  };

  return (
    <>
      <Button variant={isEditing ? "outline" : "default"} onClick={() => setOpen(true)}>
        {isEditing ? <SquarePen className="size-4" /> : <Plus className="size-4" />}
        {isEditing ? "Edit" : "Add source"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] p-4 sm:max-w-5xl sm:p-6 xl:max-w-6xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit source" : "Add a source"}</DialogTitle>
            <DialogDescription>
              Save the metadata once and generate citations anytime.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]"
            onSubmit={form.handleSubmit((values) => {
              startSaveTransition(async () => {
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
                      file.type,
                      file.size,
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
            <div className="space-y-5">
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
                  <p className="text-xs text-destructive">
                    {form.formState.errors.doi?.message}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${fieldId}-url`}>URL</Label>
                  <Input id={`${fieldId}-url`} {...form.register("url")} />
                  <p className="text-xs text-destructive">
                    {form.formState.errors.url?.message}
                  </p>
                </div>
              </div>
              <div className="space-y-3 rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Metadata lookup</p>
                    <p className="text-xs leading-5 text-muted-foreground">
                      Paste a DOI or article URL to auto-fill citation fields before saving.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFetchMetadata}
                    disabled={
                      metadataPending ||
                      (!previewValues.doi?.trim() && !previewValues.url?.trim())
                    }
                  >
                    {metadataPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Search className="size-4" />
                    )}
                    {metadataPending ? "Fetching..." : "Fetch metadata"}
                  </Button>
                </div>
                {metadataStatus ? (
                  <p
                    className={
                      metadataStatus.tone === "error"
                        ? "text-sm text-destructive"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {metadataStatus.message}
                  </p>
                ) : null}
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
                  Optional. PDFs can be previewed inside the source page. Files are stored securely in Supabase Storage.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={savePending}>
                {savePending
                  ? isEditing
                    ? "Saving..."
                    : "Saving source..."
                  : isEditing
                    ? "Save changes"
                    : "Save source"}
              </Button>
            </div>
            <div className="space-y-4 2xl:sticky 2xl:top-0">
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
