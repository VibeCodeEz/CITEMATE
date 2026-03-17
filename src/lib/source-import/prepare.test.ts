import assert from "node:assert/strict";
import test from "node:test";

import {
  prepareSourceImportRows,
  summarizeSourceImportResults,
} from "@/lib/source-import/prepare";
import type { ImportExistingSource } from "@/lib/source-import/types";

const existingSources: ImportExistingSource[] = [
  {
    id: "source-1",
    title: "Existing Source",
    authors: ["Dana Moore"],
    year: 2024,
    doi: "10.1000/existing",
    url: null,
  },
];

test("prepares valid source import rows and skips duplicates or invalid rows", () => {
  const prepared = prepareSourceImportRows({
    existingSources,
    rows: [
      {
        rowNumber: 2,
        title: "Existing Source",
        authorsText: "Dana Moore",
        year: "2024",
        journalOrPublisher: "Existing Journal",
        url: "",
        doi: "10.1000/existing",
        tagsText: "",
        abstract: "",
        sourceType: "journal_article",
        citationStylePreference: "apa",
        subjectIds: [],
      },
      {
        rowNumber: 3,
        title: "New Source",
        authorsText: "Avery Patel",
        year: "2025",
        journalOrPublisher: "Methods Press",
        url: "",
        doi: "",
        tagsText: "methods, review",
        abstract: "",
        sourceType: "book",
        citationStylePreference: "mla",
        subjectIds: [],
      },
      {
        rowNumber: 4,
        title: "New Source",
        authorsText: "Avery Patel",
        year: "2025",
        journalOrPublisher: "Methods Press",
        url: "",
        doi: "",
        tagsText: "",
        abstract: "",
        sourceType: "book",
        citationStylePreference: "mla",
        subjectIds: [],
      },
      {
        rowNumber: 5,
        title: "Broken Row",
        authorsText: "",
        year: "2025",
        journalOrPublisher: "Methods Press",
        url: "",
        doi: "",
        tagsText: "",
        abstract: "",
        sourceType: "book",
        citationStylePreference: "mla",
        subjectIds: [],
      },
    ],
  });

  assert.equal(prepared.length, 4);
  assert.equal(prepared[0].ok, false);
  assert.equal(prepared[1].ok, true);
  assert.equal(prepared[2].ok, false);
  assert.equal(prepared[3].ok, false);

  if (prepared[1].ok) {
    assert.deepEqual(prepared[1].payload.authors, ["Avery Patel"]);
    assert.deepEqual(prepared[1].payload.tags, ["methods", "review"]);
    assert.equal(prepared[1].payload.source_type, "book");
  }
});

test("summarizes import results for partial success feedback", () => {
  const summary = summarizeSourceImportResults([
    { rowNumber: 2, imported: true, message: "Imported." },
    { rowNumber: 3, imported: false, message: "Duplicate." },
    { rowNumber: 4, imported: true, message: "Imported." },
  ]);

  assert.deepEqual(summary, {
    imported: 2,
    skipped: 1,
  });
});
