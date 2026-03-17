"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, LoaderCircle, Upload } from "lucide-react";
import { toast } from "sonner";

import { importSourcesAction } from "@/actions/sources";
import {
  buildCsvImportPreview,
  inferCsvFieldMapping,
  parseCsv,
} from "@/lib/source-import/csv";
import type { CsvSourceField, ImportExistingSource, ParsedCsv } from "@/lib/source-import/types";
import type { CitationStyle, SourceType } from "@/types/app";
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
import { Card, CardContent } from "@/components/ui/card";

const mappingOptions: Array<{ value: CsvSourceField; label: string }> = [
  { value: "title", label: "Title" },
  { value: "authorsText", label: "Authors" },
  { value: "year", label: "Year" },
  { value: "journalOrPublisher", label: "Journal or publisher" },
  { value: "url", label: "URL" },
  { value: "doi", label: "DOI" },
  { value: "tagsText", label: "Tags" },
  { value: "abstract", label: "Abstract" },
  { value: "sourceType", label: "Source type" },
  { value: "citationStylePreference", label: "Citation style" },
];

type SourceImportDialogProps = {
  existingSources: ImportExistingSource[];
};

export function SourceImportDialog({
  existingSources,
}: SourceImportDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [importPending, startImportTransition] = useTransition();
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv>({ headers: [], rows: [] });
  const [mapping, setMapping] = useState<Partial<Record<CsvSourceField, string>>>({});
  const [sourceTypeDefault, setSourceTypeDefault] = useState<SourceType>("journal_article");
  const [citationStyleDefault, setCitationStyleDefault] =
    useState<CitationStyle>("apa");
  const [fileName, setFileName] = useState("");
  const [importResults, setImportResults] = useState<{
    imported: number;
    skipped: number;
    results: Array<{ rowNumber: number; imported: boolean; message: string }>;
  } | null>(null);

  const preview = useMemo(
    () =>
      buildCsvImportPreview({
        parsedCsv,
        mapping,
        defaults: {
          sourceType: sourceTypeDefault,
          citationStylePreference: citationStyleDefault,
        },
        existingSources,
      }),
    [citationStyleDefault, existingSources, mapping, parsedCsv, sourceTypeDefault],
  );

  async function handleFileChange(file: File | null) {
    setImportResults(null);

    if (!file) {
      setParsedCsv({ headers: [], rows: [] });
      setMapping({});
      setFileName("");
      return;
    }

    const text = await file.text();
    const nextParsedCsv = parseCsv(text);

    if (nextParsedCsv.headers.length === 0) {
      toast.error("That CSV looks empty.");
      setParsedCsv({ headers: [], rows: [] });
      setMapping({});
      setFileName(file.name);
      return;
    }

    setParsedCsv(nextParsedCsv);
    setMapping(inferCsvFieldMapping(nextParsedCsv.headers));
    setFileName(file.name);
  }

  function handleImport() {
    const rowsToImport = preview.rows
      .filter((row) => row.readyToImport)
      .map((row) => ({
        rowNumber: row.rowNumber,
        ...row.mappedValues,
        subjectIds: [],
      }));

    startImportTransition(async () => {
      const result = await importSourcesAction(rowsToImport);

      if (!result.success || !result.data) {
        toast.error(result.message);
        return;
      }

      setImportResults(result.data);
      router.refresh();
      toast.success(result.message);
    });
  }

  const mappedFields = new Set(Object.values(mapping).filter(Boolean));

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="size-4" />
        Import CSV
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] p-4 sm:max-w-6xl sm:p-6">
          <DialogHeader>
            <DialogTitle>Import sources from CSV</DialogTitle>
            <DialogDescription>
              Upload a spreadsheet export, map the columns once, and preview what will import before anything is saved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="border-border/70 bg-card/90">
              <CardContent className="space-y-4 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-2">
                    <Label htmlFor="csv-file">CSV file</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(event) =>
                        void handleFileChange(event.target.files?.[0] ?? null)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Start with title and authors. Other fields can be mapped if they exist in the file.
                    </p>
                  </div>
                  {fileName ? (
                    <div className="rounded-[1.5rem] border border-border/80 bg-secondary/25 px-4 py-3 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">{fileName}</p>
                      <p>{parsedCsv.rows.length} row{parsedCsv.rows.length === 1 ? "" : "s"} detected</p>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {parsedCsv.headers.length > 0 ? (
              <>
                <Card className="border-border/70 bg-card/90">
                  <CardContent className="space-y-4 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-serif text-2xl tracking-tight">Column mapping</h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Confirm how the CSV columns should map into your source fields.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="default-source-type">Default source type</Label>
                          <select
                            id="default-source-type"
                            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            value={sourceTypeDefault}
                            onChange={(event) =>
                              setSourceTypeDefault(event.target.value as SourceType)
                            }
                          >
                            <option value="journal_article">Journal article</option>
                            <option value="book">Book</option>
                            <option value="website">Website</option>
                            <option value="report">Report</option>
                            <option value="thesis">Thesis</option>
                            <option value="conference_paper">Conference paper</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="default-style">Default citation style</Label>
                          <select
                            id="default-style"
                            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            value={citationStyleDefault}
                            onChange={(event) =>
                              setCitationStyleDefault(
                                event.target.value as CitationStyle,
                              )
                            }
                          >
                            <option value="apa">APA 7</option>
                            <option value="mla">MLA 9</option>
                            <option value="chicago">Chicago</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                      {mappingOptions.map((option) => (
                        <div key={option.value} className="space-y-1">
                          <Label htmlFor={`mapping-${option.value}`}>{option.label}</Label>
                          <select
                            id={`mapping-${option.value}`}
                            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            value={mapping[option.value] ?? ""}
                            onChange={(event) => {
                              const nextHeader = event.target.value;

                              setMapping((current) => ({
                                ...Object.fromEntries(
                                  Object.entries(current).filter(
                                    ([fieldName, header]) =>
                                      fieldName === option.value || header !== nextHeader,
                                  ),
                                ),
                                [option.value]: nextHeader || undefined,
                              }));
                            }}
                          >
                            <option value="">Not mapped</option>
                            {parsedCsv.headers.map((header) => (
                              <option
                                key={header}
                                value={header}
                                disabled={mappedFields.has(header) && mapping[option.value] !== header}
                              >
                                {header}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/90">
                  <CardContent className="space-y-4 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="font-serif text-2xl tracking-tight">Import preview</h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Review valid rows, duplicates, and warnings before importing.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                          {preview.summary.ready} ready
                        </span>
                        <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                          {preview.summary.invalid} invalid
                        </span>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                          {preview.summary.duplicates} duplicates
                        </span>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                          {preview.summary.warnings} warnings
                        </span>
                      </div>
                    </div>

                    {preview.rows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Add a CSV file to preview import rows.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {preview.rows.slice(0, 12).map((row) => (
                          <div
                            key={row.rowNumber}
                            className="rounded-[1.25rem] border border-border/80 bg-secondary/20 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                  Row {row.rowNumber}
                                </p>
                                <p className="font-medium">
                                  {row.mappedValues.title || "Untitled row"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {row.mappedValues.authorsText || "No mapped author"}
                                </p>
                              </div>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  row.readyToImport
                                    ? "bg-primary/10 text-primary"
                                    : "bg-destructive/10 text-destructive"
                                }`}
                              >
                                {row.readyToImport ? "Ready" : "Needs fixes"}
                              </span>
                            </div>
                            {row.errors.length > 0 ? (
                              <div className="mt-3 space-y-1 text-sm text-destructive">
                                {row.errors.map((message) => (
                                  <p key={message}>{message}</p>
                                ))}
                              </div>
                            ) : null}
                            {row.warnings.length > 0 ? (
                              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                                {row.warnings.map((message) => (
                                  <p key={message}>{message}</p>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                        {preview.rows.length > 12 ? (
                          <p className="text-sm text-muted-foreground">
                            Showing the first 12 rows. The summary and import action still use the full CSV.
                          </p>
                        ) : null}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Only rows marked ready will be imported. Invalid or duplicate rows are skipped.
                  </p>
                  <Button
                    type="button"
                    onClick={handleImport}
                    disabled={importPending || preview.summary.ready === 0}
                  >
                    {importPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="size-4" />
                    )}
                    {importPending
                      ? "Importing..."
                      : `Import ${preview.summary.ready} row${preview.summary.ready === 1 ? "" : "s"}`}
                  </Button>
                </div>

                {importResults ? (
                  <Card className="border-border/70 bg-card/90">
                    <CardContent className="space-y-4 py-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="font-serif text-2xl tracking-tight">Import results</h3>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {importResults.imported} imported, {importResults.skipped} skipped.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setImportResults(null)}
                        >
                          <Download className="size-4" />
                          Clear results
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {importResults.results.slice(0, 12).map((row) => (
                          <div
                            key={`${row.rowNumber}-${row.message}`}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-secondary/20 px-4 py-3"
                          >
                            <p className="text-sm">
                              Row {row.rowNumber}: {row.message}
                            </p>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                row.imported
                                  ? "bg-primary/10 text-primary"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {row.imported ? "Imported" : "Skipped"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
