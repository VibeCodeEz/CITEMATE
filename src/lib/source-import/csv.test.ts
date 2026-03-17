import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCsvImportPreview,
  inferCsvFieldMapping,
  parseCsv,
} from "@/lib/source-import/csv";
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

test("parses CSV headers, rows, and quoted multiline cells", () => {
  const parsed = parseCsv(
    'Title,Authors,Abstract\n"Study One","Dana Moore","Line one\nLine two"\n',
  );

  assert.deepEqual(parsed.headers, ["Title", "Authors", "Abstract"]);
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].Title, "Study One");
  assert.equal(parsed.rows[0].Abstract, "Line one\nLine two");
});

test("infers common CSV field mappings from header names", () => {
  const mapping = inferCsvFieldMapping([
    "Title",
    "Authors",
    "Publisher",
    "DOI",
    "Keywords",
  ]);

  assert.equal(mapping.title, "Title");
  assert.equal(mapping.authorsText, "Authors");
  assert.equal(mapping.journalOrPublisher, "Publisher");
  assert.equal(mapping.doi, "DOI");
  assert.equal(mapping.tagsText, "Keywords");
});

test("builds a preview with ready rows, warnings, and duplicate detection", () => {
  const parsedCsv = parseCsv(
    [
      "Title,Authors,DOI,Year,Publisher",
      "Existing Source,Dana Moore,10.1000/existing,2024,Existing Journal",
      "New Source,Avery Patel,,2025,",
      "New Source,Avery Patel,,2025,",
      "Bad Row,,,2025,Publisher",
    ].join("\n"),
  );

  const preview = buildCsvImportPreview({
    parsedCsv,
    mapping: {
      title: "Title",
      authorsText: "Authors",
      doi: "DOI",
      year: "Year",
      journalOrPublisher: "Publisher",
    },
    defaults: {
      sourceType: "journal_article",
      citationStylePreference: "apa",
    },
    existingSources,
  });

  assert.equal(preview.summary.total, 4);
  assert.equal(preview.summary.ready, 0);
  assert.equal(preview.summary.invalid, 4);
  assert.equal(preview.summary.duplicates, 3);
  assert.equal(preview.rows[1].warnings[0], "Missing journal or publisher.");
  assert.match(
    preview.rows[0].errors.join(" "),
    /duplicate of an existing source/i,
  );
  assert.match(
    preview.rows[2].errors.join(" "),
    /duplicates another row in this csv/i,
  );
  assert.match(preview.rows[3].errors.join(" "), /author/i);
});
